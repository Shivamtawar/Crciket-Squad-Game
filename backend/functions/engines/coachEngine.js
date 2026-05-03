const { db } = require("../config/firebaseAdmin");

/**
 * AI Coach Engine
 *
 * Three strategy modes:
 *   1. Aggressive — Suggests high-cost power hitters if budget allows
 *   2. Analytical — Identifies "Value for Money" players (high stats/cost ratio)
 *   3. Defensive — Warns if bowling lineup is too weak
 */

async function getCoachInsights(sessionId, userId) {
  const sessionDoc = await db.collection("gameSessions").doc(sessionId).get();
  if (!sessionDoc.exists) throw new Error("Game session not found.");

  const session = sessionDoc.data();
  if (session.userId !== userId) throw new Error("You do not own this session.");

  const userTeam = session.userTeam || [];
  const teamRoles = session.teamRoles || {};
  const currentCredits = session.currentCredits;

  // Fetch all players for analysis
  const playersSnap = await db.collection("players").get();
  const allPlayers = [];
  playersSnap.forEach(doc => allPlayers.push({ id: doc.id, ...doc.data() }));

  // Players NOT yet drafted
  const available = allPlayers.filter(p => !userTeam.includes(String(p.id)));

  // Current team player data
  const teamPlayers = allPlayers.filter(p => userTeam.includes(String(p.id)));

  // Role counts
  const roleCounts = { BAT: 0, BWL: 0, AR: 0, WK: 0 };
  Object.values(teamRoles).forEach(role => { if (roleCounts[role] !== undefined) roleCounts[role]++; });

  // Fetch boss team for comparison
  const bossTeamId = session.bossTeamId || "easy";
  const bossDoc = await db.collection("bossTeams").doc(bossTeamId).get();
  const bossTeam = bossDoc.exists ? bossDoc.data() : null;

  const insights = [];
  const suggestedPlayers = [];

  // ─── Strategy 1: AGGRESSIVE ───
  if (currentCredits >= 15) {
    const powerHitters = available
      .filter(p => p.role === "BAT" && p.cardCost <= currentCredits && (p.baseStats?.power || 0) >= 80)
      .sort((a, b) => (b.baseStats?.power || 0) - (a.baseStats?.power || 0))
      .slice(0, 3);

    if (powerHitters.length > 0) {
      insights.push({
        strategy: "AGGRESSIVE",
        icon: "⚔️",
        message: `You have ${currentCredits} Cr remaining — enough for premium picks! Consider adding elite power hitters to dominate the batting phase.`,
        suggestedPlayers: powerHitters.map(p => ({
          id: p.id,
          cardName: p.cardName,
          role: p.role,
          cardCost: p.cardCost,
          power: p.baseStats?.power,
          formFactor: p.formFactor,
          reason: `${p.specialty} — Power: ${p.baseStats?.power}, Form: ${p.formFactor}x`,
        })),
      });
    }
  }

  // ─── Strategy 2: ANALYTICAL (Value for Money) ───
  const valuePicks = available
    .filter(p => p.cardCost <= currentCredits)
    .map(p => {
      const avgStat = ((p.baseStats?.power || 0) + (p.baseStats?.defense || 0)) / 2;
      const valueScore = (avgStat * (p.formFactor || 1.0)) / p.cardCost;
      return { ...p, valueScore };
    })
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 3);

  if (valuePicks.length > 0) {
    insights.push({
      strategy: "ANALYTICAL",
      icon: "📊",
      message: `Best value-for-money picks based on stats/cost ratio and current form factor. These players punch above their price tag.`,
      suggestedPlayers: valuePicks.map(p => ({
        id: p.id,
        cardName: p.cardName,
        role: p.role,
        cardCost: p.cardCost,
        valueScore: Math.round(p.valueScore * 100) / 100,
        formFactor: p.formFactor,
        reason: `Value Score: ${Math.round(p.valueScore * 100) / 100} — ${p.specialty}`,
      })),
    });
  }

  // ─── Strategy 3: DEFENSIVE ───
  const bowlerCount = roleCounts.BWL + (roleCounts.AR > 0 ? Math.min(roleCounts.AR, 2) : 0);
  const avgBowlingDefense = teamPlayers.length > 0
    ? teamPlayers.filter(p => p.role === "BWL" || p.role === "AR")
        .reduce((sum, p) => sum + (p.baseStats?.defense || 0), 0) /
      Math.max(teamPlayers.filter(p => p.role === "BWL" || p.role === "AR").length, 1)
    : 0;

  const needMoreBowlers = roleCounts.BWL < 3;
  const weakBowling = avgBowlingDefense < 75;

  if (needMoreBowlers || weakBowling) {
    const suggestedBowlers = available
      .filter(p => p.role === "BWL" && p.cardCost <= currentCredits)
      .sort((a, b) => (b.baseStats?.defense || 0) - (a.baseStats?.defense || 0))
      .slice(0, 3);

    let warningMsg = "";
    if (needMoreBowlers && weakBowling) {
      warningMsg = `⚠️ CRITICAL: Only ${roleCounts.BWL} dedicated bowlers with avg defense of ${Math.round(avgBowlingDefense)}.`;
    } else if (needMoreBowlers) {
      warningMsg = `⚠️ Only ${roleCounts.BWL} bowlers in the squad. You need at least 3-4 for a balanced attack.`;
    } else {
      warningMsg = `⚠️ Bowling defense avg is ${Math.round(avgBowlingDefense)} — below the recommended 75.`;
    }

    if (bossTeam) {
      warningMsg += ` The ${bossTeam.name} (${bossTeam.difficulty}) has batting strength of ${bossTeam.battingStrength}.`;
    }

    insights.push({
      strategy: "DEFENSIVE",
      icon: "🛡️",
      message: warningMsg,
      suggestedPlayers: suggestedBowlers.map(p => ({
        id: p.id,
        cardName: p.cardName,
        role: p.role,
        cardCost: p.cardCost,
        defense: p.baseStats?.defense,
        reason: `${p.specialty} — Defense: ${p.baseStats?.defense}`,
      })),
    });
  }

  // ─── Summary ───
  const slotsRemaining = 11 - userTeam.length;
  const summary = {
    teamSize: userTeam.length,
    slotsRemaining,
    currentCredits,
    roleCounts,
    avgCreditsPerSlot: slotsRemaining > 0 ? Math.round((currentCredits / slotsRemaining) * 10) / 10 : 0,
  };

  // WK reminder
  if (roleCounts.WK === 0 && slotsRemaining > 0) {
    insights.unshift({
      strategy: "REMINDER",
      icon: "🧤",
      message: "You haven't picked a Wicket-Keeper yet! Every team needs exactly 1 WK.",
      suggestedPlayers: available
        .filter(p => p.role === "WK" && p.cardCost <= currentCredits)
        .map(p => ({ id: p.id, cardName: p.cardName, cardCost: p.cardCost, reason: p.specialty })),
    });
  }

  return { success: true, summary, insights };
}

module.exports = { getCoachInsights };
