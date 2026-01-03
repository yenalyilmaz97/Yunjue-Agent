export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  userName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  gender: boolean
  city: string
  phone: string
  description: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: UserInfo | undefined
  roles: string[]
}

export interface UserInfo {
  userId: number
  userName: string
  firstName: string
  lastName: string
  email: string
  gender: boolean
  city: string
  phone: string
  description: string
  dateOfBirth: string
  subscriptionEnd: string
  isWeeklyTaskCompleted: boolean
  weeklyContentId: number
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  userName: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: boolean
  city: string
  phone: string
  description: string
}


