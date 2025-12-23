<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { StarFilled, EditPen } from '@element-plus/icons-vue'
import { useKakaoMap } from '../../composables/useKakaoMap'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  course: {
    type: Object,
    default: null
  }
})

const showReviewForm = ref(false)
const newReview = ref({ rating: 5, content: '' })

const submitReview = () => {
  if (!newReview.value.content.trim()) return
  
  if (!props.course.reviews) props.course.reviews = []
  
  props.course.reviews.unshift({
    id: Date.now(),
    user: 'Me', 
    rating: newReview.value.rating,
    date: new Date().toISOString().split('T')[0],
    content: newReview.value.content
  })
  
  newReview.value.content = ''
  showReviewForm.value = false
}

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const mapContainer = ref(null)
let map = null
const { loadKakaoMap } = useKakaoMap()

// Helper to parse POINT(lng lat)
const parseWktToLatLng = (wkt) => {
  if (!wkt) return null
  try {
    const match = wkt.match(/POINT\s*\(\s*([0-9.]+)\s+([0-9.]+)\s*\)/)
    if (match) {
      const lng = parseFloat(match[1])
      const lat = parseFloat(match[2])
      return new window.kakao.maps.LatLng(lat, lng)
    }
  } catch (e) {
    console.error('WKT parse error:', e)
  }
  return null
}

const onOpened = async () => {
  try {
    await loadKakaoMap()
    // Small delay to ensure DOM is ready inside the dialog
    setTimeout(() => initMap(), 100)
  } catch (error) {
    console.error('Failed to load Kakao Map:', error)
  }
}

const initMap = () => {
  const container = document.getElementById('detail-map')
  if (!container || !props.course) return

  const center = parseWktToLatLng(props.course.mainPointWkt) || new window.kakao.maps.LatLng(37.566826, 126.9786567)

  const options = {
    center: center,
    level: 4
  }
  map = new window.kakao.maps.Map(container, options)

  // 1. Draw Path (Polyline)
  if (props.course.path && props.course.path.length > 0) {
    const path = props.course.path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
    
    // Draw Line
    const polyline = new window.kakao.maps.Polyline({
      path: path,
      strokeWeight: 6,
      strokeColor: '#3B82F6', // Blue
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    })
    polyline.setMap(map)

    // 2. Start & End Markers
    // Start Marker (Blue Image or Default)
    const startSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png' // Default Red
    const endSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png' // Default Blue
    // Actually, let's use standard markers with titles for simplicity, or custom images if user provided assets.
    // We will use Simple Markers with titles.

    // Start
    const startMarker = new window.kakao.maps.Marker({
      position: path[0],
      map: map,
      title: '출발'
    })

    // End
    const endMarker = new window.kakao.maps.Marker({
      position: path[path.length - 1],
      map: map,
      title: '도착'
    })

    // 3. Set Bounds to fit path
    const bounds = new window.kakao.maps.LatLngBounds()
    path.forEach(p => bounds.extend(p))
    map.setBounds(bounds)

  } else if (center) {
    // Fallback if no path: Single Marker
    new window.kakao.maps.Marker({
      position: center,
      map: map
    })
  }
}

const formatDistance = (meters) => {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + 'km'
  }
  return meters + 'm'
}

