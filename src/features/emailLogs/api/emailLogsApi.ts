import { apiRequest } from '../../../lib/apiClient'
import type { EmailLog, TechnicalLog } from '../types/emailLogTypes'

type ApiData<T> = {
  data: T
}

export function fetchEmailLogs(token: string) {
  return apiRequest<ApiData<EmailLog[]>>('/api/email-logs', {
    token,
  })
}

export function fetchEmailLog(token: string, logId: number) {
  return apiRequest<ApiData<EmailLog>>(`/api/email-logs/${logId}`, {
    token,
  })
}

export function fetchTechnicalLogs(token: string) {
  return apiRequest<ApiData<TechnicalLog[]>>('/api/technical-logs?limit=500', {
    token,
  })
}

export function clearTechnicalLogs(token: string) {
  return apiRequest<ApiData<{ technicalLogs: number }>>('/api/technical-logs', {
    method: 'DELETE',
    token,
  })
}
