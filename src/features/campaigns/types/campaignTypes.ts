import type { Contact } from '../../contacts/types/contactTypes'

export type CampaignStatus =
  | 'draft'
  | 'ready'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled'

export type CampaignSendMode = 'single' | 'bulk'
export type CampaignChannel = 'email' | 'sms' | 'whatsapp' | 'telegram'

export type CampaignChannelConfig = {
  id?: number
  campaignId?: number
  channel: CampaignChannel
  communicationProviderId: number | null
  templateId?: number | null
  sendMode: CampaignSendMode
  status?: CampaignStatus
  errorMessage?: string | null
  createdAt?: string
  updatedAt?: string
}

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
  channel: CampaignChannel
  communicationProviderId: number | null
  sendMode: CampaignSendMode
  channels: CampaignChannelConfig[]
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
  channel?: CampaignChannel
  communicationProviderId?: number | null
  sendMode?: CampaignSendMode
  channels?: CampaignChannelConfig[]
  scheduledAt?: string | null
}

export type CampaignChannelFormState = {
  enabled: boolean
  communicationProviderId: string
  templateId: string
  sendMode: CampaignSendMode
}

export type CampaignFormValues = {
  name: string
  subject: string
  templateId: string
  contactListId: string
  channels: Record<CampaignChannel, CampaignChannelFormState>
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

export type CampaignChannelStatus = {
  id: number
  channel: CampaignChannel
  providerName: string | null
  status: CampaignStatus
  errorMessage: string | null
  stats: {
    pending: number
    sent: number
    failed: number
    bounced: number
    opened: number
    clicked: number
    unsubscribed: number
  }
}

export type CampaignSendQueuedResult = {
  campaign: Campaign
  jobId: string
  message: string
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
