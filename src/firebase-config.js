/* ============================================================
   CalorieAI — Firebase Configuration & Initialization
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyB1oxRfoH8ypDjUv22RmbXMWLSuRBa14WE",
    authDomain: "calorieai-aacbc.firebaseapp.com",
    projectId: "calorieai-aacbc",
    storageBucket: "calorieai-aacbc.firebasestorage.app",
    messagingSenderId: "593978879361",
    appId: "1:593978879361:web:240e3e62ffe72f5a3c0c80",
    measurementId: "G-HBGVJ61BV6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ---------- Auth Helper Functions ---------- */

const Auth = (() => {

    function getCurrentUser() {
        return auth.currentUser;
    }

    function isLoggedIn() {
        return !!auth.currentUser;
    }

    async function signUpEmail(email, password, displayName) {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: displayName || email.split('@')[0] });
        // Create user doc in Firestore
        await createUserDoc(cred.user);
        return cred.user;
    }

    async function loginEmail(email, password) {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        return cred.user;
    }

    async function loginGoogle() {
        const cred = await auth.signInWithPopup(googleProvider);
        // Create user doc if first time
        await createUserDoc(cred.user);
        return cred.user;
    }

    async function logout() {
        await auth.signOut();
        // Clear local data
        localStorage.removeItem('calorieai_data');
        location.hash = '#/login';
        location.reload();
    }

    async function createUserDoc(user) {
        const docRef = db.collection('users').doc(user.uid);
        const doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({
                displayName: user.displayName || user.email.split('@')[0],
                email: user.email,
                photoURL: user.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                profile: {
                    gender: 'male',
                    height: 167,
                    weight: 70,
                    goal: 'lose',
                    activity: 'moderate'
                },
                dailyGoal: 1500,
                waterTarget: 8,
                reminders: { breakfast: '08:00', lunch: '13:00', dinner: '19:00', enabled: false },
                hasOnboarded: false
            });
        }
    }

    // Listen for auth state changes
    function onAuthChanged(callback) {
        auth.onAuthStateChanged(callback);
    }

    return {
        getCurrentUser, isLoggedIn,
        signUpEmail, loginEmail, loginGoogle, logout,
        onAuthChanged
    };
})();

/* ---------- Cloud Sync (Firestore) ---------- */

const CloudSync = (() => {

    function getUserRef() {
        const user = auth.currentUser;
        if (!user) return null;
        return db.collection('users').doc(user.uid);
    }

    async function saveToCloud(data) {
        const ref = getUserRef();
        if (!ref) return;
        try {
            await ref.update({
                profile: data.profile || {},
                dailyGoal: data.dailyGoal || 1500,
                waterTarget: data.waterTarget || 8,
                reminders: data.reminders || {},
                hasOnboarded: data.hasOnboarded || false
            });
        } catch (e) {
            console.log('Cloud sync error:', e);
        }
    }

    async function saveMeals(dateKey, meals) {
        const ref = getUserRef();
        if (!ref) return;
        try {
            await ref.collection('meals').doc(dateKey).set(meals);
        } catch (e) {
            console.log('Meal sync error:', e);
        }
    }

    async function saveWater(dateKey, glasses) {
        const ref = getUserRef();
        if (!ref) return;
        try {
            await ref.collection('water').doc(dateKey).set({ glasses });
        } catch (e) {
            console.log('Water sync error:', e);
        }
    }

    async function loadFromCloud() {
        const ref = getUserRef();
        if (!ref) return null;
        try {
            const doc = await ref.get();
            if (doc.exists) {
                return doc.data();
            }
        } catch (e) {
            console.log('Cloud load error:', e);
        }
        return null;
    }

    async function loadMeals(dateKey) {
        const ref = getUserRef();
        if (!ref) return null;
        try {
            const doc = await ref.collection('meals').doc(dateKey).get();
            if (doc.exists) return doc.data();
        } catch (e) { }
        return null;
    }

    async function loadWater(dateKey) {
        const ref = getUserRef();
        if (!ref) return 0;
        try {
            const doc = await ref.collection('water').doc(dateKey).get();
            if (doc.exists) return doc.data().glasses || 0;
        } catch (e) { }
        return 0;
    }

    return {
        saveToCloud, saveMeals, saveWater,
        loadFromCloud, loadMeals, loadWater
    };
})();
