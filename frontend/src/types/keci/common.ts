export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

export interface DashboardStats {
  totalSeries: number
  totalEpisodes: number
  totalUsers: number
  totalFavorites: number
  totalNotes: number
  totalQuestions: number
}


