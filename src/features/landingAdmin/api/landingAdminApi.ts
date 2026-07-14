import { apiRequest } from '../../../lib/apiClient'
import type { LandingContent } from '../types/landingAdminTypes'

type LandingResponse = {
  data: LandingContent
}

export function fetchLandingAdmin(token: string) {
  return apiRequest<LandingResponse>('/api/landing/admin', { token })
}

export function updateLandingPage(
  token: string,
  payload: Partial<LandingContent['page']>,
) {
  return apiRequest<LandingResponse>('/api/landing/admin/page', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateLandingSection(
  token: string,
  sectionKey: string,
  payload: Partial<LandingContent['sections'][number]>,
) {
  return apiRequest<LandingResponse>(`/api/landing/admin/sections/${sectionKey}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateLandingContact(
  token: string,
  payload: Partial<NonNullable<LandingContent['contact']>>,
) {
  return apiRequest<LandingResponse>('/api/landing/admin/contact', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}
