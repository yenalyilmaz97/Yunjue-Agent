import { api, API_CONFIG } from '@/lib/axios'
import type { Question } from '@/types/keci'

const QUESTIONS_ENDPOINT = API_CONFIG.ENDPOINTS.QUESTIONS

const QUESTIONS_ENDPOINTS = {
  LIST: `${QUESTIONS_ENDPOINT}/questions`,
  CREATE: `${QUESTIONS_ENDPOINT}/questions`,
  UPDATE: `${QUESTIONS_ENDPOINT}/questions`,
  UPDATE_BY_ID: (questionId: number) => `${QUESTIONS_ENDPOINT}/questions/${questionId}`,
  BY_USER: (userId: number) => `${QUESTIONS_ENDPOINT}/questions/user/${userId}`,
  BY_EPISODE: (episodeId: number) => `${QUESTIONS_ENDPOINT}/questions/episode/${episodeId}`,
  BY_USER_AND_EPISODE: (userId: number, episodeId: number) => `${QUESTIONS_ENDPOINT}/questions/user/${userId}/episode/${episodeId}`,
  BY_ARTICLE: (articleId: number) => `${QUESTIONS_ENDPOINT}/questions/article/${articleId}`,
  BY_USER_AND_ARTICLE: (userId: number, articleId: number) => `${QUESTIONS_ENDPOINT}/questions/user/${userId}/article/${articleId}`,
} as const

export interface AddQuestionRequest {
  userId: number
  episodeId?: number | null
  articleId?: number | null
  questionText: string
}

export interface EditQuestionRequest {
  userId: number
  episodeId: number
  questionText: string
}

export interface UpdateQuestionRequest {
  questionId: number
  questionText?: string | null
  isAnswered?: boolean | null
}

export const questionsService = {
  async getQuestions(): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.LIST)
  },
  async createQuestion(questionData: AddQuestionRequest): Promise<Question> {
    return await api.post<Question>(QUESTIONS_ENDPOINTS.CREATE, questionData)
  },
  async updateQuestion(questionData: EditQuestionRequest): Promise<Question> {
    return await api.put<Question>(QUESTIONS_ENDPOINTS.UPDATE, questionData)
  },
  async updateQuestionById(questionId: number, questionData: UpdateQuestionRequest): Promise<Question> {
    return await api.put<Question>(QUESTIONS_ENDPOINTS.UPDATE_BY_ID(questionId), questionData)
  },
  async getQuestionsByUser(userId: number): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.BY_USER(userId))
  },
  async getQuestionsByEpisode(episodeId: number): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.BY_EPISODE(episodeId))
  },
  async getQuestionByUserAndEpisode(userId: number, episodeId: number): Promise<Question | null> {
    try {
      return await api.get<Question>(QUESTIONS_ENDPOINTS.BY_USER_AND_EPISODE(userId, episodeId))
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
  async getQuestionsByArticle(articleId: number): Promise<Question[]> {
    return await api.get<Question[]>(QUESTIONS_ENDPOINTS.BY_ARTICLE(articleId))
  },
  async getQuestionByUserAndArticle(userId: number, articleId: number): Promise<Question | null> {
    try {
      return await api.get<Question>(QUESTIONS_ENDPOINTS.BY_USER_AND_ARTICLE(userId, articleId))
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
}

export default questionsService


