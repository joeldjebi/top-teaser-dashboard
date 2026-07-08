import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchCurrentUser, login, logout } from './api/authApi'
import {
  clearStoredSession,
  readStoredSession,
  storeSession,
} from './sessionStorage'
import type { AdminUser, LoginCredentials } from './types'

type AuthContextValue = {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  loginAdmin: (credentials: LoginCredentials) => Promise<void>
  logoutAdmin: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const session = readStoredSession()

    if (!session) {
      setIsBootstrapping(false)
      return
    }

    setToken(session.token)
    fetchCurrentUser(session.token)
      .then(({ data }) => {
        setUser(data)
        storeSession({
          token: session.token,
          user: data,
        })
      })
      .catch(() => {
        clearStoredSession()
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [])

  const loginAdmin = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await login(credentials)
    storeSession(data)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logoutAdmin = useCallback(async () => {
    const currentToken = token

    clearStoredSession()
    setToken(null)
    setUser(null)

    if (currentToken) {
      await logout(currentToken).catch(() => undefined)
    }
  }, [token])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const { data } = await fetchCurrentUser(token)
    setUser(data)
    storeSession({ token, user: data })
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBootstrapping,
      loginAdmin,
      logoutAdmin,
      refreshUser,
    }),
    [isBootstrapping, loginAdmin, logoutAdmin, refreshUser, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}
