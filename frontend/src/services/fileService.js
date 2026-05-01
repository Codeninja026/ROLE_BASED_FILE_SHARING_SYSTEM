import api from './api';

export const fileService = {
  async getFiles() {
    const { data } = await api.get('/files/browse');
    return data.data?.files || [];
  },

  async getFolderContents(folderId = null) {
    const params = {};
    if (folderId) params.folderId = folderId;
    const { data } = await api.get('/files/browse', { params });
    return data.data || { folders: [], files: [], breadcrumbs: [] };
  },

  async createFolder(name, parentId = null) {
    const { data } = await api.post('/files/folders', { name, parentId });
    return data.data;
  },

  async deleteFolder(folderId) {
    const { data } = await api.delete(`/files/folders/${folderId}`);
    return data;
  },

  async getAllFiles() {
    const { data } = await api.get('/files/all');
    return data.data || [];
  },

  async getSharedFiles() {
    const { data } = await api.get('/files/shared');
    return data.data || [];
  },

  async getSharedFolders() {
    const { data } = await api.get('/files/folders/shared');
    return data.data || [];
  },

  async getStarred() {
    const { data } = await api.get('/files/starred');
    return data.data || { folders: [], files: [] };
  },

  async getTrash() {
    const { data } = await api.get('/files/trash');
    return data.data || [];
  },

  async uploadFile(file, folderId = null, onProgress = null, path = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    if (path) formData.append('path', path);

    const { data } = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct);
      } : undefined,
    });
    return data.data;
  },

  async downloadFile(fileId, fileName) {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadFolder(folderId, folderName) {
    const response = await api.get(`/files/folders/download/${folderId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${folderName}.zip` || 'folder.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async toggleStar(fileId) {
    const { data } = await api.patch(`/files/${fileId}/star`);
    return data.data;
  },

  async toggleFolderStar(folderId) {
    const { data } = await api.patch(`/files/folders/${folderId}/star`);
    return data.data;
  },

  async renameFile(fileId, name) {
    const { data } = await api.patch(`/files/${fileId}/rename`, { name });
    return data.data;
  },

  async renameFolder(folderId, name) {
    const { data } = await api.patch(`/files/folders/${folderId}/rename`, { name });
    return data.data;
  },

  async deleteFile(fileId) {
    const { data } = await api.delete(`/files/${fileId}`);
    return data.data;
  },

  async restoreFile(fileId) {
    const { data } = await api.patch(`/files/${fileId}/restore`);
    return data.data;
  },

  async permanentDelete(fileId) {
    const { data } = await api.delete(`/files/${fileId}/permanent`);
    return data;
  },

  async search(query, page = 0, size = 20, sort = 'createdAt', dir = 'desc') {
    const { data } = await api.get('/files/search', { params: { q: query, page, size, sort, dir } });
    return data.data;
  },

  async getMetrics() {
    const { data } = await api.get('/files/metrics');
    return data.data || {};
  },

  async shareFile(fileId, teamId, accessLevel, shareWithAll = false, email = null) {
    const payload = { fileId, accessLevel, shareWithAll };
    if (!shareWithAll && teamId) {
      payload.teamId = teamId;
    }
    if (email) {
      payload.email = email;
    }
    const { data } = await api.post('/shares', payload);
    return data.data;
  },

  async shareFolder(folderId, teamId, accessLevel, shareWithAll = false, email = null) {
    const payload = { folderId, accessLevel, shareWithAll };
    if (!shareWithAll && teamId) {
      payload.teamId = teamId;
    }
    if (email) {
      payload.email = email;
    }
    const { data } = await api.post('/shares', payload);
    return data.data;
  },

  async revokeAccess(fileId, userId) {
    const { data } = await api.delete(`/shares/${fileId}/users/${userId}`);
    return data;
  },

  async revokeFolderAccess(folderId, userId) {
    const { data } = await api.delete(`/shares/folders/${folderId}/users/${userId}`);
    return data;
  },

  async getFilePermissions(fileId) {
    const { data } = await api.get(`/shares/${fileId}`);
    return data.data || [];
  },

  async getFolderPermissions(folderId) {
    const { data } = await api.get(`/shares/folders/${folderId}`);
    return data.data || [];
  },

  async getNotifications() {
    const { data } = await api.get('/notifications');
    return data.data || [];
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.data?.count || 0;
  },

  async markAllRead() {
    await api.post('/notifications/mark-all-read');
  },

  async markRead(notificationId) {
    await api.post(`/notifications/${notificationId}/mark-read`);
  },

  async getActivities(action = null) {
    const params = action && action !== 'all' ? { action } : {};
    const { data } = await api.get('/activities', { params });
    return data.data || [];
  },

  async getDashboard() {
    const { data } = await api.get('/dashboard');
    return data.data || {};
  },
};
