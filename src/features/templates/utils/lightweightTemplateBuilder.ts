export type LightweightTemplateInput = {
  title: string
  message: string
  ctaLabel?: string
  ctaUrl?: string
  signature?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildLightweightTemplate(input: LightweightTemplateInput) {
  const safeTitle = escapeHtml(input.title)
  const paragraphs = normalizeLines(input.message)
  const safeSignature = input.signature?.trim()
    ? escapeHtml(input.signature.trim())
    : 'L’équipe Top Teaser'
  const hasCta = Boolean(input.ctaLabel?.trim() && input.ctaUrl?.trim())
  const safeCtaLabel = escapeHtml(input.ctaLabel?.trim() ?? '')
  const safeCtaUrl = escapeHtml(input.ctaUrl?.trim() ?? '')

  const htmlParagraphs = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#334155;">${escapeHtml(paragraph)}</p>`,
    )
    .join('')

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px;border-bottom:1px solid #e2e8f0;">
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0f172a;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 0 6px;">
                ${htmlParagraphs}
                ${
                  hasCta
                    ? `<p style="margin:22px 0;"><a href="${safeCtaUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 16px;font-size:14px;font-weight:700;">${safeCtaLabel}</a></p>`
                    : ''
                }
                <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#475569;">${safeSignature}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 0 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
                Email envoyé à {{email}}. <a href="{{unsubscribeUrl}}" style="color:#0f766e;">Se désabonner</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    input.title,
    '',
    ...paragraphs,
    '',
    hasCta ? `${input.ctaLabel}: ${input.ctaUrl}` : '',
    safeSignature.replace(/&amp;/g, '&'),
    '',
    'Se désabonner : {{unsubscribeUrl}}',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return { html, text }
}
