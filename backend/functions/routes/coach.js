const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { getCoachInsights } = require("../engines/coachEngine");

router.use(authMiddleware);

/**
 * POST /coach/getCoachInsights
 * Returns AI Coach strategic analysis for the current session
 */
router.post("/getCoachInsights", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const insights = await getCoachInsights(sessionId, req.user.uid);
    res.json(insights);
  } catch (error) {
    console.error("Coach insights error:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
