export type AdminUser = {
  id: number
  name: string
  email: string
  role: 'admin'
}

export type AuthSession = {
  token: string
  user: AdminUser
}

export type LoginCredentials = {
  email: string
  password: string
}
