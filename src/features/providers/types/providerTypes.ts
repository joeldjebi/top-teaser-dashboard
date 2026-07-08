export type MailProviderKey =
  | 'postmark'
  | 'sendgrid'
  | 'mailgun'
  | 'brevo'
  | 'amazon-ses'

export type CommunicationChannel = 'email' | 'sms' | 'whatsapp' | 'telegram'

export type MailProviderHealth = {
  configured: boolean
  missingConfig: string[]
}

export type MailProvider = {
  channel?: CommunicationChannel
  key: MailProviderKey
  name: string
  active: boolean
  health: MailProviderHealth
}

export type ActiveMailProvider = Omit<MailProvider, 'active'> & {
  health: MailProviderHealth
}

export type MailTestPayload = {
  to: {
    email: string
    name?: string
  }
  subject: string
  html: string
  text?: string
}

export type MailTestResult = {
  provider: MailProviderKey
  providerMessageId?: string
  status: 'sent' | 'queued'
}

export type ProviderConfigField = {
  key: string
  label: string
  secret: boolean
  inputType?: 'text' | 'password' | 'switch'
  configured: boolean
  value?: string
}

export type ProviderSettingsItem = {
  key: MailProviderKey
  fields: ProviderConfigField[]
}

export type MailSettings = {
  activeProvider: MailProviderKey
  from: string
  providers: ProviderSettingsItem[]
}

export type MailSettingsPayload = {
  provider: MailProviderKey
  from: string
  config: Record<string, string>
}

export type ProviderTestFormValues = {
  email: string
  name: string
  subject: string
  html: string
  text: string
}

export type ProviderSettingsFormValues = {
  provider: MailProviderKey
  from: string
  config: Record<string, string>
}

export type CommunicationProviderVariable = {
  key: string
  label: string
  secret: boolean
  required: boolean
  value?: string
}

export type CommunicationProviderLimits = {
  maxPerMinute: number
  maxPerHour: number
  maxPerDay: number
  batchSize: number
}

export type CommunicationProvider = {
  id: number
  channel: Exclude<CommunicationChannel, 'email'>
  name: string
  providerKey: string
  isActive: boolean
  variables: CommunicationProviderVariable[]
  limits: CommunicationProviderLimits
  createdAt: string
  updatedAt: string
}

export type CommunicationProviderPayload = {
  channel: Exclude<CommunicationChannel, 'email'>
  name: string
  providerKey: string
  isActive: boolean
  variables: CommunicationProviderVariable[]
  limits: CommunicationProviderLimits
}
