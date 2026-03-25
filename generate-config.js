const fs = require('fs');

const config = `
window.CONFIG = {
    FIREBASE: {
        apiKey: "${process.env.FIREBASE_API_KEY || 'MISSING'}",
        authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'MISSING'}",
        projectId: "${process.env.FIREBASE_PROJECT_ID || 'MISSING'}",
        storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'MISSING'}",
        messagingSenderId: "${process.env.FIREBASE_SENDER_ID || 'MISSING'}",
        appId: "${process.env.FIREBASE_APP_ID || 'MISSING'}",
        measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || 'MISSING'}"
    }
};
`;

fs.writeFileSync('config.js', config);
console.log('Successfully generated config.js from environment variables.');
