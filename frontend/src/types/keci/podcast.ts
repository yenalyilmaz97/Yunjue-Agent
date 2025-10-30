export interface PodcastSeries {
  seriesId: number
  title: string
  description: string
  createdAt: string
  updatedAt: string
  isVideo?: boolean
  isActive?: boolean
  episodes?: PodcastEpisode[]
}

export interface PodcastEpisode {
  episodesId: number
  seriesId: number
  title: string
  description?: string
  audioLink: string
  sequenceNumber: number
  isActive: boolean
  isVideo?: boolean
  duration?: number
  createdAt: string
  updatedAt: string
  seriesTitle?: string
  podcastSeries?: PodcastSeries
}

export interface CreatePodcastSeriesRequest {
  title: string
  description: string
  isVideo: boolean
}

export interface EditPodcastSeriesRequest {
  seriesId: number
  title: string
  description: string
  isVideo: boolean
}

export interface CreatePodcastEpisodeRequest {
  seriesId: number
  title: string
  description?: string
  audioLink: string
  isVideo?: boolean
  isActive: boolean
}

export interface EditPodcastEpisodeRequest {
  episodeId: number
  seriesId: number
  title: string
  description?: string
  audioLink: string
  sequenceNumber: number
  isActive: boolean
  isVideo?: boolean
}

export interface AddToFavoritesRequest {
  userId: number
  episodeId: number
}

export interface RemoveFromFavoritesRequest {
  userId: number
  episodeId: number
}

export interface Note {
  noteId: number
  userId: number
  episodeId: number
  title?: string
  noteText: string
  createdAt: string
  updatedAt: string
  userName: string
  episodeTitle: string
  seriesTitle: string
}

export interface Favorite {
  favoriteId: number
  userId: number
  episodeId: number
  createdAt: string
  userName: string
  episodeTitle: string
  seriesTitle: string
}

export interface Question {
  questionId: number
  userId: number
  episodeId: number
  questionText: string
  isAnswered: boolean
  createdAt: string
  updatedAt: string
  userName: string
  episodeTitle: string
  seriesTitle: string
  answers?: Answer[]
  answer?: Answer
}

export interface Answer {
  answerId: number
  questionId: number
  userId: number
  answerText: string
  createdAt: string
  updatedAt: string
  userName: string
  questionText: string
}

export interface SeriesFormData {
  title: string
  description: string
}

export interface EpisodeFormData {
  seriesId?: number
  title: string
  description: string
  audioIdentifier: string
  sequenceNumber: number
  durationInSeconds: number
  isActive: boolean
}

export interface SeriesFilter {
  search?: string
  status?: 'active' | 'inactive' | 'all'
}

export interface EpisodeFilter {
  search?: string
  seriesId?: number
  status?: 'active' | 'inactive' | 'all'
}


