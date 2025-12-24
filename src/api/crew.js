import axios from 'axios'
import api from './axios'
// Mock Data Generation
const generateMockCrews = (count) => {
    // Import constants concepts here (mocking imports for simplicity in single file var scope if needed, but better to use raw strings matching constants)
    const regions = [
        '서울 강남구', '서울 마포구', '서울 영등포구', '서울 송파구', '경기 성남시',
        '서울 강서구', '서울 관악구', '경기 수원시', '부산 해운대구'
    ]
    const times = [
        '오전 (06:00 ~ 12:00)',
        '점심 (12:00 ~ 14:00)',
        '저녁 (18:00 ~ 21:00)',
        '야간 (21:00 ~ 24:00)'
    ]
    const ageOptions = ['전연령', '1020', '2030', '3040', '4050']
    const genderOptions = ['모두', '남성', '여성']
    return Array.from({ length: count }, (_, i) => {
        const age = ageOptions[Math.floor(Math.random() * ageOptions.length)]
        const gender = genderOptions[Math.floor(Math.random() * genderOptions.length)]

        return {
            id: i + 1,
            name: `Run Crew ${i + 1}`,
            location: regions[Math.floor(Math.random() * regions.length)],
            members: Math.floor(Math.random() * 200) + 5,
            pace: `${Math.floor(Math.random() * 4) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            image: `https://picsum.photos/seed/crew${i + 1}/400/250`,
            activityTime: times[Math.floor(Math.random() * times.length)],
            ageRange: age,
            genderLimit: gender,
            memberInfo: `${age} / ${gender}` // For display convenience
        }
    })
}
const allCrews = generateMockCrews(60)
// Helper to convert pace string "5:30" to float 5.5
const parsePace = (paceStr) => {
    const [min, sec] = paceStr.split(':').map(Number)
    return min + (sec / 60)
}
// Advanced Vote Mock Data
const mockVoteData = [
    {
        id: 1,
        title: "12월 정기 회식 장소 투표 (복수 불가, 기명)",
        endDate: "2024-12-31",
        maxParticipants: 10,
        options: [
            { id: 1, text: "강남 돼지상회", voters: [] },
            { id: 2, text: "홍대 치킨매니아", voters: [{ id: 999, name: '나(Me)', image: 'https://picsum.photos/seed/me/50/50', votedAt: '2024-12-20 10:00:00.123' }] },
            { id: 3, text: "이태원 피자", voters: [] }
        ],
        allowMultiple: false,
        isAnonymous: false,
        status: 'progress',
        participants: [{ id: 999, name: '나(Me)', status: 'pending', votedAt: '2024-12-20 10:00:00.123' }]
    },
    {
        id: 2,
        title: "다음 주 주말 LSD 코스 (복수 가능, 익명)",
        endDate: "2024-12-25",
        maxParticipants: 20,
        options: [
            { id: 1, text: "한강 공원 코스 (20km)", voters: [] },
            { id: 2, text: "남산 둘레길 (15km)", voters: [] }
        ],
        allowMultiple: true,
        isAnonymous: true,
        status: 'progress',
        participants: []
    },
    {
        id: 3,
        title: "신년회 날짜 정하기 (복수 가능, 기명)",
        endDate: "2025-01-05",
        maxParticipants: 30,
        options: [
            { id: 1, text: "1월 10일 (금)", voters: [{ id: 101, name: '김철수', image: 'https://picsum.photos/seed/101/50/50', votedAt: '2024-12-21 14:20:05.500' }] },
            { id: 2, text: "1월 11일 (토)", voters: [{ id: 102, name: '이영희', image: 'https://picsum.photos/seed/102/50/50', votedAt: '2024-12-21 14:20:05.505' }] },
            { id: 3, text: "1월 12일 (일)", voters: [] }
        ],
        allowMultiple: true,
        isAnonymous: false,
        status: 'progress',
        participants: [
            { id: 101, name: '김철수', status: 'approved', votedAt: '2024-12-21 14:20:05.500' },
            { id: 102, name: '이영희', status: 'pending', votedAt: '2024-12-21 14:20:05.505' }
        ]
    },
    {
        id: 4,
        title: "팀 유니폼 색상 선정 (복수 불가, 익명)",
        endDate: "2024-12-28",
        maxParticipants: 50,
        options: [
            { id: 1, text: "네이비", voters: [] },
            { id: 2, text: "블랙", voters: [] },
            { id: 3, text: "화이트", voters: [] }
        ],
        allowMultiple: false,
        isAnonymous: true,
        status: 'progress',
        participants: []
    }
]
export default {
    getCrews(params) {
        const qp = {
            search: params.search,
            region: params.region === '전체' ? undefined : params.region,
            activityTimes: params.times, // times array
            genderLimits: params.genders, // genders array
            ageGroups: params.ages, // ages array
            minPace: params.paceRange ? params.paceRange[0] : undefined,
            maxPace: params.paceRange ? params.paceRange[1] : undefined,
            sort: params.sortBy === 'latest' ? 'CREATED_AT' :
                (params.sortBy === 'popular' ? 'MEMBER_COUNT' :
                    (params.sortBy === 'pace' ? 'AVERAGE_PACE' : undefined)),
            order: params.sortDirection ? params.sortDirection.toUpperCase() : undefined,
            page: params.page,
            size: params.size
        }

        // Remove undefined keys
        Object.keys(qp).forEach(key => qp[key] === undefined && delete qp[key])
        // Serialize arrays nicely (axios does this by default usually as key[], check if backend needs repeated keys)
        // Spring accepts 'activityTimes=A&activityTimes=B'.
        // Axios serializes array as 'activityTimes[]=A&activityTimes[]=B' by default? 
        // We need 'indexes: null' for qs logic or use paramsSerializer if standard spring binding.
        // Let's rely on standard axios for now, usually Spring MVC handles repeated params well.
        return api.get('/api/v1/crew/search', {
            params: qp,
            paramsSerializer: {
                indexes: null // Result: activityTimes=A&activityTimes=B
            }
        }).then(response => {
            // Backend currently returns List, not Page. Adapt to frontend expectation.
            const list = response.data.data || []
            const mappedList = list.map(item => ({
                id: item.crewId,
                name: item.name,
                location: item.region,
                members: item.memberCount,
                image: item.crewImage,
                activityTime: item.activityTime,
                pace: (item.averagePace !== null && item.averagePace !== undefined) ? `${item.averagePace}` : 'N/A', // Format as string if needed, or component handles number
                memberInfo: item.ageGroup ? `${item.ageGroup}` : '모집중'
            }))
            return {
                data: {
                    content: mappedList,
                    last: true, // Backend returns all matches for now
                    totalElements: list.length,
                    totalPages: 1
                }
            }
        })
    },
    getCrew(id) {
        return api.get(`/api/v1/crew/${id}`).then(response => {
            const data = response.data.data
            // Map backend response to frontend model
            const mappedData = {
                id: data.crewId,
                name: data.name,
                image: data.crewImage,
                location: data.region,
                members: data.memberCount,
                activityTime: data.activityTime,
                pace: (data.averagePace !== null && data.averagePace !== undefined) ? `${data.averagePace}` : 'N/A',
                ageRange: data.ageGroup ? `${data.ageGroup}` : '전연령',
                genderLimit: data.genderLimit || '무관',
                intro: data.description,
                activities: data.keywords || [], // Map keywords to activities list
                previewMembers: (data.members || []).map(m => ({
                    id: m.userId,
                    name: m.nickname,
                    image: m.profileImage
                }))
            }
            return { data: mappedData }
        })
    },
    joinCrew(crewId, data) {
        // Backend does not use data (message) currently for join, only userId from session
        return api.post(`/api/v1/crew/${crewId}/join`)
    },
    createCrew(data) {
        return api.post('/api/v1/crew', data, {
            headers: {
                'Content-Type': undefined
            }
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
        return api.get(`/api/v1/crew/${crewId}/members`)
    },
    getWaitingMembers(crewId) {
        return api.get(`/api/v1/crew/${crewId}/members/waiting`)
    },
    approveMember(crewId, memberId) {
        return api.put(`/api/v1/crew/${crewId}/members/${memberId}/status`, {
            status: 'ACCEPTED'
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
    // Votes API
    getVotes(crewId) {
        return api.get(`/api/v1/crew/${crewId}/votes`).then(response => {
            const data = response.data.data
            // Merge active and ended votes, map to frontend format
            const active = (data.activeVotes || []).map(v => ({ ...v, status: 'progress' }))
            const ended = (data.endedVotes || []).map(v => ({ ...v, status: 'closed' }))
            const merged = [...active, ...ended].map(v => ({
                id: v.voteId,
                title: v.title,
                endDate: v.endAt ? v.endAt.split('T')[0] : '', // Adjust format
                limitCount: v.limitCount || 100, // Keep mapped for backup if needed
                maxParticipants: v.limitCount || 100,
                status: v.status || (v.isClosed ? 'closed' : 'progress'),
                // For preview details, we might need to fetch individual, but list displays minimal info
                hasVoted: v.hasVoted, // Map hasVoted from backend
                participants: Array(v.participantCount || 0).fill({}),
                allowMultiple: v.multipleChoice || false,
                isAnonymous: v.isAnonymous || false,
                options: (v.options || []).map(o => ({
                    id: o.optionId,
                    text: o.content,
                    voters: [] // Initialize empty voters for now
                }))
            }))
            // Note: Frontend specific logic might need detailed data for each card. 
            // If component renders full vote details, we might need to fetch results for each or update backend list DTO.
            // For now, return basic mapped list.
            return { data: merged }
        })
    },
    getVoteResults(voteId) {
        return api.get(`/api/v1/vote/${voteId}/results`).then(response => {
            const data = response.data.data
            return {
                id: data.voteId,
                title: data.title,
                isAnonymous: data.isAnonymous,
                allowMultiple: false, // Not in result response? check backend
                options: data.options.map(opt => ({
                    id: opt.optionId,
                    text: opt.content,
                    voters: (opt.voters || []).map(v => ({
                        name: v.nickname,
                        image: v.profileImage, // Handle if null?
                        votedAt: v.votedAt
                    }))
                }))
            }
        })
    },
    castVote(crewId, voteId, selectedOptionIds) {
        return api.post(`/api/v1/vote/${voteId}/cast`, { optionIds: selectedOptionIds })
    },
    confirmParticipant(crewId, voteId, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Confirming participant ${userId} for vote ${voteId} in crew ${crewId}`)
                const vote = mockVoteData.find(v => v.id === voteId)
                if (vote) {
                    const participant = vote.participants.find(p => p.id === userId)
                    if (participant) participant.status = 'approved'
                }
                resolve({ success: true })
            }, 500)
        })
    },
    createVote(crewId, voteData) {
        return api.post(`/api/v1/crew/${crewId}/votes`, {
            title: voteData.title,
            endAt: `${voteData.endDate}T23:59:59`, // Default to end of day
            multipleChoice: voteData.allowMultiple,
            isAnonymous: voteData.isAnonymous,
            limitCount: voteData.maxParticipants,
            options: voteData.options // Expecting array of strings
        })
    },
    deleteVote(crewId, voteId) {
        // Backend API for deleting vote not explicitly checked, assuming strictly implementing what was asked.
        // If no backend endpoint found for delete, keep mock or leave as is.
        // Keeping mock for delete/updateStatus as they weren't primary scope or I didn't see explicit Delete controller method in previous views.
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Deleting vote ${voteId} in crew ${crewId}`)
                const index = mockVoteData.findIndex(v => v.id === voteId)
                if (index !== -1) mockVoteData.splice(index, 1)
                resolve({ success: true })
            }, 500)
        })
    },
    closeVote(crewId, voteId) {
        return api.post(`/api/v1/vote/${voteId}/close`)
    },
    // Notifications API
    getNotifications() {
        return api.get('/api/v1/notification/list')
    },
    getUnreadCount() {
        return api.get('/api/v1/notification/unread-count')
    },
    markAllRead() {
        return api.put('/api/v1/notification/read-all')
    },
    deleteNotification(notificationId) {
        return api.delete(`/api/v1/notification/${notificationId}`)
    },
    getMyCrews() {
        return api.get('/api/v1/crew/my').then(response => {
            const list = response.data.data || []
            // Map to simplified structure for dropdown
            return {
                data: list.map(item => ({
                    id: item.crewId,
                    name: item.name,
                    image: item.crewImage
                }))
            }
        })
    }
}
