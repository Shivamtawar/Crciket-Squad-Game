const express = require("express");
const router = express.Router();
const { 
  getAutoSuggestTeam, 
  getPlayerAnalysis, 
  getTeamAnalysis,
  getWinProbability
} = require("../engines/aiEngine");

/**
 * POST /ai/auto-suggest
 * Suggests best players based on credits
 */
router.post("/auto-suggest", async (req, res) => {
  try {
    const { currentCredits, teamRoles } = req.body;
    const result = await getAutoSuggestTeam(currentCredits || 100, teamRoles || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /ai/player-analysis/:playerId
 * Detailed individual player analysis
 */
router.get("/player-analysis/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await getPlayerAnalysis(playerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/team-analysis
 * Strategic analysis for a selected squad
 */
router.post("/team-analysis", async (req, res) => {
  try {
    const { teamIds } = req.body;
    if (!teamIds || !Array.isArray(teamIds)) {
      return res.status(400).json({ error: "teamIds array is required." });
    }
    const result = await getTeamAnalysis(teamIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ai/win-probability
 * Calculates win probability based on team composition
 */
router.post("/win-probability", async (req, res) => {
  try {
    const { teamIds } = req.body;
    if (!teamIds || !Array.isArray(teamIds)) {
      return res.status(400).json({ error: "teamIds array is required." });
    }
    const result = await getWinProbability(teamIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
