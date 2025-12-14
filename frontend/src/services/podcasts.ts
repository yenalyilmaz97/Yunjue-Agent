import { api, API_CONFIG } from '@/lib/axios'
import type {
  PodcastSeries,
  PodcastEpisode,
  CreatePodcastSeriesRequest,
  EditPodcastSeriesRequest,
  CreatePodcastEpisodeRequest,
  EditPodcastEpisodeRequest,
  SeriesFilter,
  EpisodeFilter,
} from '@/types/keci'

const SERIES_ENDPOINT = API_CONFIG.ENDPOINTS.SERIES
const EPISODES_ENDPOINT = API_CONFIG.ENDPOINTS.EPISODES

export const podcastService = {
  async getAllSeries(): Promise<PodcastSeries[]> {
    return api.get<PodcastSeries[]>(`${SERIES_ENDPOINT}/series`)
  },
  async getAllPodcastSeries(): Promise<PodcastSeries[]> {
    return this.getAllSeries()
  },
  async getSeriesById(id: number): Promise<PodcastSeries> {
    return api.get<PodcastSeries>(`${SERIES_ENDPOINT}/series/${id}`)
  },
  async createSeries(seriesData: CreatePodcastSeriesRequest): Promise<PodcastSeries> {
    return api.post<PodcastSeries>(`${SERIES_ENDPOINT}/series`, seriesData)
  },
  async updateSeries(id: number, seriesData: Omit<EditPodcastSeriesRequest, 'seriesId'>): Promise<PodcastSeries> {
    const updateData: EditPodcastSeriesRequest = { seriesId: id, ...seriesData }
    return api.put<PodcastSeries>(`${SERIES_ENDPOINT}/series`, updateData)
  },
  async deleteSeries(id: number): Promise<boolean> {
    await api.delete(`${SERIES_ENDPOINT}/series/${id}`)
    return true
  },
  async getAllEpisodes(): Promise<PodcastEpisode[]> {
    const series = await this.getAllSeries()
    const allEpisodes: PodcastEpisode[] = []
    for (const s of series) {
      if (s.episodes) allEpisodes.push(...s.episodes)
    }
    return allEpisodes
  },
  async getAllPodcastEpisodes(): Promise<PodcastEpisode[]> {
    return this.getAllEpisodes()
  },
  async getEpisodesBySeries(seriesId: number): Promise<PodcastEpisode[]> {
    return api.get<PodcastEpisode[]>(`${EPISODES_ENDPOINT}/series/${seriesId}/episodes`)
  },
  async getEpisodeById(id: number): Promise<PodcastEpisode> {
    return api.get<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes/${id}`)
  },
  async createEpisode(episodeData: CreatePodcastEpisodeRequest): Promise<PodcastEpisode> {
    return api.post<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes`, episodeData)
  },

  async createEpisodeWithFiles(formData: FormData, onProgress?: (progress: number) => void): Promise<PodcastEpisode> {
    // Content-Type will be automatically set by axios interceptor for FormData
    if (onProgress) {
      return api.postWithProgress<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes`, formData, onProgress, {
        timeout: 600000, // 10 minutes for large file uploads (2GB)
      })
    }
    return api.post<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes`, formData, {
      timeout: 600000, // 10 minutes for large file uploads (2GB)
    })
  },
  async updateEpisode(id: number, episodeData: Omit<EditPodcastEpisodeRequest, 'episodeId'>): Promise<PodcastEpisode> {
    const updateData: EditPodcastEpisodeRequest = { episodeId: id, ...episodeData }
    return api.put<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes`, updateData)
  },
  async updateEpisodeWithFiles(formData: FormData, onProgress?: (progress: number) => void): Promise<PodcastEpisode> {
    // Content-Type will be automatically set by axios interceptor for FormData
    if (onProgress) {
      return api.putWithProgress<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes/with-files`, formData, onProgress, {
        timeout: 600000, // 10 minutes for large file uploads (2GB)
      })
    }
    return api.put<PodcastEpisode>(`${EPISODES_ENDPOINT}/episodes/with-files`, formData, {
      timeout: 600000, // 10 minutes for large file uploads (2GB)
    })
  },
  async deleteEpisode(id: number): Promise<boolean> {
    await api.delete(`${EPISODES_ENDPOINT}/episodes/${id}`)
    return true
  },
  async deletePodcastEpisode(id: number): Promise<boolean> {
    return this.deleteEpisode(id)
  },
  async deletePodcastSeries(id: number): Promise<boolean> {
    return this.deleteSeries(id)
  },
  async getEligibleEpisodes(userId: number): Promise<PodcastEpisode[]> {
    return api.get<PodcastEpisode[]>(`${EPISODES_ENDPOINT}/episodes/eligible/${userId}`)
  },
  async getLastSequenceForSeries(userId: number, seriesId: number): Promise<number> {
    return api.get<number>(`${SERIES_ENDPOINT}/series/${seriesId}/user/${userId}/last-sequence`)
  },
  async getPodcastSeriesStats() {
    const series = await this.getAllSeries()
    const totalSeries = series.length
    const activeSeries = series.length
    const totalEpisodes = series.reduce((sum, s) => sum + (s.episodes?.length || 0), 0)
    const averageEpisodesPerSeries = totalSeries > 0 ? totalEpisodes / totalSeries : 0
    return { totalSeries, activeSeries, totalEpisodes, averageEpisodesPerSeries }
  },
  async getPodcastEpisodeStats() {
    const episodes = await this.getAllEpisodes()
    const totalEpisodes = episodes.length
    const activeEpisodes = episodes.filter((e) => e.isActive).length
    const totalDuration = 0
    const averageDuration = totalEpisodes > 0 ? totalDuration / totalEpisodes : 0
    return { totalEpisodes, activeEpisodes, totalDuration, averageDuration }
  },
  async getFilteredPodcastSeries(filter: SeriesFilter): Promise<PodcastSeries[]> {
    let series = await this.getAllSeries()
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      series = series.filter((s) => s.title.toLowerCase().includes(searchLower) || s.description.toLowerCase().includes(searchLower))
    }
    return series
  },
  async getFilteredPodcastEpisodes(filter: EpisodeFilter): Promise<PodcastEpisode[]> {
    let episodes = await this.getAllEpisodes()
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      episodes = episodes.filter((e) => e.title.toLowerCase().includes(searchLower) || (e.description || '').toLowerCase().includes(searchLower))
    }
    if (filter.status && filter.status !== 'all') {
      episodes = episodes.filter((e) => (filter.status === 'active' ? e.isActive : !e.isActive))
    }
    if (filter.seriesId) {
      episodes = episodes.filter((e) => e.seriesId === filter.seriesId)
    }
    return episodes
  },
  getAudioFileUrl(fileId: string): string {
    return `${API_CONFIG.BASE_URL}/UserSeriesAccess/audio/${fileId}`
  },
  async downloadAudioFile(request: { googleDriveUrl?: string }): Promise<void> {
    return api.post<void>(`${API_CONFIG.ENDPOINTS.USER_SERIES_ACCESS}/download-audio`, request)
  },
  async getFilteredSeries(filter: SeriesFilter = {}): Promise<PodcastSeries[]> {
    let series = await this.getAllSeries()
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      series = series.filter((s) => s.title.toLowerCase().includes(searchTerm) || s.description.toLowerCase().includes(searchTerm))
    }
    if (filter.status && filter.status !== 'all') {
      if (filter.status === 'active') {
        series = series.filter((s) => s.episodes && s.episodes.some((e: PodcastEpisode) => e.isActive))
      } else if (filter.status === 'inactive') {
        series = series.filter((s) => !s.episodes || !s.episodes.some((e: PodcastEpisode) => e.isActive))
      }
    }
    return series
  },
  async getFilteredEpisodes(filter: EpisodeFilter = {}): Promise<PodcastEpisode[]> {
    let episodes = filter.seriesId ? await this.getEpisodesBySeries(filter.seriesId) : await this.getAllEpisodes()
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      episodes = episodes.filter(
        (e: PodcastEpisode) => e.title.toLowerCase().includes(searchTerm) || (e.description && e.description.toLowerCase().includes(searchTerm)) || (e.content?.audio && e.content.audio.toLowerCase().includes(searchTerm)),
      )
    }
    if (filter.status && filter.status !== 'all') {
      episodes = episodes.filter((e: PodcastEpisode) => (filter.status === 'active' ? e.isActive : !e.isActive))
    }
    return episodes
  },
  async getPodcastStats(): Promise<{ totalSeries: number; activeSeries: number; totalEpisodes: number; activeEpisodes: number; totalDuration: number }> {
    const [series, episodes] = await Promise.all([this.getAllSeries(), this.getAllEpisodes()])
    const activeSeries = series.filter((s) => s.episodes && s.episodes.some((e: PodcastEpisode) => e.isActive)).length
    const activeEpisodes = episodes.filter((e: PodcastEpisode) => e.isActive).length
    const totalDuration = 0
    return { totalSeries: series.length, activeSeries, totalEpisodes: episodes.length, activeEpisodes, totalDuration }
  },
}

export default podcastService


