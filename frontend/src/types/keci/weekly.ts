export interface WeeklyContent {
  weekId: number
  weekOrder: number
  musicId: number
  movieId: number
  taskId: number
  weeklyQuestionId: number
  music: { musicId: number; musicTitle: string; musicURL: string; musicDescription?: string }
  movie: { movieId: number; movieTitle: string }
  task: { taskId: number; taskDescription: string }
  weeklyQuestion: { weeklyQuestionId: number; weeklyQuestionText: string }
}

export interface CreateWeeklyContentRequest {
  weekOrder: number
  musicId: number
  movieId: number
  taskId: number
  weeklyQuestionId: number
}

export interface EditWeeklyContentRequest {
  weekId: number
  weekOrder: number
  musicId: number
  movieId: number
  taskId: number
  weeklyQuestionId: number
}

export interface AssignWeeklyContentRequest {
  userId: number
  weeklyContentId: number
}

export interface AddUserWeeklyContentRequest {
  userId: number
  weeklyContentId: number
  questionAnswer: string
  isMusicCompleted: boolean
  isMovieCompleted: boolean
  isTaskCompleted: boolean
}

export interface EditUserWeeklyContentRequest {
  userId: number
  weeklyContentId: number
  questionAnswer: string
  isMusicCompleted: boolean
  isMovieCompleted: boolean
  isTaskCompleted: boolean
}

export interface UserWeeklyProgress {
  userWeeklyProgressId: number
  userId: number
  weeklyContentId: number
  isMusicCompleted: boolean
  musicCompletedAt?: string
  isTaskCompleted: boolean
  taskCompletedAt?: string
  taskNotes?: string
  isMovieCompleted: boolean
  movieCompletedAt?: string
  isQuestionAnswered: boolean
  questionAnsweredAt?: string
  questionAnswer?: string
  isWeekCompleted: boolean
  weekCompletedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  weeklyContent?: WeeklyContent
}

export interface CreateUserWeeklyProgressRequest {
  userId: number
  weeklyContentId: number
  isMusicCompleted: boolean
  isTaskCompleted: boolean
  taskNotes?: string
  isMovieCompleted: boolean
  isQuestionAnswered: boolean
  questionAnswer?: string
  notes?: string
}

export interface UpdateUserWeeklyProgressRequest {
  isMusicCompleted?: boolean
  isTaskCompleted?: boolean
  taskNotes?: string
  isMovieCompleted?: boolean
  isQuestionAnswered?: boolean
  questionAnswer?: string
  notes?: string
}

export interface WeeklyContentSummary {
  weekNumber: number
  year: number
  weeklyContent?: WeeklyContent
  userProgress: UserWeeklyProgress[]
}

export interface WeeklyContentFormData {
  weekNumber: number
  year: number
  musicTitle: string
  musicUrl: string
  musicDescription: string
  taskTitle: string
  taskDescription: string
  movieTitle: string
  movieUrl: string
  movieDescription: string
  question: string
  questionDescription: string
  isActive: boolean
}

export interface WeeklyContentFilter {
  search?: string
  weekNumber?: number
  year?: number
  status?: 'active' | 'inactive' | 'all'
  createdBy?: number
}


