import { apiRequest } from '../../../lib/apiClient'
import type {
  ActiveMailProvider,
  MailSettings,
  MailSettingsPayload,
  MailProvider,
  MailTestPayload,
  MailTestResult,
} from '../types/providerTypes'

type ApiData<T> = {
  data: T
}

export function fetchMailProviders(token: string) {
  return apiRequest<ApiData<MailProvider[]>>('/api/mail/providers', {
    token,
  })
}

export function fetchActiveMailProvider(token: string) {
  return apiRequest<ApiData<ActiveMailProvider>>('/api/mail/providers/active', {
    token,
  })
}

export function sendMailProviderTest(token: string, payload: MailTestPayload) {
  return apiRequest<ApiData<MailTestResult>>('/api/mail/test', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function fetchMailSettings(token: string) {
  return apiRequest<ApiData<MailSettings>>('/api/mail/settings', {
    token,
  })
}

export function updateMailSettings(
  token: string,
  payload: MailSettingsPayload,
) {
  return apiRequest<ApiData<MailSettings>>('/api/mail/settings', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}
