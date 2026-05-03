const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

// ─── Initialize Express App ────────────────────────────────────
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// ─── Mount Routes ──────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const draftRoutes = require("./routes/draft");
const matchRoutes = require("./routes/match");
const coachRoutes = require("./routes/coach");

app.use("/auth", authRoutes);
app.use("/draft", draftRoutes);
app.use("/match", matchRoutes);
app.use("/coach", coachRoutes);

// ─── Health Check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "🏏 Cricket Squad Game API is live!",
    version: "1.0.0",
    endpoints: {
      auth: ["POST /auth/signup", "POST /auth/login"],
      draft: [
        "GET /draft/players",
        "GET /draft/bossTeams",
        "POST /draft/start",
        "POST /draft/updateDraft",
        "POST /draft/removeDraft",
        "GET /draft/session/:sessionId",
      ],
      match: ["POST /match/runMatch"],
      coach: ["POST /coach/getCoachInsights"],
    },
  });
});

// ─── Export as Cloud Function ──────────────────────────────────
exports.api = functions.https.onRequest(app);
