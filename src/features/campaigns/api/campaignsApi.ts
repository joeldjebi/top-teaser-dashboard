import { apiRequest } from '../../../lib/apiClient'
import type {
  Campaign,
  CampaignBulkStatus,
  CampaignChannelStatus,
  CampaignPayload,
  CampaignRecipient,
  CampaignSendQueuedResult,
  CampaignStats,
} from '../types/campaignTypes'

type ApiData<T> = {
  data: T
}

export function fetchCampaigns(token: string) {
  return apiRequest<ApiData<Campaign[]>>('/api/campaigns', {
    token,
  })
}

export function createCampaign(token: string, payload: CampaignPayload) {
  return apiRequest<ApiData<Campaign>>('/api/campaigns', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateCampaign(
  token: string,
  campaignId: number,
  payload: Partial<CampaignPayload>,
) {
  return apiRequest<ApiData<Campaign>>(`/api/campaigns/${campaignId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteCampaign(token: string, campaignId: number) {
  return apiRequest<null>(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
    token,
  })
}

export function prepareCampaign(token: string, campaignId: number) {
  return apiRequest<
    ApiData<{ campaign: Campaign; preparedRecipients: number; stats: CampaignStats }>
  >(`/api/campaigns/${campaignId}/prepare`, {
    method: 'POST',
    token,
  })
}

export function sendCampaign(token: string, campaignId: number) {
  return apiRequest<ApiData<CampaignSendQueuedResult>>(`/api/campaigns/${campaignId}/send`, {
    method: 'POST',
    token,
  })
}

export function syncCampaignBulkStatus(token: string, campaignId: number) {
  return apiRequest<
    ApiData<{
      bulkStatus: CampaignBulkStatus
      campaign: Campaign
      stats: CampaignStats
    }>
  >(`/api/campaigns/${campaignId}/bulk-status`, {
    token,
  })
}

export function cancelCampaign(token: string, campaignId: number) {
  return apiRequest<ApiData<Campaign>>(`/api/campaigns/${campaignId}/cancel`, {
    method: 'POST',
    token,
  })
}

export function fetchCampaignStats(token: string, campaignId: number) {
  return apiRequest<ApiData<CampaignStats>>(`/api/campaigns/${campaignId}/stats`, {
    token,
  })
}

export function fetchCampaignChannelStatuses(token: string, campaignId: number) {
  return apiRequest<ApiData<CampaignChannelStatus[]>>(
    `/api/campaigns/${campaignId}/channel-statuses`,
    {
      token,
    },
  )
}

export function fetchCampaignRecipients(token: string, campaignId: number) {
  return apiRequest<ApiData<CampaignRecipient[]>>(
    `/api/campaigns/${campaignId}/recipients`,
    {
      token,
    },
  )
}
