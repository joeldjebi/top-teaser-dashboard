import type { CampaignRecipientStatus } from '../../campaigns/types/campaignTypes'

export type EmailLog = {
  id: number
  campaignId: number
  campaignName: string
  contactId: number
  email: string
  providerMessageId: string | null
  status: CampaignRecipientStatus
  errorMessage: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export type TechnicalLog = {
  id: number
  level: 'debug' | 'info' | 'warning' | 'error'
  scope: string
  event: string
  message: string
  campaignId: number | null
  campaignChannelId: number | null
  provider: string | null
  payload: unknown
  response: unknown
  error: string | null
  createdAt: string
}
