export type ContactStatus = 'active' | 'invalid' | 'bounced' | 'unsubscribed'

export type Contact = {
  id: number
  email: string
  fullName: string | null
  mobileNumber: string | null
  commune: string | null
  country: string | null
  firstName: string | null
  lastName: string | null
  status: ContactStatus
  unsubscribedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ContactPayload = {
  email: string
  fullName?: string | null
  mobileNumber?: string | null
  commune?: string | null
  country?: string | null
  firstName?: string | null
  lastName?: string | null
  status?: ContactStatus
}

export type ContactFormValues = {
  email: string
  fullName: string
  mobileNumber: string
  commune: string
  country: string
  status: ContactStatus
}

export type ContactImportRowStatus = 'imported' | 'duplicate' | 'invalid'

export type ContactImportSummaryRow = {
  rowNumber: number
  email: string | null
  status: ContactImportRowStatus
  reason: string | null
}

export type ContactImportSummary = {
  totalRows: number
  importedRows: number
  duplicateRows: number
  invalidRows: number
  rows: ContactImportSummaryRow[]
}

export type ContactImport = {
  id: number
  originalFilename: string
  status: 'completed' | 'failed'
  totalRows: number
  importedRows: number
  duplicateRows: number
  invalidRows: number
  summary: ContactImportSummary | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}
