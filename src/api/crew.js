import axios from 'axios'

// Mock Data Generation
const generateMockCrews = (count) => {
    const regions = ['서울 강남구', '서울 마포구', '서울 영등포구', '서울 송파구', '경기 성남시']

    const times = ['평일 저녁', '주말 오전', '평일 아침', '주말 오후']
    const ages = ['2030', '3040', '전연령', '20대']
    const genders = ['혼성', '남성', '여성']

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Crew ${i + 1}`,
        location: regions[Math.floor(Math.random() * regions.length)],
        members: Math.floor(Math.random() * 200) + 10,
        pace: `${Math.floor(Math.random() * 4) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        image: `https://picsum.photos/seed/${i + 1}/300/200`,
        activityTime: times[Math.floor(Math.random() * times.length)],
        memberInfo: `${ages[Math.floor(Math.random() * ages.length)]} / ${genders[Math.floor(Math.random() * genders.length)]}`
    }))
}

const allCrews = generateMockCrews(50)

// Mock Votes Data (In-memory state)
const mockVotes = [
    {
        id: 1,
        title: '12월 회식 장소 투표',
        status: 'progress',
        endDate: '2024-12-30',
        maxParticipants: 20,
        total: 15,
        participants: []
    },
    {
        id: 2,
        title: '다음 주 LSD 코스 선정',
        status: 'closed',
        endDate: '2024-11-20',
        maxParticipants: 30,
        total: 5,
        participants: [
            { id: 1, name: '김러너', votedAt: '2024-11-19 10:00:00', status: 'pending' },
            { id: 2, name: '이초보', votedAt: '2024-11-19 10:05:00', status: 'approved' },
            { id: 3, name: '박고수', votedAt: '2024-11-19 09:30:00', status: 'pending' },
            { id: 4, name: '최조깅', votedAt: '2024-11-19 11:00:00', status: 'pending' },
            { id: 5, name: '정마라', votedAt: '2024-11-19 09:45:00', status: 'approved' }
        ]
    }
]

