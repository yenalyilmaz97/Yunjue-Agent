import { useEffect, useRef } from 'react'
import { saveEpisodeProgress, getResumeTime, clearEpisodeProgress } from '@/utils/episodeProgress'

interface VideoPlayerProps {
  src: string
  episodeId?: number
  className?: string
  style?: React.CSSProperties
  controlsList?: string
}

const VideoPlayer = ({ src, episodeId, className, style, controlsList }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Load saved progress if episodeId is provided
    const loadProgress = () => {
      if (episodeId && video.duration > 0) {
        const resumeTime = getResumeTime(episodeId, video.duration)
        if (resumeTime > 0 && video.currentTime === 0) {
          video.currentTime = resumeTime
        }
      }
    }

    const handleLoadedMetadata = () => {
      loadProgress()
    }

    const handleTimeUpdate = () => {
      // Progress will be saved via interval
    }

    const handleEnded = () => {
      // Clear progress when video is completed
      if (episodeId) {
        clearEpisodeProgress(episodeId)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    // Set up interval to save progress every 5 seconds
    if (episodeId) {
      saveProgressIntervalRef.current = setInterval(() => {
        if (video.duration && video.currentTime > 0) {
          saveEpisodeProgress(episodeId, video.currentTime, video.duration)
        }
      }, 5000)
    }

    // Also save progress when user seeks
    const handleSeeked = () => {
      if (episodeId && video.duration > 0) {
        saveEpisodeProgress(episodeId, video.currentTime, video.duration)
      }
    }

    video.addEventListener('seeked', handleSeeked)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('seeked', handleSeeked)
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current)
      }
    }
  }, [episodeId])

  return (
    <video
      ref={videoRef}
      controls
      controlsList={controlsList}
      className={className}
      style={style}
      src={src}
      preload="metadata"
    />
  )
}

export default VideoPlayer

