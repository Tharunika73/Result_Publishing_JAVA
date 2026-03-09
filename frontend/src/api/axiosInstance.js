import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saerp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  ping: () => api.get('/auth/ping'),
}

// ─── Admin ───────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  importCsv: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/students/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getAuditLogs: (page = 0, size = 20) => api.get(`/admin/audit-logs?page=${page}&size=${size}`),
  getStudents: () => api.get('/admin/students'),
  getTeachers: () => api.get('/admin/teachers'),
}

// ─── COE ─────────────────────────────────────────────────
export const coeApi = {
  getExams: () => api.get('/coe/exams'),
  createExam: (data) => api.post('/coe/exams', data),
  generateSheets: (examId) => api.post(`/coe/exams/${examId}/generate-sheets`),
  getSheets: (examId) => api.get(`/coe/exams/${examId}/sheets`),
  assignTeacher: (data) => api.post('/coe/sheets/assign-teacher', data),
  publishResults: (examId) => api.post(`/coe/exams/${examId}/publish`),
  getAllResults: () => api.get('/coe/results'),
  searchResults: (q) => api.get(`/coe/results/search?q=${q}`),
  getChain: () => api.get('/coe/chain'),
  verifyChain: () => api.get('/coe/chain/verify'),
  getSubjects: () => api.get('/coe/subjects'),
}

// ─── Teacher ─────────────────────────────────────────────
export const teacherApi = {
  getSheets: () => api.get('/teacher/sheets'),
  submitMarks: (data) => api.post('/teacher/marks', data),
}

// ─── Student ─────────────────────────────────────────────
export const studentApi = {
  getResults: () => api.get('/student/results'),
  downloadPdf: () => api.get('/student/results/pdf', { responseType: 'blob' }),
  getProfile: () => api.get('/student/profile'),
  getExams: () => api.get('/student/exams'),
  getCourses: () => api.get('/student/courses'),
  registerCourse: (subjectId) => api.post(`/student/courses/${subjectId}/register`),
}

export default api
