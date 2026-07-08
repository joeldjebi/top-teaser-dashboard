export type CrudPermission = {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export type PermissionResource =
  | 'overview'
  | 'contacts'
  | 'contactLists'
  | 'templates'
  | 'campaigns'
  | 'logs'
  | 'providers'
  | 'admins'

export type PermissionMatrix = Record<PermissionResource, CrudPermission>

export type AdminUser = {
  id: number
  name: string
  email: string
  role: 'admin' | 'super_admin'
  roleId: number | null
  roleName: string
  permissions: PermissionMatrix
}

export type AuthSession = {
  token: string
  user: AdminUser
}

export type LoginCredentials = {
  email: string
  password: string
}

export type BootstrapStatus = {
  canCreateSuperAdmin: boolean
}

export type CreateSuperAdminPayload = {
  name: string
  email: string
  password: string
}
