import { CheckCircle2, XCircle } from 'lucide-react'
import type { MailProvider } from '../types/providerTypes'

type ProviderStatusBadgeProps = {
  provider: Pick<MailProvider, 'active' | 'health'>
}

export function ProviderStatusBadge({ provider }: ProviderStatusBadgeProps) {
  if (provider.active && provider.health.configured) {
    return (
      <span className="provider-status-badge provider-status-active">
        <CheckCircle2 size={14} />
        Actif
      </span>
    )
  }

  if (provider.health.configured) {
    return (
      <span className="provider-status-badge provider-status-ready">
        <CheckCircle2 size={14} />
        Configuré
      </span>
    )
  }

  return (
    <span className="provider-status-badge provider-status-missing">
      <XCircle size={14} />
      À configurer
    </span>
  )
}
