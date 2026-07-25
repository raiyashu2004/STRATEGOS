import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const api = axios.create({ baseURL: BASE, timeout: 15000 })

export const uploadFile = async (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const loadSample = (key) => api.get(`/sample/${key}`)

export const startAnalysis = (sessionId, question, provider) => {
  const url = `${BASE}/analyze?session_id=${encodeURIComponent(sessionId)}&question=${encodeURIComponent(question)}&provider=${provider}`
  return new EventSource(url)
}

// MERN MongoDB History API
export const saveReportToMongoDB = (reportData) => api.post('/reports', reportData)
export const getMongoHistory = () => api.get('/history')
export const clearMongoHistory = () => api.delete('/history')
