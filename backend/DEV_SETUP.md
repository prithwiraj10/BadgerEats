Developer setup & test instructions (backend)

This file explains how to run the backend locally, create a local database with Prisma, and test the Twilio webhook/send flow using ngrok.

Prereqs
- Node 18+
- npm or yarn
- (Optional) ngrok for exposing local webhooks

Quickstart
1. Copy env example
   - cp .env.example .env
   - Fill in values in `.env`.
     - For quick local testing you can set DATABASE_URL="file:./dev.db" to use SQLite.
     - If you don't have Twilio credentials during local development, you can still exercise most flows except actually sending SMS.

2. Install dependencies

```bash
npm install
```

3. Prisma: create the local DB and run migrations (SQLite example)

```bash
# If DATABASE_URL points to sqlite file (file:./dev.db)
npx prisma migrate dev --name init --create-only
npx prisma db push
# Optional: generate types
npx prisma generate
```

4. Start server in dev mode

```bash
npm run dev
```

The server will start on the port configured in `.env` (default 4000). The scheduler will also register (see logs).

Dev-only endpoints
- GET /api/config
  - Returns non-secret runtime info used by the frontend.
- POST /api/dev/send-test-sms
  - Body: { "to": "+1555...", "body": "Test message" }
  - Headers: `x-dev-key: <DEV_KEY>` (unless DEV_KEY not set in .env)
  - Disabled in production (blocked when NODE_ENV=production).

Testing Twilio webhooks with ngrok
1. Run ngrok to expose port 4000 (or whatever PORT you set)

```bash
ngrok http 4000
```

2. In your Twilio console, set the Messaging webhook URL for your phone number to:
   https://<your-ngrok-host>/api/webhooks/twilio

3. Use the Twilio console to send messages to your Twilio number or use the real phone to trigger inbound webhooks.

Sending a test SMS from the backend (dev)
1. Make a POST request to `/api/dev/send-test-sms` with header `x-dev-key` and body `{ to, body }`.

Example using curl:

```bash
curl -X POST http://localhost:4000/api/dev/send-test-sms \
  -H "Content-Type: application/json" \
  -H "x-dev-key: changeme_dev_key" \
  -d '{"to":"+1XXXXXXXXXX","body":"Hello from dev backend"}'
```

Notes & tips
- Twilio trial accounts require verifying target phone numbers. If you're on a trial account, add your test device number to Twilio's verified numbers list.
- For quick demos, you can skip wire-up of Creao/OpenAI and create alerts manually via `POST /api/alerts` (see `src/routes/alerts.ts`).
- If you change Prisma models, run `npx prisma migrate dev` or `npx prisma db push` for fast iteration.

If you'd like, I can also:
- Add a tiny seed script to insert a sample user and sample alert for demoing.
- Add a simple Postman collection / HTTPie script for smoke tests.
