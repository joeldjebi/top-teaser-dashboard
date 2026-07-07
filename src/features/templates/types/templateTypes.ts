export type EmailTemplate = {
  id: number
  name: string
  subject: string
  htmlContent: string
  textContent: string | null
  createdAt: string
  updatedAt: string
}

export type TemplatePayload = {
  name: string
  subject: string
  htmlContent: string
  textContent?: string | null
}

export type TemplateFormValues = {
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
