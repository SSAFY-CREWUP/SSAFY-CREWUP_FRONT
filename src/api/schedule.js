import api from './axios'

export default {
    createSchedule(crewId, data) {
        return api.post(`/api/v1/schedule/${crewId}/create`, data)
    },
    deleteSchedule(crewId, scheduleId) {
        return api.delete(`/api/v1/schedule/${scheduleId}/delete`)
    },
    joinSchedule(scheduleId) {
        return api.post(`/api/v1/schedule/${scheduleId}/join`)
    },
    getScheduleList(crewId) {
        return api.get(`/api/v1/schedule/${crewId}/list`)
    },
    checkCreator(scheduleId) {
        return api.get(`/api/v1/schedule/${scheduleId}/status/check`)
    },
    updateParticipantStatus(scheduleId, scheduleMemberId, status) {
        const payload = {
            scheduleMemberId: Number(scheduleMemberId),
            status: status
        }
        console.log(`[API] Updating participant status. ScheduleID: ${scheduleId}, Payload:`, payload)
        return api.put(`/api/v1/schedule/${scheduleId}/status`, payload)
    }
}
