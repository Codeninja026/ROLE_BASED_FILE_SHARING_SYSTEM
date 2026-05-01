import api from './api';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.data) {
      localStorage.setItem('sv_token', data.data.token);
      localStorage.setItem('sv_user', JSON.stringify(data.data.user));
    }
    return data;
  },

  async register(name, email, password, role = 'user') {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    if (data.success && data.data) {
      localStorage.setItem('sv_token', data.data.token);
      localStorage.setItem('sv_user', JSON.stringify(data.data.user));
    }
    return data;
  },

  async googleLogin(googleId, email, name, avatarUrl) {
    const { data } = await api.post('/auth/google', { googleId, email, name, avatarUrl });
    if (data.success && data.data) {
      localStorage.setItem('sv_token', data.data.token);
      localStorage.setItem('sv_user', JSON.stringify(data.data.user));
    }
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    if (data.success && data.data) {
      localStorage.setItem('sv_user', JSON.stringify(data.data));
    }
    return data.data;
  },

  logout() {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    window.location.href = '/login';
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem('sv_user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  },

  getToken() {
    return localStorage.getItem('sv_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('sv_token');
  },
};
