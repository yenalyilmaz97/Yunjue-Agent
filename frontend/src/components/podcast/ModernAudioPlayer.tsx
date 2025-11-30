import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from 'react-bootstrap'
import { saveEpisodeProgress, getResumeTime, clearEpisodeProgress } from '@/utils/episodeProgress'

interface ModernAudioPlayerProps {
  src: string
  title?: string
  episodeId?: number
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

const ModernAudioPlayer = ({ src, title, episodeId, onTimeUpdate }: ModernAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Load saved progress if episodeId is provided
    if (episodeId) {
      const resumeTime = getResumeTime(episodeId, audio.duration || 0)
      if (resumeTime > 0) {
        audio.currentTime = resumeTime
        setCurrentTime(resumeTime)
      }
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime, audio.duration || 0)
      }
    }

    const updateDuration = () => {
      const newDuration = audio.duration || 0
      setDuration(newDuration)
      
      // Load saved progress when duration is available
      if (episodeId && newDuration > 0) {
        const resumeTime = getResumeTime(episodeId, newDuration)
        if (resumeTime > 0 && audio.currentTime === 0) {
          audio.currentTime = resumeTime
          setCurrentTime(resumeTime)
        }
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      // Clear progress when episode is completed
      if (episodeId) {
        clearEpisodeProgress(episodeId)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Set up interval to save progress every 5 seconds
    if (episodeId) {
      saveProgressIntervalRef.current = setInterval(() => {
        if (audio.duration && audio.currentTime > 0) {
          saveEpisodeProgress(episodeId, audio.currentTime, audio.duration)
        }
      }, 5000)
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current)
      }
    }
  }, [onTimeUpdate, episodeId])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
      setIsPlaying(false)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressBarRef.current
    if (!audio || !progressBar || !duration) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
    
    // Save progress immediately when user seeks
    if (episodeId && duration > 0) {
      saveEpisodeProgress(episodeId, newTime, duration)
    }
  }

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    handleProgressClick(e)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="modern-audio-player"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.05) 0%, rgba(139, 21, 56, 0.02) 100%)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(139, 21, 56, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 21, 56, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(33, 215, 96, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <audio ref={audioRef} src={src} preload="metadata" />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Main Controls */}
        <div className="d-flex align-items-center gap-2 gap-md-3 mb-3">
          {/* Play/Pause Button */}
          <Button
            variant="primary"
            onClick={togglePlayPause}
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #8b1538 0%, #a02040 100%)',
              boxShadow: isPlaying
                ? '0 8px 20px rgba(139, 21, 56, 0.4)'
                : '0 4px 12px rgba(139, 21, 56, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              position: 'relative',
              zIndex: 10,
              display: 'flex !important',
              visibility: 'visible',
              opacity: 1,
              overflow: 'visible',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(139, 21, 56, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = isPlaying
                ? '0 8px 20px rgba(126, 103, 254, 0.4)'
                : '0 4px 12px rgba(126, 103, 254, 0.3)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isPlaying ? (
              // Pause Icon (iki dikey çizgi)
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  display: 'block', 
                  flexShrink: 0,
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'none',
                }}
              >
                <rect x="6" y="4" width="4" height="16" fill="white" rx="1" />
                <rect x="14" y="4" width="4" height="16" fill="white" rx="1" />
              </svg>
            ) : (
              // Play Icon (üçgen)
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  display: 'block', 
                  flexShrink: 0, 
                  marginLeft: '2px',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'none',
                }}
              >
                <path
                  d="M8 5v14l11-7z"
                  fill="white"
                />
              </svg>
            )}
          </Button>

          {/* Time and Progress */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            {/* Title (if provided) */}
            {title && (
              <div
                className="text-truncate mb-1 fw-semibold"
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--bs-primary)',
                }}
              >
                {title}
              </div>
            )}

            {/* Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              onMouseMove={handleProgressDrag}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                setIsDragging(true)
                const touch = e.touches[0]
                const rect = progressBarRef.current?.getBoundingClientRect()
                if (rect && audioRef.current && duration) {
                  const clickX = touch.clientX - rect.left
                  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
                  const newTime = percentage * duration
                  audioRef.current.currentTime = newTime
                  setCurrentTime(newTime)
                }
              }}
              onTouchMove={(e) => {
                if (isDragging) {
                  const touch = e.touches[0]
                  const rect = progressBarRef.current?.getBoundingClientRect()
                  if (rect && audioRef.current && duration) {
                    const clickX = touch.clientX - rect.left
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
                    const newTime = percentage * duration
                    audioRef.current.currentTime = newTime
                    setCurrentTime(newTime)
                  }
                }
              }}
              onTouchEnd={() => setIsDragging(false)}
              style={{
                position: 'relative',
                height: '8px',
                background: 'rgba(126, 103, 254, 0.1)',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '8px',
                overflow: 'hidden',
                touchAction: 'none',
              }}
            >
              {/* Progress Fill */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(90deg, #8b1538 0%, #a02040 100%)',
                  borderRadius: '10px',
                  transition: isDragging ? 'none' : 'width 0.1s linear',
                  boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)',
                }}
              >
                {/* Progress Handle */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translate(50%, -50%)',
                    width: '16px',
                    height: '16px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(139, 21, 56, 0.4)',
                    border: '2px solid #8b1538',
                  }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="d-flex align-items-center justify-content-between">
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--bs-secondary)',
                  fontWeight: '500',
                }}
              >
                {formatTime(currentTime)}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--bs-secondary)',
                  fontWeight: '500',
                }}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div
            className="position-relative d-none d-md-block"
            style={{ flexShrink: 0 }}
            onMouseEnter={() => setShowVolumeControl(true)}
            onMouseLeave={() => setShowVolumeControl(false)}
          >
            <Button
              variant="link"
              className="p-2"
              style={{
                color: 'var(--bs-secondary)',
                textDecoration: 'none',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                icon={
                  volume === 0
                    ? 'mingcute:volume-mute-line'
                    : volume < 0.5
                      ? 'mingcute:volume-1-line'
                      : 'mingcute:volume-2-line'
                }
                style={{ fontSize: '20px' }}
              />
            </Button>

            {/* Volume Slider */}
            {showVolumeControl && (
              <div
                className="position-absolute"
                style={{
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '10px',
                  background: 'white',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '40px',
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    WebkitAppearance: 'slider-vertical',
                    width: '6px',
                    height: '80px',
                    background: 'rgba(126, 103, 254, 0.1)',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer',
                    writingMode: 'bt-lr' as any,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Waveform Animation (when playing) */}
        {isPlaying && (
          <div
            className="d-flex align-items-center justify-content-center gap-1"
            style={{
              height: '24px',
              opacity: 0.6,
            }}
          >
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '2px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #8b1538 0%, #a02040 100%)',
                  borderRadius: '2px',
                  animation: `waveform ${0.5 + (i % 3) * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes waveform {
          0%, 100% {
            transform: scaleY(0.3);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #8b1538 0%, #a02040 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(126, 103, 254, 0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #8b1538 0%, #a02040 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(126, 103, 254, 0.3);
        }
      `}</style>
    </div>
  )
}

export default ModernAudioPlayer

