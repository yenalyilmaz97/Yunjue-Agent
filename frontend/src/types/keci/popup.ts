export type Popup = {
    id: number
    title: string
    imageUrl: string
    repeatable: boolean
    isActive: boolean
    createdAt: string
}

export type CreatePopupRequest = {
    title: string
    repeatable: boolean
    image: File
}

export type UpdatePopupRequest = {
    title: string
    repeatable: boolean
    image?: File
}

export type PopupResponse = {
    id: number
    title: string
    imageUrl: string
    repeatable: boolean
}
