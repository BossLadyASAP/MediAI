# ChatGPT Platform Clone — Backend

Node.js + Express + MongoDB backend for the ChatGPT Platform Clone. All AI/chat responses are mocked.

## Features
- Auth (email/password, Google OAuth — mocked)
- Chat endpoints (send, history, delete, rename)
- Model selector, user/profile endpoints
- File upload/download (Multer)
- Billing (Stripe, mocked)

## Setup
```bash
npm install
npm run dev
```

## Structure
- `/src/routes` — API endpoints
- `/src/models` — Mongoose models
- `/src/middleware` — JWT, Multer, etc.
