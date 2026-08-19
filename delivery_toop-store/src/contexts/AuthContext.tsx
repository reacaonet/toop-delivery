import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../api'

interface User {
  _id: string
  email: string
  role: string
  company: string | { _id: string; name: string }
}

interface AuthContextType {
  user: User | null
  companyId: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem('token'))

  const companyId = user?.company
    ? typeof user.company === 'string'
      ? user.company
      : user.company._id
    : null

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth', { email, password })
      const { user: u, token: t, refreshToken } = data
      localStorage.setItem('token', t)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(u))
      api.defaults.headers.common.Authorization = `Bearer ${t}`
      setUser(u)
      setAuthenticated(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common.Authorization
    setUser(null)
    setAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        companyId,
        login,
        logout,
        isAuthenticated: authenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
