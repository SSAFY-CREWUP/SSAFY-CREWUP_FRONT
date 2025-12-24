import { defineStore } from 'pinia'
import courseApi from '../api/course'

export const useCourseStore = defineStore('course', {
    state: () => ({
        course: {
            name: '',
            description: '',
            path: [], // Array of {lat, lng}
            distance: 0,
            expectedTime: null,
            difficulty: 'Normal',
            thumbnailFile: null,
            thumbnailPreview: null
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

        insertPoint(index, point) {
            if (this.course.path.length >= 20) {
                alert('최대 20개의 핀만 생성할 수 있습니다.')
                return
            }
            // Insert at specific index (splice)
            this.course.path.splice(index, 0, point)
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
                distance: 0,
                expectedTime: null,
                difficulty: 'Normal',
                thumbnailFile: null,
                thumbnailPreview: null
            }
            this.isDrawing = true
        },

        calculateDistance() {
            if (this.course.path.length < 2) {
                this.course.distance = 0
                this.course.expectedTime = 0
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

            // Auto-calculate expected time: 6 min per 1 km
            // Use Math.ceil or Math.round? "Around 6 minutes" -> Math.round is fine.
            this.course.expectedTime = Math.round(this.course.distance * 6)
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
                // Prepare FormData
                const formData = new FormData()

                // CourseCreateRequest DTO
                const requestDto = {
                    title: this.course.name,
                    description: this.course.description,
                    path: this.course.path, // List<PointDto> {lat, lng}
                    distance: Math.round(this.course.distance * 1000), // Convert Km to Meters (Integer)
                    expectedTime: this.course.expectedTime,
                    difficulty: this.course.difficulty.toUpperCase(), // Ensure uppercase for Enum
                    crewId: crewId
                }

                formData.append('data', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }))

                if (this.course.thumbnailFile) {
                    // Backend expects 'image' key for file
                    formData.append('image', this.course.thumbnailFile)
                }

                await courseApi.createCourse(formData)
                return true
            } catch (error) {
                console.error('Failed to save course:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        async fetchCourseDetailAction(courseId) {
            this.loading = true
            try {
                const response = await courseApi.getCourseDetail(courseId)
                const data = response.data.data

                // Map API data to Store State
                this.course.name = data.title
                this.course.description = data.description
                this.course.path = data.path || []
                this.course.distance = data.distance ? parseFloat((data.distance / 1000).toFixed(2)) : 0 // Meters to Km
                this.course.expectedTime = data.expectedTime

                // Difficulty Mapping (UPPERCASE -> Title Case)
                const diffMap = { 'EASY': 'Easy', 'NORMAL': 'Normal', 'HARD': 'Hard' }
                this.course.difficulty = diffMap[data.difficulty] || 'Normal'

                this.course.thumbnailPreview = data.thumbnail // URL
                this.course.thumbnailFile = null // Reset file input

                this.isDrawing = true // Enable map interactions
                return true
            } catch (error) {
                console.error('Failed to fetch course detail:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        async updateCourseAction(courseId) {
            this.loading = true
            try {
                const formData = new FormData()

                // CourseCreateRequest DTO (Same structure)
                const requestDto = {
                    title: this.course.name,
                    description: this.course.description,
                    path: this.course.path,
                    distance: Math.round(this.course.distance * 1000),
                    expectedTime: this.course.expectedTime,
                    difficulty: this.course.difficulty.toUpperCase(),
                    crewId: null // Not needed for update usually, or keep original
                }

                formData.append('data', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }))

                if (this.course.thumbnailFile) {
                    formData.append('image', this.course.thumbnailFile)
                }

                await courseApi.updateCourse(courseId, formData)
                return true
            } catch (error) {
                console.error('Failed to update course:', error)
                return false
            } finally {
                this.loading = false
            }
        }
    }
})