export default {
    getCrews(params) {
        // Simulate API call with delay
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...allCrews]

                // Filter by Search (Name or Location)
                if (params.search) {
                    const query = params.search.toLowerCase()
                    filtered = filtered.filter(c =>
                        c.name.toLowerCase().includes(query) ||
                        c.location.includes(query)
                    )
                }

                // Filter by Region
                if (params.region && params.region !== '전체') {
                    if (params.region === '서울') {
                        filtered = filtered.filter(c => c.location.startsWith('서울'))
                    } else {
                        filtered = filtered.filter(c => c.location === params.region)
                    }
                }

                // Filter by Pace Range
                if (params.paceRange && params.paceRange.length === 2) {
                    const [min, max] = params.paceRange
                    filtered = filtered.filter(c => {
                        const [minPace, secPace] = c.pace.split(':').map(Number)
                        const paceVal = minPace + (secPace / 60)
                        return paceVal >= min && paceVal <= max
                    })
                }

                // Filter by Time
                if (params.times && params.times.length > 0) {
                    filtered = filtered.filter(c => {
                        return params.times.some(t => c.activityTime.includes(t))
                    })
                }

                // Sorting
                if (params.sortBy) {
                    const direction = params.sortDirection === 'asc' ? 1 : -1
                    filtered.sort((a, b) => {
                        if (params.sortBy === 'latest') {
                            return (a.id - b.id) * direction // Assuming higher ID is newer
                        } else if (params.sortBy === 'popular') {
                            return (a.members - b.members) * direction
                        } else if (params.sortBy === 'pace') {
                            const getPaceVal = (paceStr) => {
                                const [min, sec] = paceStr.split(':').map(Number)
                                return min + (sec / 60)
                            }
                            return (getPaceVal(a.pace) - getPaceVal(b.pace)) * direction
                        }
                        return 0
                    })
                }

                // Pagination
                const page = params.page || 1
                const size = params.size || 12
                const start = (page - 1) * size
                const end = start + size
                const paginated = filtered.slice(start, end)

                resolve({
                    data: {
                        content: paginated,
                        totalElements: filtered.length,
                        totalPages: Math.ceil(filtered.length / size),
                        last: end >= filtered.length
                    }
                })
            }, 500)
        })
    },
    getCrew(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const crew = allCrews.find(c => c.id === parseInt(id)) || allCrews[0]
                // Enhance mock data for detail view
                const detailedCrew = {
                    ...crew,
                    rating: 4.8,
                    reviewCount: 124,
                    intro: '저희 크루는 "즐겁게 달리자"를 모토로 운영됩니다. 초보자부터 숙련자까지 모두 환영하며, 매주 다양한 코스에서 정기 러닝을 진행합니다. 함께 땀 흘리며 건강한 에너지를 나눠보세요!',
                    activityTime: crew.activityTime || '평일 저녁',
                    memberInfo: crew.memberInfo || '2030 / 혼성',
                    activities: [
                        '매주 화/목 저녁 8시 정기 러닝',
                        '월 1회 주말 장거리 러닝 (LSD)',
                        '분기별 마라톤 대회 단체 참가',
                        '러닝 후 가벼운 뒤풀이 (선택)'
                    ],
                    previewMembers: [
                        { id: 1, image: 'https://picsum.photos/seed/mem1/50/50' },
                        { id: 2, image: 'https://picsum.photos/seed/mem2/50/50' },
                        { id: 3, image: 'https://picsum.photos/seed/mem3/50/50' },
                        { id: 4, image: 'https://picsum.photos/seed/mem4/50/50' },
                        { id: 5, image: 'https://picsum.photos/seed/mem5/50/50' }
                    ]
                }
                resolve({ data: detailedCrew })
            }, 300)
        })
    },

    joinCrew(crewId, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Joining crew ${crewId} with data:`, data)
                resolve({ success: true })
            }, 1000)
        })
    },

    // Member Management API
    getRequests(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const requests = Array.from({ length: 5 }, (_, i) => ({
                    id: i + 1,
                    name: ['김러너', '이달림', '박런런', '최조깅', '정마라'][i],
                    age: 20 + Math.floor(Math.random() * 10),
                    gender: Math.random() > 0.5 ? '남' : '여',
                    location: ['서울 영등포구', '서울 마포구', '서울 강남구', '경기 성남시', '서울 송파구'][i],
                    pace: `6:${Math.floor(Math.random() * 50).toString().padStart(2, '0')}`,
                    message: '열심히 활동하겠습니다! 잘 부탁드립니다.',
                    date: '2024-11-20 14:32',
                    image: `https://picsum.photos/seed/req${i}/50/50`
                }))
                resolve({ data: requests })
            }, 500)
        })
    },

    approveRequest(crewId, requestId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true })
            }, 500)
        })
    },

    rejectRequest(crewId, requestId, reason) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true })
            }, 500)
        })
    },

    getMembers(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const roles = ['크루장', '매니저', '정회원']
                const members = Array.from({ length: 20 }, (_, i) => ({
                    id: i + 1,
                    name: `Member ${i + 1}`,
                    role: i === 0 ? '크루장' : (i < 3 ? '매니저' : '정회원'),
                    attendance: `${Math.floor(Math.random() * 10)}/10`,
                    distance: `${Math.floor(Math.random() * 100)}km`,
                    pace: `${Math.floor(Math.random() * 4) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    joinDate: '2024-01-15',
                    image: `https://picsum.photos/seed/mem${i}/50/50`
                }))
                resolve({ data: members })
            }, 500)
        })
    },

    updateMemberRole(crewId, memberId, role) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true })
            }, 500)
        })
    },

    kickMember(crewId, memberId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true })
            }, 500)
        })
    },

    getWithdrawnMembers(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const withdrawn = Array.from({ length: 3 }, (_, i) => ({
                    id: i + 1,
                    name: `Ex-Member ${i + 1}`,
                    withdrawDate: '2024-10-01',
                    reason: '개인 사정으로 인한 탈퇴',
                    image: `https://picsum.photos/seed/ex${i}/50/50`
                }))
                resolve({ data: withdrawn })
            }, 500)
        })
    },

    getDashboardData(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        notices: Array.from({ length: 3 }, (_, i) => ({
                            id: i + 1,
                            title: `[공지] 최근 공지사항 제목입니다. ${i + 1}`,
                            isPinned: i === 0,
                            date: '2024-11-24'
                        })),
                        myActivity: {
                            count: 3,
                            distance: 15.2,
                            time: 2.5
                        },
                        upcomingEvents: [
                            { id: 1, title: '정기 러닝', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], time: '19:30', location: '여의도 한강공원', participants: 12 },
                            { id: 2, title: '주말 LSD', date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], time: '07:00', location: '남산 둘레길', participants: 8 },
                            { id: 3, title: '번개 러닝', date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], time: '20:00', location: '석촌호수', participants: 5 }
                        ],
                        specialSession: {
                            id: 1,
                            title: '스냅 작가와 함께하는 인생샷 러닝',
                            date: '2024-12-01',
                            time: '19:00',
                            location: '반포 한강공원',
                            current: 7,
                            max: 10,
                            image: 'https://picsum.photos/seed/special/300/150'
                        },
                        recentPosts: [
                            { id: 1, title: '오늘 러닝 너무 좋았습니다!', author: '김러너', comments: 5 },
                            { id: 2, title: '러닝화 추천 부탁드려요', author: '이초보', comments: 12 },
                            { id: 3, title: '다음 주 마라톤 같이 가실 분?', author: '박고수', comments: 8 }
                        ],
                        mvp: [
                            { title: '출석왕', name: '김성실', image: 'https://picsum.photos/seed/mvp1/50/50' },
                            { title: '거리왕', name: '이장거리', image: 'https://picsum.photos/seed/mvp2/50/50' },
                            { title: '응원왕', name: '박활력', image: 'https://picsum.photos/seed/mvp3/50/50' },
                            { title: '열정왕', name: '최열정', image: 'https://picsum.photos/seed/mvp4/50/50' }
                        ]
                    }
                })
            }, 500)
        })
    },

    // Board API
    getPosts(crewId, params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const posts = Array.from({ length: 35 }, (_, i) => {
                    const category = ['공지', '가입인사', '자유'][Math.floor(Math.random() * 3)]
                    const authorRole = i % 5 === 0 ? '크루장' : (i % 7 === 0 ? '매니저' : null)
                    return {
                        id: i + 1,
                        category: category,
                        title: `${category} 게시글 제목입니다. ${i + 1}`,
                        content: '게시글 본문 내용입니다. 이 부분은 실제 데이터 연동 시 본문의 일부를 보여주게 됩니다. 게시글 본문 내용입니다. 이 부분은 실제 데이터 연동 시 본문의 일부를 보여주게 됩니다.',
                        author: `Member ${Math.floor(Math.random() * 20) + 1}`,
                        authorRole: authorRole,
                        date: '2024-11-24',
                        views: Math.floor(Math.random() * 100),
                        comments: Math.floor(Math.random() * 20)
                    }
                })

                let filtered = [...posts]

                // Filter by Category
                if (params.category && params.category !== '전체') {
                    filtered = filtered.filter(p => p.category === params.category)
                }

                // Filter by Search (Title)
                if (params.search) {
                    filtered = filtered.filter(p => p.title.toLowerCase().includes(params.search.toLowerCase()))
                }

                // Pagination
                const page = params.page || 1
                const size = params.size || 10
                const start = (page - 1) * size
                const end = start + size
                const paginated = filtered.slice(start, end)

                resolve({
                    data: paginated,
                    total: filtered.length
                })
            }, 500)
        })
    },

    getPost(crewId, postId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const post = {
                    id: parseInt(postId),
                    category: '자유',
                    title: `게시글 ${postId}의 제목입니다.`,
                    content: `게시글 ${postId}의 상세 내용입니다. \n\n이곳에는 게시글의 본문이 들어갑니다. 줄바꿈도 되고, \n여러 내용이 들어갈 수 있습니다.`,
                    author: '김러너',
                    authorRole: '정회원',
                    date: '2024-11-24 14:30',
                    views: 123,
                    comments: 5
                }
                resolve({ data: post })
            }, 300)
        })
    },

    createPost(crewId, postData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Creating post in crew ${crewId}:`, postData)
                resolve({ success: true })
            }, 500)
        })
    },

    getComments(crewId, postId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const comments = Array.from({ length: 5 }, (_, i) => ({
                    id: i + 1,
                    author: `User ${i + 1}`,
                    content: `댓글 내용입니다. ${i + 1}`,
                    date: '2024-11-24 15:00',
                    image: `https://picsum.photos/seed/comment${i}/50/50`
                }))
                resolve({ data: comments })
            }, 300)
        })
    },

    addComment(crewId, postId, commentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Adding comment to post ${postId} in crew ${crewId}:`, commentData)
                resolve({
                    success: true,
                    data: {
                        id: Date.now(),
                        author: '나(Me)',
                        content: commentData.content,
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        image: 'https://picsum.photos/seed/me/50/50'
                    }
                })
            }, 300)
        })
    },

    // Schedule API
    getEvents(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const today = new Date()
                const formatDate = (date) => date.toISOString().split('T')[0]

                const events = [
                    {
                        id: 1,
                        title: '정기 러닝',
                        date: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)), // +2 days
                        time: '19:30',
                        location: '여의도 한강공원',
                        type: 'regular',
                        participants: 5,
                        maxParticipants: 20,
                        content: '매주 진행하는 정기 러닝입니다. 초보자 환영!'
                    },
                    {
                        id: 2,
                        title: '주말 LSD',
                        date: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), // +5 days
                        time: '07:00',
                        location: '남산 둘레길',
                        type: 'special',
                        participants: 8,
                        maxParticipants: 15,
                        content: '주말 장거리 훈련입니다. 페이스 6:00/km'
                    },
                    {
                        id: 3,
                        title: '번개 러닝',
                        date: formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)), // +1 day
                        time: '20:00',
                        location: '석촌호수',
                        type: 'lightning',
                        participants: 3,
                        maxParticipants: 10,
                        content: '급 번개! 가볍게 뛰실 분 모여라'
                    }
                ]
                resolve({ data: events })
            }, 500)
        })
    },

    addEvent(crewId, eventData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Adding event to crew ${crewId}:`, eventData)
                resolve({
                    success: true,
                    data: {
                        id: Date.now(),
                        ...eventData,
                        participants: 1 // Creator joins automatically
                    }
                })
            }, 500)
        })
    },

    deleteEvent(crewId, eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Deleting event ${eventId} from crew ${crewId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    joinEvent(crewId, eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Joining event ${eventId} in crew ${crewId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    cancelJoinEvent(crewId, eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Canceling join for event ${eventId} in crew ${crewId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    updateEventParticipantStatus(crewId, eventId, participantId, status) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updating participant ${participantId} status to ${status} for event ${eventId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    confirmEvent(crewId, eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Confirming event ${eventId} in crew ${crewId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    completeEvent(crewId, eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Completing event ${eventId} in crew ${crewId}`)
                resolve({ success: true })
            }, 500)
        })
    },

    // Courses API
    getCrewCourses(crewId, params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('getCrewCourses params:', params)
                let courses = Array.from({ length: 12 }, (_, i) => ({
                    id: i + 1,
                    title: `Course ${i + 1}`,
                    distance: 5 + i,
                    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
                    image: `https://picsum.photos/seed/course${i}/300/200`
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

    getCrewCourseDetail(crewId, courseId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        id: courseId,
                        title: `Course ${courseId}`,
                        distance: 5 + parseInt(courseId),
                        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
                        image: `https://picsum.photos/seed/course${courseId}/600/400`,
                        savedImage: `https://picsum.photos/seed/course${courseId}_saved/600/400`,
                        sentiment: {
                            positive: ['경치가 좋아요', '달리기 편해요', '야경이 예뻐요'],
                            negative: ['사람이 많아요', '길이 좁아요', '벌레가 많아요']
                        },
                        reviews: [
                            { id: 1, user: '김러너', content: '최고의 코스입니다! 강추!', date: '2024-11-20' },
                            { id: 2, user: '이초보', content: '초보자가 뛰기에 조금 힘들었어요.', date: '2024-11-21' },
                            { id: 3, user: '박고수', content: '기록 측정하기 좋은 평지 코스네요.', date: '2024-11-22' }
                        ]
                    }
                })
            }, 500)
        })
    },

    getScrappedCourses(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const scrappedCourses = Array.from({ length: 5 }, (_, i) => ({
                    id: i + 1,
                    title: `스크랩한 코스 ${i + 1}`,
                    distance: 5 + i,
                    image: `https://picsum.photos/seed/course${i}/300/200`
                }))
                resolve({ data: scrappedCourses })
            }, 500)
        })
    },

    // Votes API
    getVotes(crewId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data: [...mockVotes] })
            }, 500)
        })
    },

    castVote(crewId, voteId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Casting vote for ${voteId} in crew ${crewId}`)
                const vote = mockVotes.find(v => v.id === voteId)
                if (vote) {
                    vote.total += 1
                    vote.participants.push({
                        id: 999, // Fixed ID for current user
                        name: '나(Me)',
                        votedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        status: 'pending'
                    })
                }
                resolve({ success: true })
            }, 500)
        })
    },

    confirmParticipant(crewId, voteId, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Confirming participant ${userId} for vote ${voteId} in crew ${crewId}`)
                const vote = mockVotes.find(v => v.id === voteId)
                if (vote) {
                    const participant = vote.participants.find(p => p.id === userId)
                    if (participant) participant.status = 'approved'
                }
                resolve({ success: true })
            }, 500)
        })
    },

    createVote(crewId, voteData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Creating vote in crew ${crewId}:`, voteData)
                const newVote = {
                    id: Date.now(),
                    ...voteData,
                    status: 'progress',
                    total: 0,
                    participants: []
                }
                mockVotes.unshift(newVote) // Add to beginning
                resolve({
                    success: true,
                    data: newVote
                })
            }, 500)
        })
    },

    // Notifications API
    getNotifications() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const now = new Date()
                const notifications = [
                    {
                        id: 1,
                        type: 'member',
                        title: '새로운 멤버 "박러너"님이 가입했습니다.',
                        crewName: '러닝 크루 A',
                        time: new Date(now.getTime() - 1000 * 60 * 5).toISOString() // 5m ago
                    },
                    {
                        id: 2,
                        type: 'vote',
                        title: '투표 "12월 회식 장소"가 등록되었습니다.',
                        crewName: '새벽 달리기',
                        time: new Date(now.getTime() - 1000 * 60 * 60).toISOString() // 1h ago
                    },
                    {
                        id: 3,
                        type: 'vote_closing',
                        title: '투표 "주말 LSD 코스" 마감 3시간 전입니다.',
                        crewName: '러닝 크루 A',
                        time: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString() // 2h ago
                    },
                    {
                        id: 4,
                        type: 'schedule',
                        title: '내일 오전 7시 "주말 LSD" 일정이 있습니다.',
                        crewName: '러닝 크루 A',
                        time: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString() // 12h ago
                    },
                    {
                        id: 5,
                        type: 'vote_closed',
                        title: '투표 "유니폼 디자인"이 마감되었습니다.',
                        crewName: '새벽 달리기',
                        time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2d ago
                    }
                ]
                resolve({ data: notifications })
            }, 500)
        })
    }
}



