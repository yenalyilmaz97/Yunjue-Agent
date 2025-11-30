import { api, API_CONFIG } from '@/lib/axios'

const WEEKLY_QUESTION_ANSWER_ENDPOINT = API_CONFIG.ENDPOINTS.WEEKLY_QUESTION_ANSWER

export interface WeeklyQuestionResponseDTO {
  weeklyQuestionId: number
  weeklyQuestionText: string
  order: number
}

export interface WeeklyQuestionAnswerResponseDTO {
  weeklyQuestionAnswerId: number
  userId: number
  weeklyQuestionId: number
  weeklyQuestionAnswerText: string | null
  user?: unknown
  weeklyQuestion?: WeeklyQuestionResponseDTO
}

export interface AnswerWeeklyQuestionRequest {
  userId: number
  weeklyQuestionId: number
  weeklyQuestionAnswerText: string
}

export interface UpdateWeeklyQuestionAnswerRequest {
  weeklyQuestionAnswerId: number
  weeklyQuestionAnswerText: string
}

export const weeklyQuestionAnswerService = {
  async getAllWeeklyQuestionAnswers(): Promise<WeeklyQuestionAnswerResponseDTO[]> {
    return api.get<WeeklyQuestionAnswerResponseDTO[]>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers`)
  },
  async getWeeklyQuestionAnswerById(weeklyQuestionAnswerId: number): Promise<WeeklyQuestionAnswerResponseDTO> {
    return api.get<WeeklyQuestionAnswerResponseDTO>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers/${weeklyQuestionAnswerId}`)
  },
  async getWeeklyQuestionAnswersByUser(userId: number): Promise<WeeklyQuestionAnswerResponseDTO[]> {
    return api.get<WeeklyQuestionAnswerResponseDTO[]>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers/user/${userId}`)
  },
  async getWeeklyQuestionAnswersByQuestion(weeklyQuestionId: number): Promise<WeeklyQuestionAnswerResponseDTO[]> {
    return api.get<WeeklyQuestionAnswerResponseDTO[]>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers/question/${weeklyQuestionId}`)
  },
  async getWeeklyQuestionAnswerByUserAndQuestion(userId: number, weeklyQuestionId: number): Promise<WeeklyQuestionAnswerResponseDTO> {
    return api.get<WeeklyQuestionAnswerResponseDTO>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers/user/${userId}/question/${weeklyQuestionId}`)
  },
  async createWeeklyQuestionAnswer(data: AnswerWeeklyQuestionRequest): Promise<WeeklyQuestionAnswerResponseDTO> {
    return api.post<WeeklyQuestionAnswerResponseDTO>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers`, data)
  },
  async updateWeeklyQuestionAnswer(data: UpdateWeeklyQuestionAnswerRequest): Promise<WeeklyQuestionAnswerResponseDTO> {
    return api.put<WeeklyQuestionAnswerResponseDTO>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers`, data)
  },
  async deleteWeeklyQuestionAnswer(weeklyQuestionAnswerId: number): Promise<WeeklyQuestionAnswerResponseDTO> {
    return api.delete<WeeklyQuestionAnswerResponseDTO>(`${WEEKLY_QUESTION_ANSWER_ENDPOINT}/weekly-question-answers/${weeklyQuestionAnswerId}`)
  },
}

export default weeklyQuestionAnswerService

