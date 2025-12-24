#!/bin/bash
set -e

echo "Starting APK build process..."

# Navigate to app-rn
cd app-rn

echo "Installing app dependencies..."
npm install

echo "Building APK..."
# Run EAS build and wait for completion (logs to stdout for debugging)
# We don't use --json here because it might mix with logs
eas build --platform android --profile production-apk --non-interactive --wait

echo "Build completed. Retrieving artifact URL..."
# Get the latest build details
BUILD_JSON="$(eas build:list --platform android --profile production-apk --limit 1 --json --non-interactive)"

# Save for debugging
echo "$BUILD_JSON" > build-output.json

# Extract URL
# Try multiple paths to be safe
APK_URL="$(echo "$BUILD_JSON" | jq -r '.[0].artifacts.applicationArchiveUrl // .[0].artifacts.buildUrl // empty')"

if [ -z "$APK_URL" ] || [ "$APK_URL" = "null" ]; then
  echo "Failed to find APK URL in build output" >&2
  cat build-output.json >&2
  exit 1
fi

echo "Found APK URL: $APK_URL"
echo "Downloading APK..."
mkdir -p ../build
curl -L -o ../build/app.apk "$APK_URL"

if [ ! -f "../build/app.apk" ]; then
    echo "Error: Failed to download APK file."
    exit 1
fi

echo "APK downloaded successfully to build/app.apk"
ls -l ../build/app.apk
