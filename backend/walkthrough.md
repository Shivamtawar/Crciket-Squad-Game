# Cricket Squad Game — Backend Walkthrough

## What Was Built

A complete Firebase backend for a Fantasy Manager Simulation Game with **server-authoritative game logic** — all math and state mutations happen on the server to prevent client manipulation.

---

## Architecture

```
backend/
├── functions/
│   ├── config/firebaseAdmin.js    ← Admin SDK init
│   ├── middleware/auth.js         ← Bearer token verification
│   ├── data/
│   │   ├── players.js             ← 40 cricket players
│   │   └── bossTeams.js           ← 3 boss teams (Easy/Med/Hard)
│   ├── engines/
│   │   ├── validationEngine.js    ← Draft rules (budget, roles, caps)
│   │   ├── matchEngine.js         ← Weighted probability simulation
│   │   ├── coachEngine.js         ← AI strategic advisor
│   │   └── aiEngine.js            ← Gemini-powered analytics & suggestions
│   ├── routes/
│   │   ├── auth.js                ← POST /signup, /login
│   │   ├── draft.js               ← Draft CRUD + validation
│   │   ├── match.js               ← POST /runMatch
│   │   ├── coach.js               ← POST /getCoachInsights
│   │   └── ai.js                  ← AI endpoints (Gemini integration)
│   ├── index.js                   ← Express entry → Cloud Function
│   └── seed.js                    ← Database seeder
├── firebase.json                  ← Emulator config
├── firestore.rules                ← Security rules (no client writes)
└── .firebaserc                    ← Project alias
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | API status + endpoint listing |
| `POST` | `/auth/signup` | No | Create user account |
| `POST` | `/auth/login` | No | Login, get custom token |
| `GET` | `/draft/players` | Yes | Get all 40 players |
| `GET` | `/draft/bossTeams` | Yes | Get all boss teams |
| `POST` | `/draft/start` | Yes | Start new draft session (100 Cr) |
| `POST` | `/draft/updateDraft` | Yes | Add player (validated) |
| `POST` | `/draft/removeDraft` | Yes | Remove player, refund credits |
| `GET` | `/draft/session/:id` | Yes | Get session state + team details |
| `POST` | `/match/runMatch` | Yes | Run 20-over match simulation |
| `POST` | `/coach/getCoachInsights` | Yes | Get AI coaching strategy |
| `POST` | `/ai/auto-suggest` | Yes | AI suggests best 11-player squad (Gemini) |
| `GET` | `/ai/player-analysis/:id`| Yes | Deep individual player performance review |
| `POST` | `/ai/team-analysis` | Yes | Overall squad rating & strategic audit |
| `POST` | `/ai/win-probability` | Yes | AI-calculated win chance against Pro boss |

---

## Key Features

### 1. Validation Engine (Atomic Transactions)
All draft operations run inside Firestore transactions to prevent race conditions:
- **Budget**: `currentCredits >= player.cardCost`
- **Roster**: max 11 players
- **Role caps**: BAT(4), BWL(4), AR(3), WK(1)
- **Duplicate prevention**

### 2. Match Engine (Weighted Probability)
```
userScore = (teamAvgStats × avgFormFactor) × (1 ± 5% luck)
bossScore = (bossAvgStats × bossFormFactor) × (1 ± 5% luck)
```
Generates a 20-over play-by-play log with:
- Batting events weighted by power stats
- Bowling events weighted by defense stats
- Clutch moments every 5 overs

### 3. AI Coach (3 Strategies)
- **⚔️ Aggressive**: Suggests power hitters when budget allows
- **📊 Analytical**: Best value-for-money picks (stats/cost ratio)
- **🛡️ Defensive**: Warns about weak bowling lineup
- **🧤 Reminder**: Alerts if no wicket-keeper picked
- **🧠 Coach Gemini (Team Audit)**: When the squad is full (11/11), Gemini provides a deep strategic audit, identifies vulnerabilities, and suggests tactical swaps.

### 4. Gemini AI Integration (New 🚀)
The backend now leverages the **Google Gemini 1.5 Flash** model to provide:
- **Auto-Drafting**: Scans the player pool to build the most mathematically optimal squad for your remaining credits.
- **Player Trends**: Generates synthetic "Past 5 Years" performance metrics and trends based on player attributes.
- **Squad Auditing**: Provides a qualitative 1-100 rating and strategic improvements for your team.

### 5. Security Rules
All client writes blocked. Only the Admin SDK (Cloud Functions) can mutate game data.
AI API keys are protected in `.env` and never exposed to the frontend.

---

## Data Model Alignment

The backend Player model extends the frontend interface:

| Frontend Field | Backend Field | Notes |
|---|---|---|
| `id` | `id` | ✅ Same |
| `cardName` | `cardName` | ✅ Same |
| `description` | `description` | ✅ Same |
| `score` | `score` | ✅ Same |
| `rarity` | `rarity` | ✅ Same |
| `imageUrl` | `imageUrl` | ✅ Same Cloudinary URLs |
| `cardCost` | `cardCost` | ✅ Same (7.0–10.0) |
| `role` | `role` | ✅ Same (BAT/BWL/AR/WK) |
| — | `baseStats.power` | 🆕 Backend only (50–98) |
| — | `baseStats.defense` | 🆕 Backend only (48–98) |
| — | `formFactor` | 🆕 Backend only (1.0–1.2) |
| — | `specialty` | 🆕 Backend only |

---

## Seed Data Summary

- **40 Players**: 12 BAT, 12 BWL, 12 AR, 4 WK
- **Cost range**: 7.0 – 10.0 Cr
- **3 Boss Teams**: Dhaka Dynamos (Easy), Sydney Thunder (Medium), Mumbai Legends (Hard)
- **Demo user**: `test@example.com` / `password123`

---

## Validation Results

- ✅ All 8 modules load without errors
- ✅ 40 players with correct role distribution
- ✅ 3 boss teams with escalating difficulty
- ✅ 540 npm packages installed
- ✅ Firestore security rules block all client writes

---

## How to Run

```bash
# 1. Start Firebase Emulators
cd backend
firebase emulators:start

# 2. Seed the database (in another terminal)
cd backend/functions
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node seed.js

# 3. API will be available at:
#    http://localhost:5001/cricket-squad-game/us-central1/api
```
