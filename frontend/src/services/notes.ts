import { api } from '@/lib/axios'
import type { Note } from '@/types/keci'

const NOTES_ENDPOINTS = {
  LIST: '/Podcast/notes',
  CREATE: '/Podcast/notes',
  GET: (id: string) => `/Podcast/notes/${id}`,
  UPDATE: () => `/Podcast/notes`,
  DELETE: () => `/Podcast/notes`,
  BY_USER: (userId: string) => `/Podcast/notes/user/${userId}`,
  BY_EPISODE: (episodeId: string) => `/Podcast/notes/episode/${episodeId}`,
  BY_USER_AND_EPISODE: (userId: string, episodeId: string) => `/Podcast/notes/user/${userId}/episode/${episodeId}`,
} as const

export const notesService = {
  async getNotes(): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.LIST)
  },
  async getNoteById(id: number): Promise<Note> {
    return await api.get<Note>(NOTES_ENDPOINTS.GET(id.toString()))
  },
  async createNote(noteData: { userId: number; episodeId: number; note: string }): Promise<Note> {
    return await api.post<Note>(NOTES_ENDPOINTS.CREATE, { userId: noteData.userId, episodeId: noteData.episodeId, Note: noteData.note })
  },
  async updateNote(id: number, noteData: Partial<Note>): Promise<Note> {
    return await api.put<Note>(NOTES_ENDPOINTS.UPDATE(), { ...noteData, noteId: id })
  },
  async deleteNote(id: number): Promise<void> {
    return await api.delete(NOTES_ENDPOINTS.DELETE(), { data: { noteId: id } })
  },
  async getNotesByUser(userId: number): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.BY_USER(userId.toString()))
  },
  async getNotesByEpisode(episodeId: number): Promise<Note[]> {
    return await api.get<Note[]>(NOTES_ENDPOINTS.BY_EPISODE(episodeId.toString()))
  },
  async getNoteByUserAndEpisode(userId: number, episodeId: number): Promise<Note | null> {
    try {
      return await api.get<Note>(NOTES_ENDPOINTS.BY_USER_AND_EPISODE(userId.toString(), episodeId.toString()))
    } catch (error: unknown) {
      // swallow 404
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.response?.status === 404) return null
      throw error
    }
  },
  async updateNoteByUserAndEpisode(noteData: { userId: number; episodeId: number; note: string }): Promise<Note> {
    return await api.put<Note>(NOTES_ENDPOINTS.UPDATE(), { userId: noteData.userId, episodeId: noteData.episodeId, Note: noteData.note })
  },
}

export default notesService


