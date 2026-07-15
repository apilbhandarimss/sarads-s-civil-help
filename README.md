# Sarad's Civil Help

Sarad's Civil Help is a React + Firebase web app for sharing and discovering civil engineering study materials (Loksewa, NEC license, bachelor's, entrance, and master's resources).

## What it does

- Browse study materials by category and subcategory
- Search by title, description, tags, and note content
- Sign in with Google to publish notes
- Like notes and participate in note discussions
- View contributor profiles and their uploads
- Admin approval workflow for submitted notes

## Tech stack

- React 19 + TypeScript
- Vite
- Firebase Authentication (Google)
- Cloud Firestore
- Tailwind CSS

## Prerequisites

- Node.js 18+ (recommended)
- npm
- A Firebase project with Authentication and Firestore enabled

## Environment variables

Create a `.env.local` file in the project root:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
# Optional (defaults to "(default)")
VITE_FIREBASE_FIRESTORE_DB_ID=
```

## Run locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Validate and build

```bash
npm run lint
npm run build
npm run preview
```

## Firestore rules

Security rules are defined in [`firestore.rules`](./firestore.rules).

## Project structure

```text
src/
  App.tsx
  firebase.ts
  types.ts
  components/
firestore.rules
security_spec.md
```

## Deployment

This repository includes `vercel.json` for SPA rewrites. Any static host that supports Vite build output (`dist/`) can be used.
