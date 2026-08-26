import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        const newToken = data.data.token
        localStorage.setItem('token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 502 || error.response?.status === 503) {
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }
      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1
        await new Promise((r) => setTimeout(r, 1000 * originalRequest._retryCount))
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)

export default api

export const messageService = {
  getMessages: async (bookingId: string, page = 1) => {
    const { data } = await api.get(`/messages/${bookingId}?page=${page}&limit=50`)
    return data?.data ?? data
  },
  send: async (bookingId: string, content: string) => {
    const { data } = await api.post(`/messages/${bookingId}`, { content })
    return data?.data ?? data
  },
  markAsRead: async (bookingId: string) => {
    const { data } = await api.put(`/messages/${bookingId}/read`)
    return data?.data ?? data
  },
  getUnreadCount: async (bookingId: string) => {
    const { data } = await api.get(`/messages/${bookingId}/unread`)
    return data?.data ?? data
  },
}
