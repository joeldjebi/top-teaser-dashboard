import { Server, ShieldCheck } from 'lucide-react'
import { ProviderStatusBadge } from './ProviderStatusBadge'
import type { MailProvider } from '../types/providerTypes'

type ProvidersGridProps = {
  providers: MailProvider[]
}

export function ProvidersGrid({ providers }: ProvidersGridProps) {
  if (providers.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucun provider</strong>
        <span>Les providers configurables apparaîtront ici.</span>
      </div>
    )
  }

  return (
    <div className="providers-grid">
      {providers.map((provider) => (
        <article className="provider-card" key={provider.key}>
          <div className="provider-card-header">
            <div className="provider-icon">
              {provider.active ? <ShieldCheck size={20} /> : <Server size={20} />}
            </div>
            <ProviderStatusBadge provider={provider} />
          </div>

          <div>
            <p className="eyebrow">{provider.key}</p>
            <h3>{provider.name}</h3>
            <p>
              {provider.health.configured
                ? 'Toutes les variables requises sont présentes.'
                : `${provider.health.missingConfig.length} variable(s) manquante(s).`}
            </p>
          </div>

          {!provider.health.configured ? (
            <div className="missing-config-list">
              {provider.health.missingConfig.map((item) => (
                <code key={item}>{item}</code>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
