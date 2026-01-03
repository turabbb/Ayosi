import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // Increased timeout for production (Render cold starts)
});

// Add request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend might not be running');
    } else if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/users/register', { username, email, password });
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return response.data;
    } catch (error) {
      console.error('Logout API error:', error);
      throw error;
    }
  },
};

// Products API calls
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Get products API error:', error);
      throw error;
    }
  },
  
  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Get featured products API error:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get product by ID API error:', error);
      throw error;
    }
  },
  
  create: async (productData: any) => {
    try {
      // Check if productData is FormData or regular object
      const config = productData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await api.post('/products', productData, config);
      return response.data;
    } catch (error) {
      console.error('Create product API error:', error);
      throw error;
    }
  },
  
  update: async (id: string, productData: any) => {
    try {
      // Check if productData is FormData or regular object
      const config = productData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await api.put(`/products/${id}`, productData, config);
      return response.data;
    } catch (error) {
      console.error('Update product API error:', error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete product API error:', error);
      throw error;
    }
  },
};

// Orders API calls
export const ordersAPI = {
  create: async (orderData: FormData) => {
    try {
      const response = await api.post('/orders', orderData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create order API error:', error);
      throw error;
    }
  },
  
  getByTrackingNumber: async (trackingNumber: string) => {
    try {
      const response = await api.get(`/orders/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      console.error('Get order by tracking number API error:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get order by ID API error:', error);
      throw error;
    }
  },
  
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/user');
      return response.data;
    } catch (error) {
      console.error('Get user orders API error:', error);
      throw error;
    }
  },
  
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Get all orders API error:', error);
      throw error;
    }
  },
  
  updateStatus: async (id: string, statusData: {
    status: string;
    courierCompany?: string;
    shipmentDescription?: string;
    estimatedDelivery?: string;
  }) => {
    try {
      const response = await api.put(`/orders/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update order status API error:', error);
      throw error;
    }
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    try {
      const response = await api.put(`/orders/${id}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error('Update payment status API error:', error);
      throw error;
    }
  },
};

export default api;
