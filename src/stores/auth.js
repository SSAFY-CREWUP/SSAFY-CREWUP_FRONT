import { defineStore } from 'pinia'
import authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null,
        loading: false
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async login(credentials) {
            this.loading = true
            this.error = null
            try {
                const response = await authApi.login(credentials)
                const { token, user, isNewUser } = response.data

                this.token = token
                this.user = user

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                return { success: true, isNewUser }
            } catch (error) {
                this.error = error.message || 'Login failed'
                return { success: false }
            } finally {
                this.loading = false
            }
        },
        async submitOnboarding(data) {
            this.loading = true
            try {
                await authApi.submitOnboarding(data)
                return true
            } catch (error) {
                console.error('Onboarding failed:', error)
                return false
            } finally {
                this.loading = false
            }
        },
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        async signup(userData) {
            this.loading = true
            this.error = null
            try {
                const response = await authApi.signup(userData)
                const { token, user } = response.data

                this.token = token
                this.user = user

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                return true
            } catch (error) {
                this.error = error.message || 'Signup failed'
                return false
            } finally {
                this.loading = false
            }
        },
    }
})
