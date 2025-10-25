# Example Frontend Configuration

This directory contains example configurations for different frontend frameworks.

## Quick Start

Choose your preferred framework and follow the setup instructions:

### React + Vite

```bash
# Create frontend with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
```

**.env.development:**
```env
VITE_API_URL=/api
```

**.env.production:**
```env
VITE_API_URL=/api
```

**src/api/client.ts:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  
  async createUser(data: { name: string; phoneE164: string; preferences: string[] }) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },
  
  async getAlerts() {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },
  
  async createAlert(data: {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create alert');
    return response.json();
  },
};
```

### React + Create React App

```bash
# Create frontend with CRA
npx create-react-app frontend --template typescript
cd frontend
npm install
```

**package.json** (add proxy):
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "proxy": "http://localhost:4000",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  }
}
```

**.env.development:**
```env
REACT_APP_API_URL=/api
```

**.env.production:**
```env
REACT_APP_API_URL=/api
```

**src/api/client.ts:**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Same API client code as Vite example above
```

### Next.js

```bash
# Create frontend with Next.js
npx create-next-app@latest frontend --typescript
cd frontend
npm install
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static export
  distDir: 'build', // Match backend expectations
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

**.env.local:**
```env
NEXT_PUBLIC_API_URL=/api
```

**lib/api/client.ts:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Same API client code as Vite example above
```

### Vue 3 + Vite

```bash
# Create frontend with Vue
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
```

**.env.development:**
```env
VITE_API_URL=/api
```

**src/api/client.ts:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Same API client code as Vite example above
```

## Running Development Environment

After setting up your frontend:

1. **Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

2. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

3. **Access Application**:
- Frontend: http://localhost:5173 (Vite) or http://localhost:3000 (CRA/Next.js)
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/health

## Building for Production

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Build Backend**:
```bash
cd backend
npm run build
```

3. **Start Production Server**:
```bash
cd backend
npm start
```

The server will automatically serve the frontend from http://localhost:4000/

## TypeScript Types

Create shared types for API responses:

**frontend/src/types/api.ts:**
```typescript
export interface User {
  id: string;
  name: string;
  phoneE164: string;
  preferences: string[];
  subscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  summary: string;
  location: string;
  startTime?: string;
  endTime?: string;
  tags: string[];
  source: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  phoneE164: string;
  preferences: string[];
}

export interface CreateAlertRequest {
  title: string;
  summary: string;
  location: string;
  startTime?: string;
  endTime?: string;
  tags: string[];
  source: string;
}
```

## State Management Examples

### Using React Query (Recommended)

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Using SWR

```bash
npm install swr
```

```typescript
// src/hooks/useUsers.ts
import useSWR from 'swr';
import { api } from '../api/client';

export function useUsers() {
  return useSWR('users', api.getUsers);
}
```

## Error Handling

```typescript
// src/api/client.ts
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new APIError(response.status, error.message || response.statusText);
  }
  
  return response.json();
}

export const api = {
  getUsers: () => fetchAPI('/users'),
  createUser: (data) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  // ... other methods
};
```
