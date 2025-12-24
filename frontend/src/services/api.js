import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events/', { params }),
  getById: (id) => api.get(`/events/${id}/`),
  create: (data) => api.post('/events/', data),
  update: (id, data) => api.put(`/events/${id}/`, data),
  delete: (id) => api.delete(`/events/${id}/`),
  markInterested: (slug) => api.post(`/events/${slug}/mark_interested/`),
  markGoing: (slug) => api.post(`/events/${slug}/mark_going/`),
  getMyEvents: (type) => api.get('/events/my_events/', { params: { type } }),
  getFeatured: () => api.get('/events/featured/'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getById: (slug) => api.get(`/categories/${slug}/`),
};

// Reviews API
export const reviewsAPI = {
  getByEvent: (eventId) => api.get('/reviews/', { params: { event: eventId } }),
  create: (data) => api.post('/reviews/', data),
  update: (id, data) => api.put(`/reviews/${id}/`, data),
  delete: (id) => api.delete(`/reviews/${id}/`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
  getUnreadCount: () => api.get('/notifications/unread_count/'),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/registration/', userData),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
  updateProfile: (data) => api.patch('/auth/user/', data),
  changePassword: (data) => api.post('/auth/password/change/', data),
  resetPassword: (email) => api.post('/auth/password/reset/', { email }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/me/', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.patch('/users/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Helper функции
export const handleAPIError = (error) => {
  if (error.response) {
    // Сервер ответил с кодом ошибки
    return error.response.data?.detail || 
           error.response.data?.message || 
           'Произошла ошибка при обработке запроса';
  } else if (error.request) {
    // Запрос был отправлен, но ответа не было
    return 'Сервер не отвечает. Проверьте подключение к интернету';
  } else {
    // Что-то пошло не так при настройке запроса
    return error.message || 'Произошла неизвестная ошибка';
  }
};

export default api;