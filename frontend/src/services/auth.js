import { authAPI } from './api';

export const authService = {
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      const { key: token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};
