#!/bin/bash
set -e

echo "Starting APK build process..."

# Navigate to app-rn
cd app-rn

echo "Installing app dependencies..."
npm install

echo "Building APK..."
# Run EAS build
BUILD_JSON="$(eas build --platform android --profile production-apk --non-interactive --json --wait)"

# Save for debugging
echo "$BUILD_JSON" > build-output.json

# Extract URL - handle both array and object formats
APK_URL="$(echo "$BUILD_JSON" | jq -r 'if type == "array" then .[0].artifacts[0].applicationArchiveUrl // .[0].applicationArchiveUrl // empty else .artifacts[0].applicationArchiveUrl // .applicationArchiveUrl // empty end')"

if [ -z "$APK_URL" ] || [ "$APK_URL" = "null" ]; then
  echo "Failed to find APK URL in build output" >&2
  cat build-output.json >&2
  exit 1
fi

echo "Downloading APK from $APK_URL"
mkdir -p ../build
curl -L -o ../build/app.apk "$APK_URL"

echo "APK downloaded to build/app.apk"
