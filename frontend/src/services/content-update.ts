import { api } from '@/lib/axios'
import type { ContentUpdateBatch } from '@/types/keci/content-update'

export const contentUpdateService = {
    getRecentBatches: async (count: number = 20): Promise<ContentUpdateBatch[]> => {
        const response = await api.get<ContentUpdateBatch[]>(`/ContentUpdateBatch?count=${count}`)
        return response
    },

    downloadPdf: async (batchId: string): Promise<void> => {
        const response = await api.get<Blob>(`/ContentUpdateBatch/${batchId}/pdf`, {
            responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `update_report_${batchId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
    }
}
