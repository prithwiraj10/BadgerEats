# Quick Start: Linking Frontend to Backend

This is a **quick reference** for linking your frontend to the BadgerEats backend. For detailed documentation, see [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

## What's Already Set Up

✅ Backend configured to serve static frontend files  
✅ API routes under `/api` prefix  
✅ CORS enabled for frontend communication  
✅ Support for client-side routing (SPA)  
✅ Automatic detection of `frontend/dist` or `frontend/build`

## Quick Setup (Choose Your Framework)

### Option 1: React with Vite (Recommended)

```bash
# 1. Create frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# 2. Configure proxy (vite.config.ts)
# Add this to your config:
server: {
  proxy: {
    '/api': 'http://localhost:4000'
  }
}

# 3. Create .env.development
echo "VITE_API_URL=/api" > .env.development

# 4. Run both servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Option 2: React with Create React App

```bash
# 1. Create frontend
npx create-react-app frontend --template typescript
cd frontend

# 2. Add proxy to package.json
"proxy": "http://localhost:4000"

# 3. Create .env.development
echo "REACT_APP_API_URL=/api" > .env.development

# 4. Run both servers (same as above)
```

### Option 3: Next.js

```bash
# 1. Create frontend
npx create-next-app@latest frontend --typescript
cd frontend

# 2. Update next.config.js
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // For static export
  distDir: 'build',  // Match backend expectations
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

```bash
# 3. Create .env.local
echo "NEXT_PUBLIC_API_URL=/api" > .env.local
```

## Making API Calls

Create an API client in your frontend:

```typescript
// frontend/src/api/client.ts

// For Vite projects:
const API_URL = import.meta.env.VITE_API_URL || '/api';

// For Create React App:
// const API_URL = process.env.REACT_APP_API_URL || '/api';

// For Next.js:
// const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = {
  async getUsers() {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },
  
  async getAlerts() {
    const res = await fetch(`${API_URL}/alerts`);
    return res.json();
  },
};
```

## Production Deployment

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Build backend
cd backend
npm run build

# 3. Start production server (serves both frontend and API)
cd backend
npm start
```

Your app will be available at `http://localhost:4000`

## Available API Endpoints

- `GET /health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert

## Troubleshooting

**Frontend not loading in production?**
- Ensure `frontend/dist` or `frontend/build` exists
- Check backend logs for "Serving static frontend files"

**CORS errors in development?**
- Configure proxy in your frontend config (see above)
- Ensure backend is running on port 4000

**API calls returning 404?**
- Verify API_URL is set to `/api` in your .env
- Check that proxy is configured correctly

## Need Help?

- 📖 [Full Integration Guide](FRONTEND_INTEGRATION.md)
- 📘 [Framework Examples](examples/FRONTEND_EXAMPLES.md)
- 📄 [API Documentation](backend/docs/integration-contract.md)
