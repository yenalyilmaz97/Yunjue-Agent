import { api, API_CONFIG } from '@/lib/axios'
import type { Role, CreateRoleRequest, EditRoleRequest, User } from '@/types/keci'

const ROLES_ENDPOINT = API_CONFIG.ENDPOINTS.ROLES

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    return api.get<Role[]>(`${ROLES_ENDPOINT}/roles`)
  },
  async getRoleById(id: number): Promise<Role> {
    return api.get<Role>(`${ROLES_ENDPOINT}/roles/${id}`)
  },
  async getUserRole(userId: number): Promise<Role> {
    return api.get<Role>(`${ROLES_ENDPOINT}/user-role/${userId}`)
  },
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    return api.post<Role>(`${ROLES_ENDPOINT}/roles`, roleData)
  },
  async updateRole(_id: number, roleData: EditRoleRequest): Promise<Role> {
    return api.put<Role>(`${ROLES_ENDPOINT}/roles`, roleData)
  },
  async deleteRole(id: number): Promise<boolean> {
    await api.delete(`${ROLES_ENDPOINT}/roles/${id}`)
    return true
  },
  async assignRoleToUser(userId: number, roleId: number): Promise<User> {
    return api.post<User>(`${API_CONFIG.ENDPOINTS.USERS}/assign-role`, { userId, roleId })
  },
  async getUsersByRole(roleId: number): Promise<User[]> {
    return api.get<User[]>(`${API_CONFIG.ENDPOINTS.USERS}/role/${roleId}`)
  },
}

export default roleService


