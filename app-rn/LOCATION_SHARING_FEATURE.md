# Location Sharing Feature

## Overview
Users can share their real-time location with specific users for a limited time. The share automatically expires or can be manually stopped.

## Features

### ✅ Time-Limited Sharing
- 15 minutes
- 30 minutes
- 1 hour
- 2 hours
- 4 hours
- Until manually stopped (24h max)

### ✅ Real-Time Updates
- Location updates every 10 seconds
- Updates when user moves 10+ meters
- Live tracking on map

### ✅ Manual Control
- Start sharing with any user
- Stop sharing anytime
- View active shares
- Auto-cleanup on expiry

### ✅ Privacy & Security
- Location only shared with selected user
- Encrypted data transmission
- Automatic expiration
- Manual cancellation anytime

## User Flow

### Starting a Share
1. Navigate to user profile
2. Tap "Share Location" button
3. Select duration
4. Location sharing starts immediately
5. Real-time updates begin

### Viewing Shared Location
1. Receive notification (if implemented)
2. Open shared location map
3. See user's real-time location
4. View distance and time remaining
5. Center map on user or self

### Stopping a Share
1. Open location share screen
2. Tap "Stop" on active share
3. Location sharing ends immediately
4. Other user notified

## Technical Implementation

### Frontend Components

**LocationShareScreen.tsx**
- UI to start/stop sharing
- Duration selection modal
- Active shares list
- Safety information

**SharedLocationMapScreen.tsx**
- Real-time map view
- User location marker
- Distance calculation
- Auto-refresh every 10s

**LocationShareService.ts**
- Start/stop sharing
- Location tracking
- Auto-expiry timers
- Backend communication

### Backend API Endpoints (Need to Implement)

```typescript
POST /location-share/start
{
  sharedWithUserId: string,
  latitude: number,
  longitude: number,
  durationMinutes: number
}

POST /location-share/:shareId/stop

GET /location-share/active
// Returns shares where others are sharing with me

GET /location-share/my-shares
// Returns shares I'm currently sharing

GET /location-share/:shareId
// Get specific share details

PUT /location-share/:shareId/location
{
  latitude: number,
  longitude: number
}
```

### Database Schema (Need to Implement)

```sql
CREATE TABLE location_shares (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  shared_with_user_id UUID NOT NULL REFERENCES users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  INDEX idx_user_id (user_id),
  INDEX idx_shared_with (shared_with_user_id),
  INDEX idx_expires_at (expires_at)
);
```

## How to Use in App

### Navigate to Location Share Screen
```typescript
navigation.navigate('LocationShare', {
  userId: 'user-id',
  userName: 'John Doe'
});
```

### Navigate to Shared Location Map
```typescript
navigation.navigate('SharedLocationMap', {
  shareId: 'share-id',
  userName: 'John Doe'
});
```

### Add Button to Profile Screen
```typescript
<TouchableOpacity
  style={styles.shareLocationButton}
  onPress={() => navigation.navigate('LocationShare', {
    userId: user.id,
    userName: user.displayName
  })}
>
  <Text>📍 Share Location</Text>
</TouchableOpacity>
```

## Dependencies

- ✅ `expo-location` - Already installed
- ✅ `react-native-maps` - Installed
- ✅ `i18next` - For translations

## Backend TODO

1. **Create LocationShare Entity**
   - Add to `server/src/location-share/location-share.entity.ts`
   - Include all fields from schema

2. **Create LocationShare Module**
   - Controller for API endpoints
   - Service for business logic
   - Auto-cleanup expired shares

3. **Add Permissions**
   - Check if users are connected/matched
   - Validate share ownership
   - Rate limiting

4. **Add Notifications**
   - Notify when someone shares location
   - Notify when share expires
   - Notify when share is stopped

5. **Add Cleanup Job**
   - Cron job to expire old shares
   - Clean up inactive shares
   - Update is_active flag

## Testing Checklist

- [ ] Start location share with user
- [ ] Verify real-time updates
- [ ] Test auto-expiry after duration
- [ ] Test manual stop
- [ ] Test map view with shared location
- [ ] Test distance calculation
- [ ] Test multiple active shares
- [ ] Test permissions
- [ ] Test cleanup on logout
- [ ] Test expired share handling

## Privacy Considerations

✅ **User Control**
- Users explicitly choose who to share with
- Users choose duration
- Users can stop anytime

✅ **Data Protection**
- Location data encrypted in transit
- Automatic expiration
- No permanent storage of location history

✅ **Transparency**
- Clear UI showing active shares
- Time remaining always visible
- Safety information displayed

## Future Enhancements

- [ ] Push notifications for share events
- [ ] Location history/breadcrumbs
- [ ] Geofencing alerts
- [ ] Share with multiple users
- [ ] Custom share messages
- [ ] Location accuracy indicator
