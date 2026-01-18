import { api, API_CONFIG } from '@/lib/axios'

const DAILY_CONTENT_ENDPOINT = API_CONFIG.ENDPOINTS.DAILY_CONTENT

export interface DailyContentResponseDTO {
  dailyContentId: number
  dayOrder: number
  affirmationId: number
  aporismId: number
  affirmation?: {
    affirmationId: number
    affirmationText: string | null
    order: number
  }
  aphorism?: {
    aphorismId: number
    aphorismText: string | null
    order: number
  }
}

export interface CreateDailyContentRequest {
  dayOrder: number
  affirmationId: number
  aporismId: number
}

export interface UpdateDailyContentRequest {
  dailyContentId: number
  dayOrder: number
  affirmationId: number
  aporismId: number
}

export const dailyContentService = {
  async getAllDailyContent(): Promise<DailyContentResponseDTO[]> {
    return api.get<DailyContentResponseDTO[]>(`${DAILY_CONTENT_ENDPOINT}/daily-content`)
  },
  async getDailyContentById(dailyContentId: number): Promise<DailyContentResponseDTO> {
    return api.get<DailyContentResponseDTO>(`${DAILY_CONTENT_ENDPOINT}/daily-content/${dailyContentId}`)
  },
  async getDailyContentByUser(userId: number): Promise<DailyContentResponseDTO> {
    return api.get<DailyContentResponseDTO>(`${DAILY_CONTENT_ENDPOINT}/daily-content/user/${userId}`)
  },
  async getDailyContentHistory(userId: number): Promise<DailyContentResponseDTO[]> {
    return api.get<DailyContentResponseDTO[]>(`${DAILY_CONTENT_ENDPOINT}/daily-content/user/${userId}/history`)
  },
  async createDailyContent(data: CreateDailyContentRequest): Promise<DailyContentResponseDTO> {
    return api.post<DailyContentResponseDTO>(`${DAILY_CONTENT_ENDPOINT}/daily-content`, data)
  },
  async updateDailyContent(data: UpdateDailyContentRequest): Promise<DailyContentResponseDTO> {
    return api.put<DailyContentResponseDTO>(`${DAILY_CONTENT_ENDPOINT}/daily-content`, data)
  },
  async deleteDailyContent(dailyContentId: number): Promise<DailyContentResponseDTO> {
    return api.delete<DailyContentResponseDTO>(`${DAILY_CONTENT_ENDPOINT}/daily-content/${dailyContentId}`)
  },
  async incrementDailyContentForAllUsers(): Promise<{ updatedCount: number; message: string }> {
    return api.post<{ updatedCount: number; message: string }>(`${DAILY_CONTENT_ENDPOINT}/increment-daily-content`)
  },
}

export default dailyContentService

