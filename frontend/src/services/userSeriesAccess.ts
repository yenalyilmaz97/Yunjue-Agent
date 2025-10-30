import { api, API_CONFIG } from '@/lib/axios'
import type {
  UserSeriesAccess,
  CreateUserSeriesAccess,
  UpdateUserSeriesAccess,
  GrantAccessRequest,
  RevokeAccessRequest,
  UserSeriesAccessFilter,
} from '@/types/keci'

const USER_SERIES_ACCESS_ENDPOINT = API_CONFIG.ENDPOINTS.USER_SERIES_ACCESS

export const userSeriesAccessService = {
  async getAllUserSeriesAccess(): Promise<UserSeriesAccess[]> {
    return api.get<UserSeriesAccess[]>(USER_SERIES_ACCESS_ENDPOINT)
  },
  async getUserSeriesAccessById(id: number): Promise<UserSeriesAccess> {
    return api.get<UserSeriesAccess>(`${USER_SERIES_ACCESS_ENDPOINT}/${id}`)
  },
  async getAccessByUserId(userId: number): Promise<UserSeriesAccess[]> {
    return api.get<UserSeriesAccess[]>(`${USER_SERIES_ACCESS_ENDPOINT}/user/${userId}`)
  },
  async getAccessBySeriesId(seriesId: number): Promise<UserSeriesAccess[]> {
    return api.get<UserSeriesAccess[]>(`${USER_SERIES_ACCESS_ENDPOINT}/series/${seriesId}`)
  },
  async getUserSeriesAccess(userId: number, seriesId: number): Promise<UserSeriesAccess> {
    return api.get<UserSeriesAccess>(`${USER_SERIES_ACCESS_ENDPOINT}/user/${userId}/series/${seriesId}`)
  },
  async hasAccess(userId: number, seriesId: number): Promise<boolean> {
    return api.get<boolean>(`${USER_SERIES_ACCESS_ENDPOINT}/user/${userId}/series/${seriesId}/has-access`)
  },
  async createUserSeriesAccess(accessData: CreateUserSeriesAccess): Promise<UserSeriesAccess> {
    return api.post<UserSeriesAccess>(USER_SERIES_ACCESS_ENDPOINT, accessData)
  },
  async grantAccess(request: GrantAccessRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>(`${USER_SERIES_ACCESS_ENDPOINT}/grant`, request)
  },
  async updateUserSeriesAccess(id: number, accessData: UpdateUserSeriesAccess): Promise<UserSeriesAccess> {
    return api.put<UserSeriesAccess>(`${USER_SERIES_ACCESS_ENDPOINT}/${id}`, accessData)
  },
  async deleteUserSeriesAccess(id: number): Promise<boolean> {
    await api.delete(`${USER_SERIES_ACCESS_ENDPOINT}/${id}`)
    return true
  },
  async revokeAccess(request: RevokeAccessRequest): Promise<void> {
    await api.delete(`${USER_SERIES_ACCESS_ENDPOINT}/revoke`, { data: request })
  },
  async getFilteredUserSeriesAccess(filter: UserSeriesAccessFilter = {}): Promise<UserSeriesAccess[]> {
    let accessRecords = await this.getAllUserSeriesAccess()
    if (filter.userId) accessRecords = accessRecords.filter((a) => a.userId === filter.userId)
    if (filter.seriesId) accessRecords = accessRecords.filter((a) => a.seriesId === filter.seriesId)
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      accessRecords = accessRecords.filter(
        (a) =>
          a.user?.firstName.toLowerCase().includes(searchTerm) ||
          a.user?.lastName.toLowerCase().includes(searchTerm) ||
          a.user?.userName.toLowerCase().includes(searchTerm) ||
          a.user?.email.toLowerCase().includes(searchTerm) ||
          a.podcastSeries?.title.toLowerCase().includes(searchTerm),
      )
    }
    return accessRecords
  },
}

export default userSeriesAccessService


