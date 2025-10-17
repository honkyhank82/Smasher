# Architecture Overview

- Flutter app communicates with NestJS via HTTPS and WebSockets.
- Postgres + PostGIS for geo queries.
- Redis for sessions, rate limiting, and presence.
- Media in Cloudflare R2, delivered via CDN.
- Google Play Billing for subscriptions (no Firebase SDK).
- Moderation pipeline blocks NSFW in profile picture, allows in gallery.
