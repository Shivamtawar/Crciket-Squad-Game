const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// When deployed to Cloud Functions, this uses default credentials.
// For local dev with emulator, set FIRESTORE_EMULATOR_HOST env var.
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
