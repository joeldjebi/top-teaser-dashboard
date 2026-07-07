import type { Contact } from '../../contacts/types/contactTypes'

export type CampaignStatus =
  | 'draft'
  | 'ready'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled'

export type CampaignSendMode = 'single' | 'bulk'

export type CampaignRecipientStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'bounced'
  | 'opened'
  | 'clicked'
  | 'unsubscribed'

export type Campaign = {
  id: number
  name: string
  subject: string
  templateId: number
  contactListId: number
  sendMode: CampaignSendMode
  status: CampaignStatus
  errorMessage: string | null
  scheduledAt: string | null
  sentAt: string | null
  recipientsCount: number
  createdAt: string
  updatedAt: string
}

export type CampaignPayload = {
  name: string
  subject: string
  templateId: number
  contactListId: number
  sendMode?: CampaignSendMode
  scheduledAt?: string | null
}

export type CampaignFormValues = {
  name: string
  subject: string
  templateId: string
  contactListId: string
  sendMode: CampaignSendMode
  scheduledAt: string
}

export type CampaignStats = {
  total: number
  pending: number
  sent: number
  failed: number
  bounced: number
  opened: number
  clicked: number
  unsubscribed: number
}

export type CampaignBulkStatus = {
  provider: string
  bulkRequestId: string
  status: 'accepted' | 'processing' | 'completed' | 'failed' | 'unknown'
  percentageCompleted?: number
  totalMessages?: number
  raw?: unknown
}

export type CampaignRecipient = {
  id: number
  campaignId: number
  contactId: number
  providerMessageId: string | null
  status: CampaignRecipientStatus
  errorMessage: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  contact: Contact
}
