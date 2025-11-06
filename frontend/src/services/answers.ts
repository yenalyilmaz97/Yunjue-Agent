import { api, API_CONFIG } from '@/lib/axios'
import type { Answer } from '@/types/keci'

const ANSWERS_ENDPOINT = API_CONFIG.ENDPOINTS.ANSWERS

const ANSWERS_ENDPOINTS = {
  LIST: `${ANSWERS_ENDPOINT}/answers`,
  CREATE: `${ANSWERS_ENDPOINT}/answers`,
  UPDATE: `${ANSWERS_ENDPOINT}/answers`,
  DELETE: `${ANSWERS_ENDPOINT}/answers`,
  BY_QUESTION: (questionId: number) => `${ANSWERS_ENDPOINT}/answers/question/${questionId}`,
} as const

export interface AnswerQuestionRequest {
  userId: number
  questionId: number
  answer: string
}

export interface EditAnswerRequest {
  userId: number
  answerId: number
  answer: string
}

export interface DeleteAnswerRequest {
  userId: number
  answerId: number
}

export const answersService = {
  async getAnswers(): Promise<Answer[]> {
    return await api.get<Answer[]>(ANSWERS_ENDPOINTS.LIST)
  },
  async createAnswer(answerData: AnswerQuestionRequest): Promise<Answer> {
    return await api.post<Answer>(ANSWERS_ENDPOINTS.CREATE, answerData)
  },
  async updateAnswer(answerData: EditAnswerRequest): Promise<Answer> {
    return await api.put<Answer>(ANSWERS_ENDPOINTS.UPDATE, answerData)
  },
  async deleteAnswer(request: DeleteAnswerRequest): Promise<Answer> {
    return await api.delete<Answer>(ANSWERS_ENDPOINTS.DELETE, { data: request })
  },
  async getAnswerByQuestion(questionId: number): Promise<Answer> {
    return await api.get<Answer>(ANSWERS_ENDPOINTS.BY_QUESTION(questionId))
  },
}

export default answersService


