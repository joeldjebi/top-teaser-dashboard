import { apiRequest } from '../../../lib/apiClient'

export type MonitoringOverview = {
  checkedAt: string
  scheduler: {
    isRunning: boolean
    isExecuting: boolean
    lastRunAt: string | null
    lastRunError: string | null
    nextRunAt: string | null
    queue: {
      queued: number
      running: number
      done: number
      failed: number
      recentJobs?: Array<{
        id: string
        campaignId: number
        campaignName: string
        attempts: number
        status: string
        source: string
        lastError: string | null
        enqueuedAt: string
      }>
    }
  }
  campaignsByStatus: Record<string, number>
  channelsByStatus: Record<string, number>
  activeProviders: Array<{ id: number; channel: string; name: string }>
  blockedCampaigns: Array<{
    id: number
    name: string
    status: string
    errorMessage: string | null
    updatedAt: string
  }>
  recentTechnicalErrors: Array<{ id: number; message: string; createdAt: string }>
  recentProviderEvents: Array<{
    provider: string
    eventType: string
    providerMessageId: string | null
    occurredAt: string
  }>
}

type ApiData<T> = {
  data: T
}

export function fetchMonitoringOverview(token: string) {
  return apiRequest<ApiData<MonitoringOverview>>('/api/monitoring', {
    token,
  })
}
