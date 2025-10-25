# BadgerEats

A food notification system with SMS alerts, built with Express/TypeScript backend and designed to integrate with any modern frontend framework.

## Project Structure

```
BadgerEats/
├── backend/              # Express/TypeScript API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database client
│   │   └── jobs/        # Background jobs
│   └── docs/            # API documentation
├── frontend/            # Your frontend application (to be added)
├── FRONTEND_INTEGRATION.md  # Frontend integration guide
└── examples/            # Example frontend configurations
```

## Getting Started

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables (create `.env` file):
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./dev.db
CREAO_API_URL=https://api.creao.ai/v1
CREAO_API_KEY=your_api_key
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM=+1234567890
DEFAULT_CITY=Madison
```

3. Run the backend:
```bash
npm run dev
```

### Frontend Integration

To add and integrate a frontend application with this backend, see:

📖 **[Frontend Integration Guide](FRONTEND_INTEGRATION.md)** - Complete guide for linking your frontend

📘 **[Frontend Examples](examples/FRONTEND_EXAMPLES.md)** - Ready-to-use configurations for React, Vue, Next.js

The backend is configured to:
- Serve API routes under `/api` prefix
- Serve static frontend files from `frontend/dist` or `frontend/build`
- Support client-side routing for Single Page Applications (SPAs)

## API Endpoints

- `GET /health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create a new alert
- `POST /api/webhooks/twilio` - Twilio webhook

For detailed API documentation, see [backend/docs/integration-contract.md](backend/docs/integration-contract.md)

## Development

### Backend Only
```bash
cd backend
npm run dev
```

### With Frontend (after setup)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start server (serves both API and frontend)
npm start
```

## Features

- 🍕 Food alert notifications via SMS
- 📱 Twilio integration for SMS delivery
- 🤖 AI-powered alert generation with Creao AI
- 👥 User preference management
- 🔔 Scheduled notification jobs
- 🌐 Frontend-ready API with CORS support
- 📦 Serves static frontend files in production

## Technologies

**Backend:**
- Express.js
- TypeScript
- Prisma ORM
- Twilio API
- Node-cron for job scheduling

**Frontend (your choice):**
- React + Vite
- Next.js
- Vue.js
- Or any modern framework

## License

MIT
