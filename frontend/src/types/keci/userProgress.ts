export interface UserProgressResponseDTO {
    userProgressId: number
    userId: number
    weekId?: number | null
    articleId?: number | null
    episodeId?: number | null
    isCompleted: boolean
    completeTime: string
    weeklyContent?: unknown
    article?: unknown
    podcastEpisode?: unknown
}

export interface CreateUserProgressRequest {
    userId: number
    weekId?: number | null
    articleId?: number | null
    episodeId?: number | null
    isCompleted: boolean
}

export interface UpdateUserProgressRequest {
    userProgressId: number
    isCompleted: boolean
}
