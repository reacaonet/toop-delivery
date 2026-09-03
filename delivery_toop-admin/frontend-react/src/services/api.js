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
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data?.data ?? response.data;
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
  },
  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data?.data ?? response.data;
  },
  updateNotification: async (id, data) => {
    const response = await api.put(`/notifications/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data?.data ?? response.data;
  },
  createAndSend: async (data) => {
    const response = await api.post('/notifications/send', data);
    return response.data?.data ?? response.data;
  },
  subscribeTopic: async (data) => {
    const response = await api.post('/v2/notification-topic', data);
    return response.data?.data ?? response.data;
  },
  sendToTopic: async (data) => {
    const response = await api.post('/v2/notification-topic/send', data);
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

export const cashbackService = {
  getCampaigns: async (params = {}) => {
    const response = await api.get('/cashback/campaigns', { params });
    return response.data?.data ?? response.data;
  },
  createCampaign: async (data) => {
    const response = await api.post('/cashback/campaigns', data);
    return response.data?.data ?? response.data;
  },
  updateCampaign: async (id, data) => {
    const response = await api.put(`/cashback/campaigns/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteCampaign: async (id) => {
    const response = await api.delete(`/cashback/campaigns/${id}`);
    return response.data?.data ?? response.data;
  },
  getUsed: async (params = {}) => {
    const response = await api.get('/cashback/used/paginator', { params });
    return response.data?.data ?? response.data;
  },
  getCustomerBalance: async (customerId) => {
    const response = await api.get(`/cashback/customer/balance/${customerId}`);
    return response.data?.data ?? response.data;
  },
};

export const couponService = {
  getCoupons: async (params = {}) => {
    const response = await api.get('/coupon/paginator', { params });
    return response.data?.data ?? response.data;
  },
  createCoupon: async (data) => {
    const response = await api.post('/coupon', data);
    return response.data?.data ?? response.data;
  },
  updateCoupon: async (id, data) => {
    const response = await api.put(`/coupon/update/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupon/delete/${id}`);
    return response.data?.data ?? response.data;
  },
  getUsed: async (params = {}) => {
    const response = await api.get('/coupon/coupon-customer-paginator', { params });
    return response.data?.data ?? response.data;
  },
};

export const packingService = {
  getPackings: async (params = {}) => {
    const response = await api.get('/packing', { params });
    return response.data?.data ?? response.data;
  },
  createPacking: async (data) => {
    const response = await api.post('/packing', data);
    return response.data?.data ?? response.data;
  },
  updatePacking: async (id, data) => {
    const response = await api.put(`/packing/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deletePacking: async (id) => {
    const response = await api.delete(`/packing/${id}`);
    return response.data?.data ?? response.data;
  },
};

export const shopperService = {
  getShoppers: async (params = {}) => {
    const response = await api.get('/shopper/paginator', { params });
    return response.data?.data ?? response.data;
  },
  createShopper: async (data) => {
    const response = await api.post('/shopper', data);
    return response.data?.data ?? response.data;
  },
  updateShopper: async (id, data) => {
    const response = await api.put(`/shopper/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteShopper: async (id) => {
    const response = await api.delete(`/shopper/${id}`);
    return response.data?.data ?? response.data;
  },
};

export const franchiseService = {
  getFranchises: async (params = {}) => {
    const response = await api.get('/franchises', { params });
    return response.data?.data ?? response.data;
  },
  createFranchise: async (data) => {
    const response = await api.post('/franchises', data);
    return response.data?.data ?? response.data;
  },
  updateFranchise: async (id, data) => {
    const response = await api.put(`/franchises/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteFranchise: async (id) => {
    const response = await api.delete(`/franchises/${id}`);
    return response.data?.data ?? response.data;
  },
};

export const aclService = {
  getRoles: async (params = {}) => {
    const response = await api.get('/acl/roles', { params });
    return response.data?.data ?? response.data;
  },
  paginatorRoles: async (params = {}) => {
    const response = await api.get('/acl/roles/paginator', { params });
    return response.data?.data ?? response.data;
  },
  createRole: async (data) => {
    const response = await api.post('/acl/roles', data);
    return response.data?.data ?? response.data;
  },
  updateRole: async (id, data) => {
    const response = await api.put(`/acl/roles/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteRole: async (id) => {
    const response = await api.delete(`/acl/roles/${id}`);
    return response.data?.data ?? response.data;
  },
  getPermissions: async () => {
    const response = await api.get('/acl/permissions');
    return response.data?.data ?? response.data;
  },
  createPermission: async (data) => {
    const response = await api.post('/acl/permissions', data);
    return response.data?.data ?? response.data;
  },
  updatePermission: async (id, data) => {
    const response = await api.put(`/acl/permissions/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deletePermission: async (id) => {
    const response = await api.delete(`/acl/permissions/${id}`);
    return response.data?.data ?? response.data;
  },
};

export const accessGroupService = {
  getTree: async () => {
    const response = await api.get('/access-group/tree');
    return response.data?.data ?? response.data;
  },
  create: async (data) => {
    const response = await api.post('/access-group', data);
    return response.data?.data ?? response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/access-group/${id}`, data);
    return response.data?.data ?? response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/access-group/${id}`);
    return response.data?.data ?? response.data;
  },
  listModules: async () => {
    const response = await api.get('/settings/modules');
    return response.data?.data ?? response.data;
  },
  createModule: async (data) => {
    const response = await api.post('/settings/modules', data);
    return response.data?.data ?? response.data;
  },
  updateModule: async (id, data) => {
    const response = await api.put(`/settings/modules/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteModule: async (id) => {
    const response = await api.delete(`/settings/modules/${id}`);
    return response.data?.data ?? response.data;
  },
};

export const financeService = {
  listBalances: async (params = {}) => {
    const response = await api.get('/finance/balances', { params });
    return response.data?.data ?? response.data;
  },
  getCompanyBalance: async (id, params = {}) => {
    const response = await api.get(`/finance/balances/company/${id}`, { params });
    return response.data?.data ?? response.data;
  },

  listCostCenters: async (params = {}) => {
    const response = await api.get('/finance/cost-centers', { params });
    return response.data?.data ?? response.data;
  },
  createCostCenter: async (data) => {
    const response = await api.post('/finance/cost-centers', data);
    return response.data?.data ?? response.data;
  },
  updateCostCenter: async (id, data) => {
    const response = await api.put(`/finance/cost-centers/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteCostCenter: async (id) => {
    const response = await api.delete(`/finance/cost-centers/${id}`);
    return response.data?.data ?? response.data;
  },

  listTypePayments: async (params = {}) => {
    const response = await api.get('/finance/type-payments', { params });
    return response.data?.data ?? response.data;
  },
  createTypePayment: async (data) => {
    const response = await api.post('/finance/type-payments', data);
    return response.data?.data ?? response.data;
  },
  updateTypePayment: async (id, data) => {
    const response = await api.put(`/finance/type-payments/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteTypePayment: async (id) => {
    const response = await api.delete(`/finance/type-payments/${id}`);
    return response.data?.data ?? response.data;
  },

  listBanks: async (params = {}) => {
    const response = await api.get('/finance/banks', { params });
    return response.data?.data ?? response.data;
  },
  createBank: async (data) => {
    const response = await api.post('/finance/banks', data);
    return response.data?.data ?? response.data;
  },
  updateBank: async (id, data) => {
    const response = await api.put(`/finance/banks/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteBank: async (id) => {
    const response = await api.delete(`/finance/banks/${id}`);
    return response.data?.data ?? response.data;
  },

  listAgencies: async (params = {}) => {
    const response = await api.get('/finance/agencies', { params });
    return response.data?.data ?? response.data;
  },
  createAgency: async (data) => {
    const response = await api.post('/finance/agencies', data);
    return response.data?.data ?? response.data;
  },
  updateAgency: async (id, data) => {
    const response = await api.put(`/finance/agencies/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteAgency: async (id) => {
    const response = await api.delete(`/finance/agencies/${id}`);
    return response.data?.data ?? response.data;
  },

  listDigitalAccounts: async (params = {}) => {
    const response = await api.get('/finance/digital-accounts', { params });
    return response.data?.data ?? response.data;
  },
  createDigitalAccount: async (data) => {
    const response = await api.post('/finance/digital-accounts', data);
    return response.data?.data ?? response.data;
  },
  updateDigitalAccount: async (id, data) => {
    const response = await api.put(`/finance/digital-accounts/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteDigitalAccount: async (id) => {
    const response = await api.delete(`/finance/digital-accounts/${id}`);
    return response.data?.data ?? response.data;
  },
  getDigitalAccountBalance: async (id) => {
    const response = await api.get(`/finance/digital-accounts/${id}/balance`);
    return response.data?.data ?? response.data;
  },
  moveDigitalAccount: async (id, data) => {
    const response = await api.post(`/finance/digital-accounts/${id}/move`, data);
    return response.data?.data ?? response.data;
  },

  listChargebacks: async (params = {}) => {
    const response = await api.get('/finance/chargebacks', { params });
    return response.data?.data ?? response.data;
  },
  createChargeback: async (data) => {
    const response = await api.post('/finance/chargebacks', data);
    return response.data?.data ?? response.data;
  },
  updateChargeback: async (id, data) => {
    const response = await api.put(`/finance/chargebacks/${id}`, data);
    return response.data?.data ?? response.data;
  },
  deleteChargeback: async (id) => {
    const response = await api.delete(`/finance/chargebacks/${id}`);
    return response.data?.data ?? response.data;
  },
};

export default api;
