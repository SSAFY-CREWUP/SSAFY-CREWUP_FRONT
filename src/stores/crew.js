import { defineStore } from 'pinia'
import crewApi from '../api/crew'
import scheduleApi from '../api/schedule'

export const useCrewStore = defineStore('crew', {
    state: () => ({
        crews: [],
        currentCrew: null,
        requests: [],
        members: [],
        withdrawnMembers: [],
        notifications: [],
        unreadCount: 0,
        myCrews: [],
        loading: false
    }),
    actions: {
        setCrews(crews) {
            this.crews = crews
        },
        setCurrentCrew(crew) {
            this.currentCrew = crew
        },
        async fetchCrew(id) {
            this.loading = true
            try {
                const res = await crewApi.getCrew(id)
                this.currentCrew = res.data
            } finally {
                this.loading = false
            }
        },
        async fetchWaitingMembers(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getWaitingMembers(crewId)
                console.log('API Response for Waiting Members:', res) // Log added
                // Use requests state or create a new one. Since requests is unused by real logic yet, use it.
                this.requests = res.data.data
            } finally {
                this.loading = false
            }
        },
        async approveRequest(crewId, requestId) {
            await crewApi.approveRequest(crewId, requestId)
            this.requests = this.requests.filter(r => r.id !== requestId)
        },

        async fetchRecommendedCrews() {
            try {
                const res = await crewApi.getRecommendedCrews()
                return res.data
            } catch (error) {
                console.error('Failed to fetch recommended crews:', error)
                return []
            }
        },
        async fetchMembers(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getMembers(crewId)
                // Handle various response structures (wrapped data or direct array)
                const membersList = res.data?.data || res.data || []
                this.members = Array.isArray(membersList) ? membersList : []

                // [MOCK] If Leader is missing from the list, inject a mock leader for display
                const hasLeader = this.members.some(m => m.role === 'LEADER' || m.role === '크루장')
                if (!hasLeader) {
                    console.warn('Leader not found in members list. Injecting mock leader.')
                    const mockLeader = {
                        id: 9999,
                        memberId: 9999,
                        nickname: '크루장(나)',
                        profileImage: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                        role: 'LEADER',
                        totalDistance: 120.5,
                        averagePace: '5:30',
                        joinedAt: new Date().toISOString()
                    }
                    this.members.unshift(mockLeader)
                }
            } catch (error) {
                console.error('Failed to fetch members:', error)
                // Fallback for demo if API fails completely
                this.members = []
                const mockLeader = {
                    id: 9999,
                    memberId: 9999,
                    nickname: '크루장(나)',
                    profileImage: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                    role: 'LEADER',
                    totalDistance: 120.5,
                    averagePace: '5:30',
                    joinedAt: new Date().toISOString()
                }
                this.members.unshift(mockLeader)
            } finally {
                this.loading = false
            }
        },

        async updateMemberRole(crewId, memberId, role) {
            await crewApi.updateMemberRole(crewId, memberId, role)
            const member = this.members.find(m => m.memberId === memberId)
            if (member) member.role = role
        },
        async kickMember(crewId, memberId) {
            await crewApi.kickMember(crewId, memberId)
            this.members = this.members.filter(m => m.id !== memberId)
        },
        async fetchWithdrawnMembers(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getWithdrawnMembers(crewId)
                this.withdrawnMembers = res.data
            } finally {
                this.loading = false
            }
        },
        async fetchDashboardData(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getDashboardData(crewId)
                return res.data
            } finally {
                this.loading = false
            }
        },
        async joinCrew(crewId, data) {
            await crewApi.joinCrew(crewId, data)
        },
        async fetchPosts(crewId, params) {
            const res = await crewApi.getPosts(crewId, params)
            return res
        },
        async fetchPost(crewId, postId) {
            const res = await crewApi.getPost(crewId, postId)
            return res.data
        },
        async createPost(crewId, postData) {
            await crewApi.createPost(crewId, postData)
        },
        async fetchComments(crewId, postId) {
            const res = await crewApi.getComments(crewId, postId)
            return res.data
        },
        async addComment(crewId, postId, commentData) {
            const res = await crewApi.addComment(crewId, postId, commentData)
            return res.data
        },
        async fetchEvents(crewId) {
            try {
                const response = await scheduleApi.getScheduleList(crewId)
                // Filter out null/undefined events and map to view format
                return response.data.data.map(event => ({
                    id: event.scheduleId,
                    title: event.title,
                    date: event.runDate.split('T')[0],
                    time: event.runDate.split('T')[1].substring(0, 5),
                    location: event.location,
                    participants: event.currentPeople,
                    maxParticipants: event.maxPeople,
                    content: event.content,
                    members: event.members,
                    type: event.scheduleType
                }))
            } catch (error) {
                console.error('Failed to fetch events:', error)
                throw error
            }
        },


        async addEvent(crewId, eventData) {
            try {
                // Map the frontend form data to the backend expectation
                const requestData = {
                    courseId: eventData.courseId,
                    title: eventData.title,
                    // Combine date and time (e.g., "2025-12-26 20:00:00")
                    // Note: User example used space, so we use space. If backend requires T, we can change it.
                    runDate: `${eventData.date} ${eventData.time}:00`,
                    location: eventData.location,
                    maxPeople: eventData.maxParticipants,
                    content: eventData.content,
                    scheduleType: eventData.type
                }
                const response = await scheduleApi.createSchedule(crewId, requestData)
                return response.data
            } catch (error) {
                console.error('Failed to add event:', error)
                throw error
            }
        },
        async deleteEvent(crewId, eventId) {
            try {
                await scheduleApi.deleteSchedule(crewId, eventId)
            } catch (error) {
                console.error('Failed to delete event:', error)
                throw error
            }
        },
        async joinEvent(crewId, eventId) {
            try {
                await scheduleApi.joinSchedule(eventId)
                // Refresh events list to reflect the change
                await this.fetchEvents(crewId)
            } catch (error) {
                // If the backend returns a specific error for "already joined", we can handle it here or let the component handle it
                console.error('Failed to join event:', error)
                throw error
            }
        },
        async confirmEvent(crewId, eventId) {
            // API not ready yet
            console.log('API not ready: confirmEvent', eventId)
        },
        async updateEventParticipantStatus(crewId, eventId, memberId, status) {
            // API not ready yet
            console.log('API not ready: updateStatus', eventId, memberId, status)
        },
        async cancelJoinEvent(crewId, eventId) {
            await crewApi.cancelJoinEvent(crewId, eventId)
        },
        async updateEventParticipantStatus(crewId, eventId, scheduleMemberId, status) {
            await scheduleApi.updateParticipantStatus(eventId, scheduleMemberId, status)
        },
        async checkScheduleCreator(scheduleId) {
            const res = await scheduleApi.checkCreator(scheduleId)
            return res.data
        },
        async confirmEvent(crewId, eventId) {
            await crewApi.confirmEvent(crewId, eventId)
        },
        async completeEvent(crewId, eventId) {
            await crewApi.completeEvent(crewId, eventId)
        },
        async fetchCrewCourses(crewId, params) {
            const res = await crewApi.getCrewCourses(crewId, params)
            return res.data
        },
        async fetchCrewCourseDetail(crewId, courseId) {
            const res = await crewApi.getCrewCourseDetail(crewId, courseId)
            return res.data
        },
        async fetchScrappedCourses(crewId) {
            const res = await crewApi.getScrappedCourses(crewId)
            return res.data
        },
        async fetchVotes(crewId) {
            const res = await crewApi.getVotes(crewId)
            return res.data
        },
        async castVote(crewId, voteId, ids) {
            await crewApi.castVote(crewId, voteId, ids)
        },
        async confirmParticipant(crewId, voteId, userId) {
            await crewApi.confirmParticipant(crewId, voteId, userId)
        },
        async getVoteResults(voteId) {
            const res = await crewApi.getVoteResults(voteId)
            return res
        },
        async createVote(crewId, voteData) {
            try {
                await crewApi.createVote(crewId, voteData)
            } catch (error) {
                console.error('Failed to create vote:', error)
                throw error
            }
        },
        async fetchNotifications() {
            const res = await crewApi.getNotifications()
            this.notifications = res.data.data
            return res.data.data
        },
        async fetchUnreadCount() {
            const res = await crewApi.getUnreadCount()
            this.unreadCount = res.data.data.unreadCount
            return res.data.data.unreadCount
        },
        async markAllNotificationsRead() {
            await crewApi.markAllRead()
            this.unreadCount = 0
        },
        async deleteNotification(notificationId) {
            console.log('Deleting notification:', notificationId)
            await crewApi.deleteNotification(notificationId)
            this.notifications = this.notifications.filter(n => n.id !== notificationId)
        },
        async fetchMyCrews() {
            try {
                const res = await crewApi.getMyCrews()
                this.myCrews = res.data
            } catch (error) {
                console.error('Failed to fetch my crews:', error)
            }
        },
        async closeVote(crewId, voteId) {
            await crewApi.closeVote(crewId, voteId)
        },
    }
})
