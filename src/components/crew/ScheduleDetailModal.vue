<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useCrewStore } from '../../stores/crew'
import { useRoute } from 'vue-router'
import { Location, Clock, User } from '@element-plus/icons-vue'

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
const isCreator = ref(false)

const fetchEventDetails = async () => {
  if (!props.eventId) return
  
  loading.value = true
  try {
    const allEvents = await crewStore.fetchEvents(crewId)
    event.value = allEvents.find(e => e.id === props.eventId)
    
    // Check if current user is creator
    try {
        const creatorData = await crewStore.checkScheduleCreator(props.eventId)
        isCreator.value = creatorData.data.isCreator
    } catch (e) {
        console.error('Failed to check creator status', e)
        isCreator.value = false
    }

      if (event.value) {
        // Debugging: Log the first member to see structure
        if (event.value.members && event.value.members.length > 0) {
            console.log('[DEBUG] First member object:', event.value.members[0])
        }
        participants.value = (event.value.members || []).map(m => ({
          id: m.userId,
          // Try to find the schedule member ID using common names
          scheduleMemberId: m.scheduleMemberId || m.id || m.scheduleId, 
          name: m.nickname,
          status: m.status ? m.status.toLowerCase() : 'pending',
          image: m.profileImage
        }))
        
        // TODO: Replace 999 with actual user ID
        isParticipating.value = participants.value.some(p => p.id === 999) 
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
    await crewStore.joinEvent(crewId, props.eventId)
    await fetchEventDetails()
    alert('참여 신청이 완료되었습니다.')
  } catch (error) {
    if (error.response && error.response.status === 409) {
         alert('이미 참여한 일정입니다.')
    } else if (error.response && error.response.data && error.response.data.message) {
         alert(error.response.data.message)
    } else {
         alert('참여 신청에 실패했습니다.')
    }
  }
}

const handleCancelJoin = async () => {
  if (!confirm('참여를 취소하시겠습니까?')) return
  try {
    await crewStore.cancelJoinEvent(crewId, props.eventId)
    participants.value = participants.value.filter(p => p.id !== 999)
    isParticipating.value = false
    if (event.value) event.value.participants--
    alert('참여가 취소되었습니다.')
  } catch (error) {
    alert('참여 취소에 실패했습니다.')
  }
}

const handleStatusChange = async (scheduleMemberId, newStatus) => {
    try {
        // Send uppercase status to backend
        await crewStore.updateEventParticipantStatus(crewId, props.eventId, scheduleMemberId, newStatus.toUpperCase())
        alert('상태가 변경되었습니다.')
    } catch (e) {
        alert('상태 변경에 실패했습니다.')
        // Revert change in UI if needed, but for now we let it be or refresh
        fetchEventDetails()
    }
}

const getEventTypeInfo = (type) => {
  const safeType = type ? type.toUpperCase() : 'REGULAR'
  switch(safeType) {
    case 'REGULAR': return { label: '정기', type: 'success' }
    case 'EVENT': return { label: '이벤트', type: 'warning' }
    case 'LIGHTNING': return { label: '번개', type: 'primary' }
    default: return { label: '정기', type: 'success' }
  }
}

const getStatusBadge = (status) => {
  const map = {
    pending: { label: '대기', type: 'info' },
    confirmed: { label: '확정', type: 'primary' },
    attended: { label: '참석', type: 'success' },
    absent: { label: '불참', type: 'danger' },
    noshow: { label: '불참(No-Show)', type: 'danger' }
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
          <el-tag :type="getEventTypeInfo(event.type).type">
            {{ getEventTypeInfo(event.type).label }}
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
              <template v-if="isCreator">
                <el-select 
                  v-model="p.status" 
                  size="small" 
                  @change="(val) => handleStatusChange(p.scheduleMemberId, val)"
                  style="width: 110px"
                >
                  <el-option-group label="신청 상태">
                    <el-option label="대기" value="pending" />
                    <el-option label="확정" value="confirmed" />
                  </el-option-group>
                  <el-option-group label="참여 결과">
                    <el-option label="참석" value="attended" />
                    <el-option label="불참" value="absent" />
                  </el-option-group>
                </el-select>
              </template>
              <template v-else>
                <el-tag :type="getStatusBadge(p.status).type" size="small">
                  {{ getStatusBadge(p.status).label }}
                </el-tag>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

</style>
