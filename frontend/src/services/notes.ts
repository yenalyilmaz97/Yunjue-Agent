import { api, API_CONFIG } from '@/lib/axios'
import type { Note } from '@/types/keci'

const NOTES_ENDPOINT = API_CONFIG.ENDPOINTS.NOTES

const NOTES_ENDPOINTS = {
  LIST: `${NOTES_ENDPOINT}/notes`,
  CREATE: `${NOTES_ENDPOINT}/notes`,
  UPDATE: `${NOTES_ENDPOINT}/notes`,
  DELETE: `${NOTES_ENDPOINT}/notes`,
  BY_USER: (userId: number) => `${NOTES_ENDPOINT}/notes/user/${userId}`,
  BY_EPISODE: (episodeId: number) => `${NOTES_ENDPOINT}/notes/episode/${episodeId}`,
  BY_USER_AND_EPISODE: (userId: number, episodeId: number) => `${NOTES_ENDPOINT}/notes/user/${userId}/episode/${episodeId}`,
  BY_ARTICLE: (articleId: number) => `${NOTES_ENDPOINT}/notes/article/${articleId}`,
  BY_USER_AND_ARTICLE: (userId: number, articleId: number) => `${NOTES_ENDPOINT}/notes/user/${userId}/article/${articleId}`,
} as const

export interface AddNoteRequest {
  userId: number
  episodeId?: number | null
  articleId?: number | null
  title: string
  noteText: string
}

export interface EditNoteRequest {
  userId: number
  episodeId?: number | null
  articleId?: number | null
  title: string
  noteText: string
}

export interface DeleteNoteRequest {
  userId: number
  episodeId: number
}

export const notesService = {
  async getNotes(): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.LIST)
  },
  async createNote(noteData: AddNoteRequest): Promise<Note> {
    return await api.post<Note>(NOTES_ENDPOINTS.CREATE, noteData)
  },
  async updateNote(noteData: EditNoteRequest): Promise<Note> {
    return await api.put<Note>(NOTES_ENDPOINTS.UPDATE, noteData)
  },
  async deleteNote(request: DeleteNoteRequest): Promise<Note> {
    return await api.delete<Note>(NOTES_ENDPOINTS.DELETE, { data: request })
  },
  async getNotesByUser(userId: number): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.BY_USER(userId))
  },
  async getNotesByEpisode(episodeId: number): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.BY_EPISODE(episodeId))
  },
  async getNoteByUserAndEpisode(userId: number, episodeId: number): Promise<Note | null> {
    try {
      return await api.get<Note>(NOTES_ENDPOINTS.BY_USER_AND_EPISODE(userId, episodeId))
    } catch (error: unknown) {
      // swallow 404
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
  async getNotesByArticle(articleId: number): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.BY_ARTICLE(articleId))
  },
  async getNoteByUserAndArticle(userId: number, articleId: number): Promise<Note | null> {
    try {
      return await api.get<Note>(NOTES_ENDPOINTS.BY_USER_AND_ARTICLE(userId, articleId))
    } catch (error: unknown) {
      // swallow 404
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
}

export default notesService


