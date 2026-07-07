import type { Contact } from '../../contacts/types/contactTypes'

export type ContactList = {
  id: number
  name: string
  description: string | null
  contactsCount: number
  createdAt: string
  updatedAt: string
}

export type ContactListWithContacts = ContactList & {
  contacts: Contact[]
}

export type ContactListPayload = {
  name: string
  description?: string | null
}

export type ContactListFormValues = {
  name: string
  description: string
}
