# Audio Download System

This document explains the new audio download system that solves the Google Drive audio streaming issues.

## Problem

The original system tried to stream audio files directly from Google Drive URLs, which failed due to:
- CORS restrictions
- Authentication requirements
- Google Drive's anti-hotlinking measures
- Inconsistent URL formats

## Solution

The new system downloads Google Drive audio files to the server and serves them locally:

1. **Backend Downloads**: Server downloads audio files from Google Drive to local storage
2. **Local Serving**: Audio files are served directly from the server with proper headers
3. **Smart Caching**: Files are cached locally to avoid repeated downloads
4. **Status Tracking**: System tracks download progress and file availability

## Architecture

### Backend Components

#### AudioFileService (`KeciApp.API/Services/AudioFileService.cs`)
- Downloads audio files from Google Drive
- Manages local file storage
- Tracks download status
- Handles URL conversion

#### PodcastController Audio Endpoints
- `GET /api/podcast/audio/{episodeId}` - Stream audio file
- `POST /api/podcast/audio/{episodeId}/download` - Download audio file
- `GET /api/podcast/audio/{episodeId}/status` - Get download status

#### Configuration
- Audio files stored in `wwwroot/audio/` directory
- Configurable via `AudioStorage:Path` in appsettings.json

### Frontend Components

#### AudioService (`frontend/assets/js/services/audioService.js`)
- Handles audio file requests
- Manages download queue
- Provides status checking
- Implements retry logic

#### Updated Podcast Pages
- Smart audio loading with download indicators
- Progress feedback during downloads
- Automatic retry on failures
- Improved user experience

## Usage

### For Users

1. **Playing Audio**: Click the play button on any episode
2. **Download Process**: System automatically downloads the file if not cached
3. **Status Indicators**: Visual feedback shows download progress
4. **Retry Options**: Failed downloads can be retried

### For Developers

#### Backend API Usage

```csharp
// Inject the service
public class SomeController : ControllerBase
{
    private readonly IAudioFileService _audioFileService;
    
    public SomeController(IAudioFileService audioFileService)
    {
        _audioFileService = audioFileService;
    }
    
    // Check if audio is ready
    var status = await _audioFileService.GetAudioFileStatusAsync(audioIdentifier, episodeId);
    
    // Download audio file
    var success = await _audioFileService.DownloadAudioFileAsync(audioIdentifier, episodeId);
    
    // Get local file path
    var filePath = await _audioFileService.GetAudioFileAsync(audioIdentifier, episodeId);
}
```

#### Frontend Usage

```javascript
// Get audio URL (downloads if needed)
const audioUrl = await audioService.getAudioUrl(episodeId);

// Check if audio is ready
const isReady = await audioService.isAudioReady(episodeId);

// Wait for audio to be ready
const readyUrl = await audioService.waitForAudio(episodeId);

// Get download status
const status = await audioService.getAudioFileStatus(episodeId);
```

## File Structure

```
KeciApp.API/
├── Controllers/
│   └── PodcastController.cs (updated with audio endpoints)
├── Services/
│   └── AudioFileService.cs (new)
├── Interfaces/
│   └── IAudioFileService.cs (new)
└── wwwroot/
    └── audio/ (audio file storage)

frontend/
├── assets/js/services/
│   └── audioService.js (new)
├── pages/user/
│   └── podcasts.html (updated)
└── test-audio-download.html (new test page)
```

## Testing

### Test Page
Visit `/test-audio-download` to test the system:
- Download individual episodes
- Check download status
- Test audio playback
- Verify API endpoints

### Manual Testing
1. Start the backend API
2. Start the frontend server
3. Navigate to `/test-audio-download`
4. Enter an episode ID
5. Click "Get Status" to check current state
6. Click "Download" to download the file
7. Click "Play" to test playback

## Configuration

### Backend Configuration (`appsettings.json`)
```json
{
  "AudioStorage": {
    "Path": "wwwroot/audio"
  }
}
```

### Frontend Configuration
Update `API_BASE_URL` in `config.js` to point to your backend.

## Error Handling

### Backend Errors
- Invalid episode IDs return 404
- Download failures are logged and return appropriate status codes
- File system errors are handled gracefully

### Frontend Errors
- Network failures trigger retry mechanisms
- User-friendly error messages
- Automatic fallback to original Google Drive URLs (if needed)

## Performance Considerations

### Caching
- Files are cached locally after first download
- Cache check before attempting downloads
- Configurable cache location

### Concurrent Downloads
- Download queue prevents duplicate requests
- Thread-safe download tracking
- Efficient resource utilization

### File Management
- Automatic directory creation
- Proper file cleanup (can be extended)
- Storage space monitoring (can be added)

## Security

### Access Control
- Audio endpoints can be protected with authentication
- User-specific access controls (can be extended)
- Rate limiting (can be added)

### File Security
- Files stored outside web root by default
- Secure file serving with proper headers
- Input validation on episode IDs

## Future Enhancements

### Possible Improvements
1. **Batch Downloads**: Download multiple episodes at once
2. **Storage Management**: Automatic cleanup of old files
3. **CDN Integration**: Serve files from CDN for better performance
4. **Streaming**: Implement proper streaming for large files
5. **Compression**: Audio file compression to save space
6. **Metadata**: Extract and store audio metadata
7. **Thumbnails**: Generate audio waveforms or thumbnails

### Monitoring
- Add download metrics
- Track storage usage
- Monitor download success rates
- Performance analytics

## Troubleshooting

### Common Issues

1. **Downloads Fail**
   - Check Google Drive URL format
   - Verify network connectivity
   - Check storage permissions

2. **Audio Won't Play**
   - Verify file was downloaded successfully
   - Check audio file format support
   - Ensure proper MIME types

3. **Storage Issues**
   - Check disk space
   - Verify write permissions
   - Check storage path configuration

### Debugging

Enable detailed logging in the backend:
```csharp
// In Program.cs
builder.Logging.SetMinimumLevel(LogLevel.Debug);
```

Check browser console for frontend errors:
```javascript
// Enable verbose logging
console.log('Audio service debug info:', audioService);
```

## API Reference

### Audio Endpoints

#### Get Audio File
```
GET /api/podcast/audio/{episodeId}
```
Returns the audio file stream with proper headers for playback.

#### Download Audio File
```
POST /api/podcast/audio/{episodeId}/download
```
Triggers download of the audio file from Google Drive.

#### Get Audio Status
```
GET /api/podcast/audio/{episodeId}/status
```
Returns current download status and file information.

### Response Formats

#### Audio Status Response
```json
{
  "isDownloaded": true,
  "isDownloading": false,
  "filePath": "/path/to/audio/file",
  "fileSizeBytes": 1234567,
  "downloadedAt": "2024-01-01T12:00:00Z",
  "error": null
}
```

#### Download Response
```json
{
  "message": "Audio file downloaded successfully",
  "episodeId": 123
}
```

This system provides a robust solution for handling Google Drive audio files while maintaining good performance and user experience. 