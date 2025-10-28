# Web App Setup & Deployment Guide

## Overview

The SMASHER web app provides the same features as the mobile app, accessible from any browser. It uses the same backend API with automatic failover.

## What's Included

**Location**: `d:\Dev\smasher\app-web`

- React 19 + TypeScript
- Vite build system
- Automatic failover to backup servers
- Same UI/UX as mobile app
- Responsive design

## Quick Start

### 1. Install Dependencies

```powershell
cd app-web
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## Project Structure

```
app-web/
├── src/
│   ├── screens/          # Page components
│   │   ├── Auth.tsx      # Login page
│   │   ├── Home.tsx      # Dashboard
│   │   ├── Discover.tsx  # User discovery
│   │   ├── Chat.tsx      # Messaging
│   │   └── Profile.tsx   # User profile
│   ├── services/         # API & utilities
│   │   └── api-failover.ts  # Auto-failover
│   ├── config/           # Configuration
│   │   └── api.ts        # Backend URLs & health checks
│   ├── styles/           # CSS files
│   ├── App.tsx           # Main component
│   └── main.tsx          # Entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── vercel.json           # Vercel deployment config
```

## Features

### 🔐 Authentication
- Passwordless email verification
- JWT token stored in localStorage
- Automatic token refresh on failover

### 🔍 User Discovery
- Find nearby users
- Adjustable distance filter (5-100 miles)
- Real-time location data

### 💬 Real-Time Chat
- Instant messaging
- Conversation history
- User presence indicators
- Unread message counts

### 👤 Profile Management
- View user profile
- Edit personal info
- Photo uploads (up to 6)
- Premium status

### 🌐 Automatic Failover
- Health checks every 60 seconds
- Instant switch on server failure
- No data loss (shared database)
- Seamless user experience

## Deployment to Vercel

### First Time Setup

```bash
npm install -g vercel
cd app-web
vercel login          # Authenticate with Vercel
vercel                # Link to Vercel project
```

### Deploy to Production

```bash
vercel --prod
```

### Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add variables:

```env
VITE_API_URL=https://smasher-api.fly.dev
```

### Auto-Deploy with GitHub

1. Link GitHub repository to Vercel
2. Select `app-web` as root directory
3. Vercel auto-deploys on push to main

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/send-verification` | POST | Send code to email |
| `/auth/verify` | POST | Verify code & login |
| `/users/profile` | GET | Get user profile |
| `/users/profile` | PUT | Update profile |
| `/geo/nearby` | GET | Get nearby users |
| `/chat/conversations` | GET | List conversations |
| `/chat/messages/:id` | GET | Get messages |
| `/chat/send` | POST | Send message |
| `/health` | GET | Server health |

## Customization

### Change Backend URLs

Edit `src/config/api.ts`:

```typescript
export const BACKEND_SERVICES = [
  {
    name: 'Primary Server',
    apiUrl: 'https://your-primary-url.com',
    priority: 1,
  },
  // ... add more servers
]
```

### Styling

- **Theme**: Edit `src/index.css`
- **Components**: CSS in `src/styles/`
- **Colors**:
  - Primary: `#000000` (Black)
  - Secondary: `#C0C0C0` (Silver)
  - Accent: `#8B0000` (Deep Red)
  - Background: `#1A1A1A` (Dark)

### Add Features

Example: Add notifications feature

```typescript
// src/screens/Notifications.tsx
import React from 'react'
import { apiFailoverService } from '../services/api-failover'

export default function Notifications() {
  const [notifications, setNotifications] = React.useState([])
  
  React.useEffect(() => {
    loadNotifications()
  }, [])
  
  const loadNotifications = async () => {
    const response = await apiFailoverService.get('/notifications')
    setNotifications(response.data)
  }
  
  return (
    <div>
      {/* Render notifications */}
    </div>
  )
}
```

## Testing

### Local Testing

```bash
npm run dev
# Open browser to http://localhost:3000
# Test login, discover, chat, profile
```

### Production Testing

```bash
npm run build
npm run preview
# Open browser to http://localhost:4173
# Test same features
```

### Failover Testing

1. **Stop primary server**:
   ```bash
   # Stop Fly.io
   fly scale count 0
   ```

2. **Refresh web app**: Should switch to Render

3. **Restart primary**:
   ```bash
   fly scale count 1
   ```

