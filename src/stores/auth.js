import { defineStore } from 'pinia'
import authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
    state: () => {
        let user = null
        try {
            const userStr = localStorage.getItem('user')
            if (userStr && userStr !== 'undefined') {
                user = JSON.parse(userStr)
            }
        } catch (e) {
            console.error('Error parsing user from localStorage:', e)
            localStorage.removeItem('user')
        }
        let token = localStorage.getItem('token')
        if (token === 'undefined') {
            token = null
            localStorage.removeItem('token')
        }

        return {
            user,
            token: token || null,
            error: null,
            loading: false
        }
    },
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
        async logout() {
            try {
                await authApi.logout()
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.user = null
                this.token = null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        },
        async signup(userData) {
            this.loading = true
            this.error = null
            try {
                const response = await authApi.signup(userData)

                if (response.data && response.data.token) {
                    const { token, user } = response.data
                    this.token = token
                    this.user = user
                    localStorage.setItem('token', token)
                    localStorage.setItem('user', JSON.stringify(user))
                }

                return true
            } catch (error) {
                this.error = error.message || 'Signup failed'
                return false
            } finally {
                this.loading = false
            }
        },
        async fetchProfile() {
            try {
                const response = await authApi.getProfile()
                if (response.data.status === 200) {
                    this.user = { ...this.user, ...response.data.data }
                    localStorage.setItem('user', JSON.stringify(this.user))
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            }
        },
        async updateProfile(data) {
            this.loading = true
            try {
                const response = await authApi.updateProfile(data)
                if (response.data.status === 200) {
                    // After successful update, fetch fresh profile data
                    await this.fetchProfile()
                    return true
                }
                return false
            } catch (error) {
                console.error('Update profile failed:', error)
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})
