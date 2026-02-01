import { api } from '@/lib/axios'
import type { CreatePopupRequest, PopupResponse, UpdatePopupRequest } from '@/types/keci/popup'

export const popupService = {
    getAllPopups: async (): Promise<PopupResponse[]> => {
        const response = await api.get<PopupResponse[]>('/Popup/admin/all')
        return response
    },

    createPopup: async (data: CreatePopupRequest): Promise<PopupResponse> => {
        const formData = new FormData()
        formData.append('Title', data.title)
        formData.append('Repeatable', String(data.repeatable))
        formData.append('Image', data.image)

        const response = await api.post<PopupResponse>('/Popup/admin', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    },

    updatePopup: async (id: number, data: UpdatePopupRequest): Promise<PopupResponse> => {
        const formData = new FormData()
        formData.append('Title', data.title)
        formData.append('Repeatable', String(data.repeatable))
        if (data.image) {
            formData.append('Image', data.image)
        }

        const response = await api.put<PopupResponse>(`/Popup/admin/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    },

    activatePopup: async (id: number): Promise<void> => {
        await api.post(`/Popup/admin/${id}/activate`)
    },

    deletePopup: async (id: number): Promise<void> => {
        await api.delete(`/Popup/admin/${id}`)
    },

    getActivePopup: async (): Promise<PopupResponse | null> => {
        const response = await api.get<PopupResponse | null>('/Popup')
        // API returns 204 No Content (null) if no popup, or 200 with object
        return response
    },

    markAsSeen: async (): Promise<void> => {
        await api.post('/Popup/seen')
    },
}
