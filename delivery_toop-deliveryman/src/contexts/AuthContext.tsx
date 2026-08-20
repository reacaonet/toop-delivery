import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api'

interface User {
  _id: string
  email: string
  role: string
  name?: string
  deliveryman?: {
    _id: string
    name: string
    email: string
    phone?: string
    vehicleType?: string
    vehiclePlate?: string
    cpf?: string
    cnh?: string
    avatar?: string
    rating?: number
    totalDeliveries?: number
    active?: boolean
    documents?: {
      cnh?: string
      vehicleDocument?: string
      photo?: string
    }
  }
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  token: string | null
  deliverymanId: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const deliverymanId = user?.deliveryman?._id || null

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User
        if (parsed.role === 'deliveryman' || parsed.role === 'admin') {
          setToken(savedToken)
          setUser(parsed)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials)
    const newToken = response?.token
    const refreshToken = response?.refreshToken
    const userData = response?.user

    if (!newToken) {
      throw new Error('Credenciais inválidas')
    }

    localStorage.setItem('token', newToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    localStorage.setItem('user', JSON.stringify(userData ?? {}))
    setToken(newToken)
    setUser(userData ?? {})
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) return
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      const body = await response.json()
      const freshUser = body?.data?.user ?? body?.data
      if (freshUser) {
        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
      }
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        deliverymanId,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
