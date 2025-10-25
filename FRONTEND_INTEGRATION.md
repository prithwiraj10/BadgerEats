# Frontend Integration Guide

This guide explains how to integrate a frontend application with the BadgerEats backend.

## Overview

The BadgerEats backend is configured to serve static frontend files in production while providing a REST API under the `/api` prefix. This allows you to build a Single Page Application (SPA) that communicates with the backend API.

## Directory Structure

```
BadgerEats/
├── backend/          # Express/TypeScript backend
│   ├── src/
│   ├── dist/         # Compiled backend code (generated)
│   └── package.json
└── frontend/         # Your frontend application (to be added)
    ├── src/          # Frontend source code
    ├── dist/         # Production build output (Vite, etc.)
    └── build/        # Production build output (Create React App, etc.)
```

## Backend Configuration

The backend (`backend/src/app.ts`) is configured to:

1. **Serve API routes** under `/api` prefix:
   - `/api/users` - User management
   - `/api/alerts` - Food alerts
   - `/api/webhooks/twilio` - Twilio webhook handling

2. **Serve static files** from `frontend/dist` or `frontend/build`:
   - Automatically detects which directory exists
   - Falls back to API-only mode if neither exists

3. **Support client-side routing**:
   - All non-API routes serve `index.html` for SPA routing
   - Preserves API 404s for missing API endpoints

## Setting Up Your Frontend

### Step 1: Create Frontend Directory

Create your frontend application in the `frontend/` directory:

```bash
# Example with Vite (React)
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Example with Create React App
npx create-react-app frontend --template typescript

# Example with Next.js
npx create-next-app@latest frontend
```

### Step 2: Configure API Communication

Set your backend API URL in your frontend environment configuration.

**For Vite** (`.env` or `.env.production`):
```env
VITE_API_URL=http://localhost:4000/api
```

**For Create React App** (`.env` or `.env.production`):
```env
REACT_APP_API_URL=http://localhost:4000/api
```

**For Next.js** (`next.config.js`):
```javascript
module.exports = {
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000/api',
  },
}
```

### Step 3: Configure Build Output

Ensure your frontend builds to either `dist/` or `build/` directory.

**Vite** (`vite.config.ts`):
```typescript
export default defineConfig({
  build: {
    outDir: 'dist', // Default for Vite
  },
})
```

**Create React App** builds to `build/` by default.

### Step 4: Set Up Proxy for Development

Configure a development proxy to avoid CORS issues during local development.

**For Vite** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
```

**For Create React App** (`package.json`):
```json
{
  "proxy": "http://localhost:4000"
}
```

### Step 5: Create API Client

Create a centralized API client for backend communication:

```typescript
// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function createUser(data: { name: string; phoneE164: string; preferences: string[] }) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
}

export async function fetchAlerts() {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return response.json();
}

export async function createAlert(data: {
  title: string;
  summary: string;
  location: string;
  startTime?: string;
  endTime?: string;
  tags: string[];
  source: string;
}) {
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create alert');
  }
  return response.json();
}
```

## Development Workflow

### Running Frontend and Backend Together

**Option 1: Separate terminals**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Using concurrently (recommended)**
```bash
# Install in root directory
npm install --save-dev concurrently

# Add to root package.json scripts:
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "build": "npm run build --prefix backend && npm run build --prefix frontend"
  }
}

# Run both
npm run dev
```

## Production Deployment

### Build Steps

1. **Build the frontend**:
```bash
cd frontend
npm run build
```

2. **Build the backend**:
```bash
cd backend
npm run build
```

3. **Start the server**:
```bash
cd backend
npm start
```

The backend will automatically serve the frontend static files from `frontend/dist` or `frontend/build`.

### Environment Variables

**Backend** (`.env`):
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
CREAO_API_URL=https://api.creao.ai/v1
CREAO_API_KEY=your_api_key
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM=+1234567890
DEFAULT_CITY=Madison
```

**Frontend** - Set production API URL:
```env
VITE_API_URL=/api
# or for absolute URL
VITE_API_URL=https://your-domain.com/api
```

## API Endpoints

The backend provides the following API endpoints:

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create a new alert

### Webhooks
- `POST /api/webhooks/twilio` - Twilio SMS webhook

### Health Check
- `GET /health` - Server health check

## Security Considerations

### Rate Limiting

For production deployments, consider adding rate limiting to protect against DoS attacks:

```bash
npm install express-rate-limit
```

```typescript
// backend/src/app.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply to all routes or specific routes
app.use('/api', limiter);
```

### CORS Configuration

The backend has CORS enabled for all origins during development. For production, you may want to restrict this:

```typescript
// backend/src/app.ts
app.use(cors({
  origin: config.isProduction ? 'https://your-domain.com' : '*',
  credentials: true,
}));
```

### Environment Variables

Never commit secrets to version control. Always use environment variables:
- Keep `.env` files out of git (already in `.gitignore`)
- Use different `.env` files for development and production
- For production, set environment variables through your hosting platform

## Troubleshooting

### Frontend not loading
- Ensure frontend is built: `cd frontend && npm run build`
- Check build output directory exists: `frontend/dist` or `frontend/build`
- Check backend logs for "Serving static frontend files" message

### API calls failing with CORS errors
- Ensure proxy is configured correctly in development
- Check that API_URL is set to `/api` in production
- Verify backend CORS configuration

### 404 errors for routes
- Ensure client-side routing is enabled in your frontend framework
- Check that the route is not conflicting with API routes (don't use `/api/*` paths)

### Cannot connect to backend during development
- Ensure backend is running on port 4000: `cd backend && npm run dev`
- Check proxy configuration in frontend config
- Verify `VITE_API_URL` or `REACT_APP_API_URL` is set correctly

## Example Frontend Implementations

See the following for complete examples:

- **React + Vite**: Check `examples/react-vite-frontend/` (to be added)
- **Next.js**: Check `examples/nextjs-frontend/` (to be added)
- **Vue.js**: Check `examples/vue-frontend/` (to be added)

## Additional Resources

- [Backend API Documentation](backend/docs/integration-contract.md)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [Create React App Proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/)
