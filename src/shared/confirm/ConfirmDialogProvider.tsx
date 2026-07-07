import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

export type ConfirmDialogOptions = {
  cancelLabel?: string
  confirmLabel?: string
  description?: string
  title: string
  variant?: ConfirmDialogVariant
}

type PendingConfirmation = Required<
  Pick<ConfirmDialogOptions, 'confirmLabel' | 'cancelLabel' | 'variant'>
> &
  Pick<ConfirmDialogOptions, 'title' | 'description'> & {
    resolve: (confirmed: boolean) => void
  }

type ConfirmDialogContextValue = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

const variantIcons = {
  danger: Trash2,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirmation | null>(null)
  const previousPendingRef = useRef<PendingConfirmation | null>(null)

  const close = useCallback(
    (confirmed: boolean) => {
      if (!pending) {
        return
      }

      pending.resolve(confirmed)
      setPending(null)
    },
    [pending],
  )

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    previousPendingRef.current?.resolve(false)

    return new Promise<boolean>((resolve) => {
      const nextPending: PendingConfirmation = {
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        variant: options.variant ?? 'info',
        resolve,
      }

      previousPendingRef.current = nextPending
      setPending(nextPending)
    })
  }, [])

  useEffect(() => {
    if (!pending) {
      previousPendingRef.current = null
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, pending])

  const value = useMemo(() => ({ confirm }), [confirm])
  const Icon = pending ? variantIcons[pending.variant] : Info

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}

      {pending ? (
        <div
          className="modal-backdrop confirm-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              close(false)
            }
          }}
          role="presentation"
        >
          <section
            aria-describedby={
              pending.description ? 'confirm-dialog-description' : undefined
            }
            aria-labelledby="confirm-dialog-title"
            className={`modal-panel confirm-dialog-panel confirm-dialog-${pending.variant}`}
            role="alertdialog"
          >
            <button
              aria-label="Fermer la confirmation"
              className="icon-button soft confirm-dialog-close"
              onClick={() => close(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="confirm-dialog-icon" aria-hidden="true">
              <Icon size={24} />
            </div>

            <div className="confirm-dialog-copy">
              <p className="eyebrow">Confirmation</p>
              <h2 id="confirm-dialog-title">{pending.title}</h2>
              {pending.description ? (
                <p className="muted" id="confirm-dialog-description">
                  {pending.description}
                </p>
              ) : null}
            </div>

            <div className="confirm-dialog-actions">
              <button
                className="secondary-button"
                onClick={() => close(false)}
                type="button"
              >
                {pending.cancelLabel}
              </button>
              <button
                className={`primary-button confirm-dialog-confirm ${pending.variant}`}
                onClick={() => close(true)}
                type="button"
              >
                {pending.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const value = useContext(ConfirmDialogContext)

  if (!value) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  }

  return value
}
