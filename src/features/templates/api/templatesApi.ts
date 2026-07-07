import { apiRequest } from '../../../lib/apiClient'
import type {
  EmailTemplate,
  RenderedTemplate,
  TemplatePayload,
} from '../types/templateTypes'

type ApiData<T> = {
  data: T
}

const previewVariables = {
  fullName: 'Awa Koné',
  firstName: 'Awa',
  lastName: 'Koné',
  mobileNumber: '+225 07 00 00 00 00',
  email: 'awa.kone@example.com',
  commune: 'Cocody',
  country: 'Côte d’Ivoire',
  unsubscribeUrl: 'https://top-teaser.com/unsubscribe/demo-token',
}

export function fetchTemplates(token: string) {
  return apiRequest<ApiData<EmailTemplate[]>>('/api/templates', {
    token,
  })
}

export function createTemplate(token: string, payload: TemplatePayload) {
  return apiRequest<ApiData<EmailTemplate>>('/api/templates', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateTemplate(
  token: string,
  templateId: number,
  payload: TemplatePayload,
) {
  return apiRequest<ApiData<EmailTemplate>>(`/api/templates/${templateId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteTemplate(token: string, templateId: number) {
  return apiRequest<null>(`/api/templates/${templateId}`, {
    method: 'DELETE',
    token,
  })
}

export function previewTemplate(token: string, templateId: number) {
  return apiRequest<ApiData<RenderedTemplate>>(
    `/api/templates/${templateId}/preview`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ variables: previewVariables }),
    },
  )
}

export function sendTemplateTest(
  token: string,
  templateId: number,
  toEmail: string,
) {
  return apiRequest<ApiData<{ provider: string; status: string }>>(
    `/api/templates/${templateId}/test-send`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({
        to: { email: toEmail },
        variables: previewVariables,
      }),
    },
  )
}
