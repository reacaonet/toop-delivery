import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success !== undefined && body.data !== undefined) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth', credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data?.data ?? response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const companyService = {
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data?.data ?? response.data;
  },
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },
  deleteCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data?.data ?? response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data?.data ?? response.data;
  },
  updateOrderStatus: async (id, status, deliverymanId) => {
    const payload = { status };
    if (deliverymanId) payload.deliverymanId = deliverymanId;
    const response = await api.put(`/orders/${id}/status`, payload);
    return response.data?.data ?? response.data;
  },
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data?.data ?? response.data;
  }
};

export const deliverymanService = {
  getDeliverymen: async () => {
    const response = await api.get('/deliverymen');
    return response.data?.data ?? response.data;
  },
  createDeliveryman: async (deliverymanData) => {
    const response = await api.post('/deliverymen', deliverymanData);
    return response.data;
  },
  updateDeliveryman: async (id, deliverymanData) => {
    const response = await api.put(`/deliverymen/${id}`, deliverymanData);
    return response.data;
  },
  deleteDeliveryman: async (id) => {
    const response = await api.delete(`/deliverymen/${id}`);
    return response.data;
  }
};

export const driverService = {
  getDrivers: async (params = {}) => {
    const response = await api.get('/drivers', { params });
    return response.data?.data ?? response.data;
  },
  getDriverById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data?.data ?? response.data;
  },
  createDriver: async (data) => {
    const response = await api.post('/drivers', data);
    return response.data;
  },
  updateDriver: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data;
  },
  deleteDriver: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
  findNearby: async (lat, lng, maxDistance = 5000) => {
    const response = await api.get('/drivers/nearby', { params: { lat, lng, maxDistance } });
    return response.data?.data ?? response.data;
  }
};

export const bookingService = {
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data?.data ?? response.data;
  },
  getStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data?.data ?? response.data;
  },
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data?.data ?? response.data;
  },
  cancelBooking: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason, cancelledBy: 'system' });
    return response.data?.data ?? response.data;
  }
};

export const paymentService = {
  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data?.data ?? response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data?.data ?? response.data;
  }
};

export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data?.data ?? response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data?.data ?? response.data;
  },
  createProduct: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export const bannerService = {
  getBanners: async (params = {}) => {
    const response = await api.get('/banners', { params });
    return response.data?.data ?? response.data;
  },
  createBanner: async (data) => {
    const response = await api.post('/banners', data);
    return response.data;
  },
  updateBanner: async (id, data) => {
    const response = await api.put(`/banners/${id}`, data);
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  }
};

export const promoService = {
  getPromos: async (params = {}) => {
    const response = await api.get('/promo', { params });
    return response.data?.data ?? response.data;
  },
  createPromo: async (data) => {
    const response = await api.post('/promo', data);
    return response.data;
  },
  updatePromo: async (id, data) => {
    const response = await api.put(`/promo/${id}`, data);
    return response.data;
  },
  togglePromo: async (id) => {
    const response = await api.patch(`/promo/${id}/toggle`);
    return response.data;
  },
  deletePromo: async (id) => {
    const response = await api.delete(`/promo/${id}`);
    return response.data;
  }
};

export const uploadService = {
  uploadSingle: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const response = await api.post('/upload/single', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const healthService = {
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data?.data ?? response.data;
  },
  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data?.data ?? response.data;
  }
};

export const walletService = {
  getBalance: async (driverId) => {
    const response = await api.get(`/wallet/balance`, { params: { driverId } });
    return response.data?.data ?? response.data;
  },
  getTransactions: async (driverId, params = {}) => {
    const response = await api.get(`/wallet/transactions`, { params: { driverId, ...params } });
    return response.data?.data ?? response.data;
  },
  credit: async (driverId, amount, description) => {
    const response = await api.post('/wallet/credit', { driverId, amount, description });
    return response.data?.data ?? response.data;
  },
  debit: async (driverId, amount, description) => {
    const response = await api.post('/wallet/debit', { driverId, amount, description });
    return response.data?.data ?? response.data;
  },
};

export default api;
