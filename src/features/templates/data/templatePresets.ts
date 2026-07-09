import type { TemplateFormValues } from '../types/templateTypes'
import { buildLightweightTemplate } from '../utils/lightweightTemplateBuilder'

export type TemplatePreset = TemplateFormValues & {
  id: string
  category: string
  description: string
}

function preset(input: {
  id: string
  category: string
  channel?: TemplateFormValues['channel']
  name: string
  subject: string
  title: string
  message: string
  description: string
  ctaLabel?: string
  ctaUrl?: string
}) {
  const generated = buildLightweightTemplate({
    title: input.title,
    message: input.message,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    signature: 'L’équipe Top Teaser',
  })

  return {
    id: input.id,
    category: input.category,
    channel: input.channel ?? 'email',
    name: input.name,
    subject: input.subject,
    description: input.description,
    htmlContent: generated.html,
    textContent: generated.text,
  }
}

export const templatePresets: TemplatePreset[] = [
  preset({
    id: 'message-simple',
    category: 'Information',
    name: 'Message simple',
    subject: 'Bonjour {{fullName}}, une information pour vous',
    title: 'Bonjour {{fullName}},',
    description: 'Un email très léger pour informer sans surcharger.',
    message:
      'Nous avons une information utile à partager avec vous à {{commune}}.\n\nAjoutez votre message principal ici en restant clair, court et direct.',
  }),
  preset({
    id: 'offre-courte',
    category: 'Promotion',
    name: 'Offre courte',
    subject: '{{fullName}}, votre offre est disponible',
    title: 'Votre offre est disponible',
    description: 'Un format promotionnel sobre avec un seul appel à l’action.',
    message:
      'Bonjour {{fullName}},\n\nNous avons préparé une offre simple et limitée pour nos contacts à {{commune}}.\n\nConsultez les détails et profitez-en tant que l’offre est disponible.',
    ctaLabel: 'Voir l’offre',
    ctaUrl: 'https://example.com/offre',
  }),
  preset({
    id: 'invitation-courte',
    category: 'Événement',
    name: 'Invitation courte',
    subject: 'Invitation pour {{fullName}}',
    title: 'Vous êtes invité',
    description: 'Une invitation claire, sans mise en page lourde.',
    message:
      'Bonjour {{fullName}},\n\nNous organisons un rendez-vous pour notre communauté à {{commune}}, {{country}}.\n\nVotre place est réservée avec l’adresse {{email}}.',
    ctaLabel: 'Confirmer ma présence',
    ctaUrl: 'https://example.com/invitation',
  }),
  preset({
    id: 'relance-douce',
    category: 'Relance',
    name: 'Relance douce',
    subject: '{{fullName}}, petit rappel',
    title: 'Petit rappel',
    description: 'Un message de relance humain, court et lisible.',
    message:
      'Bonjour {{fullName}},\n\nNous revenons vers vous concernant notre précédent message.\n\nSi cela vous intéresse toujours, vous pouvez consulter les informations depuis le lien ci-dessous.',
    ctaLabel: 'Reprendre',
    ctaUrl: 'https://example.com',
  }),
  {
    id: 'sms-rappel-court',
    category: 'SMS',
    channel: 'sms',
    name: 'SMS rappel court',
    subject: 'Rappel SMS',
    description: 'Un SMS court avec personnalisation du contact.',
    htmlContent:
      'Bonjour {{fullName}}, rappel : votre information Top Teaser est disponible à {{commune}}. Répondez STOP pour ne plus recevoir nos messages.',
    textContent:
      'Bonjour {{fullName}}, rappel : votre information Top Teaser est disponible à {{commune}}. Répondez STOP pour ne plus recevoir nos messages.',
  },
  {
    id: 'whatsapp-offre-directe',
    category: 'WhatsApp',
    channel: 'whatsapp',
    name: 'WhatsApp offre directe',
    subject: 'Offre WhatsApp',
    description: 'Un message WhatsApp naturel, personnalisé et léger.',
    htmlContent:
      'Bonjour {{fullName}},\n\nNous avons une offre disponible pour vous à {{commune}}.\n\nDites-nous si vous souhaitez recevoir les détails.',
    textContent:
      'Bonjour {{fullName}},\n\nNous avons une offre disponible pour vous à {{commune}}.\n\nDites-nous si vous souhaitez recevoir les détails.',
  },
  {
    id: 'telegram-info-rapide',
    category: 'Telegram',
    channel: 'telegram',
    name: 'Telegram info rapide',
    subject: 'Information Telegram',
    description: 'Un message Telegram clair, court et réutilisable.',
    htmlContent:
      'Bonjour {{fullName}}, une nouvelle information Top Teaser est disponible pour {{commune}}, {{country}}.',
    textContent:
      'Bonjour {{fullName}}, une nouvelle information Top Teaser est disponible pour {{commune}}, {{country}}.',
  },
]
