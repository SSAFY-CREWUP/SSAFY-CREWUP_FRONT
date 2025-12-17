import { defineStore } from 'pinia'
import crewApi from '../api/crew'

export const useCrewStore = defineStore('crew', {
    state: () => ({
        crews: [],
        currentCrew: null,
        requests: [],
        members: [],
        members: [],
        withdrawnMembers: [],
        notifications: [],
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
        async fetchRequests(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getRequests(crewId)
                this.requests = res.data
            } finally {
                this.loading = false
            }
        },
        async approveRequest(crewId, requestId) {
            await crewApi.approveRequest(crewId, requestId)
            this.requests = this.requests.filter(r => r.id !== requestId)
        },
        async rejectRequest(crewId, requestId, reason) {
            await crewApi.rejectRequest(crewId, requestId, reason)
            this.requests = this.requests.filter(r => r.id !== requestId)
        },
        async fetchMembers(crewId) {
            this.loading = true
            try {
                const res = await crewApi.getMembers(crewId)
                this.members = res.data
            } finally {
                this.loading = false
            }
        },
        async updateMemberRole(crewId, memberId, role) {
            await crewApi.updateMemberRole(crewId, memberId, role)
            const member = this.members.find(m => m.id === memberId)
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
                const response = await crewApi.getEvents(crewId)
                return response.data
            } catch (error) {
                console.error('Failed to fetch events:', error)
                throw error
            }
        },

        async addEvent(crewId, eventData) {
            try {
                const response = await crewApi.addEvent(crewId, eventData)
                return response.data
            } catch (error) {
                console.error('Failed to add event:', error)
                throw error
            }
        },
        async deleteEvent(crewId, eventId) {
            try {
                await crewApi.deleteEvent(crewId, eventId)
            } catch (error) {
                console.error('Failed to delete event:', error)
                throw error
            }
        },
        async joinEvent(crewId, eventId) {
            await crewApi.joinEvent(crewId, eventId)
        },
        async cancelJoinEvent(crewId, eventId) {
            await crewApi.cancelJoinEvent(crewId, eventId)
        },
        async updateEventParticipantStatus(crewId, eventId, participantId, status) {
            await crewApi.updateEventParticipantStatus(crewId, eventId, participantId, status)
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
        async castVote(crewId, voteId) {
            await crewApi.castVote(crewId, voteId)
        },
        async confirmParticipant(crewId, voteId, userId) {
            await crewApi.confirmParticipant(crewId, voteId, userId)
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
            this.notifications = res.data
            return res.data
        }
    }
})
