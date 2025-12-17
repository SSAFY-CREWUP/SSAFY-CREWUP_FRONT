import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000' // Placeholder base URL
})

export default {
    login(credentials) {
        // Mocking API response for now as no backend is running
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (credentials.email === 'test@crewup.com' && credentials.password === 'password') {
                    resolve({
                        data: {
                            token: 'mock-jwt-token',
                            user: { name: 'Test User', email: credentials.email },
                            isNewUser: false
                        }
                    })
                } else if (credentials.email === 'new@crewup.com' && credentials.password === 'password') {
                    resolve({
                        data: {
                            token: 'mock-jwt-token-new',
                            user: { name: 'New User', email: credentials.email },
                            isNewUser: true
                        }
                    })
                } else {
                    reject(new Error('Invalid credentials'))
                }
            }, 1000)
        })
        // return api.post('/api/auth/login', credentials)
    },
    signup(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        token: 'mock-jwt-token-new',
                        user: { name: userData.name, email: userData.email }
                    }
                })
            }, 1000)
        })
    },
    submitOnboarding(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Onboarding Data:', data)
                resolve({ success: true })
            }, 1000)
        })
    }
}
