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

const PODCAST_ENDPOINT = API_CONFIG.ENDPOINTS.PODCASTS

export const podcastService = {
  async getAllSeries(): Promise<PodcastSeries[]> {
    return api.get<PodcastSeries[]>(`${PODCAST_ENDPOINT}/series`)
  },
  async getAllPodcastSeries(): Promise<PodcastSeries[]> {
    return this.getAllSeries()
  },
  async getSeriesById(id: number): Promise<PodcastSeries> {
    return api.get<PodcastSeries>(`${PODCAST_ENDPOINT}/series/${id}`)
  },
  async createSeries(seriesData: CreatePodcastSeriesRequest): Promise<PodcastSeries> {
    return api.post<PodcastSeries>(`${PODCAST_ENDPOINT}/series`, seriesData)
  },
  async updateSeries(id: number, seriesData: Omit<EditPodcastSeriesRequest, 'seriesId'>): Promise<PodcastSeries> {
    const updateData: EditPodcastSeriesRequest = { seriesId: id, ...seriesData }
    return api.put<PodcastSeries>(`${PODCAST_ENDPOINT}/series`, updateData)
  },
  async deleteSeries(id: number): Promise<boolean> {
    await api.delete(`${PODCAST_ENDPOINT}/series/${id}`)
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
    return api.get<PodcastEpisode[]>(`${PODCAST_ENDPOINT}/series/${seriesId}/episodes`)
  },
  async getEpisodeById(id: number): Promise<PodcastEpisode> {
    const allEpisodes = await this.getAllEpisodes()
    const episode = allEpisodes.find((e) => e.episodesId === id)
    if (!episode) throw new Error('Episode not found')
    return episode
  },
  async createEpisode(episodeData: CreatePodcastEpisodeRequest): Promise<PodcastEpisode> {
    return api.post<PodcastEpisode>(`${PODCAST_ENDPOINT}/episodes`, episodeData)
  },
  async updateEpisode(id: number, episodeData: Omit<EditPodcastEpisodeRequest, 'episodeId'>): Promise<PodcastEpisode> {
    const updateData: EditPodcastEpisodeRequest = { episodeId: id, ...episodeData }
    return api.put<PodcastEpisode>(`${PODCAST_ENDPOINT}/episodes`, updateData)
  },
  async deleteEpisode(id: number): Promise<boolean> {
    await api.delete(`${PODCAST_ENDPOINT}/episodes/${id}`)
    return true
  },
  async deletePodcastEpisode(id: number): Promise<boolean> {
    return this.deleteEpisode(id)
  },
  async deletePodcastSeries(id: number): Promise<boolean> {
    return this.deleteSeries(id)
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
  getAudioFileUrl(episodeId: number): string {
    return `${API_CONFIG.BASE_URL}${PODCAST_ENDPOINT}/audio/${episodeId}`
  },
  async downloadAudioFile(episodeId: number): Promise<{ message: string; episodeId: number }> {
    return api.post<{ message: string; episodeId: number }>(`${PODCAST_ENDPOINT}/audio/${episodeId}/download`)
  },
  async getAudioFileStatus(episodeId: number): Promise<unknown> {
    return api.get(`${PODCAST_ENDPOINT}/audio/${episodeId}/status`)
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
        (e: PodcastEpisode) => e.title.toLowerCase().includes(searchTerm) || (e.description && e.description.toLowerCase().includes(searchTerm)) || e.audioLink.toLowerCase().includes(searchTerm),
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


