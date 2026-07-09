export type TemplateChannel = 'email' | 'sms' | 'whatsapp' | 'telegram'

export type EmailTemplate = {
  id: number
  channel: TemplateChannel
  name: string
  subject: string
  htmlContent: string
  textContent: string | null
  createdAt: string
  updatedAt: string
}

export type TemplatePayload = {
  channel: TemplateChannel
  name: string
  subject: string
  htmlContent: string
  textContent?: string | null
}

export type TemplateFormValues = {
  channel: TemplateChannel
  name: string
  subject: string
  htmlContent: string
  textContent: string
}

export type RenderedTemplate = {
  subject: string
  html: string
  text: string | null
}
