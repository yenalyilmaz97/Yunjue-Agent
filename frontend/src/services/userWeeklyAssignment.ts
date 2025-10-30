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

const USER_ASSIGNMENT_ENDPOINT = API_CONFIG.ENDPOINTS.USER_WEEKLY_ASSIGNMENT

export const userWeeklyAssignmentService = {
  async getAllUserAssignments(): Promise<UserWeeklyAssignment[]> {
    return api.get<UserWeeklyAssignment[]>(USER_ASSIGNMENT_ENDPOINT)
  },
  async getUserAssignmentById(id: number): Promise<UserWeeklyAssignment> {
    return api.get<UserWeeklyAssignment>(`${USER_ASSIGNMENT_ENDPOINT}/${id}`)
  },
  async getUserCurrentAssignment(userId: number): Promise<UserWeeklyAssignment> {
    return api.get<UserWeeklyAssignment>(`${USER_ASSIGNMENT_ENDPOINT}/user/${userId}`)
  },
  async createUserAssignment(assignmentData: AssignUserToWeekRequest): Promise<UserWeeklyAssignment> {
    return api.post<UserWeeklyAssignment>(USER_ASSIGNMENT_ENDPOINT, assignmentData)
  },
  async updateUserAssignment(id: number, assignmentData: Partial<AssignUserToWeekRequest>): Promise<UserWeeklyAssignment> {
    return api.put<UserWeeklyAssignment>(`${USER_ASSIGNMENT_ENDPOINT}/${id}`, assignmentData)
  },
  async deleteUserAssignment(id: number): Promise<boolean> {
    await api.delete(`${USER_ASSIGNMENT_ENDPOINT}/${id}`)
    return true
  },
  async getUserAssignments(userId: number): Promise<UserWeeklyAssignment[]> {
    return api.get<UserWeeklyAssignment[]>(`${USER_ASSIGNMENT_ENDPOINT}/user/${userId}`)
  },
  async assignUserToWeek(userId: number, weekNumber: number, year: number, isOverride: boolean = true): Promise<UserWeeklyAssignment> {
    return api.post<UserWeeklyAssignment>(`${USER_ASSIGNMENT_ENDPOINT}/assign`, { userId, weekNumber, year, isOverride, assignedBy: 1 })
  },
  async removeUserAssignment(userId: number): Promise<boolean> {
    await api.delete(`${USER_ASSIGNMENT_ENDPOINT}/user/${userId}`)
    return true
  },
  async getAssignmentsByWeek(weekNumber: number, year: number): Promise<UserWeeklyAssignment[]> {
    return api.get<UserWeeklyAssignment[]>(`${USER_ASSIGNMENT_ENDPOINT}/week/${weekNumber}/${year}`)
  },
  async bulkAssignWeek(assignmentData: BulkAssignWeekRequest): Promise<UserWeeklyAssignment[]> {
    return api.post<UserWeeklyAssignment[]>(`${USER_ASSIGNMENT_ENDPOINT}/bulk-assign`, assignmentData)
  },
  async assignUsersToCurrentWeek(assignmentData: { userIds: number[] }): Promise<UserWeeklyAssignment[]> {
    return api.post<UserWeeklyAssignment[]>(`${USER_ASSIGNMENT_ENDPOINT}/assign-current-week`, assignmentData)
  },
  async bulkRemoveAssignments(userIds: number[]): Promise<boolean> {
    await api.delete(`${USER_ASSIGNMENT_ENDPOINT}/bulk-remove`, { data: { userIds } })
    return true
  },
  async getAssignmentStats(): Promise<UserWeeklyAssignmentStats> {
    return api.get<UserWeeklyAssignmentStats>(`${USER_ASSIGNMENT_ENDPOINT}/stats`)
  },
  async getUserAssignmentSummaries(): Promise<UserAssignmentSummary[]> {
    return api.get<UserAssignmentSummary[]>(`${USER_ASSIGNMENT_ENDPOINT}/summaries`)
  },
  async getAvailableWeeks(): Promise<{ weekNumber: number; year: number; weeklyContent: WeeklyContent }[]> {
    return api.get<{ weekNumber: number; year: number; weeklyContent: WeeklyContent }[]>(`${USER_ASSIGNMENT_ENDPOINT}/available-weeks`)
  },
  async getCurrentWeek(): Promise<{ weekNumber: number; year: number }> {
    return api.get<{ weekNumber: number; year: number }>(`${USER_ASSIGNMENT_ENDPOINT}/current-week`)
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


