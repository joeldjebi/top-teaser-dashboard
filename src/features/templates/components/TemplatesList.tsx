import { Edit3, Eye, Send, Trash2 } from 'lucide-react'
import type { EmailTemplate } from '../types/templateTypes'

type TemplatesListProps = {
  onDelete: (template: EmailTemplate) => void
  onEdit: (template: EmailTemplate) => void
  onPreview: (template: EmailTemplate) => void
  onTestSend: (template: EmailTemplate) => void
  templates: EmailTemplate[]
}

export function TemplatesList({
  onDelete,
  onEdit,
  onPreview,
  onTestSend,
  templates,
}: TemplatesListProps) {
  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucun template</strong>
        <span>Créez votre premier template pour préparer vos campagnes.</span>
      </div>
    )
  }

  return (
    <div className="template-list">
      {templates.map((template) => (
        <article className="template-card" key={template.id}>
          <div>
            <p className="eyebrow">{formatTemplateChannel(template.channel)}</p>
            <h3>{template.name}</h3>
            <p>{template.subject}</p>
          </div>
          <div className="template-actions">
            <button
              className="icon-button soft"
              onClick={() => onPreview(template)}
              title="Aperçu"
              type="button"
            >
              <Eye size={17} />
            </button>
            {template.channel === 'email' ? (
              <button
                className="icon-button soft"
                onClick={() => onTestSend(template)}
                title="Envoi test"
                type="button"
              >
                <Send size={17} />
              </button>
            ) : null}
            <button
              className="icon-button soft"
              onClick={() => onEdit(template)}
              title="Modifier"
              type="button"
            >
              <Edit3 size={17} />
            </button>
            <button
              className="icon-button danger"
              onClick={() => onDelete(template)}
              title="Supprimer"
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function formatTemplateChannel(channel: EmailTemplate['channel']) {
  const labels: Record<EmailTemplate['channel'], string> = {
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
  }

  return labels[channel]
}