const getDifficultyColor = (diff) => {
  const map = {
    'EASY': '#4CAF50',
    'NORMAL': '#FF9800',
    'HARD': '#F44336'
  }
  return map[diff] || '#999'
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="코스 상세 정보"
    width="600px"
    destroy-on-close
    center
    @opened="onOpened"
  >
    <div v-if="course" class="detail-content">
      <!-- Map Area -->
      <div class="map-wrapper">
        <div id="detail-map" class="map-view"></div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <h2>{{ course.title }}</h2>
        
        <div class="rating-row" v-if="course.rating">
          <el-icon color="#FFD700" :size="20"><StarFilled /></el-icon>
          <span class="rating-score">{{ course.rating }}</span>
          <span class="rating-text">/ 5.0</span>
        </div>

        <div class="detail-tags">
          <el-tag effect="dark" :color="getDifficultyColor(course.difficulty)" style="border:none; color:white;">
            {{ course.difficulty }}
          </el-tag>
          <el-tag effect="plain">{{ formatDistance(course.distance) }}</el-tag>
          <el-tag effect="plain">⏱ {{ course.expectedTime }}분</el-tag>
        </div>
      </div>
      <!-- Course Description (User provided) -->
      <div class="section-box" v-if="course.description">
        <h3>📝 코스 설명</h3>
        <p class="description-text">{{ course.description }}</p>
      </div>
      
      <!-- AI Summary -->
      <div class="section-box" v-if="course.aiSummary">
        <h3>🤖 AI 후기 요약</h3>
        <p class="ai-summary-text">
          {{ course.aiSummary }}
        </p>
      </div>

      <!-- Sentiment Analysis (Keywords) -->
      <div v-if="course.sentiment" class="section-box">
        <h3>💡 키워드 분석</h3>
        <div class="sentiment-group">
          <div class="sentiment-col positive">
            <h4>😊 긍정 키워드</h4>
            <div class="keywords">
              <el-tag v-for="k in course.sentiment.positive" :key="k" type="success" effect="light">{{ k }}</el-tag>
            </div>
          </div>
          <div class="sentiment-col negative">
            <h4>😓 부정 키워드</h4>
            <div class="keywords">
              <el-tag v-for="k in course.sentiment.negative" :key="k" type="danger" effect="light">{{ k }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="section-box">
        <div class="reviews-title-row">
          <h3>💬 코스 후기 ({{ course.reviews ? course.reviews.length : 0 }})</h3>
          <button 
            v-if="course.isScrapped" 
            class="btn-write-review"
            @click="showReviewForm = !showReviewForm"
          >
            <el-icon><EditPen /></el-icon> 후기 작성
          </button>
        </div>

        <!-- Review Form -->
        <div v-if="showReviewForm" class="review-form-container">
          <div class="form-rating">
            <span>나의 평점:</span>
            <el-rate v-model="newReview.rating" />
          </div>
          <el-input 
            v-model="newReview.content" 
            type="textarea" 
            rows="3"
            placeholder="코스에 대한 솔직한 후기를 남겨주세요." 
            class="review-input"
          />
          <div class="form-actions">
            <button class="btn-cancel" @click="showReviewForm = false">취소</button>
            <button class="btn-submit" @click="submitReview">등록</button>
          </div>
        </div>
        
        <ul class="review-list" v-if="course.reviews && course.reviews.length > 0">
          <li v-for="review in course.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="user-row">
                 <span class="review-user">{{ review.user }}</span>
                 <div class="mini-rating">
                   <el-icon color="#FFD700" :size="14"><StarFilled /></el-icon>
                   {{ review.rating }}
                 </div>
              </div>
              <span class="review-date">{{ review.date }}</span>
            </div>
            
            <p class="review-content">{{ review.content }}</p>
            
            <div class="review-image" v-if="review.image">
              <img :src="review.image" alt="Review Image" />
            </div>
          </li>
        </ul>
        <p v-else class="no-reviews">아직 후기가 없습니다.</p>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* Resembles Tailwind w-full h-[350px] rounded-t-xl */
.map-wrapper {
  width: 100%;
  height: 350px;
  border-radius: 12px 12px 0 0; /* rounded-t-xl approx 12px */
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #f0f0f0;
}

.map-view {
  width: 100%;
  height: 100%;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}

.rating-score {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.rating-text {
  font-size: 0.9rem;
  color: #888;
}

.section-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.section-box h3, .sentiment-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 700;
}

.ai-summary-text, .description-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.ai-summary-text {
  color: #555;
  background-color: #eef2ff;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #3B82F6;
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
  /* Using shared section-box style now mostly, but kept for compatibility if needed */
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

.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.review-image {
  margin-top: 8px;
  width: 100%;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.review-image img {
  width: 100%;
  height: auto;
  display: block;
}

.no-reviews {
  text-align: center;
  color: #999;
  font-size: 0.9rem;
}

.reviews-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviews-title-row h3 {
  margin: 0;
}

.btn-write-review {
  background: white;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-write-review:hover {
  background: #f0f9eb;
}

.review-form-container {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 16px;
}

.form-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.review-input {
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel, .btn-submit {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-submit {
  background: var(--color-primary);
  color: white;
}
</style>
