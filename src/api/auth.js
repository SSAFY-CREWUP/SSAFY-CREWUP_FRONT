import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

export default {
    login(credentials) {
        return api.post('/api/v1/user/login', credentials)
    },
    logout() {
        return api.post('/api/v1/user/logout')
    },
    signup(userData) {
        const formData = new FormData()

        const requestData = {
            email: userData.email,
            password: userData.password,
            nickname: userData.name
        }

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" })
        formData.append("request", jsonBlob)

        if (userData.profileImage) {
            formData.append("profileImage", userData.profileImage)
        }

        return api.post('/api/v1/user/signup', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    submitOnboarding(data) {
        return api.put('/api/v1/user/add/info', {
            gender: data.gender === 'male' ? 'MALE' : 'FEMALE',
            birthDate: data.birthDate,
            averagePace: data.averagePace,
            activityRegion: data.region
        })
    }
}
