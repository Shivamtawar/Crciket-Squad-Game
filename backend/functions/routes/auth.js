const express = require("express");
const router = express.Router();
const { admin, db, auth } = require("../config/firebaseAdmin");

/**
 * POST /auth/signup
 * Create a new user with email/password
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
    });

    // Generate a custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      uid: userRecord.uid,
      email: userRecord.email,
      customToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already registered." });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /auth/login
 * Verify credentials via Firebase Auth REST API
 * In production, the frontend handles this with Firebase Client SDK.
 * This endpoint is for testing/demo purposes.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Look up user by email
    const userRecord = await auth.getUserByEmail(email);

    // Generate custom token (frontend exchanges this for an ID token)
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      uid: userRecord.uid,
      email: userRecord.email,
      customToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(401).json({ error: "Invalid credentials." });
  }
});

module.exports = router;
