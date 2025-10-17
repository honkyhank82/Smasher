# Video Upload Feature

Users can now upload videos to their profile gallery alongside photos.

## Features Implemented

### Backend Changes

**Media Controller** (`server/src/media/media.controller.ts`)
- Updated `signed-upload` endpoint to accept both photos and videos
- Added file type validation (images and videos)
- Organizes uploads into `photos/` and `videos/` folders based on media type

### Frontend Changes

**Gallery Screen** (`app-rn/src/screens/GalleryScreen.tsx`)
- Added support for video selection via `react-native-image-picker`
- Displays video thumbnails with play icon overlay
- Separate "Add Photo" and "Add Video" buttons
- Updated UI to show media type
- Delete functionality for both photos and videos

## Usage

### For Users

1. Navigate to Gallery screen
2. Tap "Add Photo" to upload a photo OR "Add Video" to upload a video
3. Select media from device
4. Media appears in gallery with appropriate icon
5. Long press to delete any media item

### Technical Details

**Supported Formats:**
- **Photos:** JPG, PNG, HEIF, etc. (via `image/*` MIME type)
- **Videos:** MP4, MOV, etc. (via `video/*` MIME type)

**Limits:**
- Up to 6 media items total (photos + videos combined)
- Videos compressed to medium quality on upload

**Storage:**
- Photos stored in: `users/{userId}/photos/`
- Videos stored in: `users/{userId}/videos/`

## Dependencies

Already installed:
- ✅ `react-native-video` - For video playback
- ✅ `react-native-image-picker` - For media selection

## Future Enhancements

- [ ] Video thumbnail generation server-side
- [ ] Video compression before upload
- [ ] Video duration limits
- [ ] Progress indicator for video uploads
- [ ] Video preview/playback in gallery
