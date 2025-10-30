import { api } from '@/lib/axios'
import type { Question } from '@/types/keci'

const QUESTIONS_ENDPOINTS = {
  LIST: '/Podcast/questions',
  CREATE: '/Podcast/questions',
  GET: (id: string) => `/Podcast/questions/${id}`,
  UPDATE: (id: string) => `/Podcast/questions/${id}`,
  DELETE: (id: string) => `/Podcast/questions/${id}`,
  BY_USER: (userId: string) => `/Podcast/questions/user/${userId}`,
  BY_EPISODE: (episodeId: string) => `/Podcast/questions/episode/${episodeId}`,
  BY_USER_AND_EPISODE: (userId: string, episodeId: string) => `/Podcast/questions/user/${userId}/episode/${episodeId}`,
} as const

export const questionsService = {
  async getQuestions(): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.LIST)
  },
  async getQuestionById(id: number): Promise<Question> {
    return await api.get<Question>(QUESTIONS_ENDPOINTS.GET(id.toString()))
  },
  async createQuestion(questionData: { userId: number; episodeId: number; question: string }): Promise<Question> {
    return await api.post<Question>(QUESTIONS_ENDPOINTS.CREATE, { userId: questionData.userId, episodeId: questionData.episodeId, Question: questionData.question })
  },
  async updateQuestion(id: number, questionData: Partial<Question>): Promise<Question> {
    return await api.put<Question>(QUESTIONS_ENDPOINTS.UPDATE(id.toString()), questionData)
  },
  async updateQuestionByUserAndEpisode(questionData: { userId: number; episodeId: number; question: string }): Promise<Question> {
    return await api.put<Question>(QUESTIONS_ENDPOINTS.LIST, { userId: questionData.userId, episodeId: questionData.episodeId, Question: questionData.question })
  },
  async deleteQuestion(id: number): Promise<void> {
    return await api.delete(QUESTIONS_ENDPOINTS.DELETE(id.toString()))
  },
  async getQuestionsByUser(userId: number): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.BY_USER(userId.toString()))
  },
  async getQuestionsByEpisode(episodeId: number): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.BY_EPISODE(episodeId.toString()))
  },
  async getQuestionByUserAndEpisode(userId: number, episodeId: number): Promise<Question | null> {
    try {
      return await api.get<Question>(QUESTIONS_ENDPOINTS.BY_USER_AND_EPISODE(userId.toString(), episodeId.toString()))
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
}

export default questionsService


