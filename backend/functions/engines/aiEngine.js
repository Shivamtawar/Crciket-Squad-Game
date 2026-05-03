const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require("../config/firebaseAdmin");

// Initialize Gemini API (User should provide the key in environment)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

/**
 * AI Engine for Player Suggestions and Analysis
 */

async function getAutoSuggestTeam(currentCredits, teamRoles = {}) {
  // Fetch all players
  const playersSnap = await db.collection("players").get();
  const players = [];
  playersSnap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert Cricket Scout. I need to build a balanced squad of 11 players.
    Current available credits: ${currentCredits}
    Current roles in team: ${JSON.stringify(teamRoles)}

    Here is the pool of players:
    ${JSON.stringify(players.map(p => ({ id: p.id, name: p.cardName, cost: p.cardCost, role: p.role, stats: p.baseStats })))}

    Rules:
    1. Total cost must not exceed ${currentCredits}.
    2. Need a balanced team: ~4-5 Batsmen, 3-4 Bowlers, 2 All-rounders, 1 Wicket-keeper.
    3. Suggest the BEST possible squad from the available pool.

    Return the response as a JSON object with:
    - suggestedTeam: Array of player IDs
    - reasoning: A brief explanation for the selection.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Extract JSON from the response (Gemini sometimes adds markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("AI Auto-suggest error:", error);
    throw new Error("AI failed to generate suggestions.");
  }
}

async function getPlayerAnalysis(playerId) {
  const playerDoc = await db.collection("players").doc(String(playerId)).get();
  if (!playerDoc.exists) throw new Error("Player not found.");
  
  const player = playerDoc.data();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this cricket player and provide a "Past 5 Years Performance" summary and strategy.
    Player Data: ${JSON.stringify(player)}

    Return the response as a JSON object with:
    - analysis: String (detailed analysis)
    - statsTrend: Array of objects { year, performanceScore }
    - strengths: Array of strings
    - weaknesses: Array of strings
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("AI Player analysis error:", error);
    throw new Error("AI failed to analyze player.");
  }
}

async function getTeamAnalysis(teamIds) {
  const playersSnap = await db.collection("players").get();
  const allPlayers = {};
  playersSnap.forEach(doc => allPlayers[doc.id] = doc.data());

  const team = teamIds.map(id => allPlayers[id]).filter(p => p);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this Cricket Squad and provide strategic feedback.
    Team: ${JSON.stringify(team.map(p => ({ name: p.cardName, role: p.role, cost: p.cardCost, stats: p.baseStats })))}

    Return the response as a JSON object with:
    - teamRating: Number (1-100)
    - verdict: String (overall assessment)
    - improvements: Array of strings
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("AI Team analysis error:", error);
    throw new Error("AI failed to analyze team.");
  }
}

async function getWinProbability(teamIds) {
  const playersSnap = await db.collection("players").get();
  const allPlayers = {};
  playersSnap.forEach(doc => allPlayers[doc.id] = doc.data());

  const team = teamIds.map(id => allPlayers[id]).filter(p => p);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Based on the reputation and stats of these cricket players, calculate the win probability of this squad against a standard "Pro" difficulty boss team.
    Squad: ${JSON.stringify(team.map(p => ({ name: p.cardName, role: p.role, cost: p.cardCost, stats: p.baseStats, score: p.score })))}

    Return the response as a JSON object with:
    - winProbability: Number (0-100 percentage)
    - keyFactor: String (the most important reason for this probability)
    - bossDifficultyMatch: String (Easy/Medium/Hard)
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("AI Win Probability error:", error);
    throw new Error("AI failed to calculate win probability.");
  }
}

module.exports = {
  getAutoSuggestTeam,
  getPlayerAnalysis,
  getTeamAnalysis,
  getWinProbability
};
