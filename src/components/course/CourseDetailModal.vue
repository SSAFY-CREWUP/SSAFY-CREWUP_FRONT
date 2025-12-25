<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  StarFilled, EditPen, Star, UserFilled, Camera, Close, Picture,
  Document, MagicStick, ChatLineRound, TrendCharts, Timer
} from '@element-plus/icons-vue'
import { useKakaoMap } from '../../composables/useKakaoMap'
import { useAuthStore } from '../../stores/auth' // Import Auth Store
import courseApi from '../../api/course' // Import real API

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
const newReview = ref({ rating: 5, difficulty: 3, content: '' })
const reviewImageFile = ref(null)
const reviewImagePreview = ref(null)
const fileInput = ref(null)

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }
    reviewImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      reviewImagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const clearReviewImage = () => {
  reviewImageFile.value = null
  reviewImagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// Pagination refs removed as per user request

const localCourse = ref(null) // Data fetched from API

watch(() => props.course, (newVal) => {
  // Reset local course when prop changes
  if (newVal) {
    localCourse.value = { ...newVal } // Start with prop data
  }
}, { immediate: true })

// fetchReviews removed, moved to fetchDetail

// handlePageChange removed

const submitReview = async () => {
  if (!newReview.value.content.trim()) return
  
  try {
    const formData = new FormData()
    formData.append('data', new Blob([JSON.stringify({
      rating: newReview.value.rating,
      difficultyScore: newReview.value.difficulty,
      content: newReview.value.content
    })], { type: 'application/json' }))
    
    // If image support is needed later: formData.append('image', file)
    if (reviewImageFile.value) {
      formData.append('image', reviewImageFile.value)
    }
 
    await courseApi.createReview(props.course.courseId, formData)
    
    alert('후기가 등록되었습니다.')
    newReview.value.content = ''
    newReview.value.difficulty = 3 // Reset to Normal
    clearReviewImage() // Reset Image
    showReviewForm.value = false
    
    // Refresh detail to show new review
    // Refresh detail to show new review
    fetchDetail()
  } catch (error) {
    console.error('Failed to submit review:', error)
    if (error.response && error.response.status === 401) {
      alert('로그인이 필요한 서비스입니다.')
    }
  }
}

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const mapContainer = ref(null)
let map = null
const { loadKakaoMap } = useKakaoMap()
const authStore = useAuthStore() // Use Auth Store

const myPaceSeconds = computed(() => {
  if (!authStore.user || !authStore.user.averagePace) return null
  const p = authStore.user.averagePace
  // Parse "MM'SS"" or "MM:SS"
  try {
     const parts = p.replace(/"/g, '').split(/[':]/)
     if (parts.length >= 2) {
       return parseInt(parts[0]) * 60 + parseInt(parts[1])
     }
  } catch (e) {
    console.error('Pace parse error:', e)
  }
  return null
})

// Helper to calculate left position % (8'00" -> 0%, 4'00" -> 100%)
const getPacePosition = (seconds) => {
  if (!seconds) return 0
  const slowest = 480 // 8 min
  const fastest = 240 // 4 min
  
  if (seconds >= slowest) return 0
  if (seconds <= fastest) return 100
  
  return ((slowest - seconds) / (slowest - fastest)) * 100
}

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

const fetchDetail = async () => {
  if (!props.course || !props.course.courseId) return
  
  try {
    // 1. Fetch Course Detail
    const response = await courseApi.getCourseDetail(props.course.courseId)
    const data = response.data.data
    
    // Parse AI Keywords (JSON String -> Object)
    if (data.aiKeywords && typeof data.aiKeywords === 'string') {
      try {
        data.sentiment = JSON.parse(data.aiKeywords)
      } catch (e) {
        console.error('Failed to parse aiKeywords:', e)
        data.sentiment = null
      }
    }

    localCourse.value = data
  
    // 2. Fetch Reviews (Restored Simple Fetch)
    const reviewResponse = await courseApi.getReviewList(props.course.courseId)
    // Handle potential PageResponse vs List (just in case backend is mixed)
    // But since we are rolling back to 'before', we assume List or we extract content if PageResponse
    let rawReviews = []
    if (Array.isArray(reviewResponse.data.data)) {
        rawReviews = reviewResponse.data.data
    } else if (reviewResponse.data.data && Array.isArray(reviewResponse.data.data.content)) {
         rawReviews = reviewResponse.data.data.content
    }

    localCourse.value.reviews = rawReviews.map(r => ({
      id: r.reviewId,
      user: r.writerNickname,
      rating: r.rating,
      content: r.content,
      date: r.createdDate ? r.createdDate.split('T')[0] : (r.createdAt ? r.createdAt.split('T')[0] : ''),
      image: r.reviewImage || r.image,
      writerProfileImage: r.writerProfileImage,
      isMyReview: r.isMyReview
    }))

  } catch (error) {
    console.error('Failed to fetch detail:', error)
  }
}

const onOpened = async () => {
  try {
    await fetchDetail() // Fetch full details including path and reviews
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
  if (localCourse.value.path && localCourse.value.path.length > 0) {
    const path = localCourse.value.path.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
    
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

const toggleScrap = async () => {
  if (!localCourse.value) return

  try {
    const response = await courseApi.toggleScrap(localCourse.value.courseId)
    const isNowScrapped = response.data.data // Boolean from API

    // Update local state
    localCourse.value.isScrapped = isNowScrapped
    
    // Update count
    if (isNowScrapped) {
      localCourse.value.scrapCount = (localCourse.value.scrapCount || 0) + 1
      alert('코스가 스크랩되었습니다.')
    } else {
      localCourse.value.scrapCount = (localCourse.value.scrapCount || 0) - 1
      alert('코스 스크랩이 취소되었습니다.')
    }
  } catch (error) {
    console.error('Scrap failed:', error)
    if (error.response && error.response.status === 401) {
      alert('로그인이 필요한 서비스입니다.')
    }
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
    <div v-if="localCourse" class="detail-content">
      <!-- Map Area -->
      <div class="map-wrapper">
        <div id="detail-map" class="map-view"></div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <div class="title-row">
          <h2>{{ localCourse.title }}</h2>
          <button class="btn-scrap-lg" @click="toggleScrap">
            <el-icon v-if="localCourse.isScrapped" color="#FFB300" :size="24"><StarFilled /></el-icon>
            <el-icon v-else :size="24"><Star /></el-icon>
          </button>
        </div>

        <div class="writer-info" v-if="localCourse.writerNickname || (localCourse.writer && localCourse.writer.nickname)">
          <el-avatar :size="24" :src="localCourse.writerProfileImage || localCourse.writer?.profileImage" :icon="UserFilled" />
          <span class="writer-name">{{ localCourse.writerNickname || localCourse.writer?.nickname }}</span>
        </div>
        
        <div class="rating-row" v-if="localCourse.rating">
          <el-icon color="#FFD700" :size="20"><StarFilled /></el-icon>
          <span class="rating-score">{{ localCourse.rating }}</span>
          <span class="rating-text">/ 5.0</span>
        </div>

        <div class="detail-tags">
          <!-- Difficulty Spectrum Bar -->
          <div class="spectrum-box difficulty-spectrum-box">
             <div class="spectrum-header">
               <span class="spectrum-title"><el-icon><TrendCharts /></el-icon> 체감 난이도</span>
             </div>
             <div class="spectrum-bar difficulty-bar">
                <div class="spectrum-track"></div>
                <!-- Labels -->
                 <span class="track-label label-easy">EASY</span>
                 <span class="track-label label-hard">HARD</span>
                
                <!-- AVG Marker -->
                <div 
                  class="spectrum-indicator" 
                  v-if="localCourse.avgDifficultyScore"
                  :style="{ left: ((localCourse.avgDifficultyScore - 1) / 4 * 100) + '%' }"
                >
                  <div class="indicator-bubble">AVG</div>
                  <div class="indicator-line"></div>
                  <div class="indicator-dot"></div>
                </div>
             </div>
             <div class="spectrum-value">
                평균 {{ localCourse.avgDifficultyScore ? localCourse.avgDifficultyScore.toFixed(1) : '?' }} / 5.0
             </div>
          </div>

          <!-- Pace Spectrum Bar -->
          <div class="spectrum-box pace-spectrum-box">
             <div class="spectrum-header">
               <span class="spectrum-title"><el-icon><Timer /></el-icon> 평균 페이스</span>
             </div>
             <div class="spectrum-bar pace-bar">
                <div class="spectrum-track"></div>
                 <!-- Labels with Icons -->
                 <span class="track-label label-start">
                    🐢 8'00"
                 </span>
                 <span class="track-label label-end">
                    🐆 4'00"
                 </span>

                <!-- AVG Marker -->
                <div 
                  class="spectrum-indicator"
                  v-if="localCourse.avgPaceSeconds"
                  :style="{ left: getPacePosition(localCourse.avgPaceSeconds) + '%' }"
                >
                  <div class="indicator-bubble">AVG</div>
                  <div class="indicator-line"></div>
                  <div class="indicator-dot"></div>
                </div>

                <!-- ME Marker -->
                <div 
                  class="spectrum-indicator my-indicator"
                  v-if="myPaceSeconds"
                  :style="{ left: getPacePosition(myPaceSeconds) + '%' }"
                >
                  <div class="indicator-bubble me-bubble">ME</div>
                  <div class="indicator-line me-line"></div>
                  <div class="indicator-dot me-dot"></div>
                </div>
             </div>
             <div class="spectrum-value">
                기록 {{ localCourse.avgPace ? localCourse.avgPace : '정보 없음' }}
             </div>
          </div>
        </div>
      </div>
      <!-- Course Description (User provided) -->
      <div class="section-box" v-if="localCourse.description">
        <h3><el-icon><Document /></el-icon> 코스 설명</h3>
        <p class="description-text">{{ localCourse.description }}</p>
      </div>
      
      <!-- AI Summary -->
      <div class="section-box" v-if="localCourse.aiSummary">
        <h3><el-icon><MagicStick /></el-icon> AI 후기 요약</h3>
        <p class="ai-summary-text">
          {{ localCourse.aiSummary }}
        </p>
      </div>

      <!-- Sentiment Analysis (Keywords) -->
      <div v-if="localCourse.sentiment" class="section-box">
        <h3>💡 키워드 분석</h3>
        <div class="sentiment-group">
          <div class="sentiment-col positive">
            <h4>😊 긍정 키워드</h4>
            <div class="keywords">
              <el-tag v-for="k in localCourse.sentiment.positive" :key="k" type="success" effect="light">{{ k }}</el-tag>
            </div>
          </div>
          <div class="sentiment-col negative">
            <h4>😓 부정 키워드</h4>
            <div class="keywords">
              <el-tag v-for="k in localCourse.sentiment.negative" :key="k" type="danger" effect="light">{{ k }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="section-box">
        <div class="reviews-title-row">
          <h3><el-icon><ChatLineRound /></el-icon> 코스 후기</h3>
          <button 
            v-if="!localCourse.isMyCourse" 
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
          
          <!-- Difficulty Slider -->
          <div class="form-rating">
             <span>체감 난이도:</span>
             <el-slider 
               v-model="newReview.difficulty" 
               :min="1" 
               :max="5" 
               :step="1" 
               show-stops
               style="width: 150px; margin-left: 10px;"
             />
             <span style="font-size:0.85rem; margin-left:8px; color:#666;">
               (1: 쉬움 ~ 5: 어려움)
             </span>
          </div>

          <!-- Image Upload -->
          <div class="image-upload-box">
             <div class="upload-btn" @click="triggerFileUpload">
                <el-icon><Camera /></el-icon> 사진 추가
             </div>
             <input 
               type="file" 
               ref="fileInput" 
               accept="image/*" 
               style="display: none" 
               @change="handleFileChange" 
             />
             
             <div v-if="reviewImagePreview" class="preview-container">
               <img :src="reviewImagePreview" class="preview-img" />
               <div class="remove-btn" @click.stop="clearReviewImage">
                 <el-icon><Close /></el-icon>
               </div>
             </div>
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
        
        
        <ul class="review-list" v-if="localCourse.reviews && localCourse.reviews.length > 0">
          <li v-for="review in localCourse.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="user-row">
                 <el-avatar :size="24" :src="review.writerProfileImage" :icon="UserFilled" />
                 <span class="review-user">{{ review.user }}</span>
                 <div class="mini-rating">
                   <el-icon color="#FFD700" :size="14"><StarFilled /></el-icon>
                   {{ review.rating }}
                 </div>
              </div>
              <span class="review-date">{{ review.date }}</span>
            </div>
            <p class="review-content">{{ review.content }}</p>
            <div v-if="review.image" class="review-image">
               <img :src="review.image" alt="review" />
            </div>
          </li>
        </ul>
        <div v-else class="no-reviews">
          <p>등록된 후기가 없습니다. 첫 후기를 남겨보세요!</p>
        </div>

        <!-- Pagination -->
        <!-- Pagination Removed -->

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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-info h2 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-scrap-lg {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.btn-scrap-lg:hover {
  transform: scale(1.1);
}

.writer-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

.writer-name {
  font-weight: 500;
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


/* Spectrum Bar Styles */
.detail-tags {
  display: flex;
  flex-direction: column; /* Stack vertically now */
  gap: 16px;
  width: 100%;
  margin-top: 10px;
}

.spectrum-box {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.spectrum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spectrum-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.spectrum-bar {
  position: relative;
  height: 24px;   /* Height for labels */
  margin: 20px 0 10px 0; /* Space for top bubble */
}

.spectrum-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  border-radius: 3px;
  transform: translateY(-50%);
  background: #eee; /* Fallback */
}

.difficulty-bar .spectrum-track {
  /* Neon Energy Gradient: Green -> Yellow -> Red */
  background: linear-gradient(90deg, #00E676 0%, #FFEA00 50%, #FF1744 100%);
}

.pace-bar .spectrum-track {
   /* Neon Energy Gradient: Green -> Yellow -> Red */
  background: linear-gradient(90deg, #00E676 0%, #FFEA00 50%, #FF1744 100%);
}

.track-label {
  position: absolute;
  top: 14px; /* Below track */
  font-size: 10px;
  color: #999;
  font-weight: 600;
}

.label-easy { left: 0; }
.label-hard { right: 0; }
.label-start { left: 0; display:flex; gap:2px; }
.label-end { right: 0; display:flex; gap:2px; }

.spectrum-value {
  text-align: right;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Indicators */
.spectrum-indicator {
  position: absolute;
  top: 50%; 
  transform: translate(-50%, -50%); /* Centered on position */
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  top: -12px; /* Pull up to sit on track */
}

.indicator-bubble {
  background: var(--color-text-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-bottom: 2px;
  font-weight: bold;
  white-space: nowrap;
}

.indicator-line {
  width: 2px;
  height: 14px;
  background: var(--color-text-primary);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: white;
  border: 2px solid var(--color-text-primary);
  border-radius: 50%;
  margin-top: -1px;
}

/* My Marker: Below the track for differentiation */
.my-indicator {
  top: auto; 
  bottom: -36px; /* Push down */
  flex-direction: column-reverse;
}

.me-bubble {
  background: var(--color-primary);
  margin-bottom: 0;
  margin-top: 2px;
}

.me-line {
  background: var(--color-primary);
}

.me-dot {
  border-color: var(--color-primary);
}

/* Image Upload Styles */
.image-upload-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--color-primary);
  border: 1px dashed var(--color-primary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.upload-btn:hover {
  background: #f0f9eb;
}
.preview-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pagination-wrapper {
  margin-top: var(--space-4);
  display: flex;
  justify-content: center;
}
</style>
