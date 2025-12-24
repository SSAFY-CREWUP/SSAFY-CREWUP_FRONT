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
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #1F2937;
  letter-spacing: -0.02em;
}



.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

/* Calendar Customization */
.calendar-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #F3F4F6;
  transition: transform 0.3s ease;
}

.calendar-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05); /* Subtle lift effect */
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 85px;
  padding: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-calendar-table .el-calendar-day:hover) {
  background-color: #F9FAFB;
  transform: scale(0.98); /* Dynamic interaction */
  border-radius: 12px;
}

/* Weekend Styling */
/* Force standard color first */
:deep(.el-calendar-table tr td .day-number) { 
    color: #6B7280; /* Soft Gray (Tailwind Gray 500) - Much softer than black */
}

/* Sunday - Softer Rose/Red */
:deep(.el-calendar-table tr td:first-child .day-number) {
    color: #F87171; /* Soft Red (Tailwind Red 400) */
}

/* Saturday - Softer Blue */
:deep(.el-calendar-table tr td:nth-child(7) .day-number) {
    color: #60A5FA; /* Soft Blue (Tailwind Blue 400) */
}

.custom-date-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-number {
  font-weight: 700; /* Increased weight */
  font-size: 0.95rem; /* Slightly larger */
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  /* Remove any default transparency/lightness */
  opacity: 1 !important; 
}

.day-number.is-selected {
  background-color: #6366f1;
  color: white !important; /* Ensure white text on selected */
}
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6366f1; /* Solid Indigo - Simplified */
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); /* Softer shadow */
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy transition */
  font-size: 0.95rem;
}

.btn-add:hover {
  background: #4F46E5; /* Darker Indigo on hover */
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-add:active {
  transform: scale(0.95);
}

.date-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  overflow: hidden;
}

.mini-event-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  transition: transform 0.1s;
}

.mini-event-item:hover {
  transform: scale(1.02);
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
  font-weight: 600;
}

/* Upcoming Section */
.upcoming-section {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  height: fit-content;
}

.upcoming-section h3 {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  color: #1F2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scrollable-list {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom Scrollbar */
.scrollable-list::-webkit-scrollbar {
  width: 6px;
}
.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-list::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.scrollable-list::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}

.event-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -6px rgba(0, 0, 0, 0.1);
  border-color: #E0E7FF;
}

.event-date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #EEF2FF;
  border-radius: 12px;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  color: #6366f1;
}

.event-date-box .month {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
}

.event-date-box .day {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* Fix flex ellipsis issue */
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.event-badges {
  display: flex;
}

.type-badge {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.event-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 8px;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-details {
  padding-top: 8px;
  border-top: 1px dashed #F3F4F6;
  font-size: 0.85rem;
  color: #6B7280;
}

.participants {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  font-weight: 600;
  color: #6366f1;
  font-size: 0.85rem;
}

.event-content {
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.85rem;
  color: #4B5563;
}

.btn-delete {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0; /* Hidden by default */
}

.event-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #FEF2F2;
  color: #EF4444;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9CA3AF;
  font-size: 0.95rem;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  border: 1px dashed #E5E7EB;
}

@media (max-width: 850px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
