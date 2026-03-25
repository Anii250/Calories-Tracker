/* ============================================================
   CalorieAI — Firebase Configuration & Initialization
   ============================================================ */

const firebaseConfig = window.CONFIG?.FIREBASE || {
    apiKey: "MISSING",
    authDomain: "MISSING",
    projectId: "MISSING",
    storageBucket: "MISSING",
    messagingSenderId: "MISSING",
    appId: "MISSING",
    measurementId: "MISSING"
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

    async function loginGooglePopup() {
        try {
            const cred = await auth.signInWithPopup(googleProvider);
            // Create/ensure the user document, but never block auth on Firestore issues.
            // Some projects lock down writes; in that case Google sign-in should still succeed.
            try {
                await createUserDoc(cred.user);
            } catch (e) {
                console.log("createUserDoc after Google popup failed:", e);
            }
            return cred.user;
        } catch (error) {
            console.error("Google Popup Error:", error);
            throw error;
        }
    }

    async function loginGoogleRedirect() {
        try {
            await auth.signInWithRedirect(googleProvider);
        } catch (error) {
            console.error("Google Redirect Error:", error);
            throw error;
        }
    }

    async function loginGoogle() {
        try {
            // Try popup first
            return await loginGooglePopup();
        } catch (err) {
            // Fallback to redirect if popup is blocked or fails
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
                console.log("Popup blocked, falling back to redirect...");
                return await loginGoogleRedirect();
            }
            throw err;
        }
    }

    async function handleRedirectResult() {
        try {
            const result = await auth.getRedirectResult();
            if (result && result.user) {
                // Same as popup flow: don't block login completion on Firestore doc creation.
                try {
                    await createUserDoc(result.user);
                } catch (e) {
                    console.log("createUserDoc after Google redirect failed:", e);
                }
                return result.user;
            }
        } catch (error) {
            console.error("Redirect Result Error:", error);
            throw error;
        }
        return null;
    }

    async function logout() {
        await auth.signOut();
        // Clear local data
        localStorage.removeItem('calorieai_data');
        location.hash = '#/login';
        location.reload();
    }

    async function createUserDoc(user) {
        if (!user) return;
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
                stepsTarget: 10000,
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
        signUpEmail, loginEmail, loginGoogle, 
        loginGooglePopup, loginGoogleRedirect, handleRedirectResult,
        logout, onAuthChanged
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
                stepsTarget: data.stepsTarget || 10000,
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

    async function saveSteps(dateKey, steps) {
        const ref = getUserRef();
        if (!ref) return;
        try {
            await ref.collection('steps').doc(dateKey).set({ count: steps });
        } catch (e) {
            console.log('Steps sync error:', e);
        }
    }

    async function loadSteps(dateKey) {
        const ref = getUserRef();
        if (!ref) return 0;
        try {
            const doc = await ref.collection('steps').doc(dateKey).get();
            if (doc.exists) return doc.data().count || 0;
        } catch (e) { }
        return 0;
    }

    return {
        saveToCloud, saveMeals, saveWater, saveSteps,
        loadFromCloud, loadMeals, loadWater, loadSteps
    };
})();
