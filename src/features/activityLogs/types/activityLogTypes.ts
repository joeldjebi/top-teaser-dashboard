export type ActivityLog = {
  id: number
  userId: number | null
  actorName: string | null
  actorEmail: string | null
  action: string
  resource: string
  resourceId: string | null
  message: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
