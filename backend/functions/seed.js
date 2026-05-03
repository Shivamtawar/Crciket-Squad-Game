/**
 * Seed Script — Populates Firestore with 40 players, 3 boss teams,
 * and creates the demo user (test@example.com / password123).
 *
 * Usage:
 *   1. With Emulator: FIRESTORE_EMULATOR_HOST=localhost:8080 node seed.js
 *   2. With Service Account: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node seed.js
 */

const admin = require("firebase-admin");

// Initialize Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const players = require("./data/players");
const bossTeams = require("./data/bossTeams");

async function seedPlayers() {
  console.log("🏏 Seeding 40 players...");
  const batch = db.batch();

  players.forEach((player) => {
    const docRef = db.collection("players").doc(String(player.id));
    batch.set(docRef, player);
  });

  await batch.commit();
  console.log(`   ✅ ${players.length} players seeded successfully.`);
}

async function seedBossTeams() {
  console.log("👹 Seeding boss teams...");
  const batch = db.batch();

  bossTeams.forEach((team) => {
    const docRef = db.collection("bossTeams").doc(team.id);
    batch.set(docRef, team);
  });

  await batch.commit();
  console.log(`   ✅ ${bossTeams.length} boss teams seeded successfully.`);
}

async function createDemoUser() {
  console.log("👤 Creating demo user...");

  try {
    // Check if user already exists
    const existing = await auth.getUserByEmail("test@example.com");
    console.log(`   ℹ️  Demo user already exists (UID: ${existing.uid}). Skipping.`);
    return existing;
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      const user = await auth.createUser({
        email: "test@example.com",
        password: "password123",
        displayName: "Test Player",
      });
      console.log(`   ✅ Demo user created (UID: ${user.uid}).`);
      return user;
    }
    throw error;
  }
}

async function seed() {
  console.log("═══════════════════════════════════════════");
  console.log("  🏏 CRICKET SQUAD GAME — Database Seeder");
  console.log("═══════════════════════════════════════════\n");

  try {
    await seedPlayers();
    await seedBossTeams();
    await createDemoUser();

    console.log("\n═══════════════════════════════════════════");
    console.log("  ✅ ALL DONE! Database is ready to go.");
    console.log("═══════════════════════════════════════════");
    console.log("\n  Demo credentials:");
    console.log("    Email:    test@example.com");
    console.log("    Password: password123\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
