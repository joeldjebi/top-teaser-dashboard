import { apiRequest } from '../../../lib/apiClient'
import type { ActivityLog } from '../types/activityLogTypes'

type ApiData<T> = {
  data: T
}

export function fetchActivityLogs(token: string) {
  return apiRequest<ApiData<ActivityLog[]>>('/api/activity-logs?limit=500', {
    token,
  })
}

export function clearActivityLogs(token: string) {
  return apiRequest<ApiData<{ activityLogs: number }>>('/api/activity-logs', {
    method: 'DELETE',
    token,
  })
}
