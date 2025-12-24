import api from './axios'

export default {
    // 1. 코스 목록 검색
    getCourseList(params) {
        return api.get('/api/v1/courses', { params })
    },

    // 2. 코스 상세 조회
    getCourseDetail(courseId) {
        return api.get(`/api/v1/courses/${courseId}`)
    },

    // 3. 코스 등록
    createCourse(formData) {
        return api.post('/api/v1/courses', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 4. 리뷰 등록
    createReview(courseId, formData) {
        return api.post(`/api/v1/courses/${courseId}/reviews`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 5. 스크랩 (토글)
    toggleScrap(courseId) {
        return api.post(`/api/v1/courses/${courseId}/scrap`)
    },

    // 6. 리뷰 목록 조회
    getReviewList(courseId, params) {
        return api.get(`/api/v1/courses/${courseId}/reviews`, { params })
    },

    // 7. 리뷰 삭제
    deleteReview(reviewId) {
        return api.delete(`/api/v1/courses/reviews/${reviewId}`)
    },

    // 8. 내 스크랩 코스 모아보기
    getMyScrapCourses(params) {
        return api.get('/api/v1/courses/scraps', { params })
    },

    // 9. 내가 만든 코스 조회
    getMyCourses(params) {
        return api.get('/api/v1/courses/my', { params })
    },

    // 10. 코스 수정
    updateCourse(courseId, formData) {
        return api.put(`/api/v1/courses/${courseId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 11. 코스 삭제
    deleteCourse(courseId) {
        return api.delete(`/api/v1/courses/${courseId}`)
    }
}
