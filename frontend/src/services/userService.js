import api from './api';

export const userService = {
  async getUsers() {
    const { data } = await api.get('/users');
    return (data.data || []).map(u => ({
      ...u,
      avatar: u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`,
    }));
  },

  async getUser(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },

  async getManageableUsers(query = "") {
    const { data } = await api.get('/users/manageable', {
      params: query ? { q: query } : {},
    });
    return (data.data || []).map(u => ({
      ...u,
      avatar: u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`,
    }));
  },

  async updateUser(id, updates) {
    const { data } = await api.patch(`/users/${id}`, updates);
    return data.data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  async updateProfile(name) {
    const { data } = await api.patch('/users/profile', { name });
    return data.data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.post('/users/change-password', { currentPassword, newPassword });
    return data;
  },

  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async verifyEmail(email) {
    // Simulate a real API call to verify if a Gmail account exists
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple mock: fail if it contains 'fake' or 'invalid'
        if (email.toLowerCase().includes('fake') || email.toLowerCase().includes('invalid')) {
          reject({ response: { data: { message: "Google account does not exist." } } });
        } else {
          resolve({ success: true, message: "Gmail account verified." });
        }
      }, 1500);
    });
  },
};
