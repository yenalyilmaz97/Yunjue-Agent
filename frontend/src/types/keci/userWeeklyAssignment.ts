import type { User } from './user'
import type { WeeklyContent, UserWeeklyProgress } from './weekly'

export interface UserWeeklyAssignment {
  userWeeklyAssignmentId: number
  userId: number
  assignedWeekNumber: number
  assignedYear: number
  isOverride: boolean
  assignedAt: string
  assignedBy: number
  createdAt: string
  updatedAt: string
  user?: User
  assignedByUser?: User
  weeklyContent?: WeeklyContent
  userProgress?: UserWeeklyProgress
}

export interface AssignUserToWeekRequest {
  userId: number
  assignedWeekNumber: number
  assignedYear: number
  isOverride: boolean
  assignedBy: number
}

export interface BulkAssignWeekRequest {
  userIds: number[]
  weekNumber: number
  year: number
  isOverride: boolean
}

export interface BulkRemoveAssignmentsRequest {
  userIds: number[]
}

export interface UserWeeklyAssignmentFilter {
  search?: string
  userId?: number
  weekNumber?: number
  year?: number
  isOverride?: boolean
  assignedBy?: number
}

export interface UserWeeklyAssignmentFormData {
  userId: number
  assignedWeekNumber: number
  assignedYear: number
  isOverride: boolean
}

export interface UserWeeklyAssignmentStats {
  totalAssignments: number
  overrideAssignments: number
  usersWithAssignments: number
  usersWithoutAssignments: number
  weeksCovered: number
  mostAssignedWeek: { weekNumber: number; year: number; count: number } | null
}

export interface UserAssignmentSummary {
  user: User
  currentAssignment: UserWeeklyAssignment | null
  assignmentProgress: UserWeeklyProgress | null
  isOnCurrentWeek: boolean
  isOverridden: boolean
}


