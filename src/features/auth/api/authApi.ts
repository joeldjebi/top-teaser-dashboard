import { apiRequest } from '../../../lib/apiClient'
import type { AdminUser, AuthSession, LoginCredentials } from '../types'

type ApiData<T> = {
  data: T
}

export function login(credentials: LoginCredentials) {
  return apiRequest<ApiData<AuthSession>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
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
