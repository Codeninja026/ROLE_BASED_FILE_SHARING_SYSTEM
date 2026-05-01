import api from './api';

export const settingsService = {
  async getSettings() {
    const { data } = await api.get('/settings');
    return data.data || {};
  },

  async updateSettings(settings) {
    const { data } = await api.patch('/settings', settings);
    return data.data;
  },
};
