# 🚀 LifeVault Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Repository Setup
- [ ] Code pushed to GitHub
- [ ] `.gitignore` properly configured
- [ ] No sensitive data in repository
- [ ] `render.yaml` configuration file created

### ✅ Project Restructuring
- [ ] Create `backend/` directory
- [ ] Move `server/`, `drizzle/`, `shared/` to `backend/`
- [ ] Move `package.json`, `pnpm-lock.yaml` to `backend/`
- [ ] Create `frontend/` directory
- [ ] Move `client/` to `frontend/`
- [ ] Update backend `package.json` with correct scripts

### ✅ Backend Configuration
- [ ] Update server port to use `process.env.PORT`
- [ ] Add CORS configuration for production
- [ ] Add health check endpoint (`/health`)
- [ ] Update database connection to use `DATABASE_URL`
- [ ] Configure file upload paths for production

### ✅ Frontend Configuration
- [ ] Update API base URL to use environment variable
- [ ] Configure Vite build settings
- [ ] Update OAuth redirect URLs for production
- [ ] Test build process locally

### ✅ Environment Variables
- [ ] `DATABASE_URL` (PostgreSQL connection string)
- [ ] `JWT_SECRET` (secure random string)
- [ ] `OAUTH_GOOGLE_CLIENT_ID`
- [ ] `OAUTH_GOOGLE_CLIENT_SECRET`
- [ ] `OAUTH_FACEBOOK_CLIENT_ID`
- [ ] `OAUTH_FACEBOOK_CLIENT_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `FROM_EMAIL`
- [ ] `FRONTEND_URL` (production URL)
- [ ] `NODE_ENV=production`

## 🚀 Render Deployment Steps

### 1. Repository Connection
- [ ] Sign up/login to Render
- [ ] Connect GitHub repository
- [ ] Authorize Render access

### 2. Service Creation
- [ ] Render detects `render.yaml`
- [ ] Review service configurations
- [ ] Create services (backend, frontend, database)

### 3. Environment Variables Setup
- [ ] Add all backend environment variables
- [ ] Add frontend environment variables
- [ ] Verify no sensitive data in code
- [ ] Test variable values

### 4. Database Setup
- [ ] PostgreSQL database created
- [ ] Get connection string
- [ ] Add to backend environment variables
- [ ] Run database migrations
- [ ] Verify database connectivity

### 5. Build and Deploy
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Services start without errors
- [ ] Health check endpoints respond

## 🧪 Post-Deployment Testing

### Backend Testing
- [ ] Health check: `https://your-api.onrender.com/health`
- [ ] OAuth endpoints working
- [ ] Database queries working
- [ ] Email service working
- [ ] File uploads working
- [ ] API routes responding correctly

### Frontend Testing
- [ ] Application loads without errors
- [ ] Login/Signup working
- [ ] OAuth redirects working
- [ ] API calls successful
- [ ] File uploads working
- [ ] All vaults accessible

### Integration Testing
- [ ] User registration flow
- [ ] Email verification flow
- [ ] OAuth login flow
- [ ] Vault creation and management
- [ ] Media upload and display
- [ ] Email scheduling

## 🔧 Common Issues & Solutions

### CORS Issues
```
Error: Access-Control-Allow-Origin
```
**Solution**: Check `FRONTEND_URL` in backend environment variables

### Database Connection
```
Error: ECONNREFUSED
```
**Solution**: Verify `DATABASE_URL` format and database status

### Build Failures
```
Error: Build failed
```
**Solution**: Check build logs, ensure all dependencies in package.json

### OAuth Redirects
```
Error: Redirect URI mismatch
```
**Solution**: Update OAuth provider with production URL

### File Upload Issues
```
Error: ENOENT: no such file or directory
```
**Solution**: Ensure upload directory exists and is writable

## 📊 Monitoring Setup

### Render Dashboard
- [ ] Monitor service logs
- [ ] Set up alerts for errors
- [ ] Check metrics dashboard
- [ ] Configure health checks

### External Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Create alerting rules

## 🔒 Security Checklist

### Environment Security
- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] CORS properly configured

### OAuth Security
- [ ] Secure redirect URIs
- [ ] Client secrets not exposed
- [ ] Token handling secure
- [ ] Session management proper

### Database Security
- [ ] Connection string secure
- [ ] Database user permissions limited
- [ ] Backups configured
- [ ] Access logs monitored

## 📱 Production Optimizations

### Performance
- [ ] Enable gzip compression
- [ ] Optimize image sizes
- [ ] Implement caching
- [ ] Monitor bundle sizes

### SEO & Analytics
- [ ] Add meta tags
- [ ] Set up analytics
- [ ] Configure sitemap
- [ ] Add robots.txt

### User Experience
- [ ] Error pages configured
- [ ] Loading states optimized
- [ ] Mobile responsive tested
- [ ] Accessibility checked

## 🔄 Maintenance Tasks

### Regular Updates
- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Backup database regularly
- [ ] Review logs periodically

### Scaling Preparation
- [ ] Monitor resource usage
- [ ] Plan for traffic spikes
- [ ] Configure auto-scaling if needed
- [ ] Document scaling procedures

---

## 🎯 Quick Deploy Commands

```bash
# 1. Restructure project
mkdir backend frontend
mv server drizzle shared package.json pnpm-lock.yaml tsconfig.json vite.config.ts vitest.config.ts drizzle.config.ts backend/
mv client components.json frontend/

# 2. Update configurations
# (See RENDER_DEPLOYMENT_GUIDE.md)

# 3. Commit and push
git add .
git commit -m "Restructure for Render deployment"
git push origin main

# 4. Deploy on Render
# Go to dashboard.render.com and connect repository
```

## 📞 Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Render Status**: [status.render.com](https://status.render.com)
- **LifeVault Issues**: Check GitHub Issues

---

🎉 **Ready to Deploy!** Follow this checklist to ensure a smooth deployment process.

After deployment, your LifeVault application will be available at:
- Frontend: `https://lifevault-frontend.onrender.com`
- Backend API: `https://lifevault-api.onrender.com`
