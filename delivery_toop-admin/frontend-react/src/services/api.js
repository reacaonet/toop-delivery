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
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
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

export const healthService = {
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
