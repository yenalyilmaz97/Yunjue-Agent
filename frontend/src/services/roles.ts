import { api, API_CONFIG } from '@/lib/axios'
import type { Role, CreateRoleRequest, EditRoleRequest, User } from '@/types/keci'

const ROLES_ENDPOINT = API_CONFIG.ENDPOINTS.ROLES

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    return api.get<Role[]>(ROLES_ENDPOINT)
  },
  async getRoleById(id: number): Promise<Role> {
    return api.get<Role>(`${ROLES_ENDPOINT}/${id}`)
  },
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    return api.post<Role>(ROLES_ENDPOINT, roleData)
  },
  async updateRole(_id: number, roleData: EditRoleRequest): Promise<Role> {
    return api.put<Role>(ROLES_ENDPOINT, roleData)
  },
  async deleteRole(id: number): Promise<boolean> {
    await api.delete(`${ROLES_ENDPOINT}/${id}`)
    return true
  },
  async assignRoleToUser(userId: number, roleId: number): Promise<unknown> {
    return api.post('/User/assign-role', { userId, roleId })
  },
  async getUsersByRole(roleId: number): Promise<User[]> {
    return api.get<User[]>(`/User/role/${roleId}`)
  },
}

export default roleService


