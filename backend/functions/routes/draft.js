const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");
const { authMiddleware } = require("../middleware/auth");
const {
  validateAndAddPlayer,
  validateAndRemovePlayer,
  STARTING_CREDITS,
} = require("../engines/validationEngine");

// All draft routes require authentication
router.use(authMiddleware);

/**
 * GET /draft/players
 * Returns all 40 players from Firestore
 */
router.get("/players", async (req, res) => {
  try {
    const snapshot = await db.collection("players").orderBy("id").get();
    const players = [];
    snapshot.forEach((doc) => players.push({ firestoreId: doc.id, ...doc.data() }));
    res.json({ success: true, players, count: players.length });
  } catch (error) {
    console.error("Get players error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /draft/bossTeams
 * Returns all boss teams
 */
router.get("/bossTeams", async (req, res) => {
  try {
    const snapshot = await db.collection("bossTeams").get();
    const teams = [];
    snapshot.forEach((doc) => teams.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, teams });
  } catch (error) {
    console.error("Get boss teams error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /draft/start
 * Creates a new game session with 100 credits and empty team
 */
router.post("/start", async (req, res) => {
  try {
    const { difficulty } = req.body;
    const bossTeamId = difficulty || "easy";

    // Verify boss team exists
    const bossDoc = await db.collection("bossTeams").doc(bossTeamId).get();
    if (!bossDoc.exists) {
      return res.status(400).json({ error: `Invalid difficulty: ${bossTeamId}` });
    }

    const sessionData = {
      userId: req.user.uid,
      status: "DRAFTING",
      userTeam: [],
      teamRoles: {},
      currentCredits: STARTING_CREDITS,
      bossTeamId,
      difficulty: bossTeamId,
      result: null,
      simulationLog: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("gameSessions").add(sessionData);

    res.status(201).json({
      success: true,
      message: `Draft started! Difficulty: ${bossTeamId.toUpperCase()}. Budget: ${STARTING_CREDITS} Cr.`,
      sessionId: docRef.id,
      session: sessionData,
      bossTeam: {
        name: bossDoc.data().name,
        difficulty: bossDoc.data().difficulty,
        description: bossDoc.data().description,
      },
    });
  } catch (error) {
    console.error("Start draft error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /draft/updateDraft
 * Add a player to the squad (runs through Validation Engine)
 */
router.post("/updateDraft", async (req, res) => {
  try {
    const { sessionId, playerId } = req.body;

    if (!sessionId || !playerId) {
      return res.status(400).json({ error: "sessionId and playerId are required." });
    }

    const result = await validateAndAddPlayer(sessionId, playerId, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error("Update draft error:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /draft/removeDraft
 * Remove a player from the squad and refund credits
 */
router.post("/removeDraft", async (req, res) => {
  try {
    const { sessionId, playerId } = req.body;

    if (!sessionId || !playerId) {
      return res.status(400).json({ error: "sessionId and playerId are required." });
    }

    const result = await validateAndRemovePlayer(sessionId, playerId, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error("Remove draft error:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /draft/session/:sessionId
 * Get current session state
 */
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDoc = await db.collection("gameSessions").doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: "Session not found." });
    }

    const session = sessionDoc.data();
    if (session.userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Fetch full player details for the team
    let teamDetails = [];
    if (session.userTeam && session.userTeam.length > 0) {
      const playerDocs = await Promise.all(
        session.userTeam.map((pid) =>
          db.collection("players").doc(String(pid)).get()
        )
      );
      teamDetails = playerDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({ firestoreId: doc.id, ...doc.data() }));
    }

    res.json({
      success: true,
      sessionId,
      session: { ...session, teamDetails },
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
