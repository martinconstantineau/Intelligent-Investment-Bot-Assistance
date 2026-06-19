# Intelligent Investment Bot Assistance

An early-stage portfolio research assistant for monitoring holdings, tracking theses, reviewing risk, and keeping a decision journal.

## Purpose

This project is being scaled back to a small Firebase-backed MVP. The first goal is to make the app deployable, authenticated, and persistent before adding advanced reporting or external API integrations.

## Important disclaimer

This software is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice. Users remain responsible for their own decisions.

## Current MVP direction

Core stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase App Hosting
- Firebase Authentication
- Cloud Firestore
- Cloud Functions for Firebase
- Firestore Security Rules

External market-data and AI providers are deferred until the Firebase foundation is working end-to-end.

## Canonical starting portfolio

The initial research list is:

- AMD
- ETH
- SOL
- SanDisk
- Applied Materials
- AST SpaceMobile
- Quantum Computing Inc.
- Arm Holdings

The seed data intentionally leaves quantities, cost details, purchase dates, and allocation percentages blank. Do not invent missing portfolio values.

## Firebase data model

Use user-scoped documents and subcollections:

```text
users/{userId}
users/{userId}/holdings/{holdingId}
users/{userId}/watchlist/{watchlistId}
users/{userId}/theses/{thesisId}
users/{userId}/researchNotes/{noteId}
users/{userId}/reports/{reportId}
users/{userId}/decisionJournal/{entryId}
```

Firebase configuration files:

```text
firebase.json
firestore.rules
firestore.indexes.json
apphosting.yaml
functions/src/index.ts
```

## Local setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the Firebase values.

Required for the client app:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firebase console steps

1. Create a Firebase project.
2. Enable billing if Firebase App Hosting or scheduled functions require it.
3. Set a budget alert.
4. Enable Firebase Authentication.
5. Enable Cloud Firestore.
6. Deploy or paste the Firestore rules from `firestore.rules`.
7. Connect the GitHub repository to Firebase App Hosting.
8. Add Firebase public environment variables to App Hosting.
9. Keep external market-data and AI API keys disabled until the MVP is stable.

## First MVP boundary

Included:

- Canonical holdings list
- Firebase SDK setup
- Firebase Admin setup
- Firestore security rules
- Firebase App Hosting configuration
- Placeholder scheduled function
- Empty states for theses, reports, and allocation data

Excluded for now:

- Brokerage integration
- Automated trading
- Paid external API calls
- Real-time market pricing
- Portfolio calculations without user-entered quantities and values
