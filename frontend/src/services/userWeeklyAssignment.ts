import { api, API_CONFIG } from '@/lib/axios'
import type {
  UserWeeklyAssignment,
  AssignUserToWeekRequest,
  UserAssignmentSummary,
  UserWeeklyAssignmentFilter,
  UserWeeklyAssignmentStats,
  BulkAssignWeekRequest,
  UserWeeklyAssignmentFormData,
  WeeklyContent,
} from '@/types/keci'

const WEEKLY_ENDPOINT = API_CONFIG.ENDPOINTS.WEEKLY

// Note: Backend doesn't have a separate UserWeeklyAssignment controller
// All weekly assignment endpoints are in WeeklyController
// Some endpoints may not exist in backend - these are placeholders for future implementation
export const userWeeklyAssignmentService = {
  // These endpoints don't exist in backend yet - returning empty arrays for now
  async getAllUserAssignments(): Promise<UserWeeklyAssignment[]> {
    // Backend doesn't have this endpoint - return empty array
    return Promise.resolve([])
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserAssignmentById(_id: number): Promise<UserWeeklyAssignment> {
    // Backend doesn't have this endpoint
    throw new Error('Endpoint not implemented in backend')
  },
  async getUserCurrentAssignment(userId: number): Promise<UserWeeklyAssignment> {
    // Use Weekly controller's current endpoint
    await api.get<WeeklyContent>(`${WEEKLY_ENDPOINT}/user/${userId}/current`)
    // Convert WeeklyContent to UserWeeklyAssignment format if needed
    return {} as UserWeeklyAssignment
  },
  async createUserAssignment(assignmentData: AssignUserToWeekRequest): Promise<UserWeeklyAssignment> {
    // Use Weekly controller's assign endpoint
    await api.post<WeeklyContent>(`${WEEKLY_ENDPOINT}/assign`, {
      userId: assignmentData.userId,
      weeklyContentId: assignmentData.assignedWeekNumber, // This might need adjustment
    })
    return {} as UserWeeklyAssignment
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUserAssignment(_id: number, _assignmentData: Partial<AssignUserToWeekRequest>): Promise<UserWeeklyAssignment> {
    // Backend doesn't have this endpoint
    throw new Error('Endpoint not implemented in backend')
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteUserAssignment(_id: number): Promise<boolean> {
    // Backend doesn't have this endpoint
    throw new Error('Endpoint not implemented in backend')
  },
  async getUserAssignments(userId: number): Promise<UserWeeklyAssignment[]> {
    // Use Weekly controller's user content endpoint
    await api.get<WeeklyContent[]>(`${WEEKLY_ENDPOINT}/content/user/${userId}`)
    return [] as UserWeeklyAssignment[]
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignUserToWeek(userId: number, weekNumber: number, _year: number, _isOverride: boolean = true): Promise<UserWeeklyAssignment> {
    // Use Weekly controller's assign endpoint - need to find weeklyContentId from weekNumber
    // This is a simplified version - may need adjustment
    const weeklyContents = await api.get<WeeklyContent[]>(`${WEEKLY_ENDPOINT}/content`)
    const matchingContent = weeklyContents.find((wc) => wc.weekOrder === weekNumber)
    if (!matchingContent) {
      throw new Error(`Weekly content for week ${weekNumber} not found`)
    }
    await api.post<WeeklyContent>(`${WEEKLY_ENDPOINT}/assign`, {
      userId,
      weeklyContentId: matchingContent.weekId,
    })
    return {} as UserWeeklyAssignment
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeUserAssignment(_userId: number): Promise<boolean> {
    // Backend doesn't have this endpoint
    throw new Error('Endpoint not implemented in backend')
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAssignmentsByWeek(_weekNumber: number, _year: number): Promise<UserWeeklyAssignment[]> {
    // Backend doesn't have this endpoint
    return Promise.resolve([])
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async bulkAssignWeek(_assignmentData: BulkAssignWeekRequest): Promise<UserWeeklyAssignment[]> {
    // Backend doesn't have this endpoint
    return Promise.resolve([])
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignUsersToCurrentWeek(_assignmentData: { userIds: number[] }): Promise<UserWeeklyAssignment[]> {
    // Backend doesn't have this endpoint
    return Promise.resolve([])
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async bulkRemoveAssignments(_userIds: number[]): Promise<boolean> {
    // Backend doesn't have this endpoint
    return Promise.resolve(false)
  },
  async getAssignmentStats(): Promise<UserWeeklyAssignmentStats> {
    // Backend doesn't have this endpoint
    return Promise.resolve({} as UserWeeklyAssignmentStats)
  },
  async getUserAssignmentSummaries(): Promise<UserAssignmentSummary[]> {
    // Backend doesn't have this endpoint - we need to build it from available data
    // For now, return empty array or build from users and weekly content
    try {
      // Get all users and their weekly content assignments
      const { userService } = await import('./users')
      const { weeklyService } = await import('./weekly')
      const users = await userService.getAllUsers()
      const allWeeklyContent = await weeklyService.getAllWeeklyContent()
      
      // Build summaries from available data
      const summaries: UserAssignmentSummary[] = users.map((user) => {
        const userWeeklyContent = allWeeklyContent.find((wc) => wc.weekId === user.weeklyContentId)
        return {
          user,
          currentAssignment: userWeeklyContent
            ? {
                assignedWeekNumber: userWeeklyContent.weekOrder,
                assignedYear: new Date().getFullYear(), // This might need to come from backend
                isOverride: false, // This might need to come from backend
                assignedBy: 1,
              }
            : null,
        } as UserAssignmentSummary
      })
      return summaries
    } catch (error) {
      console.error('Error building user assignment summaries:', error)
      return []
    }
  },
  async getAvailableWeeks(): Promise<WeeklyContent[]> {
    // Use Weekly controller's available-weeks endpoint
    return api.get<WeeklyContent[]>(`${WEEKLY_ENDPOINT}/userweeklyassignment/available-weeks`)
  },
  async getCurrentWeek(): Promise<{ weekNumber: number; year: number }> {
    // Backend doesn't have this endpoint - calculate from current date
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
    return { weekNumber, year: now.getFullYear() }
  },
  async getFilteredUserAssignmentSummaries(filter: UserWeeklyAssignmentFilter = {}): Promise<UserAssignmentSummary[]> {
    let summaries = await this.getUserAssignmentSummaries()
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      summaries = summaries.filter(
        (s) =>
          s.user.firstName.toLowerCase().includes(searchTerm) ||
          s.user.lastName.toLowerCase().includes(searchTerm) ||
          s.user.userName.toLowerCase().includes(searchTerm) ||
          s.user.email.toLowerCase().includes(searchTerm) ||
          (s.currentAssignment && (`week ${s.currentAssignment.assignedWeekNumber}`.toLowerCase().includes(searchTerm) || s.currentAssignment.assignedYear.toString().includes(searchTerm))),
      )
    }
    if (filter.userId) summaries = summaries.filter((s) => s.user.userId === filter.userId)
    if (filter.weekNumber && filter.year) {
      summaries = summaries.filter(
        (s) => s.currentAssignment && s.currentAssignment.assignedWeekNumber === filter.weekNumber && s.currentAssignment.assignedYear === filter.year,
      )
    }
    if (filter.isOverride !== undefined) {
      summaries = summaries.filter((s) => (filter.isOverride ? !!s.currentAssignment?.isOverride : !s.currentAssignment?.isOverride))
    }
    if (filter.assignedBy) summaries = summaries.filter((s) => s.currentAssignment && s.currentAssignment.assignedBy === filter.assignedBy)
    return summaries
  },
  formDataToCreateDto(formData: UserWeeklyAssignmentFormData): AssignUserToWeekRequest {
    return { userId: formData.userId, assignedWeekNumber: formData.assignedWeekNumber, assignedYear: formData.assignedYear, isOverride: formData.isOverride, assignedBy: 1 }
  },
  formDataToUpdateDto(formData: Partial<UserWeeklyAssignmentFormData>): Partial<AssignUserToWeekRequest> {
    return { assignedWeekNumber: formData.assignedWeekNumber, assignedYear: formData.assignedYear, isOverride: formData.isOverride }
  },
}

export default userWeeklyAssignmentService


