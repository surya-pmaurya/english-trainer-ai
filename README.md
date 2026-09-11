# English Trainer AI

A full-stack English-learning MVP: responsive React interface, secure Express/MongoDB API, server-side Gemini tutoring, learning history, progress metrics, vocabulary, recurring mistake tracking, and browser speech-to-text support.

## What is implemented

- Registration, verification emails, login, refresh-token rotation in HTTP-only cookies, logout, password-reset flow, and password-change endpoint.
- Profile, three-step onboarding, persisted light/dark/system themes, and protected learning routes.
- Practice modes for conversations, speaking, grammar, interviews, travel, and workplace English.
- Server-validated Gemini responses with concise corrections, useful vocabulary suggestions, error fallbacks, AI request rate limits, and no browser API key exposure.
- Stored sessions, transparent score aggregation, daily goals, timezone-aware streaks, vocabulary collection, recurring mistakes, session reports, and data-backed dashboard screens.
- Browser Speech Recognition and speech synthesis where supported. The product deliberately does **not** claim pronunciation scores without a reliable audio-analysis provider.

## Run locally

1. Copy `.env.example` to `.env` in the project root and fill in at least `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `GEMINI_API_KEY`.
2. From this directory, install dependencies with `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The API runs at `http://localhost:5000`. If SMTP is not configured in development, verification and password-reset links are written to the server console for safe local testing.

## Structure

```text
client/        React + Vite + Tailwind user interface
server/        Express REST API
  controllers/ Request orchestration
  services/    Gemini, email, scoring, progress logic
  models/      Mongoose data models
  middleware/  Authentication, validation, limits, errors
```

## Before production

- Set a long, unique `JWT_ACCESS_SECRET` and a real MongoDB URI.
- Configure SMTP or a transactional email provider.
- Serve client and API over HTTPS, configure the exact production `CLIENT_URL`, and set `NODE_ENV=production`.
- Add integration tests and monitoring for the chosen hosting environment.
