import { api } from '@/lib/axios'
import type { Answer } from '@/types/keci'

const ANSWERS_ENDPOINTS = {
  LIST: '/Podcast/answers',
  CREATE: '/Podcast/answers',
  GET: (id: string) => `/Podcast/answers/${id}`,
  UPDATE: (id: string) => `/Podcast/answers/${id}`,
  DELETE: (id: string) => `/Podcast/answers/${id}`,
  BY_USER: (userId: string) => `/Podcast/answers/user/${userId}`,
  BY_QUESTION: (questionId: string) => `/Podcast/answers/question/${questionId}`,
} as const

export const answersService = {
  async getAnswers(): Promise<Answer[]> {
    return await api.get<Answer[]>(ANSWERS_ENDPOINTS.LIST)
  },
  async getAnswerById(id: number): Promise<Answer> {
    return await api.get<Answer>(ANSWERS_ENDPOINTS.GET(id.toString()))
  },
  async createAnswer(answerData: Omit<Answer, 'answerId' | 'createdAt' | 'updatedAt'>): Promise<Answer> {
    return await api.post<Answer>(ANSWERS_ENDPOINTS.CREATE, answerData)
  },
  async updateAnswer(id: number, answerData: Partial<Answer>): Promise<Answer> {
    return await api.put<Answer>(ANSWERS_ENDPOINTS.UPDATE(id.toString()), answerData)
  },
  async deleteAnswer(id: number): Promise<void> {
    return await api.delete(ANSWERS_ENDPOINTS.DELETE(id.toString()))
  },
  async getAnswersByUser(userId: number): Promise<Answer[]> {
    return await api.get<Answer[]>(ANSWERS_ENDPOINTS.BY_USER(userId.toString()))
  },
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    return await api.get<Answer[]>(ANSWERS_ENDPOINTS.BY_QUESTION(questionId.toString()))
  },
}

export default answersService


