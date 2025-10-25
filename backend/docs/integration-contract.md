# Integration Contract: Creao AI ↔ Twilio SMS Platform

## Overview
This document captures the working assumptions for integrating Creao AI content generation with the Twilio-powered SMS notification system used by the campus food notifier project. Update this contract once official API references are available.

## Creao AI Content Service
- **Endpoint (assumed)**: `POST https://api.creao.ai/v1/generate`
- **Auth**: Bearer token via `Authorization: Bearer <CREAO_API_KEY>`.
- **Request shape** (JSON):
  ```json
  {
    "prompt": "Write a concise food alert for ...",
    "max_tokens": 160,
    "temperature": 0.3,
    "metadata": {
      "source": "web_scraper|manual_submission",
      "tags": ["free", "vegetarian"]
    }
  }
  ```
  - `prompt` will be assembled server-side to include location, time window, and preference tags.
  - `metadata` is optional and gives model context for style adjustments.
- **Response shape** (JSON):
  ```json
  {
    "id": "gen_123",
    "content": "Free pizza at Union South Room 222 until 4 PM. Limited slices — hurry!",
    "tokens_used": 47,
    "finish_reason": "stop"
  }
  ```
  - If the live API uses a different field (e.g., `text` or `choices[0].message.content`), adapt the parser in `src/services/creaoClient.ts`.
- **Latency budget**: < 2 seconds per generation; retry up to 2 times with exponential backoff (base 500ms) on 429/5xx responses.
- **Rate limiting**: Assume 60 requests/minute shared quota. Batch menu items before calling to stay inside quota.

## Twilio SMS Service
- **Send SMS**: Twilio Programmable SMS REST API using the official Node SDK.
- **From number**: `TWILIO_FROM` (must be SMS-capable; in trial mode, recipients must be verified).
- **Outbound policy**cd "/Users/prith/Documents/CalHacks 12.0"
git initgit push -u origin main:
  1. Compose alert text (≤ 320 chars) from Creao AI output.
  2. Append unsubscribe footer on first send: "Reply STOP to opt out".
  3. Call `client.messages.create({ to, from, body })`.
- **Inbound webhook** (`/api/webhooks/twilio`):
  - Receive `POST` with `Body`, `From`, `SmsStatus`.
  - Trim and uppercase body; if `STOP|UNSUBSCRIBE|CANCEL|END|QUIT`, mark user unsubscribed and confirm with "You will no longer receive alerts.".
  - For other keywords (e.g., "MENU", "FREE"), forward payload to Creao AI for an ad-hoc response, then reply via Twilio `MessagingResponse`.

## Data Contract
- **Users table**:
  - `id` (UUID), `name`, `phoneE164`, `preferences` (JSON array), `subscribed` (boolean), timestamps.
- **Alerts table**:
  - `id`, `title`, `summary`, `location`, `startTime`, `endTime`, `tags` (string[]), `source`, `createdAt`.
- **Delivery Log** (optional MVP+):
  - `id`, `alertId`, `userId`, `status` (SENT|FAILED|STOPPED), `twilioSid`.

## Flow Summary
1. Scheduler scrapes or receives food event (`sourcePayload`).
2. Backend normalizes data and builds `prompt` for Creao AI.
3. Creao AI returns `content` → saved as `Alerts.summary`.
4. Preference engine selects matching users.
5. For each user:
   - Compose SMS body (`summary + location + time`).
   - Send via Twilio.
   - Record delivery status, handle errors (retry on 429/5xx with max 3 attempts).
6. Inbound messages:
   - `STOP` toggles `subscribed=false`.
   - Other keywords trigger contextual responses via Creao AI.

## Open Questions / Next Steps
- Confirm actual Creao AI endpoint, parameter names, and rate limits.
- Determine if Creao needs streaming responses and whether partial completions are possible.
- Decide whether to batch notifications (Twilio Notify) once user base grows.
- Verify compliance with Twilio STOP/START/HELP keyword requirements for production.
