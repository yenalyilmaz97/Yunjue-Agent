import { api, API_CONFIG } from '@/lib/axios'
import type { Favorite } from '@/types/keci'

const FAVORITES_ENDPOINT = API_CONFIG.ENDPOINTS.FAVORITES

const FAVORITES_ENDPOINTS = {
  CREATE: `${FAVORITES_ENDPOINT}/favorites`,
  DELETE: `${FAVORITES_ENDPOINT}/favorites`,
  BY_USER: (userId: number) => `${FAVORITES_ENDPOINT}/favorites/${userId}`,
} as const

export interface AddToFavoritesRequest {
  userId: number
  favoriteType: number // 1=Episode, 2=Article, 3=Affirmation, 4=Aphorism
  episodeId?: number | null
  articleId?: number | null
  affirmationId?: number | null
  aphorismId?: number | null
}

export interface RemoveFromFavoritesRequest {
  userId: number
  favoriteType: number
  episodeId?: number | null
  articleId?: number | null
  affirmationId?: number | null
  aphorismId?: number | null
}

export const favoritesService = {
  async addFavorite(favoriteData: AddToFavoritesRequest): Promise<Favorite> {
    return await api.post<Favorite>(FAVORITES_ENDPOINTS.CREATE, favoriteData)
  },
  async removeFavorite(request: RemoveFromFavoritesRequest): Promise<Favorite> {
    return await api.delete<Favorite>(FAVORITES_ENDPOINTS.DELETE, { data: request })
  },
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await api.get<Favorite[]>(FAVORITES_ENDPOINTS.BY_USER(userId))
  },
  async isFavorited(userId: number, episodeId: number): Promise<boolean> {
    try {
      const userFavorites = await this.getFavoritesByUser(userId)
      return userFavorites.some((fav) => fav.episodeId === episodeId)
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  },
}

export default favoritesService


