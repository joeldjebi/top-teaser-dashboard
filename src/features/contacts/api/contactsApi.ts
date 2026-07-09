import { apiRequest } from '../../../lib/apiClient'
import type {
  Contact,
  ContactImport,
  ContactPayload,
} from '../types/contactTypes'

type ApiData<T> = {
  data: T
}

export function fetchContacts(token: string) {
  return apiRequest<ApiData<Contact[]>>('/api/contacts', {
    token,
  })
}

export function createContact(token: string, payload: ContactPayload) {
  return apiRequest<ApiData<Contact>>('/api/contacts', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateContact(
  token: string,
  contactId: number,
  payload: ContactPayload,
) {
  return apiRequest<ApiData<Contact>>(`/api/contacts/${contactId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteContact(token: string, contactId: number) {
  return apiRequest<null>(`/api/contacts/${contactId}`, {
    method: 'DELETE',
    token,
  })
}

export function clearContacts(token: string) {
  return apiRequest<
    ApiData<{ contacts: number; imports: number; recipients: number }>
  >('/api/contacts', {
    method: 'DELETE',
    token,
  })
}

export function importContactsFile(token: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<ApiData<ContactImport>>('/api/imports/contacts', {
    method: 'POST',
    token,
    body: formData,
  })
}

export function fetchContactImport(token: string, importId: number) {
  return apiRequest<ApiData<ContactImport>>(`/api/imports/${importId}`, {
    token,
  })
}
