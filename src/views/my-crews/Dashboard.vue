<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { 
  Bell, Calendar, Trophy, Timer, 
  ArrowRight, ChatDotRound, Location 
} from '@element-plus/icons-vue'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const route = useRoute()
const router = useRouter()
const crewStore = useCrewStore()

const dashboardData = ref({
  notices: [],
  upcomingEvents: [],
  recentPosts: [],
  mvp: []
})
const loading = ref(true)

const loadData = async (id) => {
  if (!id) return
  loading.value = true
  try {
    // 1. Crew Detail & Members
    await Promise.all([
      crewStore.fetchCrew(id),
      crewStore.fetchMembers(id)
    ])
    
    const [eventsRes, noticesRes, recentPostsRes] = await Promise.all([
        crewStore.fetchEvents(id).catch(e => { console.error(e); return [] }),
        crewStore.fetchPosts(id, { category: '공지', size: 3 }).catch(e => { console.error(e); return { data: [] } }),
        crewStore.fetchPosts(id, { category: '전체', size: 5 }).catch(e => { console.error(e); return { data: [] } })
    ])
    
    // Events
    if (eventsRes) {
        dashboardData.value.upcomingEvents = eventsRes
    }

    // Notices
    if (noticesRes && noticesRes.data) {
        dashboardData.value.notices = noticesRes.data.map(post => ({
            id: post.id,
            title: post.title,
            date: post.date,
            isPinned: false
        }))
    }

    // Recent Posts
    if (recentPostsRes && recentPostsRes.data) {
        dashboardData.value.recentPosts = recentPostsRes.data.map(post => ({
            id: post.id,
            title: post.title,
            comments: post.comments,
            author: post.author
        }))
    }

  } catch (error) {
    console.error('Failed to load dashboard data', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData(route.params.id)
})

watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        loadData(newId)
    }
})

const formatAgeGroup = (ageGroup) => {
  if (!ageGroup) return '-'
  if (ageGroup === '전연령') return '전연령'
  
  const map = {
    '1020': '10대~20대',
    '2030': '20대~30대',
    '3040': '30대~40대',
    '4050': '40대~50대',
    '5060': '50대~60대',
    'TEENS': '10대',
    'TWENTIES': '20대',
    'THIRTIES': '30대',
    'FORTIES': '40대',
    'FIFTIES': '50대',
    'SIXTIES': '60대',
    'SEVENTIES': '70대'
  }
  
  if (map[ageGroup]) return map[ageGroup]
  
  // If it's a simple number string like "30", return "30대"
  if (!isNaN(ageGroup)) return `${ageGroup}대`
  
  return ageGroup
}





const getProgressPercentage = (current, max) => {
  return Math.min((current / max) * 100, 100)
}

