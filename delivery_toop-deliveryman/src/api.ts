import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.success !== undefined && body.data !== undefined) {
      response.data = body.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        originalRequest._retry = true
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken })
          const { token: newToken } = response.data?.data ?? response.data
          if (newToken) {
            localStorage.setItem('token', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth', credentials)
    return response.data
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },
}

export const orderService = {
  getOrders: async (params: Record<string, string | number> = {}) => {
    const response = await api.get('/orders', { params })
    return response.data?.data ?? response.data
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`)
    return response.data?.data ?? response.data
  },
  updateOrderStatus: async (id: string, status: string, deliverymanId?: string) => {
    const payload: Record<string, string> = { status }
    if (deliverymanId) {
      payload.deliverymanId = deliverymanId
    }
    const response = await api.put(`/orders/${id}/status`, payload)
    return response.data?.data ?? response.data
  },
  acceptOrder: async (id: string) => {
    const response = await api.put(`/orders/${id}/accept`)
    return response.data?.data ?? response.data
  },
}

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings')
    return response.data?.data ?? response.data
  },
}

export const deliverymanService = {
  toggleAvailability: async () => {
    const response = await api.put('/deliverymen/me/availability')
    return response.data?.data ?? response.data
  },
}

export default api
