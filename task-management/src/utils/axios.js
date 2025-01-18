import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expire olmuşsa veya authentication hatası varsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Kullanıcıyı çıkış yaptır
      store.dispatch(logout());
      
      // Login sayfasına yönlendir
      window.location.href = '/auth';
      
      return Promise.reject(error);
    }

    // Rate limiting hatası
    if (error.response?.status === 429) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 5000); // 5 saniye bekle ve tekrar dene
      });
    }

    // Network hatası
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.'));
    }

    // Strapi özel hata mesajları
    const message = error.response?.data?.error?.message || 
                   error.response?.data?.message || 
                   'Bir hata oluştu';

    return Promise.reject({
      ...error,
      message,
      statusCode: error.response?.status
    });
  }
);

// API helpers
export const apiHelpers = {
  // Dosya yükleme için özel header
  getUploadHeaders: () => ({
    'Content-Type': 'multipart/form-data',
  }),

  // Pagination parametreleri
  getPaginationQuery: (page = 1, pageSize = 10) => ({
    pagination: {
      page,
      pageSize,
    },
  }),

  // Sıralama parametreleri
  getSortQuery: (field, order = 'desc') => ({
    sort: [`${field}:${order}`],
  }),

  // Filtreleme parametreleri
  getFilterQuery: (filters) => ({
    filters: filters,
  }),

  // Populate parametreleri
  getPopulateQuery: (relations) => ({
    populate: relations,
  }),
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/local',
    register: '/auth/local/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },
  users: {
    me: '/users/me',
    profile: (id) => `/users/${id}`,
  },
  tasks: {
    base: '/project-tasks',
    single: (id) => `/project-tasks/${id}`,
    workPackages: (taskId) => `/project-tasks/${taskId}/work-packages`,
  },
  teams: {
    base: '/teams',
    single: (id) => `/teams/${id}`,
    members: (teamId) => `/teams/${teamId}/members`,
  },
  notifications: {
    base: '/notifications',
    single: (id) => `/notifications/${id}`,
    markAsRead: (id) => `/notifications/${id}/mark-as-read`,
  },
  upload: '/upload',
};

export default api;