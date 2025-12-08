import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from 'react-bootstrap'
import { saveEpisodeProgress, getResumeTime, clearEpisodeProgress } from '@/utils/episodeProgress'
import { userProgressService } from '@/services'

interface ModernAudioPlayerProps {
  src: string
  title?: string
  episodeId?: number
  userId?: number
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

const ModernAudioPlayer = ({ src, title, episodeId, userId, onTimeUpdate }: ModernAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

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

      if (episodeId && userId && audio.duration > 0 && !completedRef.current) {
        const progressPercentage = (audio.currentTime / audio.duration) * 100
        if (progressPercentage >= 85) {
          completedRef.current = true
          userProgressService
            .createOrUpdateUserProgress({
              userId,
              episodeId,
              isCompleted: true,
            })
            .then(() => {
              console.log(`Episode ${episodeId} marked as completed`)
            })
            .catch((error) => {
              console.error('Error marking episode as completed:', error)
              if (error?.response?.status !== 400) {
                completedRef.current = false
              }
            })
        }
      }
    }

    const updateDuration = () => {
      const newDuration = audio.duration || 0
      setDuration(newDuration)
      
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
      if (episodeId) {
        clearEpisodeProgress(episodeId)
      }
      if (episodeId && userId && !completedRef.current) {
        completedRef.current = true
        userProgressService
          .createOrUpdateUserProgress({
            userId,
            episodeId,
            isCompleted: true,
          })
          .catch((error) => {
            console.error('Error marking episode as completed:', error)
          })
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

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
  }, [onTimeUpdate, episodeId, userId])

  useEffect(() => {
    completedRef.current = false
  }, [episodeId])

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
        background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.06) 0%, rgba(var(--bs-primary-rgb), 0.02) 100%)',
        borderRadius: '16px',
        padding: '12px 16px',
        border: '1px solid rgba(var(--bs-primary-rgb), 0.12)',
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
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(var(--bs-primary-rgb), 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <audio ref={audioRef} src={src} preload="metadata" />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Main Controls */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Play/Pause Button */}
          <Button
            variant="primary"
            onClick={togglePlayPause}
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bs-primary)',
              boxShadow: isPlaying
                ? '0 6px 16px rgba(var(--bs-primary-rgb), 0.35)'
                : '0 3px 10px rgba(var(--bs-primary-rgb), 0.25)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(var(--bs-primary-rgb), 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = isPlaying
                ? '0 6px 16px rgba(var(--bs-primary-rgb), 0.35)'
                : '0 3px 10px rgba(var(--bs-primary-rgb), 0.25)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="white" rx="1" />
                <rect x="14" y="4" width="4" height="16" fill="white" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '2px' }}>
                <path d="M8 5v14l11-7z" fill="white" />
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
                  fontSize: '0.85rem',
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
                height: '6px',
                background: 'rgba(var(--bs-primary-rgb), 0.12)',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '6px',
                overflow: 'visible',
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
                  background: 'var(--bs-primary)',
                  borderRadius: '10px',
                  transition: isDragging ? 'none' : 'width 0.1s linear',
                }}
              >
                {/* Progress Handle */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translate(50%, -50%)',
                    width: '14px',
                    height: '14px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(var(--bs-primary-rgb), 0.35)',
                    border: '2px solid var(--bs-primary)',
                  }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="d-flex align-items-center justify-content-between">
              <span style={{ fontSize: '0.7rem', color: 'var(--bs-secondary)', fontWeight: '500' }}>
                {formatTime(currentTime)}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--bs-secondary)', fontWeight: '500' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div
            className="position-relative d-none d-md-block flex-shrink-0"
            onMouseEnter={() => setShowVolumeControl(true)}
            onMouseLeave={() => setShowVolumeControl(false)}
          >
            <Button
              variant="link"
              className="p-2"
              style={{
                color: 'var(--bs-secondary)',
                textDecoration: 'none',
                minWidth: '36px',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                icon={volume === 0 ? 'mingcute:volume-mute-line' : volume < 0.5 ? 'mingcute:volume-1-line' : 'mingcute:volume-2-line'}
                style={{ fontSize: '18px' }}
              />
            </Button>

            {showVolumeControl && (
              <div
                className="position-absolute"
                style={{
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  background: 'white',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  zIndex: 1000,
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
                    height: '70px',
                    background: 'rgba(var(--bs-primary-rgb), 0.1)',
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
            className="d-flex align-items-center justify-content-center gap-1 mt-2"
            style={{ height: '20px', opacity: 0.6 }}
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '2px',
                  height: '100%',
                  background: 'var(--bs-primary)',
                  borderRadius: '2px',
                  animation: `waveform ${0.5 + (i % 3) * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--bs-primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--bs-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.3);
        }
      `}</style>
    </div>
  )
}

export default ModernAudioPlayer
