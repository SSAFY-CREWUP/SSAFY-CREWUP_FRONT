<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useCrewStore } from '../../stores/crew'
import { useRoute } from 'vue-router'
import { Location, Clock, User, Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  eventId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const crewStore = useCrewStore()
const route = useRoute()
const crewId = route.params.id

const event = ref(null)
const loading = ref(false)
const participants = ref([])
const isParticipating = ref(false)
const isManager = ref(true) // Mock: Assume manager for now

const fetchEventDetails = async () => {
  if (!props.eventId) return
  
  loading.value = true
  try {
    // In a real app, you might have a specific API for event details including participants
    // For now, we'll simulate fetching details and participants
    const allEvents = await crewStore.fetchEvents(crewId)
    event.value = allEvents.find(e => e.id === props.eventId)
    
    if (event.value) {
      // Mock participants data if not present
      if (!event.value.participantList) {
        participants.value = [
          { id: 1, name: '김러너', status: 'pending', image: 'https://picsum.photos/seed/p1/50/50' },
          { id: 2, name: '이초보', status: 'attended', image: 'https://picsum.photos/seed/p2/50/50' },
          { id: 3, name: '박고수', status: 'pending', image: 'https://picsum.photos/seed/p3/50/50' }
        ]
      } else {
        participants.value = event.value.participantList
      }
      
      // Check if current user is participating (Mock)
      isParticipating.value = participants.value.some(p => p.id === 999) // 999 is mock current user ID
    }
  } catch (error) {
    console.error('Failed to fetch event details', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.eventId, (newId) => {
  if (newId) {
    fetchEventDetails()
  }
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleJoin = async () => {
  try {
    // Mock API call to join
    // await crewStore.joinEvent(crewId, props.eventId)
    
    // Optimistic update
    participants.value.push({
      id: 999,
      name: '나(Me)',
      status: 'pending',
      image: 'https://picsum.photos/seed/me/50/50'
    })
    isParticipating.value = true
    if (event.value) event.value.participants++
    
    alert('참여 신청이 완료되었습니다.')
  } catch (error) {
    alert('참여 신청에 실패했습니다.')
  }
}

const handleCancelJoin = async () => {
  if (!confirm('참여를 취소하시겠습니까?')) return
  
  try {
    // Mock API call to cancel join
    // await crewStore.cancelJoinEvent(crewId, props.eventId)
    
    // Optimistic update
    participants.value = participants.value.filter(p => p.id !== 999)
    isParticipating.value = false
    if (event.value) event.value.participants--
    
    alert('참여가 취소되었습니다.')
  } catch (error) {
    alert('참여 취소에 실패했습니다.')
  }
}

const updateParticipantStatus = async (participantId, status) => {
  try {
    // Mock API call
    // await crewStore.updateEventParticipantStatus(crewId, props.eventId, participantId, status)
    
    const p = participants.value.find(p => p.id === participantId)
    if (p) p.status = status
  } catch (error) {
    console.error('Failed to update status', error)
  }
}

const confirmEvent = async () => {
  if (!confirm('일정을 확정하시겠습니까? 확정 후에는 추가 참여가 불가능합니다.')) return
  
  try {
    // Mock API call
    // await crewStore.confirmEvent(crewId, props.eventId)
    
    if (event.value) event.value.status = 'confirmed'
    
    // Update all pending to attended or no-show based on logic (or just mark event as confirmed)
    // For this requirement: "scheduleMember의 상태가 Attended로 변경되고"
    // We might want to bulk update or just mark the event. 
    // Let's assume we mark the event as confirmed and maybe update statuses.
    
    alert('일정이 확정되었습니다.')
  } catch (error) {
    alert('일정 확정에 실패했습니다.')
  }
}

const completeEvent = async () => {
  if (!confirm('일정을 종료하시겠습니까? 참여한 멤버들의 거리가 업데이트됩니다.')) return
  
  try {
    // Mock API call
    // await crewStore.completeEvent(crewId, props.eventId)
    
    if (event.value) event.value.status = 'completed'
    alert('일정이 종료되었습니다. 마일리지가 적립되었습니다.')
  } catch (error) {
    alert('일정 종료 처리에 실패했습니다.')
  }
}

const getStatusBadge = (status) => {
  const map = {
    pending: { label: '대기', type: 'info' },
    attended: { label: '참석', type: 'success' },
    noshow: { label: '불참', type: 'danger' }
  }
  return map[status] || { label: status, type: '' }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="일정 상세"
    width="600px"
    @close="close"
    destroy-on-close
  >
    <div v-if="loading" class="loading-state">
      Loading...
    </div>
    
    <div v-else-if="event" class="detail-container">
      <div class="event-header-section">
        <div class="header-top">
          <el-tag :type="event.type === 'regular' ? 'success' : (event.type === 'special' ? 'warning' : 'primary')">
            {{ event.type === 'regular' ? '정기' : (event.type === 'special' ? '이벤트' : '번개') }}
          </el-tag>
          <span class="event-status" v-if="event.status === 'confirmed'">확정됨</span>
          <span class="event-status completed" v-else-if="event.status === 'completed'">종료됨</span>
        </div>
        <h2>{{ event.title }}</h2>
        <div class="meta-grid">
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            <span>{{ event.date }} {{ event.time }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Location /></el-icon>
            <span>{{ event.location }}</span>
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>{{ participants.length }} / {{ event.maxParticipants }}명</span>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h3>상세 내용</h3>
        <p class="content-text">{{ event.content }}</p>
      </div>

      <div class="participants-section">
        <div class="section-header">
          <h3>참여자 목록</h3>
          <div class="action-buttons" v-if="event.status !== 'completed'">
            <el-button 
              v-if="!isParticipating && event.status !== 'confirmed'" 
              type="primary" 
              @click="handleJoin"
              :disabled="participants.length >= event.maxParticipants"
            >
              참여하기
            </el-button>
            <el-button 
              v-else-if="isParticipating && event.status !== 'confirmed'" 
              type="danger" 
              plain 
              @click="handleCancelJoin"
            >
              참여 취소
            </el-button>
          </div>
        </div>

        <div class="participants-list">
          <div v-for="p in participants" :key="p.id" class="participant-item">
            <div class="p-info">
              <el-avatar :size="32" :src="p.image" />
              <span class="p-name">{{ p.name }}</span>
            </div>
            <div class="p-status">
              <el-tag :type="getStatusBadge(p.status).type" size="small">
                {{ getStatusBadge(p.status).label }}
              </el-tag>
              
              <!-- Manager Controls -->
              <div v-if="isManager && event.status !== 'completed'" class="manager-controls">
                <el-button 
                  v-if="p.status !== 'attended'" 
                  circle 
                  size="small" 
                  type="success" 
                  :icon="Check"
                  @click="updateParticipantStatus(p.id, 'attended')"
                  title="참석 처리"
                />
                <el-button 
                  v-if="p.status !== 'noshow'" 
                  circle 
                  size="small" 
                  type="danger" 
                  :icon="Close"
                  @click="updateParticipantStatus(p.id, 'noshow')"
                  title="불참 처리"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="left-actions" v-if="isManager">
          <el-button 
            v-if="event?.status !== 'confirmed' && event?.status !== 'completed'" 
            type="success" 
            @click="confirmEvent"
          >
            일정 확정
          </el-button>
          <el-button 
            v-if="event?.status === 'confirmed'" 
            type="warning" 
            @click="completeEvent"
          >
            일정 종료
          </el-button>
        </div>
        <el-button @click="close">닫기</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.loading-state {
  text-align: center;
  padding: 40px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.event-header-section {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-status {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  background: #e8f5e9;
  padding: 4px 8px;
  border-radius: 4px;
}

.event-status.completed {
  color: #666;
  background: #eee;
}

.event-header-section h2 {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.content-section h3, .participants-section h3 {
  font-size: 1.1rem;
  margin: 0 0 12px 0;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
}

.p-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.p-name {
  font-weight: 500;
}

.p-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-controls {
  display: flex;
  gap: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 8px;
}
</style>
