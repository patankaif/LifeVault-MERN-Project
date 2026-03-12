# 🚀 Render Deployment Guide for LifeVault

This guide will help you deploy your LifeVault application on Render.com with both frontend and backend services.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code is already pushed to GitHub
3. **Environment Variables**: Have all your `.env` variables ready
4. **Database**: Choose a database provider (Render PostgreSQL recommended)

## 🗂️ Project Structure for Deployment

Your LifeVault application needs to be split into two separate services:

```
LifeVault/
├── backend/          # Node.js server (API)
├── frontend/         # React client
└── render.yaml      # Render configuration file
```

## 🔧 Step 1: Restructure Project for Render

### Create Backend Directory

```bash
# Create backend directory
mkdir backend

# Move server files to backend
mv server/* backend/
mv drizzle backend/
mv shared backend/
mv package.json backend/
mv pnpm-lock.yaml backend/
mv tsconfig.json backend/
mv vite.config.ts backend/
mv vitest.config.ts backend/
mv drizzle.config.ts backend/
```

### Create Frontend Directory

```bash
# Create frontend directory
mkdir frontend

# Move client files to frontend
mv client/* frontend/
mv components.json frontend/
```

### Update Backend Package.json

```json
{
  "name": "lifevault-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server/_core/index.js",
    "build": "tsc",
    "dev": "tsx watch server/_core/index.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 📄 Step 2: Create Render Configuration

Create `render.yaml` in your root directory:

```yaml
services:
  # Backend Service
  - type: web
    name: lifevault-api
    env: node
    repo: https://github.com/patankaif/LifeVault.git
    rootDir: backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      # Add your environment variables here
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: OAUTH_GOOGLE_CLIENT_ID
        sync: false
      - key: OAUTH_GOOGLE_CLIENT_SECRET
        sync: false
      - key: OAUTH_FACEBOOK_CLIENT_ID
        sync: false
      - key: OAUTH_FACEBOOK_CLIENT_SECRET
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: FROM_EMAIL
        sync: false
      - key: FRONTEND_URL
        value: https://lifevault-frontend.onrender.com

  # Frontend Service
  - type: web
    name: lifevault-frontend
    env: static
    repo: https://github.com/patankaif/LifeVault.git
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://lifevault-api.onrender.com

databases:
  # PostgreSQL Database
  - name: lifevault-db
    databaseName: lifevault
    user: lifevault
    plan: free
```

## 🔧 Step 3: Update Backend for Production

### Update Server Configuration

In `backend/server/_core/index.ts`, update:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Your existing routes...
```

### Update Database Connection

In `backend/server/db.ts`:

```typescript
export const db = drizzle({
  connection: process.env.DATABASE_URL,
  logger: process.env.NODE_ENV === 'development' ? console.log : undefined
});
```

## 🎨 Step 4: Update Frontend for Production

### Update API Base URL

In `frontend/client/src/lib/authFetch.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const authFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
};
```

### Update Vite Config

In `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
});
```

## 🚀 Step 5: Deploy to Render

### 1. Push Updated Structure to GitHub

```bash
git add .
git commit -m "Restructure for Render deployment"
git push origin main
```

### 2. Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will detect your `render.yaml` file
5. Review and create services

### 3. Configure Environment Variables

In your Render dashboard, add these environment variables to your backend service:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT & Auth
JWT_SECRET=your-super-secret-jwt-key-here

# OAuth - Google
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Facebook  
OAUTH_FACEBOOK_CLIENT_ID=your-facebook-client-id
OAUTH_FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Email Service
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# URLs
FRONTEND_URL=https://your-frontend-url.onrender.com

# Other variables from your .env file
NODE_ENV=production
```

### 4. Set Up Database

1. Go to your database service in Render
2. Get the connection string
3. Add it to your backend environment variables
4. Run migrations:
   ```bash
   # In Render dashboard, go to your service
   # Click "Shell" and run:
   npm run db:migrate
   ```

## 🔍 Step 6: Verify Deployment

### Check Backend Health

Visit: `https://your-backend-url.onrender.com/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-03-07T..."
}
```

### Check Frontend

Visit: `https://your-frontend-url.onrender.com`

The application should load with the API connected.

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is correctly set in backend
   - Check CORS configuration in server

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check database is running and accessible

3. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

4. **Environment Variables**
   - Double-check all variables are set
   - Ensure no trailing spaces or special characters

### Debug Commands

```bash
# Check backend logs
# In Render dashboard → Service → Logs

# Test database connection
# In Render dashboard → Database → Shell

# Rebuild service
# In Render dashboard → Service → Manual Deploy → Deploy Latest Commit
```

## 📊 Monitoring

### Render Dashboard Features

- **Logs**: View real-time application logs
- **Metrics**: Monitor performance and usage
- **Events**: Track deployments and changes
- **Shell**: Access your running service

### Health Checks

Add health check endpoint in your backend:

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## 🔄 Continuous Deployment

Your `render.yaml` enables automatic deployments:

- **Push to main** → Auto-deploy to production
- **Push to other branches** → Create preview environments
- **Pull requests** → Deploy preview URLs

## 💡 Pro Tips

1. **Use Render's free tier** for development and testing
2. **Set up custom domains** once everything is working
3. **Configure SSL certificates** (Render provides free SSL)
4. **Set up monitoring** and alerts for production
5. **Use environment-specific configs** for development vs production

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

---

🎉 **Congratulations!** Your LifeVault application is now deployed on Render with a scalable, production-ready setup.

For issues specific to LifeVault deployment, check the application logs and ensure all environment variables are correctly configured.
