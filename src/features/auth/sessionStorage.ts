import type { AuthSession } from './types'

const SESSION_KEY = 'top-teaser:auth-session'

export function readStoredSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function storeSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY)
}
