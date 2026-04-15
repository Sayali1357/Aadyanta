# Attention Monitor Integration Guide

## Overview
This document explains how the AI Attention Monitoring system has been integrated into the Career Compass frontend. The system automatically monitors user attention while watching YouTube educational videos using computer vision to detect face and eye aspects.

## Architecture

### Components Modified/Created

#### 1. **AttentionMonitor.tsx** (Enhanced)
- **Location**: `frontend/src/components/study/AttentionMonitor.tsx`
- **Purpose**: Core attention monitoring UI component
- **Features**:
  - Real-time attention score display (0-100%)
  - Live camera feed with video canvas
  - Auto-start/stop based on YouTube video state
  - Session summary display with statistics
  - Error handling for offline model server
  - Automatic snapshot transmission to backend

#### 2. **YouTubePlaylistViewer.tsx** (Updated)
- **Location**: `frontend/src/components/resources/YouTubePlaylistViewer.tsx`
- **New Prop**: `onVideoStateChange?: (isPlaying: boolean) => void`
- **Changes**:
  - Calls `onVideoStateChange(true)` when video is selected
  - Calls `onVideoStateChange(false)` when user marks video complete
  - Tracks video playback state

#### 3. **Topic.tsx** (Updated)
- **Location**: `frontend/src/pages/Topic.tsx`
- **Changes**:
  - Added `isVideoPlaying` state
  - Passes `isVideoPlaying` to AttentionMonitor component
  - Passes `onVideoStateChange` callback to YouTubePlaylistViewer

## How It Works

### Auto-Start/Stop Workflow
```
User selects YouTube video
    ↓
YouTubePlaylistViewer calls onVideoStateChange(true)
    ↓
Topic component sets isVideoPlaying = true
    ↓
AttentionMonitor detects isVideoPlaying = true
    ↓
Auto-starts monitoring session via startMonitoring()
    ↓
Creates session on backend, begins snapshot transmission
    ↓
Real-time scores displayed in UI
    ↓
User plays next video or marks complete
    ↓
onVideoStateChange(false) is called
    ↓
stopMonitoring() is triggered
    ↓
Session ends, summary displayed
```

### Data Flow
```
Frontend (Camera)
    ↓
Capture frame every 300ms
    ↓
Convert to JPEG blob
    ↓
Send to Backend: POST /api/v1/session/{sessionId}/snapshot
    ↓
Backend (Flask + MediaPipe)
    ↓
Detect face landmarks
    ↓
Calculate eye aspect ratio
    ↓
Determine ATTENTIVE or DISTRACTED
    ↓
Return: {attention_score, current_status, frames_processed, elapsed_time}
    ↓
Update UI with real-time score
    ↓
Accumulate data for final summary
```

## API Integration

### Backend Endpoints Used

#### 1. **Start Session**
```
POST /api/v1/session/start
Headers: Content-Type: application/json
Body: { "timeout": 300 }
Response: { "session_id": "uuid" }
```

#### 2. **Send Snapshot**
```
POST /api/v1/session/{sessionId}/snapshot
Headers: Content-Type: multipart/form-data
Body: FormData with "image" file
Response: {
  "attention_score": 75.5,
  "current_status": "ATTENTIVE",
  "face_detected": true,
  "eye_ratio": 0.35,
  "frames_processed": 42,
  "elapsed_time": 12.6
}
```

#### 3. **Get Session Summary**
```
GET /api/v1/session/{sessionId}/summary
Response: {
  "attention_score": 78.3,
  "total_time": 45.2,
  "frames_processed": 150,
  "distracted_periods": [...],
  "time_array": [0.0, 0.3, 0.6, ...],
  "attention_array": [75.5, 82.1, 68.9, ...],
  "status_array": ["ATTENTIVE", "ATTENTIVE", "DISTRACTED", ...]
}
```

#### 4. **End Session**
```
POST /api/v1/session/{sessionId}/end
```

## UI Components

### Real-time Display
- **Attention Score**: Large bold display (0-100%)
- **Progress Bar**: Visual representation of score
- **Status Badge**: GREEN (ATTENTIVE) or RED (DISTRACTED)
- **Frames Counter**: Number of processed frames
- **Elapsed Time**: Session duration in seconds

### Session Summary (After Video Ends)
- Final Attention Score
- Total Session Duration
- Total Frames Processed
- Number of Distracted Periods

### Error Handling
```
Frontend Error Display:
├─ Camera Access Denied
│  └─ Message: "Camera access denied. Please allow camera access in browser settings."
│
├─ Model Server Offline
│  └─ Message: "Attention model server is offline. Please ensure the backend is running."
│  └─ Status: 503 Service Unavailable
│
└─ Network Error
   └─ Message: "Failed to process snapshot"
```

## Environment Configuration

