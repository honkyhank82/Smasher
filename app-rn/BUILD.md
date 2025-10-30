# Building the App

This app uses GitHub Actions for automated builds and deployments.

## How to Build

1. **Push to master branch** or **Create a tag**:
   - Pushing to `master` will create a build with the tag `build-{run-number}`
   - Creating a tag (e.g., `v1.0.0`) will use that tag for the release

2. **Automated Process**:
   - GitHub Actions will automatically:
     - Build the Android App Bundle (AAB)
     - Create a draft GitHub release
     - Upload the AAB to the release
     - Deploy to Google Play Store (if service account JSON is configured)

## Deployment to Google Play Store

The workflow automatically deploys to Google Play Store if the Google Play service account JSON is configured in repository secrets.

### Required Secrets

The following secrets must be configured in your GitHub repository:

- `KEYSTORE_BASE64`: Base64-encoded Android keystore
- `SMASHER_UPLOAD_STORE_PASSWORD`: Keystore password
- `SMASHER_UPLOAD_KEY_ALIAS`: Key alias
- `SMASHER_UPLOAD_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Base64-encoded Google Play service account JSON (for Play Store deployment)

## Development Flow

1. Develop and test locally using `npm start` and `npm run android`
2. Push changes to master or create a release tag
3. GitHub Actions will handle the build and deployment
4. Check the "Actions" tab in GitHub for build status and logs