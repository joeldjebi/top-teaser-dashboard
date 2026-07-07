import { apiRequest } from '../../../lib/apiClient'
import type { EmailLog } from '../types/emailLogTypes'

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
