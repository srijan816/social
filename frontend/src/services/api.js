import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  register: (userData) =>
    api.post('/api/auth/register', userData),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

// Content API
export const contentAPI = {
  generateContent: (data) =>
    api.post('/api/content/generate', data),
  
  createPost: (postData) =>
    api.post('/api/content/posts', postData),
  
  getPosts: (params = {}) =>
    api.get('/api/content/posts', { params }),
  
  getPost: (postId) =>
    api.get(`/api/content/posts/${postId}`),
  
  generateVariations: (postId, count = 3) =>
    api.post(`/api/content/variations?post_id=${postId}&count=${count}`),
  
  createTemplate: (templateData) =>
    api.post('/api/content/templates', templateData),
  
  getTemplates: () =>
    api.get('/api/content/templates'),
  
  getTrendingTopics: (category = null) =>
    api.get('/api/content/trending-topics', { params: { category } }),
  
  getAIProviders: () =>
    api.get('/api/content/ai-providers'),
};

// Schedule API
export const scheduleAPI = {
  schedulePost: (scheduleData) =>
    api.post('/api/schedule/schedule', scheduleData),
  
  getScheduledPosts: (params = {}) =>
    api.get('/api/schedule/scheduled', { params }),
  
  cancelScheduledPost: (scheduledPostId) =>
    api.delete(`/api/schedule/scheduled/${scheduledPostId}`),
  
  getCalendarView: (startDate, endDate) =>
    api.get('/api/schedule/calendar', {
      params: { start_date: startDate, end_date: endDate }
    }),
  
  publishNow: (postId) =>
    api.post(`/api/schedule/publish-now/${postId}`),
};

// Platforms API
export const platformsAPI = {
  updateCredentials: (credentials) =>
    api.post('/api/platforms/credentials', credentials),
  
  updateAPIKeys: (apiKeys) =>
    api.post('/api/platforms/api-keys', apiKeys),
  
  getPlatformStatus: () =>
    api.get('/api/platforms/status'),
  
  removeCredentials: (platform) =>
    api.delete(`/api/platforms/credentials/${platform}`),
  
  getPlatformLimits: () =>
    api.get('/api/platforms/limits'),
  
  testConnection: (platform) =>
    api.post(`/api/platforms/test-connection/${platform}`),
};

export default api;