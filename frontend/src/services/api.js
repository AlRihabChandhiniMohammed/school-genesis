import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        return api(err.config);
      } catch { window.location.href = '/login'; }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const classAPI = {
  list: () => api.get('/classes'),
  get: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  addStudents: (id, data) => api.post(`/classes/${id}/students`, data),
  performanceGroups: (id) => api.get(`/classes/${id}/performance-groups`),
};

export const quizAPI = {
  generate: (data) => api.post('/quizzes/generate', data),
  create: (data) => api.post('/quizzes', data),
  list: () => api.get('/quizzes'),
  get: (id) => api.get(`/quizzes/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  results: (id) => api.get(`/quizzes/${id}/results`),
};

export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  list: () => api.get('/assignments'),
  get: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  submissions: (id) => api.get(`/assignments/${id}/submissions`),
  grade: (id, subId, data) => api.put(`/assignments/${id}/grade/${subId}`, data),
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  generateQuiz: (data) => api.post('/ai/generate-quiz', data),
  summarize: (data) => api.post('/ai/summarize', data),
  analyzePerformance: (data) => api.post('/ai/analyze-performance', data),
  videoRecommendations: (params) => api.get('/ai/videos/recommend', { params }),
};

export const analyticsAPI = {
  class: (id) => api.get(`/analytics/class/${id}`),
  student: (id) => api.get(`/analytics/student/${id || ''}`),
};

export const groupAPI = {
  autoGenerate: (classId, data) => api.post(`/groups/auto-generate/${classId}`, data),
  list: (classId) => api.get(`/groups/class/${classId}`),
  update: (id, data) => api.put(`/groups/${id}`, data),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  logs: () => api.get('/admin/logs'),
};

export default api;
