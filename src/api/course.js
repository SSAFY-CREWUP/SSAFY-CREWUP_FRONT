// Mock Course API

export default {
    saveCourse(courseData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Course Saved:', courseData)
                resolve({
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        ...courseData,
                        createdAt: new Date().toISOString()
                    }
                })
            }, 1000)
        })
    },

    getCourses(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let courses = Array.from({ length: 12 }, (_, i) => ({
                    id: i + 1,
                    title: `Course ${i + 1}`,
                    distance: 5 + i,
                    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
                    image: `https://picsum.photos/seed/course${i}/300/200`,
                    savedImage: `https://picsum.photos/seed/course${i}_saved/600/400`,
                    sentiment: {
                        positive: ['경치가 좋아요', '달리기 편해요', '야경이 예뻐요'],
                        negative: ['사람이 많아요', '길이 좁아요', '벌레가 많아요']
                    },
                    reviews: [
                        { id: 1, user: '김러너', content: '최고의 코스입니다! 강추!', date: '2024-11-20' },
                        { id: 2, user: '이초보', content: '초보자가 뛰기에 조금 힘들었어요.', date: '2024-11-21' }
                    ]
                }))

                // Filter by Difficulty
                if (params.difficulty && params.difficulty !== '전체') {
                    courses = courses.filter(c => c.difficulty === params.difficulty)
                }

                // Sort
                if (params.sort) {
                    if (params.sort === 'distance') {
                        courses.sort((a, b) => a.distance - b.distance)
                    } else if (params.sort === 'name') {
                        courses.sort((a, b) => a.title.localeCompare(b.title))
                    }
                }

                resolve({ data: courses })
            }, 500)
        })
    },

    getCourse(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        id,
                        name: '한강공원 러닝 코스',
                        description: '여의도 한강공원을 따라 달리는 상쾌한 코스입니다.',
                        distance: 5.2,
                        difficulty: 'easy',
                        path: [
                            { lat: 37.528, lng: 126.933 },
                            { lat: 37.529, lng: 126.934 },
                            { lat: 37.530, lng: 126.935 }
                        ]
                    }
                })
            }, 500)
        })
    },

    getElevation(coordinates) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock Elevation Data: Generate random elevation between 10m and 50m
                const elevations = coordinates.map((_, index) => {
                    // Create a somewhat smooth profile
                    return 20 + Math.sin(index * 0.5) * 10 + Math.random() * 5
                })
                resolve({ data: { elevations } })
            }, 500)
        })
    }
}
