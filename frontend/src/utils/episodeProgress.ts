/**
 * Episode playback progress tracking utilities
 * Stores progress in localStorage and manages resume functionality
 */

const STORAGE_KEY_PREFIX = 'episode_progress_'

export interface EpisodeProgress {
  episodeId: number
  currentTime: number
  duration: number
  lastUpdated: number
}

/**
 * Get storage key for an episode
 */
function getStorageKey(episodeId: number): string {
  return `${STORAGE_KEY_PREFIX}${episodeId}`
}

/**
 * Save episode progress to localStorage
 */
export function saveEpisodeProgress(episodeId: number, currentTime: number, duration: number): void {
  try {
    const progress: EpisodeProgress = {
      episodeId,
      currentTime,
      duration,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(getStorageKey(episodeId), JSON.stringify(progress))
  } catch (error) {
    console.error('Error saving episode progress:', error)
  }
}

/**
 * Get episode progress from localStorage
 */
export function getEpisodeProgress(episodeId: number): EpisodeProgress | null {
  try {
    const stored = localStorage.getItem(getStorageKey(episodeId))
    if (!stored) return null
    
    const progress = JSON.parse(stored) as EpisodeProgress
    return progress
  } catch (error) {
    console.error('Error reading episode progress:', error)
    return null
  }
}

/**
 * Clear episode progress from localStorage (when episode is completed)
 */
export function clearEpisodeProgress(episodeId: number): void {
  try {
    localStorage.removeItem(getStorageKey(episodeId))
  } catch (error) {
    console.error('Error clearing episode progress:', error)
  }
}

/**
 * Check if episode is completed (progress >= 95% of duration)
 */
export function isEpisodeCompleted(progress: EpisodeProgress | null, currentDuration: number): boolean {
  if (!progress || !currentDuration) return false
  // Consider completed if progress is within 5 seconds of the end or >= 95%
  return progress.currentTime >= currentDuration - 5 || (progress.currentTime / currentDuration) >= 0.95
}

/**
 * Get resume time for an episode
 */
export function getResumeTime(episodeId: number, duration: number): number {
  const progress = getEpisodeProgress(episodeId)
  if (!progress) return 0
  
  // If episode is completed, don't resume
  if (isEpisodeCompleted(progress, duration)) {
    clearEpisodeProgress(episodeId)
    return 0
  }
  
  return progress.currentTime
}

