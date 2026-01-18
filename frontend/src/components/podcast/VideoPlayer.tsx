import { useEffect, useRef, useState, useMemo } from 'react'
import { saveEpisodeProgress, getResumeTime, clearEpisodeProgress } from '@/utils/episodeProgress'
import { userProgressService } from '@/services'
import { Icon } from '@iconify/react'
import { Button } from 'react-bootstrap'

interface VideoPlayerProps {
  src: string
  episodeId?: number
  userId?: number
  className?: string
  style?: React.CSSProperties
}

const VideoPlayer = ({ src, episodeId, userId, className, style }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // -----------------------------------------------------------------------
  // HTML5 Video Logic
  // -----------------------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const loadProgress = () => {
      if (episodeId && video.duration > 0) {
        const resumeTime = getResumeTime(episodeId, video.duration)
        if (resumeTime > 0 && video.currentTime === 0) {
          video.currentTime = resumeTime
          setCurrentTime(resumeTime)
        }
      }
      setDuration(video.duration)
    }

    const handleLoadedMetadata = () => loadProgress()

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Check for 85% completion
      if (episodeId && userId && video.duration > 0 && !completedRef.current) {
        const progressPercentage = (video.currentTime / video.duration) * 100
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

      // Save progress
      if (episodeId && video.duration > 0) {
        saveEpisodeProgress(episodeId, video.currentTime, video.duration)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      if (episodeId) clearEpisodeProgress(episodeId)
    }

    const handleSeeked = () => {
      if (episodeId && video.duration > 0) {
        saveEpisodeProgress(episodeId, video.currentTime, video.duration)
        setCurrentTime(video.currentTime)
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('seeked', handleSeeked)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('seeked', handleSeeked)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [episodeId, userId])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progressBar = e.currentTarget
    if (!video || !duration) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    video.currentTime = percentage * duration
    setCurrentTime(video.currentTime)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // -----------------------------------------------------------------------
  // Vimeo Logic
  // -----------------------------------------------------------------------

  // Determine player type
  const isVimeo = useMemo(() => {
    return src.includes('vimeo.com') || src.includes('player.vimeo.com') || (src.includes('<iframe') && src.includes('vimeo'))
  }, [src])

  const iframeSrc = useMemo(() => {
    if (!isVimeo) return ''

    // Extract from iframe tag
    if (src.includes('<iframe')) {
      const match = src.match(/src="([^"]+)"/)
      return match ? match[1] : src
    }

    // Convert watch URL to embed URL
    const vimeoMatch = src.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0&player_id=0&app_id=58479`
    }

    return src
  }, [src, isVimeo])

  const vimeoPlayerRef = useRef<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!isVimeo || !iframeRef.current) return

    let player: any
    let mounted = true

    const initVimeo = async () => {
      try {
        const { default: Player } = await import('@vimeo/player')
        if (!mounted) return

        player = new Player(iframeRef.current!)
        vimeoPlayerRef.current = player

        await player.ready()
        if (!mounted) return

        const d = await player.getDuration()
        setDuration(d)

        // Resume functionality
        if (episodeId && d > 0) {
          const resumeTime = getResumeTime(episodeId, d)
          if (resumeTime > 0) {
            await player.setCurrentTime(resumeTime).catch(() => { })
            setCurrentTime(resumeTime)
          }
        }

        player.on('timeupdate', (data: { seconds: number; percent: number; duration: number }) => {
          if (!mounted) return
          setCurrentTime(data.seconds)
          setDuration(data.duration)

          // Check for 85% completion
          if (episodeId && userId && data.duration > 0 && !completedRef.current) {
            const progressPercentage = (data.seconds / data.duration) * 100
            if (progressPercentage >= 85) {
              completedRef.current = true
              userProgressService
                .createOrUpdateUserProgress({
                  userId,
                  episodeId,
                  isCompleted: true,
                })
                .then(() => console.log(`Episode ${episodeId} marked as completed (Vimeo)`))
                .catch((e) => {
                  if (e?.response?.status !== 400) completedRef.current = false
                })
            }
          }

          // Save progress
          if (episodeId && data.duration > 0) {
            saveEpisodeProgress(episodeId, data.seconds, data.duration)
          }
        })

        player.on('play', () => setIsPlaying(true))
        player.on('pause', () => setIsPlaying(false))
        player.on('ended', () => {
          setIsPlaying(false)
          if (episodeId) clearEpisodeProgress(episodeId)
        })

      } catch (err) {
        console.error("Failed to initialize Vimeo player", err)
      }
    }

    initVimeo()

    return () => {
      mounted = false
      if (player) {
        player.off('timeupdate')
        player.off('play')
        player.off('pause')
        player.off('ended')
      }
    }
  }, [isVimeo, iframeSrc, episodeId, userId])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (isVimeo) {
    return (
      <div
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          ...style,
        }}
        className={className}
      >
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Vimeo Video"
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#000',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        ...style,
      }}
      className={className}
    >
      <video
        ref={videoRef}
        controls={false}
        className="w-100"
        style={{
          display: 'block',
          width: '100%',
          maxHeight: '70vh',
          outline: 'none',
        }}
        src={src}
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Custom Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          padding: '1rem',
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
        }}
      >
        {/* Progress Bar */}
        <div
          onClick={handleProgressClick}
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            cursor: 'pointer',
            marginBottom: '0.75rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--bs-primary)',
              borderRadius: '3px',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Controls */}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="link"
            className="p-0 text-white"
            onClick={togglePlay}
            style={{ minWidth: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon icon={isPlaying ? 'mingcute:pause-fill' : 'mingcute:play-fill'} style={{ fontSize: '1.5rem' }} />
          </Button>

          <span className="text-white small" style={{ minWidth: '80px' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-grow-1" />

          <Button
            variant="link"
            className="p-0 text-white"
            onClick={toggleFullscreen}
            style={{ minWidth: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon icon={isFullscreen ? 'mingcute:fullscreen-exit-line' : 'mingcute:fullscreen-line'} style={{ fontSize: '1.25rem' }} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
