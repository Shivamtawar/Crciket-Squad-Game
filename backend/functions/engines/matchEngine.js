const { db } = require("../config/firebaseAdmin");

// Event Templates
const BATTING_EVENTS = [
  { text: "{player} smashes a massive SIX! 💥", runs: 6 },
  { text: "{player} drives through covers for FOUR! 🏏", runs: 4 },
  { text: "{player} flicks it off the pads for 2 runs.", runs: 2 },
  { text: "{player} nudges for a quick single.", runs: 1 },
  { text: "{player} plays a dot ball. Good defense.", runs: 0 },
  { text: "{player} launches it into the stands! SIX! 🔥", runs: 6 },
  { text: "{player} cuts past point for FOUR! 💪", runs: 4 },
  { text: "{player} works it to mid-wicket for a single.", runs: 1 },
  { text: "{player} sweeps beautifully for FOUR! 🎯", runs: 4 },
];

const BOWLING_EVENTS = [
  { text: "{player} takes a WICKET! Clean bowled! 🎳", wickets: 1 },
  { text: "{player} gets an edge — CAUGHT behind! 🧤", wickets: 1 },
  { text: "{player} bowls a tight over! 🔒", wickets: 0 },
  { text: "{player} beats the bat! Dot ball.", wickets: 0 },
  { text: "{player} bowls a brilliant yorker! 🎯", wickets: 0 },
];

const CLUTCH_EVENTS = [
  "🌟 MOMENTUM SHIFT! The crowd roars!",
  "⚡ ELECTRIC ATMOSPHERE! What a contest!",
  "🔥 HEATED BATTLE! Both teams giving their all!",
  "💎 PRESSURE MOMENT! Can they hold their nerve?",
];

function applyLuck(score) {
  return score * (1 + (Math.random() * 0.1 - 0.05));
}

function generateSimulationLog(userPlayers, bossTeam) {
  const log = [];
  let userRuns = 0, bossRuns = 0, userWickets = 0, bossWickets = 0;

  const batsmen = userPlayers.filter(p => ["BAT","WK","AR"].includes(p.role));
  const bowlers = userPlayers.filter(p => ["BWL","AR"].includes(p.role));
  const bossBatsmen = bossTeam.players.filter(p => ["BAT","WK","AR"].includes(p.role));

  for (let over = 1; over <= 20; over++) {
    const overLog = { over, events: [] };

    if (over <= 10) {
      const bat = batsmen[Math.floor(Math.random() * batsmen.length)];
      for (let ball = 1; ball <= 6; ball++) {
        if (userWickets >= 10) break;
        const pw = (bat.baseStats?.power || 70) / 100;
        if (Math.random() < pw * 0.3) {
          const ev = BATTING_EVENTS.filter(e => e.runs >= 4);
          const ch = ev[Math.floor(Math.random() * ev.length)];
          userRuns += ch.runs;
          overLog.events.push({ ball, text: ch.text.replace("{player}", bat.cardName || bat.name), runs: ch.runs, team: "user" });
        } else if (Math.random() < 0.15) {
          userWickets++;
          overLog.events.push({ ball, text: `${bat.cardName || bat.name} is OUT! 😱`, runs: 0, wicket: true, team: "user" });
        } else {
          const r = Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : 0;
          userRuns += r;
          overLog.events.push({ ball, text: `${bat.cardName || bat.name} gets ${r} run(s).`, runs: r, team: "user" });
        }
      }
      overLog.userScore = userRuns;
      overLog.userWickets = userWickets;
    }

    if (over > 10) {
      const bwl = bowlers[Math.floor(Math.random() * bowlers.length)];
      const bossBat = bossBatsmen[Math.floor(Math.random() * bossBatsmen.length)];
      for (let ball = 1; ball <= 6; ball++) {
        if (bossWickets >= 10) break;
        const def = (bwl.baseStats?.defense || 70) / 100;
        if (Math.random() < def * 0.25) {
          bossWickets++;
          const ev = BOWLING_EVENTS.filter(e => e.wickets > 0);
          const ch = ev[Math.floor(Math.random() * ev.length)];
          overLog.events.push({ ball, text: ch.text.replace("{player}", bwl.cardName || bwl.name), wicket: true, team: "boss" });
        } else {
          const bp = (bossBat?.power || 70) / 100;
          let r = 0;
          if (Math.random() < bp * 0.25) { r = Math.random() < 0.5 ? 6 : 4; }
          else { r = Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : 0; }
          bossRuns += r;
          overLog.events.push({ ball, text: `${bossBat?.name || "Boss"} scores ${r} off ${bwl.cardName || bwl.name}.`, runs: r, team: "boss" });
        }
      }
      overLog.bossScore = bossRuns;
      overLog.bossWickets = bossWickets;
    }

    if (over % 5 === 0) {
      overLog.events.push({ ball: 0, text: CLUTCH_EVENTS[Math.floor(Math.random() * CLUTCH_EVENTS.length)], special: true });
    }
    log.push(overLog);
  }
  return { log, userRuns, bossRuns, userWickets, bossWickets };
}

