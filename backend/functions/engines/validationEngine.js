const { db } = require("../config/firebaseAdmin");

/**
 * Validation Engine
 *
 * Enforces all draft rules atomically via Firestore transactions:
 * - Budget check (currentCredits >= player.cost)
 * - Roster size (< 11 players)
 * - Role caps (BAT: 4, BWL: 4, AR: 3, WK: 1)
 * - No duplicate players
 */

// Maximum players allowed per role
const ROLE_CAPS = {
  BAT: 4,
  BWL: 4,
  AR: 3,
  WK: 1,
};

const MAX_TEAM_SIZE = 11;
const STARTING_CREDITS = 100;

/**
 * Validate and add a player to the user's draft — runs inside a Firestore transaction.
 *
 * @param {string} sessionId - Game session document ID
 * @param {string} playerId - Player document ID to add
 * @param {string} userId - Authenticated user's UID
 * @returns {{ success: boolean, session: object, message: string }}
 */
async function validateAndAddPlayer(sessionId, playerId, userId) {
  const sessionRef = db.collection("gameSessions").doc(sessionId);
  const playerRef = db.collection("players").doc(String(playerId));

  return db.runTransaction(async (transaction) => {
    // 1. Fetch session and player docs
    const sessionDoc = await transaction.get(sessionRef);
    const playerDoc = await transaction.get(playerRef);

    if (!sessionDoc.exists) {
      throw new Error("Game session not found.");
    }
    if (!playerDoc.exists) {
      throw new Error("Player not found.");
    }

    const session = sessionDoc.data();
    const player = playerDoc.data();

    // 2. Ownership check
    if (session.userId !== userId) {
      throw new Error("You do not own this game session.");
    }

    // 3. Status check
    if (session.status !== "DRAFTING") {
      throw new Error(`Cannot modify draft. Session status is '${session.status}'.`);
    }

    // 4. Duplicate check
    const userTeam = session.userTeam || [];
    if (userTeam.includes(String(playerId))) {
      throw new Error(`${player.cardName} is already in your squad.`);
    }

    // 5. Roster size check
    if (userTeam.length >= MAX_TEAM_SIZE) {
      throw new Error(`Squad is full (${MAX_TEAM_SIZE}/${MAX_TEAM_SIZE}). Remove a player first.`);
    }

    // 6. Budget check
    const currentCredits = session.currentCredits;
    if (currentCredits < player.cardCost) {
      throw new Error(
        `Insufficient credits. Need ${player.cardCost} Cr but only have ${currentCredits} Cr.`
      );
    }

    // 7. Role cap check
    const roleCount = userTeam.reduce((counts, pid) => {
      // We need to check existing roles from the session's stored role map
      return counts;
    }, {});

    // Build role counts from the teamRoles map stored in session
    const teamRoles = session.teamRoles || {};
    const currentRoleCount = Object.values(teamRoles).filter(
      (r) => r === player.role
    ).length;
    const maxForRole = ROLE_CAPS[player.role] || 4;

    if (currentRoleCount >= maxForRole) {
      throw new Error(
        `Role cap reached: max ${maxForRole} ${player.role} players allowed. Currently have ${currentRoleCount}.`
      );
    }

    // 8. All checks passed — atomically update
    const newCredits = parseFloat((currentCredits - player.cardCost).toFixed(1));
    const newTeam = [...userTeam, String(playerId)];
    const newRoles = { ...teamRoles, [String(playerId)]: player.role };

    transaction.update(sessionRef, {
      userTeam: newTeam,
      currentCredits: newCredits,
      teamRoles: newRoles,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: `${player.cardName} added to squad! (${newCredits} Cr remaining)`,
      session: {
        userTeam: newTeam,
        currentCredits: newCredits,
        teamRoles: newRoles,
        teamSize: newTeam.length,
      },
    };
  });
}

/**
 * Remove a player from the draft and refund credits.
 */
async function validateAndRemovePlayer(sessionId, playerId, userId) {
  const sessionRef = db.collection("gameSessions").doc(sessionId);
  const playerRef = db.collection("players").doc(String(playerId));

  return db.runTransaction(async (transaction) => {
    const sessionDoc = await transaction.get(sessionRef);
    const playerDoc = await transaction.get(playerRef);

    if (!sessionDoc.exists) throw new Error("Game session not found.");
    if (!playerDoc.exists) throw new Error("Player not found.");

    const session = sessionDoc.data();
    const player = playerDoc.data();

    if (session.userId !== userId) {
      throw new Error("You do not own this game session.");
    }
    if (session.status !== "DRAFTING") {
      throw new Error(`Cannot modify draft. Session status is '${session.status}'.`);
    }

    const userTeam = session.userTeam || [];
    const pidStr = String(playerId);

    if (!userTeam.includes(pidStr)) {
      throw new Error(`${player.cardName} is not in your squad.`);
    }

    const newTeam = userTeam.filter((id) => id !== pidStr);
    const newCredits = parseFloat((session.currentCredits + player.cardCost).toFixed(1));
    const newRoles = { ...(session.teamRoles || {}) };
    delete newRoles[pidStr];

    transaction.update(sessionRef, {
      userTeam: newTeam,
      currentCredits: newCredits,
      teamRoles: newRoles,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: `${player.cardName} removed. ${newCredits} Cr available.`,
      session: {
        userTeam: newTeam,
        currentCredits: newCredits,
        teamRoles: newRoles,
        teamSize: newTeam.length,
      },
    };
  });
}

module.exports = {
  validateAndAddPlayer,
  validateAndRemovePlayer,
  ROLE_CAPS,
  MAX_TEAM_SIZE,
  STARTING_CREDITS,
};
