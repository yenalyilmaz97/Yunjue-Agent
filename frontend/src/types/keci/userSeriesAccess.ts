import type { User } from './user'
import type { PodcastSeries } from './podcast'
import type { Article } from './content'

export interface UserSeriesAccess {
  userSeriesAccessId: number
  userId: number
  seriesId?: number | null
  articleId?: number | null
  currentAccessibleSequence: number
  updatedAt: string
  user?: User
  podcastSeries?: PodcastSeries
  article?: Article
}

export interface CreateUserSeriesAccess {
  userId: number
  seriesId?: number | null
  articleId?: number | null
  currentAccessibleSequence: number
}

export interface UpdateUserSeriesAccess {
  currentAccessibleSequence: number
}

export interface GrantAccessRequest {
  userId: number
  seriesId: number
  articleId?: number | null
}

export interface RevokeAccessRequest {
  userId: number
  seriesId?: number | null
  articleId?: number | null
}

export interface UserSeriesAccessFilter {
  search?: string
  userId?: number
  seriesId?: number
  hasAccess?: boolean
}

export interface UserSeriesAccessFormData {
  userId: number
  seriesId: number
  currentAccessibleSequence: number
  nextUnlockDate: string
  currentPositionInSeconds: number
}


