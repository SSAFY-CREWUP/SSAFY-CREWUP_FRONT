import { defineStore } from 'pinia'
import userApi from '../api/user'

export const useUserStore = defineStore('user', {
    state: () => ({
        profile: null,
        loading: false
    }),
    actions: {
        async fetchProfile() {
            this.loading = true
            try {
                const response = await userApi.getProfile()
                this.profile = response.data
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            } finally {
                this.loading = false
            }
        },
        async updateProfile(data) {
            try {
                await userApi.updateProfile(data)
                // Update local state
                this.profile = { ...this.profile, ...data }
                return true
            } catch (error) {
                console.error('Failed to update profile:', error)
                return false
            }
        }
    }
})
