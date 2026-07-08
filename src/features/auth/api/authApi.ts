import { apiRequest } from '../../../lib/apiClient'
import type {
  AdminUser,
  AuthSession,
  BootstrapStatus,
  CreateSuperAdminPayload,
  LoginCredentials,
} from '../types'

type ApiData<T> = {
  data: T
}

export function login(credentials: LoginCredentials) {
  return apiRequest<ApiData<AuthSession>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function fetchBootstrapStatus() {
  return apiRequest<ApiData<BootstrapStatus>>('/api/auth/bootstrap-status')
}

export function createSuperAdminAccount(payload: CreateSuperAdminPayload) {
  return apiRequest<ApiData<AdminUser> & { message: string }>(
    '/api/auth/bootstrap-super-admin',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export function fetchCurrentUser(token: string) {
  return apiRequest<ApiData<AdminUser>>('/api/auth/me', {
    token,
  })
}

export function logout(token: string) {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
    token,
  })
}

export function updateCurrentUserProfile(
  token: string,
  payload: { name: string; email: string },
) {
  return apiRequest<ApiData<AdminUser>>('/api/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateCurrentUserPassword(
  token: string,
  payload: { password: string },
) {
  return apiRequest<{ message: string }>('/api/auth/me/password', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function acceptAdminInvitation(payload: {
  token: string
  password: string
}) {
  return apiRequest<{ message: string }>('/api/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