async function simulateMatch(sessionId, userId) {
  const sessionRef = db.collection("gameSessions").doc(sessionId);
  const sessionDoc = await sessionRef.get();
  if (!sessionDoc.exists) throw new Error("Game session not found.");

  const session = sessionDoc.data();
  if (session.userId !== userId) throw new Error("You do not own this session.");
  if (session.status !== "DRAFTING") throw new Error(`Cannot run match. Status: '${session.status}'.`);
  if (!session.userTeam || session.userTeam.length < 11) {
    throw new Error(`Need 11 players. Have ${(session.userTeam || []).length}.`);
  }

  await sessionRef.update({ status: "SIMULATING" });

  const playerDocs = await Promise.all(
    session.userTeam.map(pid => db.collection("players").doc(String(pid)).get())
  );
  const userPlayers = playerDocs.map(doc => ({ id: doc.id, ...doc.data() }));

  const bossDoc = await db.collection("bossTeams").doc(session.bossTeamId || "easy").get();
  if (!bossDoc.exists) throw new Error("Boss team not found.");
  const bossTeam = bossDoc.data();

  const userAvgPower = userPlayers.reduce((s, p) => s + (p.baseStats?.power || 70), 0) / userPlayers.length;
  const userAvgDefense = userPlayers.reduce((s, p) => s + (p.baseStats?.defense || 70), 0) / userPlayers.length;
  const userAvgForm = userPlayers.reduce((s, p) => s + (p.formFactor || 1.0), 0) / userPlayers.length;
  const userAvgStats = (userAvgPower + userAvgDefense) / 2;
  const bossAvgStats = (bossTeam.avgPower + bossTeam.avgDefense) / 2;

  const userCalc = applyLuck(userAvgStats * userAvgForm);
  const bossCalc = applyLuck(bossAvgStats * bossTeam.formFactor);

  const sim = generateSimulationLog(userPlayers, bossTeam);

  let winner, margin;
  if (sim.userRuns > sim.bossRuns) { winner = "USER"; margin = `Won by ${sim.userRuns - sim.bossRuns} runs`; }
  else if (sim.bossRuns > sim.userRuns) { winner = "BOSS"; margin = `Lost by ${sim.bossRuns - sim.userRuns} runs`; }
  else { winner = "TIE"; margin = "Match tied! What a thriller!"; }

  const result = {
    winner, margin,
    userScore: { runs: sim.userRuns, wickets: sim.userWickets, rating: Math.round(userCalc * 10) / 10 },
    bossScore: { runs: sim.bossRuns, wickets: sim.bossWickets, rating: Math.round(bossCalc * 10) / 10 },
    bossTeam: { name: bossTeam.name, difficulty: bossTeam.difficulty },
    userTeamStats: { avgPower: Math.round(userAvgPower), avgDefense: Math.round(userAvgDefense), avgForm: Math.round(userAvgForm * 100) / 100 },
  };

  await sessionRef.update({ status: "COMPLETED", result, simulationLog: sim.log, completedAt: new Date() });

  return { success: true, result, simulationLog: sim.log };
}

module.exports = { simulateMatch };
