import { defineStore } from 'pinia'
import courseApi from '../api/course'

export const useCourseStore = defineStore('course', {
    state: () => ({
        course: {
            name: '',
            description: '',
            path: [], // Array of {lat, lng}
            distance: 0
        },
        courses: [],
        isDrawing: true,
        loading: false,
        analyzing: false
    }),

    actions: {
        async fetchCourses(params) {
            this.loading = true
            try {
                const response = await courseApi.getCourses(params)
                this.courses = response.data
                return response.data
            } catch (error) {
                console.error('Failed to fetch courses:', error)
                return []
            } finally {
                this.loading = false
            }
        },

        startDrawing() {
            this.isDrawing = true
        },

        stopDrawing() {
            this.isDrawing = false
        },

        addPoint(point) {
            if (!this.isDrawing) return
            if (this.course.path.length >= 20) {
                alert('최대 20개의 핀만 생성할 수 있습니다.')
                return
            }
            this.course.path.push(point)
            this.calculateDistance()
        },

        undoPoint() {
            if (this.course.path.length > 0) {
                this.course.path.pop()
                this.calculateDistance()
            }
        },

        resetCourse() {
            this.course = {
                name: '',
                description: '',
                path: [],
                distance: 0
            }
            this.isDrawing = true
        },

        calculateDistance() {
            if (this.course.path.length < 2) {
                this.course.distance = 0
                return
            }

            let total = 0
            for (let i = 0; i < this.course.path.length - 1; i++) {
                total += this.getDistanceFromLatLonInKm(
                    this.course.path[i].lat, this.course.path[i].lng,
                    this.course.path[i + 1].lat, this.course.path[i + 1].lng
                )
            }
            this.course.distance = parseFloat(total.toFixed(2))
        },

        getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            const R = 6371
            const dLat = this.deg2rad(lat2 - lat1)
            const dLon = this.deg2rad(lon2 - lon1)
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const d = R * c
            return d
        },

        deg2rad(deg) {
            return deg * (Math.PI / 180)
        },

        async saveCourse(crewId = null) {
            this.loading = true
            try {
                const payload = { ...this.course, crewId }
                await courseApi.saveCourse(payload)
                return true
            } catch (error) {
                console.error('Failed to save course:', error)
                return false
            } finally {
                this.loading = false
            }
        }
    }
})
