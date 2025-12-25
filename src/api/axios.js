import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

// Request interceptor to add sessionId
api.interceptors.request.use(config => {
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) {
        config.headers['X-Session-Id'] = sessionId
    }
    return config
})

export default api
