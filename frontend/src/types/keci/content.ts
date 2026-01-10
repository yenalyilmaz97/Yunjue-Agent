export interface Music {
  musicId: number
  musicTitle: string
  musicURL: string
  musicDescription?: string
}

export interface Movie {
  movieId: number
  movieTitle: string
  imageUrl?: string
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
  order: number
  pdfLink: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  authorUserName?: string
  coverImageUrl?: string
  contentHtml?: string
}

export interface CreateArticleRequest {
  title: string
  pdfLink: string
  isActive: boolean
}

export interface EditArticleRequest {
  articleId: number
  title: string
  pdfLink: string
  isActive: boolean
}