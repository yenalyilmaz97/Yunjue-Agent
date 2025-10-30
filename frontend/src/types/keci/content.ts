export interface Music {
  musicId: number
  musicTitle: string
  musicURL: string
  musicDescription?: string
}

export interface Movie {
  movieId: number
  movieTitle: string
}

export interface Task {
  taskId: number
  taskDescription: string
}

export interface WeeklyQuestion {
  weeklyQuestionId: number
  weeklyQuestionText: string
}

export interface Affirmation {
  affirmationId: number
  affirmationText: string
  order?: number
}

export interface Aphorism {
  aphorismId: number
  aphorismText: string
  order?: number
}



// Articles
export interface Article {
  articleId: number
  title: string
  slug: string
  contentHtml: string
  excerpt?: string | null
  coverImageUrl?: string | null
  authorId: number
  authorUserName: string
  isPublished: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateArticleRequest {
  title: string
  contentHtml: string
  excerpt?: string
  coverImageUrl?: string
  isPublished: boolean
}

export interface EditArticleRequest {
  articleId: number
  title: string
  contentHtml: string
  excerpt?: string
  coverImageUrl?: string
  isPublished: boolean
}