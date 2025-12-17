import { defineStore } from 'pinia'
import aiApi from '../api/ai'

export const useAiStore = defineStore('ai', {
    state: () => ({
        step: 1,
        totalSteps: 4,
        answers: {
            location: null,
            pace: [6, 7], // Default 6:00 - 7:00
            timeSlots: [],
            purpose: null
        },
        recommendations: [],
        loading: false
    }),
    actions: {
        setStep(step) {
            this.step = step
        },
        nextStep() {
            if (this.step < this.totalSteps) {
                this.step++
            }
        },
        prevStep() {
            if (this.step > 1) {
                this.step--
            }
        },
        updateAnswer(key, value) {
            this.answers[key] = value
        },
        async getRecommendations() {
            this.loading = true
            try {
                const response = await aiApi.recommendCrews(this.answers)
                this.recommendations = response.data
                return true
            } catch (error) {
                console.error('AI Recommendation failed:', error)
                return false
            } finally {
                this.loading = false
            }
        },
        reset() {
            this.step = 1
            this.answers = {
                location: null,
                pace: [6, 7],
                timeSlots: [],
                purpose: null
            }
            this.recommendations = []
        }
    }
})
