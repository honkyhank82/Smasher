#!/bin/bash
set -e

echo "Starting APK build process..."

# Navigate to app-rn
cd app-rn

echo "Installing app dependencies..."
npm install

echo "Environment check:"
node -v
npm -v

echo "Building APK locally to bypass cloud limits..."
# Run EAS build locally using npx to ensure CLI availability
mkdir -p ../build
npx eas-cli build --local --platform android --profile production-apk --non-interactive --output ../build/app.apk

echo "Build completed."
ls -l ../build/app.apk
