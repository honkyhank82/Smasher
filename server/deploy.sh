#!/bin/bash
# Deployment script for Smasher Backend

set -e  # Exit on error

echo "🚀 Deploying Smasher Backend to Fly.io"

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Install from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Run: fly auth login"
    exit 1
fi

echo "📦 Building application..."
npm install
npm run build

echo "🔍 Running migrations..."
# Set production database URL from Fly.io secrets
echo "⚠️  Make sure DATABASE_URL is set in Fly.io secrets"
echo "   Run: fly secrets set DATABASE_URL='postgresql://...'"

echo "🚢 Deploying to Fly.io..."
fly deploy

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status: fly status"
echo "📝 View logs: fly logs"
echo "🌐 Open app: fly open"
echo "🔧 SSH into app: fly ssh console"