4. **Refresh web app**: Should switch back to Fly.io

## Troubleshooting

### Blank page after deploy

1. Check browser console for errors
2. Verify `vercel.json` has correct build config
3. Check environment variables in Vercel dashboard
4. Verify backend API is accessible

### Login failing

1. Check JWT_SECRET on backend
2. Verify Resend API key configured
3. Check email address is valid
4. Review backend logs: `fly logs`

### Chat not loading

1. Verify WebSocket connection in browser DevTools
2. Check backend chat service is running
3. Verify user has auth token
4. Check database for conversations

### Build failing on Vercel

1. Check `npm run build` succeeds locally
2. Verify Node version compatibility (20+)
3. Check environment variables set
4. Review Vercel build logs in dashboard

## Performance

### Optimization Tips

1. **Lazy load routes**: Use React.lazy() for screens
2. **Code splitting**: Vite automatically splits code
3. **Image optimization**: Use WebP format
4. **Caching**: Browser cache for assets (30 days)
5. **API caching**: Cache health checks

### Monitoring

Monitor on Vercel dashboard:
- Deploy status
- Build times
- Function logs
- Performance metrics

## Security

### Best Practices

1. ✅ **HTTPS only**: All traffic encrypted
2. ✅ **JWT tokens**: Secure auth mechanism
3. ✅ **CORS enabled**: Configured on backend
4. ✅ **No secrets in code**: Use env vars
5. ✅ **Content Security Policy**: Set headers

### Secrets Management

Never commit secrets to repo:
```bash
# ✅ DO: Use environment variables
VITE_API_URL=https://smasher-api.fly.dev

# ❌ DON'T: Hardcode in code
const API_URL = 'https://...'  # Can leak in git
```

## Scaling

### Traffic Handling

| Traffic | Solution |
|---------|----------|
| 0-100 users | Single Vercel instance (free) |
| 100-1k users | Vercel Pro ($20/mo) |
| 1k+ users | Vercel with edge functions |

### Database Scaling

Current setup handles:
- **PostgreSQL**: 5k concurrent connections
- **Queries/sec**: 1k+
- **Data**: 100GB+

For more:
1. Upgrade to RDS Multi-AZ
2. Add read replicas
3. Implement caching layer (Redis)

## Deployment Checklist

- [ ] Install Vercel CLI
- [ ] Build locally succeeds
- [ ] Test in browser (http://localhost:3000)
- [ ] Set environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Test failover (stop backend)
- [ ] Monitor health checks
- [ ] Set up error tracking
- [ ] Share URL with users

## Monitoring & Alerts

### Set Up Error Tracking

```typescript
// Install Sentry
npm install @sentry/react

// In src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project',
  environment: 'production',
})
```

### Monitor Uptime

Use services like:
- **Uptime Robot** (free): Ping health endpoint every 5 mins
- **Datadog**: Full monitoring & dashboards
- **New Relic**: APM & error tracking

## Support & Troubleshooting

### Check Logs

**Vercel**:
1. Go to Vercel dashboard
2. Select project
3. View Deployments → Logs

**Backend**:
```bash
fly logs --follow
```

### Get Help

- **Docs**: Check MULTI_SERVER_DEPLOYMENT.md
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Vercel Docs**: https://vercel.com/docs

## Next Steps

1. ✅ Web app created
2. 🔄 Deploy to Vercel
3. 🔧 Configure backend URLs
4. ✅ Test all features
5. 📊 Monitor performance
6. 🎯 Scale as needed

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality

# Deployment
vercel --prod            # Deploy to Vercel
vercel env pull          # Pull env vars
vercel logs              # View production logs

# Maintenance
npm update               # Update dependencies
npm audit fix            # Fix security issues
npm prune                # Remove unused packages
```

## FAQ

**Q: Can I run web app without backend?**
A: No, web app requires backend API. All features depend on backend.

**Q: How often do health checks run?**
A: Every 60 seconds by default. Configurable in src/config/api.ts

**Q: What if all servers are down?**
A: App will show error, but cached data may still display. Check server status.

**Q: Can I add more features?**
A: Yes! Follow the component structure and use apiFailoverService for API calls.

**Q: Is the web app mobile-friendly?**
A: Yes! Uses responsive design that works on all devices.

---

**Last Updated**: 2024
**Version**: 1.0.15