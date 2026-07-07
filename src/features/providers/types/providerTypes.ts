export type MailProviderKey =
  | 'postmark'
  | 'sendgrid'
  | 'mailgun'
  | 'brevo'
  | 'amazon-ses'

export type MailProviderHealth = {
  configured: boolean
  missingConfig: string[]
}

export type MailProvider = {
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
