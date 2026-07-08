import { apiRequest } from '../../../lib/apiClient'
import type {
  AdminAccount,
  AdminAccountCreatedResponse,
  AdminAccountPayload,
  AdminRole,
  AdminRolePayload,
} from '../types/adminUserTypes'

type ApiData<T> = { data: T }

export function fetchAdminRoles(token: string) {
  return apiRequest<ApiData<AdminRole[]>>('/api/admin-users/roles', { token })
}

export function createAdminRole(token: string, payload: AdminRolePayload) {
  return apiRequest<ApiData<AdminRole>>('/api/admin-users/roles', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateAdminRole(
  token: string,
  roleId: number,
  payload: Partial<AdminRolePayload>,
) {
  return apiRequest<ApiData<AdminRole>>(`/api/admin-users/roles/${roleId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteAdminRole(token: string, roleId: number) {
  return apiRequest<null>(`/api/admin-users/roles/${roleId}`, {
    method: 'DELETE',
    token,
  })
}

export function fetchAdminUsers(token: string) {
  return apiRequest<ApiData<AdminAccount[]>>('/api/admin-users', { token })
}

export function createAdminUser(token: string, payload: AdminAccountPayload) {
  return apiRequest<AdminAccountCreatedResponse>('/api/admin-users', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteAdminUser(token: string, adminId: number) {
  return apiRequest<null>(`/api/admin-users/${adminId}`, {
    method: 'DELETE',
    token,
  })
}
