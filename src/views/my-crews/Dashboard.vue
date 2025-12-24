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
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.widget-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.btn-more {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
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
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.notice-list li:last-child {
  border-bottom: none;
}

.notice-list li.pinned {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.notice-icon {
  margin-right: 8px;
}

.notice-title {
  flex: 1;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-date {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  margin-left: 10px;
}

/* Activity */
.activity-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #e0e0e0;
}

.btn-detail {
  width: 100%;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
  cursor: pointer;
}

/* Events */
.event-card {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.event-card h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.event-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participants {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.btn-join {
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
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
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.post-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-title {
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.post-comments {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.post-author {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* MVP */
.mvp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mvp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.mvp-badge {
  background: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.mvp-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffd700;
}

.mvp-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.loading-container {
  text-align: center;
  padding: 50px;
  color: var(--color-text-tertiary);
}
/* Crew Info Widget */
.crew-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.info-item.full-width {
  grid-column: span 2;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 20px;
}

.info-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.info-item.full-width .info-label {
  margin-bottom: 0;
}

.info-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.info-value.highlight {
  color: var(--color-primary);
}

.empty-widget {
  text-align: center;
  padding: 30px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  background: #f9fafb;
  border-radius: 8px;
}
</style>
