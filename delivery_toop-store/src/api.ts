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

    return Promise.reject(error)
  },
)

export default api

export const branchService = {
  list: (companyId: string) => api.get(`/branches/company/${companyId}`),
  get: (id: string) => api.get(`/branches/${id}`),
  create: (data: any) => api.post('/branches', data),
  update: (id: string, data: any) => api.put(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
}

export const stockItemService = {
  list: (companyId: string) => api.get(`/stock-items/company/${companyId}`),
  get: (id: string) => api.get(`/stock-items/${id}`),
  create: (data: any) => api.post('/stock-items', data),
  update: (id: string, data: any) => api.put(`/stock-items/${id}`, data),
  delete: (id: string) => api.delete(`/stock-items/${id}`),
}

export const stockBatchService = {
  listByBranch: (branchId: string) => api.get(`/stock-batches/branch/${branchId}`),
  listByCompany: (companyId: string) => api.get(`/stock-batches/company/${companyId}`),
  get: (id: string) => api.get(`/stock-batches/${id}`),
  create: (data: any) => api.post('/stock-batches', data),
  update: (id: string, data: any) => api.put(`/stock-batches/${id}`, data),
  getAlerts: (companyId: string) => api.get(`/stock-batches/alerts/${companyId}`),
}

export const stockMovementService = {
  listByBranch: (branchId: string, params?: any) => api.get(`/stock-movements/branch/${branchId}`, { params }),
  listByCompany: (companyId: string, params?: any) => api.get(`/stock-movements/company/${companyId}`, { params }),
  get: (id: string) => api.get(`/stock-movements/${id}`),
  create: (data: any) => api.post('/stock-movements', data),
  entry: (data: any) => api.post('/stock-movements/entry', data),
  exit: (data: any) => api.post('/stock-movements/exit', data),
  summary: (branchId: string) => api.get(`/stock-movements/summary/${branchId}`),
}
