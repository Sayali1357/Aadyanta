# Quick Setup: Attention Monitoring Integration

## 🚀 Quick Start

### Step 1: Ensure Backend is Running
```bash
# Terminal 1: Backend (Flask)
cd backend
python server.js  # or however you run the Flask server
# Should be accessible at: http://localhost:5000/api/v1
```

### Step 2: Start Frontend
```bash
# Terminal 2: Frontend (React/Vite)
cd frontend
npm run dev
# Should be accessible at: http://localhost:5173
```

### Step 3: Grant Camera Permission
- When prompted by browser, click "Allow" for camera access
- Component will show "Ready" status when camera is initialized

### Step 4: Use the System
1. Navigate to a learning topic
2. Select a YouTube video from the playlist
3. Attention monitoring **auto-starts**
4. Watch the real-time attention score update
5. Video completion **auto-stops** monitoring
6. See session summary with final score

## 🔧 Configuration

### Backend URL
Default: `http://localhost:5000/api/v1`

**To change** (in frontend/.env.local):
```env
VITE_API_URL=http://your-backend-url/api/v1
```

## ✨ Features

### Auto-Start/Stop
- ✅ Automatically starts when video selected
- ✅ Automatically stops when video marked complete
- ✅ No manual button clicking needed

### Real-time Metrics
- **Attention Score** (0-100%): Eye openness indicator
- **Status**: ATTENTIVE (green) or DISTRACTED (red)
- **Frames**: Number of processed frames
- **Time**: Elapsed session duration

### Error Handling
- ✅ Camera access denied → Clear error message
- ✅ Backend offline → Service unavailable error
- ✅ Network issues → Graceful error handling
- ✅ Session timeout → Automatic recovery

### Session Summary (After Video)
```
Final Attention Score: 78%
Total Duration: 45.2 seconds
Total Frames: 150
Distracted Periods: 2
```

## 🎯 How Attention is Calculated

1. **Face Detection**: MediaPipe detects face landmarks from camera frame
2. **Eye Analysis**: Calculates Eye Aspect Ratio (EAR)
   - EAR > 0.2 → Eyes OPEN → ATTENTIVE
   - EAR ≤ 0.2 → Eyes CLOSED → DISTRACTED
3. **Scoring**: Converts status to percentage (0-100%)
4. **Tracking**: Records every 300ms for trend analysis

## 📊 UI Layout

```
┌────────────────────────────────────────┐
│  🔌 AI Attention Monitor  [Status]     │
├────────────────────────────────────────┤
│                                        │
│  [Camera Feed]  [Attention Score]      │
│  (640x480)      ┌─────────────────┐   │
│                 │ 78%             │   │
│                 │ ████████░░ 78%  │   │
│                 ├─────────────────┤   │
│                 │ Status: ATTENTIVE   │
│                 │ Frames: 150     │   │
│                 │ Time: 45.2s     │   │
│                 └─────────────────┘   │
│                                        │
├────────────────────────────────────────┤
│  [Session Summary After Video]         │
│  Final Score: 78% | Time: 45.2s        │
│  Frames: 150    | Distractions: 2     │
└────────────────────────────────────────┘
```

## 🐛 Debugging

### Check Camera is Working
1. Browser DevTools → Console
2. Should see: "Page loaded. Ready to start..."
3. Video element should show your face

### Check Backend Connection
1. Open browser DevTools → Network tab
2. Select video
3. Should see POST requests to `/session/start`
4. Should see POST requests to `/session/{id}/snapshot`

### Check Attention Scores
1. DevTools → Console
2. Look for: "attention_score: XX"
3. UI should update every 300ms

## 📝 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Camera access denied | Browser permission | Grant camera access in browser settings |
| Model server offline | Backend not running | Start Flask backend at port 5000 |
| No scores updating | Backend not responding | Check backend logs for errors |
| Slow updates | Network issue | Verify network connectivity |
| Session expires | Timeout reached | Session lasts max 300 seconds |

## 🔌 API Endpoints

All endpoints use prefix: `http://localhost:5000/api/v1`

### Create Session
```
POST /session/start
→ Returns: { "session_id": "uuid" }
```

### Send Frame
```
POST /session/{id}/snapshot
→ Returns: { "attention_score": 78.5, "current_status": "ATTENTIVE", ... }
```

### Get Summary
```
GET /session/{id}/summary
→ Returns: { "attention_score": 78, "total_time": 45.2, ... }
```

### End Session
```
POST /session/{id}/end
→ Returns: Success confirmation
```

## 💾 Session Data

After session ends, data includes:
- **attention_score**: Overall attention percentage
- **total_time**: Session duration in seconds
- **frames_processed**: Total frames analyzed
- **distracted_periods**: List of distraction intervals
- **time_array**: Timestamp array for graphing
- **attention_array**: Score array for graphing
- **status_array**: Status array for graphing

## 🎮 User Actions

### Select Video
1. Click video in playlist
2. ✅ Monitoring auto-starts
3. Camera feed appears
4. Score starts updating

### Complete Video
1. Click "Mark as Complete"
2. ✅ Monitoring auto-stops
3. Session summary appears
4. Shows final statistics

### Next Video
1. Select next video from playlist
2. ✅ New session starts automatically
3. Previous summary clears
4. Fresh monitoring begins

## 🌐 Deployment

### For Production
1. Update `VITE_API_URL` to your backend domain
2. Ensure CORS is configured on backend
3. Use HTTPS for secure camera transmission
4. Configure camera permissions policy in headers

Example:
```env
VITE_API_URL=https://api.yoursite.com/api/v1
```

## 📱 Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (with camera permission)
- ✅ Edge
- ⚠️ Mobile browsers (limited camera support)

## 🆘 Support

For issues:
1. Check browser console for errors
2. Check backend logs
3. Verify network connectivity
4. Review attention-monitor-integration.md for detailed docs

---

**Need Help?** Check the full documentation in [ATTENTION_MONITOR_INTEGRATION.md](./ATTENTION_MONITOR_INTEGRATION.md)