### Required Environment Variables
```env
# Either set in .env or use default
VITE_API_URL=http://localhost:5000/api/v1

# For production/deployed backend:
VITE_API_URL=https://your-deployed-backend.com/api/v1
```

### Example .env.local
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## State Management

### AttentionMonitor State Variables
```typescript
interface AttentionSession {
  sessionId: string;              // Backend session identifier
  currentScore: number;           // Latest attention score (0-100)
  framesProcessed: number;        // Total frames processed
  elapsedTime: number;            // Elapsed time in seconds
  status: 'ATTENTIVE' | 'DISTRACTED';  // Current status
  timeArray: number[];            // Time points for graph
  attentionArray: number[];       // Attention scores over time
  statusArray: string[];          // Status over time
  faceDetected: boolean;          // Face detected in current frame
}
```

### Component States
```typescript
isCameraActive: boolean;          // Camera successfully initialized
isMonitoring: boolean;            // Active monitoring session
permissionDenied: boolean;        // User denied camera access
modelError: string | null;        // Error message if any
sessionData: AttentionSession | null;  // Current session data
showResults: boolean;             // Show summary after session
sessionSummary: any;              // Final summary data
```

## Features

### ✅ Implemented
- [x] Auto-start monitoring when YouTube video selected
- [x] Auto-stop monitoring when video ended/marked complete
- [x] Real-time attention score display
- [x] Live camera feed preview
- [x] Error handling for offline model
- [x] Error handling for camera access denial
- [x] Session summary display
- [x] Frame and time tracking
- [x] Automatic snapshot transmission (300ms intervals)
- [x] Attentive/Distracted status indication
- [x] Responsive UI design

### 📋 To Be Added (Optional Enhancements)
- [ ] Graph visualization using Chart.js (for time-series data)
- [ ] Download session report as PDF
- [ ] Historical session comparisons
- [ ] Detailed distraction period analysis
- [ ] Performance metrics and trends
- [ ] Integration with quiz results
- [ ] Attention feedback notifications

## Troubleshooting

### Issue: "Camera access denied"
**Solution**: 
1. Check browser camera permissions
2. Reset camera permissions in browser settings
3. Reload page and try again

### Issue: "Attention model server is offline"
**Solution**:
1. Ensure Flask backend is running
2. Check if backend is accessible at configured URL
3. Verify network connectivity to backend
4. Check backend logs for errors

### Issue: No attention scores appearing
**Step 1**: Check camera feed is visible
**Step 2**: Verify backend is receiving snapshot requests
**Step 3**: Check browser console for errors
**Step 4**: Verify CORS headers are properly configured

### Issue: Monitoring not auto-starting
**Solution**:
1. Ensure camera permission was granted
2. Check that `isVideoPlaying` state is true
3. Verify backend session endpoint is working
4. Check browser console for error messages

## Testing

### Manual Testing Steps
1. Navigate to a learning topic with YouTube videos
2. Ensure camera is connected and working
3. Grant camera access when prompted
4. Select a YouTube video from the playlist
5. Verify:
   - Camera feed appears in AttentionMonitor
   - Attention score starts updating
   - Status badge shows ATTENTIVE/DISTRACTED
   - Frame counter increments
6. Mark video as complete
7. Verify:
   - Monitoring stops
   - Session summary appears
   - Shows final attention score

## Performance Considerations

- **Snapshot Frequency**: Every 300ms (~3-4 fps)
- **API Timeout**: 300 seconds per session
- **Camera Resolution**: Ideal 640x480 (adaptive)
- **Network Bandwidth**: ~3-4 images per second
- **Backend Processing**: ~100-200ms per frame

## Security Notes

- Camera data is only sent to your configured backend
- No data is stored on client browser after session ends
- Sessions expire after 300 seconds of inactivity
- Backend should validate all incoming requests

## Future Enhancements

1. **Graph Implementation**: Use Chart.js to visualize attention over time
2. **ML Model Improvements**: Train model on diverse face types and lighting
3. **Notifications**: Alert user during distraction periods
4. **Dashboard**: Show aggregated attention data across learning sessions
5. **Export**: Generate detailed reports in PDF format
6. **Analytics**: Track attention patterns and identify improvement areas

## File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── study/
│   │   │   └── AttentionMonitor.tsx (MODIFIED)
│   │   ├── resources/
│   │   │   └── YouTubePlaylistViewer.tsx (MODIFIED)
│   ├── pages/
│   │   └── Topic.tsx (MODIFIED)
```

## Running the System

### Prerequisites
1. Frontend running: `npm run dev` (from frontend folder)
2. Backend running: Flask server at configured URL
3. Camera: Connected and permissions granted
4. YouTube API: Configured for playlist loading

### Start Learning
1. Go to career roadmap or dashboard
2. Select a learning topic
3. Click on a YouTube video
4. Attention monitoring starts automatically
5. Watch the video - your attention is tracked
6. Complete the video to see summary

---
**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
