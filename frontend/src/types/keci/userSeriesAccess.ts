import type { User } from './user'
import type { PodcastSeries } from './podcast'

export interface UserSeriesAccess {
  userSeriesAccessId: number
  userId: number
  seriesId: number
  currentAccessibleSequence: number
  nextUnlockDate: string
  currentPositionInSeconds: number
  updatedAt: string
  user?: User
  podcastSeries?: PodcastSeries
}

export interface CreateUserSeriesAccess {
  userId: number
  seriesId: number
  currentAccessibleSequence: number
  nextUnlockDate: string
  currentPositionInSeconds: number
}

export interface UpdateUserSeriesAccess {
  currentAccessibleSequence?: number
  nextUnlockDate?: string
  currentPositionInSeconds?: number
}

export interface GrantAccessRequest {
  userId: number
  seriesId: number
}

export interface RevokeAccessRequest {
  userId: number
  seriesId: number
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