const filteredUpcomingEvents = computed(() => {
  if (!dashboardData.value?.upcomingEvents) return []
  
  const now = dayjs()
  
  return dashboardData.value.upcomingEvents
    .filter(event => {
      const eventDate = dayjs(`${event.date} ${event.time}`)
      return eventDate.isAfter(now)
    })
    .sort((a, b) => {
      const dateA = dayjs(`${a.date} ${a.time}`)
      const dateB = dayjs(`${b.date} ${b.time}`)
      return dateA.diff(dateB)
    })
    .slice(0, 3)
})
const formatPace = (pace) => {
  if (!pace) return '-'
  if (typeof pace === 'string' && pace.includes(':')) return pace
  
  const numPace = Number(pace)
  if (isNaN(numPace)) return pace
  
  const minutes = Math.floor(numPace)
  const seconds = Math.round((numPace - minutes) * 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
</script>

<template>
  <div class="dashboard-view" v-if="!loading && dashboardData">
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="grid-column left">
        <!-- 1. Notices -->
        <div class="widget-card notices-widget">
          <div class="widget-header">
            <h3>📢 공지사항</h3>
            <button class="btn-more" @click="router.push({ name: 'crew-board', query: { category: '공지' } })">
              더보기 <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
          <ul class="notice-list" v-if="dashboardData.notices && dashboardData.notices.length > 0">
            <li v-for="notice in dashboardData.notices" :key="notice.id" :class="{ pinned: notice.isPinned }">
              <span class="notice-icon" v-if="notice.isPinned">📌</span>
              <span class="notice-title">{{ notice.title }}</span>
              <span class="notice-date">{{ dayjs(notice.date).format('MM.DD') }}</span>
            </li>
          </ul>
          <div v-else class="empty-widget">
            등록된 공지사항이 없습니다.
          </div>
        </div>

        <!-- 3. Upcoming Events -->
        <div class="widget-card events-widget">
          <div class="widget-header">
            <h3>📅 다가오는 일정</h3>
          </div>
          <el-timeline v-if="filteredUpcomingEvents.length > 0">
            <el-timeline-item
              v-for="event in filteredUpcomingEvents"
              :key="event.id"
              :timestamp="dayjs(event.date).format('MM.DD (ddd)')"
              placement="top"
              color="#4CAF50"
            >
              <div class="event-card">
                <h4>{{ event.title }}</h4>
                <div class="event-meta">
                  <span><el-icon><Timer /></el-icon> {{ event.time }}</span>
                  <span><el-icon><Location /></el-icon> {{ event.location }}</span>
                </div>
                <div class="event-footer">
                  <span class="participants">👥 {{ event.participants }}명 참여 중</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <div v-else class="empty-widget">
             예정된 일정이 없습니다.
          </div>
        </div>
      </div>


      <!-- Right Column -->
      <div class="grid-column right">
        <!-- 2. Crew Info Widget (Moved here) -->
        <div class="widget-card crew-info-widget">
          <div class="widget-header">
            <h3>ℹ️ 크루 정보</h3>
          </div>
          <div class="crew-info-grid">
            <div class="info-item">
              <span class="info-label">평균 페이스</span>
              <span class="info-value">{{ formatPace(crewStore.currentCrew?.pace) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">활동 지역</span>
              <span class="info-value">{{ crewStore.currentCrew?.location || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">인원 수</span>
              <span class="info-value">{{ crewStore.members ? crewStore.members.length : 0 }}명</span>
            </div>
            <div class="info-item">
              <span class="info-label">주 연령대</span>
              <span class="info-value">{{ formatAgeGroup(crewStore.currentCrew?.ageRange) }}</span>
            </div>
          </div>
        </div>

        <!-- 4. Recent Posts -->
        <div class="widget-card posts-widget">
          <div class="widget-header">
            <h3>📝 최근 게시글</h3>
            <button class="btn-more" @click="router.push({ name: 'crew-board' })">더보기</button>
          </div>
          <ul class="post-list" v-if="dashboardData.recentPosts && dashboardData.recentPosts.length > 0">
            <li v-for="post in dashboardData.recentPosts" :key="post.id">
              <div class="post-main">
                <span class="post-title">{{ post.title }}</span>
                <span class="post-comments"><el-icon><ChatDotRound /></el-icon> {{ post.comments }}</span>
              </div>
              <span class="post-author">{{ post.author }}</span>
            </li>
          </ul>
          <div v-else class="empty-widget">
            등록된 게시글이 없습니다.
          </div>
        </div>
      </div>
    </div>

  </div>
  <div v-else class="loading-container">
    Loading...
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

/* Hero Banner styles removed */

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-banner {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Premium Widget Card - Light Glass / Purple Tint */
.widget-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.8);
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transition: all 0.3s ease;
}

.widget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.1);
  border-color: #E0E7FF;
}

/* Stagger Animations */
.grid-column.left .widget-card:nth-child(1) { animation-delay: 0.2s; }
.grid-column.left .widget-card:nth-child(2) { animation-delay: 0.4s; }
.grid-column.right .widget-card:nth-child(1) { animation-delay: 0.3s; }
.grid-column.right .widget-card:nth-child(2) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F3F4F6;
}

.widget-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  color: #1F2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-more {
  background: none;
  border: none;
  color: #818CF8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-more:hover {
  background-color: #EEF2FF;
  color: #6366f1;
}

/* Notices */
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-list li {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  border-radius: 12px;
  border-bottom: 1px solid #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;
}

.notice-list li:hover {
  background-color: #F9FAFB;
  transform: scale(1.02);
  padding-left: 20px;
}

.notice-list li:last-child {
  border-bottom: none;
}

.notice-list li.pinned {
  background: linear-gradient(to right, #EEF2FF, white);
  border: 1px solid #E0E7FF;
  margin-bottom: 8px;
}

.notice-icon {
  margin-right: 12px;
  font-size: 1.1rem;
}

.notice-title {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-date {
  font-size: 0.85rem;
  color: #9CA3AF;
  margin-left: 12px;
  background: #F3F4F6;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

/* Events */
.event-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #F3F4F6;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: #a855f7;
  opacity: 0;
  transition: opacity 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(168, 85, 247, 0.15);
  border-color: #d8b4fe;
}

.event-card:hover::before {
  opacity: 1;
}

.event-card h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #1F2937;
  font-weight: 700;
}

.event-meta {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #6B7280;
  margin-bottom: 16px;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F3F4F6;
  padding-top: 12px;
}

.participants {
  font-size: 0.9rem;
  color: #7c3aed; /* Violet */
  font-weight: 700;
  background: #F3E8FF;
  padding: 6px 12px;
  border-radius: 20px;
}

/* Crew Info Widget */
.crew-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  background: #F9FAFB;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.info-item:hover {
  background: white;
  border-color: #c4b5fd;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  transform: scale(1.05);
}

.info-label {
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 8px;
  font-weight: 600;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4b5563, #1f2937);
  background-clip: text; /* Standard property */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.info-item:hover .info-value {
   background: linear-gradient(135deg, #7c3aed, #db2777);
   background-clip: text; /* Standard property */
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
}

/* Posts */
.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
}

.post-list li:hover {
  background-color: #F9FAFB;
  transform: translateX(4px);
}

.post-list li:last-child {
  border-bottom: none;
}

.post-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.post-title {
  font-size: 0.95rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.post-comments {
  font-size: 0.8rem;
  color: #7c3aed;
  background: #F3E8FF;
  padding: 4px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.post-author {
  font-size: 0.85rem;
  color: #9CA3AF;
  margin-left: 12px;
  font-weight: 500;
}

.empty-widget {
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
  font-size: 0.95rem;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px dashed #D1D5DB;
}

.loading-container {
  text-align: center;
  padding: 80px;
  color: #9CA3AF;
  font-size: 1.1rem;
}
</style>
