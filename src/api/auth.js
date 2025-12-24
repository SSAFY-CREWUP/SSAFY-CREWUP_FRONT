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
            birthDate: data.birthdate,
            averagePace: data.pace,
            activityRegion: data.region
        })
    },
    getProfile() {
        return api.get('/api/v1/user/mypage')
    },
    updateProfile(data) {
        const formData = new FormData()

        // Create request object matching backend UserUpdateRequest
        const requestData = {
            nickname: data.nickname,
            gender: data.gender === 'male' ? 'MALE' : (data.gender === 'female' ? 'FEMALE' : data.gender),
            birthDate: data.birthdate,
            averagePace: data.pace,
            activityRegion: data.region
        }

        const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" })
        formData.append("request", jsonBlob)

        if (data.profileImage) {
            formData.append("profileImage", data.profileImage)
        }

        return api.put('/api/v1/user/edit/mypage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}