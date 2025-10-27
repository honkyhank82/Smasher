# SMASHER Web App

React TypeScript web application for SMASHER - Location-based social networking platform.

## Features

- 🔐 Passwordless authentication
- 🔍 User discovery with proximity filtering
- 💬 Real-time chat messaging
- 👤 Profile management
- 🌐 Automatic server failover
- 📱 Responsive design

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
cd app-web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## Architecture

### API Failover

The app automatically connects to the best available backend server:

1. **Fly.io (Primary)** - https://smasher-api.fly.dev
2. **Railway (Secondary)** - https://smasher-production.up.railway.app
3. **Render (Tertiary)** - https://smasher.onrender.com

Health checks run every 60 seconds. If a server is down, the app automatically switches to the next available one.

### Services

- **api-failover.ts**: Axios instance with automatic failover
- **config/api.ts**: Backend service configuration

## Project Structure

```
src/
├── components/       # Reusable components
├── screens/         # Page components
├── services/        # API and utility services
├── config/          # Configuration files
├── styles/          # CSS styles
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Environment Variables

Create `.env.local` (or set via Vercel dashboard):

```env
VITE_API_URL=https://smasher-api.fly.dev
```

## API Endpoints

- `POST /auth/send-verification` - Send verification code
- `POST /auth/verify` - Verify code and login
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `GET /geo/nearby` - Get nearby users
- `GET /chat/conversations` - List conversations
- `GET /chat/messages/:id` - Get messages
- `POST /chat/send` - Send message
- `GET /health` - Server health check

## Deployment

### Vercel (Recommended)

```bash
vercel link          # Link to Vercel project
vercel --prod        # Deploy to production
```

Environment variables can be set in Vercel dashboard:
- Settings → Environment Variables

### Local Testing

```bash
npm run build
npm run preview
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Health check failing

If all servers show as down:
1. Check internet connection
2. Verify API endpoints are accessible
3. Check CORS settings on backend
4. Review browser console for errors

### Login not working

1. Verify JWT_SECRET is set on backend
2. Check email service (Resend) is configured
3. Verify verification code is correct
4. Check browser console for error details

## Contributing

1. Create feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Build with `npm run build`
5. Deploy with `vercel --prod`

## License

Proprietary - SMASHER