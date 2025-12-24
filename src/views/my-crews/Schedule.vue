<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Plus, Location, Clock, Delete, User } from '@element-plus/icons-vue'
import AddScheduleModal from '../../components/crew/AddScheduleModal.vue'
import ScheduleDetailModal from '../../components/crew/ScheduleDetailModal.vue'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

const currentDate = ref(new Date())
const events = ref([])
const loading = ref(false)

const fetchEvents = async () => {
  loading.value = true
  try {
    const data = await crewStore.fetchEvents(crewId)
    console.log('[DEBUG] Fetched Events:', data)
    events.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})

// Helper to get events for a specific date
const getEventsForDate = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return events.value.filter(e => e.date === dateStr)
}

// Upcoming events (sorted by date)
// This Month's Events (sorted by date)
const thisMonthEvents = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const todayStr = now.toISOString().split('T')[0]
  
  return events.value
    .filter(e => {
      const eventDate = new Date(e.date)
      // Check if it's in the current month and year
      const isCurrentMonth = eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
      // Check if it's today or future
      const isFuture = e.date >= todayStr
      
      return isCurrentMonth && isFuture
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

// Permission Check (Mock)
const canAddEvent = computed(() => {
  // In a real app, check user role from store
  // For now, assume true or check mock user role
  return true 
})

const canDeleteEvent = (event) => {
  // In a real app, check if current user is the creator
  // For now, assume true
  return true
}

const getEventTypeColor = (type) => {
  const safeType = type ? type.toLowerCase() : 'regular'
  const map = {
    regular: '#4CAF50', // Green
    event: '#2196F3',   // Blue
    lightning: '#FFC107' // Yellow
  }
  return map[safeType] || '#999'
}

const getEventTypeName = (type) => {
  const safeType = type ? type.toLowerCase() : 'regular'
  const map = {
    regular: '정기',
    event: '이벤트',
    lightning: '번개'
  }
  return map[safeType] || '기타'
}

const showAddModal = ref(false)

const handleAddEvent = async (eventData) => {
  try {
    await crewStore.addEvent(crewId, eventData)
    await fetchEvents() // Refresh list
  } catch (error) {
    alert('일정 추가에 실패했습니다.')
  }
}

const handleDelete = async (eventId) => {
  if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return
  
  try {
    await crewStore.deleteEvent(crewId, eventId)
    await fetchEvents() // Refresh list
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert('일정을 등록한 사람만 삭제할 수 있습니다.')
    } else {
      alert('일정 삭제에 실패했습니다.')
    }
  }
}

const showDetailModal = ref(false)
const selectedEventId = ref(null)

const handleEventClick = (event) => {
  selectedEventId.value = event.id
  showDetailModal.value = true
}

const handleDetailClose = () => {
  showDetailModal.value = false
  selectedEventId.value = null
  fetchEvents() // Refresh data on close
}
</script>

<template>
  <div class="schedule-view">
    <div class="page-header">
      <h2>일정</h2>
      <button v-if="canAddEvent" class="btn-add" @click="showAddModal = true">
        <el-icon><Plus /></el-icon>
        일정 추가
      </button>
    </div>

    <div class="content-grid">
      <!-- Calendar Section -->
      <div class="calendar-section">
        <el-calendar v-model="currentDate">
          <template #date-cell="{ data }">
            <div class="custom-date-cell">
              <span class="day-number" :class="{ 'is-selected': data.isSelected }">
                {{ data.day.split('-').slice(2).join('') }}
              </span>
              <div class="date-events">
                <div 
                  v-for="event in getEventsForDate(data.date)" 
                  :key="event.id"
                  class="mini-event-item"
                  :style="{ backgroundColor: getEventTypeColor(event.type) + '30', color: getEventTypeColor(event.type) }"
                  :title="event.title"
                  @click.stop="handleEventClick(event)"
                >
                  <span class="event-dot" :style="{ backgroundColor: getEventTypeColor(event.type) }"></span>
                  <span class="event-text">{{ event.title }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>

      <!-- Upcoming List Section -->
      <!-- This Month's Events List Section -->
      <div class="upcoming-section">
        <h3>이달의 일정</h3>
        <div v-if="thisMonthEvents.length === 0" class="empty-state">
          이달의 예정된 일정이 없습니다.
        </div>
        <div v-else class="event-list scrollable-list">
          <div v-for="event in thisMonthEvents" :key="event.id" class="event-card" @click="handleEventClick(event)">
            <div class="event-date-box">
              <span class="month">{{ event.date.split('-')[1] }}월</span>
              <span class="day">{{ event.date.split('-')[2] }}</span>
            </div>
            <div class="event-info">
              <div class="event-header">
                <div class="event-badges">
                  <span 
                    class="type-badge"
                    :style="{ backgroundColor: getEventTypeColor(event.type) + '20', color: getEventTypeColor(event.type) }"
                  >
                    {{ getEventTypeName(event.type) }}
                  </span>
                </div>
                <button v-if="canDeleteEvent(event)" class="btn-delete" @click.stop="handleDelete(event.id)">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
              <h4 class="event-title">{{ event.title }}</h4>
              <div class="event-meta">
                <span><el-icon><Clock /></el-icon> {{ event.time }}</span>
                <span><el-icon><Location /></el-icon> {{ event.location }}</span>
              </div>
              <div class="event-details">
                <span class="participants">
                  <el-icon><User /></el-icon> {{ event.participants }} / {{ event.maxParticipants }}명
                </span>
                <p class="event-content">{{ event.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Schedule Modal -->
    <AddScheduleModal 
      v-model="showAddModal" 
      @submit="handleAddEvent" 
    />

    <!-- Schedule Detail Modal -->
    <ScheduleDetailModal
      v-model="showDetailModal"
      :event-id="selectedEventId"
      @close="handleDetailClose"
    />
  </div>
</template>

<style scoped>
.schedule-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #45a049;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

/* Calendar Customization */
.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 80px;
  padding: 8px;
}

.custom-date-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-number {
  font-weight: 600;
  font-size: 0.9rem;
}

.day-number.is-selected {
  color: var(--color-primary);
}

.date-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  overflow: hidden;
}

.mini-event-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-text {
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* Upcoming Section */
.upcoming-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  height: fit-content;
}

.upcoming-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scrollable-list {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 4px; /* For scrollbar space */
}

/* Custom Scrollbar for the list */
.scrollable-list::-webkit-scrollbar {
  width: 6px;
}

.scrollable-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.event-card {
  display: flex;
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateX(4px);
  border-color: var(--color-primary);
  cursor: pointer;
}

.event-date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.event-date-box .month {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.event-date-box .day {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-badges {
  margin-bottom: 4px;
}

.type-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.event-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
}

.event-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.btn-delete {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fee;
  color: #f44336;
}

.event-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #eee;
  font-size: 0.85rem;
  color: #666;
}

.participants {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--color-primary);
}

.event-content {
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
