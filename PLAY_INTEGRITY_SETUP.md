# Play Integrity API Setup Guide

This guide covers the complete implementation of Google Play Integrity API with request hash protection, token verification, and replay attack mitigation.

## Overview

The Play Integrity API helps protect your app against tampering, unauthorized access, and fraudulent activity by verifying:
- **App Integrity**: Confirms the app is the genuine version from Google Play
- **Device Integrity**: Verifies the device is trustworthy
- **Account Integrity**: Checks if the app is properly licensed

## Architecture

### Client-Side (Android)
- **IntegrityModule.java**: Main module for requesting integrity tokens
- **IntegrityUsageExample.java**: Usage examples for common scenarios

### Server-Side (Node.js/NestJS)
- **integrity.service.ts**: Service for decrypting and verifying tokens
- **integrity.controller.ts**: API endpoints for protected actions
- **integrity.module.ts**: NestJS module configuration

## Setup Instructions

### 1. Google Cloud Project Setup

1. **Create/Link Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or link existing one
   - Note your **Project Number** (not Project ID)

2. **Enable Play Integrity API**
   ```bash
   gcloud services enable playintegrity.googleapis.com
   ```

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant role: **Service Account Token Creator**
   - Create and download JSON key file

4. **Link to Play Console**
   - Go to [Play Console](https://play.google.com/console)
   - Select your app
   - Go to Release > Setup > App Integrity
   - Link your Google Cloud project

### 2. Android App Configuration

1. **Update IntegrityModule.java**
   ```java
   private static final long CLOUD_PROJECT_NUMBER = YOUR_PROJECT_NUMBER;
   ```

2. **Add to build.gradle**
   ```gradle
   dependencies {
       implementation 'com.google.android.play:integrity:1.3.0'
   }
   ```

3. **Initialize in MainActivity or Application**
   ```java
   IntegrityModule integrityModule = new IntegrityModule(context);
   ```

### 3. Server Configuration

1. **Set Environment Variables**
   ```bash
   GOOGLE_CLOUD_PROJECT_NUMBER=your_project_number
   ANDROID_PACKAGE_NAME=com.smasherapp
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
   ```

2. **Install Dependencies**
   ```bash
   npm install googleapis
   ```

3. **Import IntegrityModule in app.module.ts**
   ```typescript
   import { IntegrityModule } from './integrity/integrity.module';

   @Module({
     imports: [
       // ... other modules
       IntegrityModule,
     ],
   })
   export class AppModule {}
   ```

## Usage Examples

### Client-Side: Protecting a Score Submission

```java
public void submitScore(int score, String userId) {
    // Create request data with all relevant parameters
    String requestData = String.format("score=%d&userId=%s&timestamp=%d", 
        score, userId, System.currentTimeMillis());

    // Request integrity token with automatic hash computation
    integrityModule.requestIntegrityTokenForAction(requestData, 
        new IntegrityModule.IntegrityCallback() {
            @Override
            public void onSuccess(String token) {
                // Send token to server
                sendScoreToServer(score, userId, token);
            }

            @Override
            public void onFailure(Exception exception) {
                // Handle error
                Log.e(TAG, "Integrity check failed", exception);
            }
        });
}
```

### Server-Side: Verifying the Score

```typescript
@Post('submit-score')
async submitScore(@Body() dto: SubmitScoreDto) {
    // Reconstruct the request data exactly as on client
    const requestData = `score=${dto.score}&userId=${dto.userId}`;

    // Verify integrity token with request hash
    const verification = await this.integrityService.verifyIntegrityWithRequestHash(
        dto.integrityToken,
        requestData,
    );

    if (!verification.isValid) {
        throw new HttpException('Integrity verification failed', HttpStatus.FORBIDDEN);
    }

    // Proceed with score submission
    // ...
}
```

## Request Hash Protection

### Why Use Request Hash?

Without request hash, integrity tokens are only bound to the device, not the specific request. This opens up replay attacks where an attacker could:
1. Intercept a valid integrity token
2. Modify the request data (e.g., change score from 100 to 9999)
3. Replay the token with modified data

### How It Works

1. **Client computes hash** of all request parameters
   ```java
   String requestData = "score=100&userId=abc123&timestamp=1234567890";
   String hash = IntegrityModule.computeRequestHash(requestData);
   ```

2. **Hash is included in integrity token** request
   ```java
   StandardIntegrityTokenRequest.builder()
       .setRequestHash(hash)
       .build()
   ```

3. **Server verifies hash** matches the actual request
   ```typescript
   const expectedHash = this.integrityService.computeRequestHash(requestData);
   const matches = payload.requestDetails.requestHash === expectedHash;
   ```

### Best Practices

- ✅ **DO** include all critical request parameters in the hash
- ✅ **DO** use a stable serialization format (e.g., `key1=value1&key2=value2`)
- ✅ **DO** include timestamp to prevent replay attacks
- ❌ **DON'T** put sensitive data in plain text (hash it first)
- ❌ **DON'T** exceed 500 bytes for the hash value

## Automatic Replay Protection

Google Play automatically prevents integrity tokens from being reused. When a token is used multiple times:

- Device recognition verdict becomes **empty**
- App recognition verdict becomes **UNEVALUATED**
- Licensing verdict becomes **UNEVALUATED**

The server-side implementation detects these conditions:

```typescript
if (payload.appIntegrity.appRecognitionVerdict === 'UNEVALUATED') {
    warnings.push('Possible replay attack detected');
}
```

## Token Provider Expiration

Token providers can expire if used for too long. The client automatically handles this:

```java
if (integrityException.getErrorCode() == 
    IntegrityServiceException.INTEGRITY_TOKEN_PROVIDER_INVALID) {
    // Automatically request new provider and retry
    prepareIntegrityToken(new TokenProviderCallback() {
        @Override
        public void onSuccess(StandardIntegrityTokenProvider provider) {
            requestIntegrityToken(requestHash, callback);
        }
    });
}
```

## Verification Flow

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Android   │                    │   Server    │                    │ Google Play │
│     App     │                    │             │                    │             │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                  │                                  │
       │ 1. Prepare Token Provider        │                                  │
       ├─────────────────────────────────────────────────────────────────────>
       │                                  │                                  │
       │ 2. Compute Request Hash          │                                  │
       ├──┐                               │                                  │
       │<─┘                               │                                  │
       │                                  │                                  │
       │ 3. Request Integrity Token       │                                  │
       ├─────────────────────────────────────────────────────────────────────>
       │                                  │                                  │
       │ 4. Return Encrypted Token        │                                  │
       <─────────────────────────────────────────────────────────────────────┤
       │                                  │                                  │
       │ 5. Send Request + Token          │                                  │
       ├─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │ 6. Decrypt Token                 │
       │                                  ├─────────────────────────────────>│
       │                                  │                                  │
       │                                  │ 7. Return Decrypted Payload      │
       │                                  <─────────────────────────────────┤
       │                                  │                                  │
       │                                  │ 8. Verify Hash & Verdicts        │
       │                                  ├──┐                               │
       │                                  │<─┘                               │
       │                                  │                                  │
       │ 9. Return Success/Failure        │                                  │
       <─────────────────────────────────┤                                  │
       │                                  │                                  │
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `INTEGRITY_TOKEN_PROVIDER_INVALID` | Provider expired | Automatically handled - new provider requested |
| `PLAY_SERVICES_NOT_FOUND` | Play Services not installed | Show user dialog to install |
| `APP_NOT_INSTALLED` | App not from Play Store | Only occurs in development |
| `UNEVALUATED` verdicts | Replay attack | Reject the request |

### Client-Side Error Handling

```java
@Override
public void onFailure(Exception exception) {
    if (exception instanceof IntegrityServiceException) {
        IntegrityServiceException e = (IntegrityServiceException) exception;
        switch (e.getErrorCode()) {
            case IntegrityServiceException.PLAY_SERVICES_NOT_FOUND:
                // Show dialog to install Play Services
                break;
            case IntegrityServiceException.APP_NOT_INSTALLED:
                // App not from Play Store (development only)
                break;
            // ... handle other errors
        }
    }
}
```

### Server-Side Error Handling

```typescript
if (!verification.isValid) {
    this.logger.warn('Integrity check failed', {
        error: verification.error,
        warnings: verification.warnings,
    });
    
    throw new HttpException({
        message: 'Integrity verification failed',
        error: verification.error,
    }, HttpStatus.FORBIDDEN);
}
```

## Testing

### Development Testing

During development, integrity checks may fail because:
- App is not installed from Play Store
- Debug builds have different signatures

**Solutions:**
1. Use internal testing track in Play Console
2. Add test accounts in Play Console
3. Implement conditional checks for debug builds

### Production Testing

1. **Test with Internal Testing Track**
   - Upload to internal testing
   - Add test users
   - Verify integrity checks pass

2. **Monitor Warnings**
   - Check server logs for warnings
   - Investigate UNEVALUATED verdicts
   - Monitor replay attack attempts

## Security Best Practices

1. ✅ **Always use request hash** for critical actions
2. ✅ **Verify on server-side** - never trust client
3. ✅ **Include timestamp** in request data
4. ✅ **Log all verification failures** for monitoring
5. ✅ **Handle token expiration** gracefully
6. ✅ **Reject UNEVALUATED verdicts** (replay attacks)
7. ❌ **Never** skip verification for "convenience"
8. ❌ **Never** expose service account keys in client

## Monitoring

### Key Metrics to Track

- **Integrity check success rate**
- **UNEVALUATED verdict frequency** (replay attacks)
- **Token provider expiration rate**
- **Device integrity failures**
- **Unlicensed app attempts**

### Logging Example

```typescript
this.logger.log('Integrity verification', {
    userId: dto.userId,
    isValid: verification.isValid,
    appVerdict: verification.payload?.appIntegrity.appRecognitionVerdict,
    deviceVerdict: verification.payload?.deviceIntegrity.deviceRecognitionVerdict,
    licensingVerdict: verification.payload?.accountDetails.appLicensingVerdict,
    warnings: verification.warnings,
});
```

## Troubleshooting

### "Token provider not ready"
**Cause:** Trying to request token before provider is prepared  
**Solution:** Check `isReady()` before requesting, or use callback

### "Request hash mismatch"
**Cause:** Client and server compute hash differently  
**Solution:** Ensure identical serialization format on both sides

### "UNEVALUATED verdicts"
**Cause:** Replay attack or token reuse  
**Solution:** Reject the request, investigate logs

### "PLAY_SERVICES_NOT_FOUND"
**Cause:** Device doesn't have Play Services  
**Solution:** Show user dialog to install Play Services

## Resources

- [Play Integrity API Documentation](https://developer.android.com/google/play/integrity)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Play Console](https://play.google.com/console)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)

## Files Created

### Android
- `app-rn/android/app/src/main/java/com/smasherapp/IntegrityModule.java`
- `app-rn/android/app/src/main/java/com/smasherapp/IntegrityUsageExample.java`

### Server
- `server/src/integrity/integrity.service.ts`
- `server/src/integrity/integrity.controller.ts`
- `server/src/integrity/integrity.module.ts`

## Next Steps

1. ✅ Update `CLOUD_PROJECT_NUMBER` in IntegrityModule.java
2. ✅ Set up service account and download key
3. ✅ Configure environment variables on server
4. ✅ Import IntegrityModule in app.module.ts
5. ✅ Test with internal testing track
6. ✅ Monitor logs for verification failures
7. ✅ Implement in critical user actions (purchases, scores, etc.)
