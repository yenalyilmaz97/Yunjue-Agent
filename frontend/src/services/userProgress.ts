import { api, API_CONFIG } from '@/lib/axios'

const USER_PROGRESS_ENDPOINT = API_CONFIG.ENDPOINTS.USER_PROGRESS

export interface UserProgressResponseDTO {
  userProgressId: number
  userId: number
  weekId?: number | null
  articleId?: number | null
  episodeId?: number | null
  isCompleted: boolean
  completeTime: string
  weeklyContent?: unknown
  article?: unknown
  podcastEpisode?: unknown
}

export interface CreateUserProgressRequest {
  userId: number
  weekId?: number | null
  articleId?: number | null
  episodeId?: number | null
  isCompleted: boolean
}

export interface UpdateUserProgressRequest {
  userProgressId: number
  isCompleted: boolean
}

export const userProgressService = {
  async getAllUserProgressByUserId(userId: number): Promise<UserProgressResponseDTO[]> {
    return api.get<UserProgressResponseDTO[]>(`${USER_PROGRESS_ENDPOINT}/user/${userId}`)
  },
  async getUserProgressByUserIdAndWeekId(userId: number, weekId: number): Promise<UserProgressResponseDTO | null> {
    try {
      return await api.get<UserProgressResponseDTO>(`${USER_PROGRESS_ENDPOINT}/user/${userId}/week/${weekId}`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },
  async createOrUpdateUserProgress(request: CreateUserProgressRequest): Promise<UserProgressResponseDTO> {
    return api.post<UserProgressResponseDTO>(`${USER_PROGRESS_ENDPOINT}/progress`, request)
  },
  async updateUserProgress(request: UpdateUserProgressRequest): Promise<UserProgressResponseDTO> {
    return api.put<UserProgressResponseDTO>(`${USER_PROGRESS_ENDPOINT}/progress`, request)
  },
  async deleteUserProgress(userProgressId: number): Promise<UserProgressResponseDTO> {
    return api.delete<UserProgressResponseDTO>(`${USER_PROGRESS_ENDPOINT}/progress/${userProgressId}`)
  },
}

export default userProgressService

