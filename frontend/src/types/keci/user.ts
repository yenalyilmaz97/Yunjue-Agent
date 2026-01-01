export interface User {
  userId: number
  userName: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: boolean
  city: string
  phone: string
  description: string
  subscriptionEnd: string
  keciTimeEnd?: string
  isWeeklyTaskCompleted: boolean
  weeklyContentId: number
  dailyContentDayOrder?: number
  roleId: number
  roleName: string
  profilePictureUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  roleId: number
  roleName: string
}

export interface CreateRoleRequest {
  roleName: string
}

export interface EditRoleRequest {
  roleId: number
  roleName: string
}

export interface UserRole {
  userRoleId: number
  userId: number
  roleId: number
  user?: User
  role?: Role
}

export interface CreateUserRequest {
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
  subscriptionEnd: string
  keciTimeEnd?: string
  roleId: number
}

export interface EditUserRequest {
  userId: number
  userName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  gender: boolean
  city: string
  phone: string
  description: string
  subscriptionEnd: string
  keciTimeEnd?: string
  roleId: number
  dailyContentDayOrder?: number
}

export interface ChangePasswordRequest {
  userId: number
  newPassword: string
}

export interface AddTimeRequest {
  userId: number
  dayCount: number
}

export interface AssignRoleRequest {
  userId: number
  roleId: number
}

export interface UserFormData {
  userName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  gender: boolean
  city: string
  phone: string
  description: string
  password?: string
  subscriptionEnd: string
  keciTimeEnd?: string
  roleId?: number
}

export interface UserFilter {
  search?: string
  roleId?: number
  city?: string
  subscriptionStatus?: 'active' | 'expired' | 'all'
}


