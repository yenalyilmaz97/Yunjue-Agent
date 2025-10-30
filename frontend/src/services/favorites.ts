import { api } from '@/lib/axios'
import type { Favorite } from '@/types/keci'

const FAVORITES_ENDPOINTS = {
  LIST: '/Podcast/favorites',
  CREATE: '/Podcast/favorites',
  GET: (id: string) => `/Podcast/favorites/${id}`,
  DELETE: () => `/Podcast/favorites`,
  BY_USER: (userId: string) => `/Podcast/favorites/${userId}`,
  BY_EPISODE: (episodeId: string) => `/Podcast/favorites/episode/${episodeId}`,
} as const

export interface CreateFavoriteData {
  userId: number
  episodeId: number
}

export const favoritesService = {
  async getFavorites(): Promise<Favorite[]> {
    return await api.get<Favorite[]>(FAVORITES_ENDPOINTS.LIST)
  },
  async getFavoriteById(id: number): Promise<Favorite> {
    return await api.get<Favorite>(FAVORITES_ENDPOINTS.GET(id.toString()))
  },
  async addFavorite(favoriteData: CreateFavoriteData): Promise<Favorite> {
    return await api.post<Favorite>(FAVORITES_ENDPOINTS.CREATE, favoriteData)
  },
  async removeFavorite(request: { userId: number; episodeId: number }): Promise<void> {
    return await api.delete(FAVORITES_ENDPOINTS.DELETE(), { data: request })
  },
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await api.get<Favorite[]>(FAVORITES_ENDPOINTS.BY_USER(userId.toString()))
  },
  async getFavoritesByEpisode(episodeId: number): Promise<Favorite[]> {
    return await api.get<Favorite[]>(FAVORITES_ENDPOINTS.BY_EPISODE(episodeId.toString()))
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


