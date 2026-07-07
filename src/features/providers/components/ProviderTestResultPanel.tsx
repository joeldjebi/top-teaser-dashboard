import { CheckCircle2 } from 'lucide-react'
import type { MailTestResult } from '../types/providerTypes'

type ProviderTestResultPanelProps = {
  result: MailTestResult | null
}

export function ProviderTestResultPanel({ result }: ProviderTestResultPanelProps) {
  if (!result) {
    return null
  }

  return (
    <section className="provider-test-result">
      <CheckCircle2 size={20} />
      <div>
        <strong>Test accepté par {result.provider}</strong>
        <span>
          Statut : {result.status}
          {result.providerMessageId
            ? ` · Message ID : ${result.providerMessageId}`
            : ''}
        </span>
      </div>
    </section>
  )
}
