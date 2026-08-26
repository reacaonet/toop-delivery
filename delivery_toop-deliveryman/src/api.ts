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
  toggleDriverMode: async () => {
    const response = await api.put('/deliverymen/me/driver-mode')
    return response.data?.data ?? response.data
  },
  toggleDriverOnline: async (lat?: number, lng?: number) => {
    const body: Record<string, number> = {};
    if (lat != null && lng != null) { body.lat = lat; body.lng = lng; }
    const response = await api.put('/deliverymen/me/driver-online', body)
    return response.data?.data ?? response.data
  },
  toggleDriverAvailable: async () => {
    const response = await api.put('/deliverymen/me/driver-available')
    return response.data?.data ?? response.data
  },
  updateLocation: async (lat: number, lng: number) => {
    const response = await api.put('/deliverymen/me/location', { lat, lng })
    return response.data?.data ?? response.data
  },
  updateAddress: async (address: string, lat?: number, lng?: number) => {
    const response = await api.put('/deliverymen/me/address', { address, lat, lng })
    return response.data?.data ?? response.data
  },
  getProfile: async () => {
    const response = await api.get('/deliverymen/me')
    return response.data?.data ?? response.data
  },
  updateDocuments: async (documents: { cnh?: string; vehicleDocument?: string; photo?: string }) => {
    const response = await api.put('/deliverymen/me/documents', documents)
    return response.data?.data ?? response.data
  },
}

export const driverService = {
  toggleOnline: async () => {
    const response = await api.put('/drivers/me/online')
    return response.data?.data ?? response.data
  },
  toggleAvailability: async () => {
    const response = await api.put('/drivers/me/availability')
    return response.data?.data ?? response.data
  },
  updateLocation: async (lat: number, lng: number, heading?: number, speed?: number) => {
    const response = await api.put('/drivers/me/location', { lat, lng, heading, speed })
    return response.data?.data ?? response.data
  },
}

export const bookingService = {
  getBookings: async (params: Record<string, string | number> = {}) => {
    const response = await api.get('/bookings', { params })
    return response.data?.data ?? response.data
  },
  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data?.data ?? response.data
  },
  acceptBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/accept`, { driverModel: 'Deliveryman' })
    return response.data?.data ?? response.data
  },
  startBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/start`, { driverModel: 'Deliveryman' })
    return response.data?.data ?? response.data
  },
  completeBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/complete`, { driverModel: 'Deliveryman' })
    return response.data?.data ?? response.data
  },
  rejectBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/reject`, { driverModel: 'Deliveryman' })
    return response.data?.data ?? response.data
  },
  generateQRCode: async (id: string) => {
    const response = await api.put(`/bookings/${id}/qr-generate`)
    return response.data?.data ?? response.data
  },
  verifyQRCode: async (id: string, token: string) => {
    const response = await api.put(`/bookings/${id}/qr-verify`, { token })
    return response.data?.data ?? response.data
  },
}

export const walletService = {
  getBalance: async () => {
    const response = await api.get('/wallet/balance')
    return response.data?.data ?? response.data
  },
  getTransactions: async (params: Record<string, string | number> = {}) => {
    const response = await api.get('/wallet/transactions', { params })
    return response.data?.data ?? response.data
  },
  credit: async (amount: number, description?: string, bookingId?: string) => {
    const response = await api.post('/wallet/credit', { amount, description, bookingId })
    return response.data?.data ?? response.data
  },
  withdraw: async (amount: number, pixKey: string, pixType: string) => {
    const response = await api.post('/wallet/withdraw', { amount, pixKey, pixType })
    return response.data?.data ?? response.data
  },
}

export const messageService = {
  getMessages: async (bookingId: string, page = 1) => {
    const response = await api.get(`/messages/${bookingId}?page=${page}&limit=50`)
    return response.data?.data ?? response.data
  },
  send: async (bookingId: string, content: string) => {
    const response = await api.post(`/messages/${bookingId}`, { content })
    return response.data?.data ?? response.data
  },
  markAsRead: async (bookingId: string) => {
    const response = await api.put(`/messages/${bookingId}/read`)
    return response.data?.data ?? response.data
  },
  getUnreadCount: async (bookingId: string) => {
    const response = await api.get(`/messages/${bookingId}/unread`)
    return response.data?.data ?? response.data
  },
}

export default api
