<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Plus, MapLocation, Trophy, Filter, Sort } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const crewStore = useCrewStore()
const crewId = route.params.id

const courses = ref([])
const loading = ref(false)
const sortOrder = ref('distance')
const difficultyFilter = ref('전체')

// Detail Modal State
const showDetail = ref(false)
const selectedCourse = ref(null)
const detailLoading = ref(false)

const fetchCourses = async () => {
  loading.value = true
  try {
    const data = await crewStore.fetchCrewCourses(crewId, {
      sort: sortOrder.value,
      difficulty: difficultyFilter.value
    })
    courses.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})

watch([sortOrder, difficultyFilter], () => {
  fetchCourses()
})

const navigateToCreate = () => {
  router.push(`/crews/${crewId}/courses/create`)
}

const openDetail = async (course) => {
  selectedCourse.value = null
  showDetail.value = true
  detailLoading.value = true
  try {
    console.log('Fetching detail for course:', course.id)
    selectedCourse.value = await crewStore.fetchCrewCourseDetail(crewId, course.id)
    console.log('Fetched detail:', selectedCourse.value)
  } catch (error) {
    console.error('Failed to fetch course detail:', error)
  } finally {
    detailLoading.value = false
  }
}

const getDifficultyColor = (diff) => {
  const map = {
    'Easy': '#4CAF50',
    'Medium': '#FF9800',
    'Hard': '#F44336'
  }
  return map[diff] || '#999'
}
</script>

<template>
  <div class="courses-view">
    <div class="page-header">
      <div class="header-text">
        <h2>크루 코스</h2>
        <p>우리 크루만의 러닝 코스를 확인해보세요.</p>
      </div>
      <button class="btn-create" @click="navigateToCreate">
        <el-icon><Plus /></el-icon>
        코스 만들기
      </button>
    </div>

    <!-- Controls -->
    <div class="controls-bar">
      <div class="control-group">
        <el-select v-model="sortOrder" placeholder="정렬" style="width: 120px">
          <template #prefix><el-icon><Sort /></el-icon></template>
          <el-option label="거리순" value="distance" />
          <el-option label="이름순" value="name" />
        </el-select>
        <el-select v-model="difficultyFilter" placeholder="난이도" style="width: 120px">
          <template #prefix><el-icon><Filter /></el-icon></template>
          <el-option label="전체" value="전체" />
          <el-option label="Easy" value="Easy" />
          <el-option label="Medium" value="Medium" />
          <el-option label="Hard" value="Hard" />
        </el-select>
      </div>
    </div>

    <!-- Grid -->
    <div class="course-grid" v-loading="loading">
      <div v-if="courses.length === 0" class="empty-state">
        <el-icon :size="50"><MapLocation /></el-icon>
        <p>등록된 코스가 없습니다.</p>
      </div>
      
      <div v-else v-for="course in courses" :key="course.id" class="course-card" @click="openDetail(course)">
        <div class="course-image-wrapper">
          <img :src="course.image" alt="Course Map" class="course-image" />
          <span 
            class="difficulty-badge"
            :style="{ backgroundColor: getDifficultyColor(course.difficulty) }"
          >
            {{ course.difficulty }}
          </span>
        </div>
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-stats">
            <div class="stat">
              <span class="label">거리</span>
              <span class="value">{{ course.distance }}km</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <el-dialog
      v-model="showDetail"
      title="코스 상세 정보"
      width="600px"
      destroy-on-close
      center
    >
      <div v-if="detailLoading" class="loading-state">
        Loading...
      </div>
      <div v-else-if="selectedCourse" class="detail-content">
        <!-- Saved Image -->
        <div class="detail-image-wrapper">
          <img :src="selectedCourse.savedImage" class="detail-image" />
        </div>

        <!-- Info -->
        <div class="detail-info">
          <h2>{{ selectedCourse.title }}</h2>
          <div class="detail-tags">
            <el-tag effect="dark" :color="getDifficultyColor(selectedCourse.difficulty)" style="border:none; color:white;">
              {{ selectedCourse.difficulty }}
            </el-tag>
            <el-tag effect="plain">{{ selectedCourse.distance }}km</el-tag>
          </div>
        </div>

        <!-- Sentiment Analysis -->
        <div class="sentiment-section">
          <h3>💡 AI 코스 분석</h3>
          <div class="sentiment-group">
            <div class="sentiment-col positive">
              <h4>😊 긍정 키워드</h4>
              <div class="keywords">
                <el-tag v-for="k in selectedCourse.sentiment.positive" :key="k" type="success" effect="light">{{ k }}</el-tag>
              </div>
            </div>
            <div class="sentiment-col negative">
              <h4>😓 부정 키워드</h4>
              <div class="keywords">
                <el-tag v-for="k in selectedCourse.sentiment.negative" :key="k" type="danger" effect="light">{{ k }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="reviews-section">
          <h3>💬 크루원 후기</h3>
          <ul class="review-list">
            <li v-for="review in selectedCourse.reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="review-user">{{ review.user }}</span>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.courses-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-text p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #45a049;
}

.controls-bar {
  margin-bottom: 24px;
}

.control-group {
  display: flex;
  gap: 12px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--color-border-light);
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.course-image-wrapper {
  position: relative;
  height: 160px;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.difficulty-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.course-content {
  padding: 16px;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-stats {
  display: flex;
  justify-content: space-between;
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat .label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stat .value {
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-tertiary);
}

/* Detail Modal Styles */
.detail-image-wrapper {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  margin-bottom: 24px;
  text-align: center;
}

.detail-info h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.detail-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.sentiment-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.sentiment-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.sentiment-group {
  display: flex;
  gap: 20px;
}

.sentiment-col {
  flex: 1;
}

.sentiment-col h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reviews-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.review-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.review-user {
  font-weight: 600;
}

.review-date {
  color: var(--color-text-tertiary);
}

.review-content {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.loading-state {
  text-align: center;
  padding: 40px;
}
</style>
