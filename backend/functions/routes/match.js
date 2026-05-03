const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { simulateMatch } = require("../engines/matchEngine");

router.use(authMiddleware);

/**
 * POST /match/runMatch
 * Runs the match simulation engine
 * Requires a full 11-player squad
 */
router.post("/runMatch", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const result = await simulateMatch(sessionId, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error("Match simulation error:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
