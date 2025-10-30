import { api, API_CONFIG } from '@/lib/axios'
import type { User, CreateUserRequest, EditUserRequest, UserFilter, PaginationParams, ChangePasswordRequest } from '@/types/keci'

const USERS_ENDPOINT = API_CONFIG.ENDPOINTS.USERS

export const userService = {
  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>(USERS_ENDPOINT)
  },
  async getUserById(id: number): Promise<User> {
    return api.get<User>(`${USERS_ENDPOINT}/${id}`)
  },
  async getUsersByRole(roleId: number): Promise<User[]> {
    return api.get<User[]>(`${USERS_ENDPOINT}/role/${roleId}`)
  },
  async createUser(userData: CreateUserRequest): Promise<User> {
    return api.post<User>(USERS_ENDPOINT, userData)
  },
  async updateUser(_id: number, userData: EditUserRequest): Promise<User> {
    return api.put<User>(USERS_ENDPOINT, userData)
  },
  async deleteUser(id: number): Promise<boolean> {
    await api.delete(`${USERS_ENDPOINT}/${id}`)
    return true
  },
  async changePassword(payload: ChangePasswordRequest): Promise<User> {
    return api.post<User>(`${USERS_ENDPOINT}/change-password`, payload)
  },
  async getFilteredUsers(filter: UserFilter = {}): Promise<User[]> {
    let users = await this.getAllUsers()
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      users = users.filter(
        (user) =>
          user.userName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.city.toLowerCase().includes(searchTerm),
      )
    }
    if (filter.roleId) users = users.filter((user) => user.roleId === filter.roleId)
    if (filter.city) users = users.filter((user) => user.city.toLowerCase().includes(filter.city!.toLowerCase()))
    if (filter.subscriptionStatus && filter.subscriptionStatus !== 'all') {
      const now = new Date()
      users = users.filter((user) => {
        const subscriptionEnd = new Date(user.subscriptionEnd)
        const isActive = subscriptionEnd > now
        return filter.subscriptionStatus === 'active' ? isActive : !isActive
      })
    }
    return users
  },
  async getPaginatedUsers(
    filter: UserFilter = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 },
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const filteredUsers = await this.getFilteredUsers(filter)
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / pagination.pageSize)
    const startIndex = (pagination.page - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    const users = filteredUsers.slice(startIndex, endIndex)
    return { users, total, totalPages }
  },
}

export default userService


