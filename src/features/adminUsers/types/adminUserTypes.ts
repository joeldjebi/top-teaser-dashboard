import type { PermissionMatrix } from '../../auth/types'

export type AdminRole = {
  id: number
  name: string
  description: string | null
  permissions: PermissionMatrix
  createdAt: string
  updatedAt: string
}

export type AdminAccount = {
  id: number
  name: string
  email: string
  role: 'admin' | 'super_admin'
  roleId: number | null
  roleName: string
  isActive: boolean
  isProtected: boolean
  permissions: PermissionMatrix | null
  createdAt: string
  updatedAt: string
}

export type AdminRolePayload = {
  name: string
  description?: string | null
  permissions: PermissionMatrix
}

export type AdminAccountPayload = {
  name: string
  email: string
  roleId: number
  isActive?: boolean
}

export type AdminAccountCreatedResponse = {
  data: AdminAccount
  invitationEmailSent: boolean
  invitationUrl?: string
  message: string
}
