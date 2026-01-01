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
# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    echo "WARNING: Running on Windows environment."
    # We allow building on Windows if the user has setup the environment, 
    # but in CI/CD (GitHub Actions), it runs on Linux/Mac usually.
    # If this script is running in Git Bash on Windows, it's fine.
    # The warning below was too aggressive.
fi

# Run EAS build locally using npx to ensure CLI availability
# Using --yes to suppress installation prompts
echo "Running EAS build..."

# Ensure gradlew is executable if it exists
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
fi

mkdir -p ../build
npx --yes eas-cli build --local --platform android --profile production-apk --non-interactive --output ../build/app.apk

echo "Build completed."
if [ -f "../build/app.apk" ]; then
    echo "APK generated successfully."
    ls -l ../build/app.apk
else
    echo "APK file not found - build was skipped or failed"
    ls -l ../build/
    exit 1
fi
