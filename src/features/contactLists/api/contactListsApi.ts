import { apiRequest } from '../../../lib/apiClient'
import type {
  ContactList,
  ContactListPayload,
  ContactListWithContacts,
} from '../types/contactListTypes'

type ApiData<T> = {
  data: T
}

export function fetchContactLists(token: string) {
  return apiRequest<ApiData<ContactList[]>>('/api/contact-lists', {
    token,
  })
}

export function fetchContactList(token: string, contactListId: number) {
  return apiRequest<ApiData<ContactListWithContacts>>(
    `/api/contact-lists/${contactListId}`,
    {
      token,
    },
  )
}

export function createContactList(token: string, payload: ContactListPayload) {
  return apiRequest<ApiData<ContactListWithContacts>>('/api/contact-lists', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateContactList(
  token: string,
  contactListId: number,
  payload: ContactListPayload,
) {
  return apiRequest<ApiData<ContactListWithContacts>>(
    `/api/contact-lists/${contactListId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    },
  )
}

export function deleteContactList(token: string, contactListId: number) {
  return apiRequest<null>(`/api/contact-lists/${contactListId}`, {
    method: 'DELETE',
    token,
  })
}

export function clearContactLists(token: string) {
  return apiRequest<ApiData<{ campaigns: number; contactLists: number }>>(
    '/api/contact-lists',
    {
      method: 'DELETE',
      token,
    },
  )
}

export function addContactToList(
  token: string,
  contactListId: number,
  contactId: number,
) {
  return apiRequest<ApiData<ContactListWithContacts>>(
    `/api/contact-lists/${contactListId}/contacts`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ contactId }),
    },
  )
}

export function removeContactFromList(
  token: string,
  contactListId: number,
  contactId: number,
) {
  return apiRequest<null>(
    `/api/contact-lists/${contactListId}/contacts/${contactId}`,
    {
      method: 'DELETE',
      token,
    },
  )
}
