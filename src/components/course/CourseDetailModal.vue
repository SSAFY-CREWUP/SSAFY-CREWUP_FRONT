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

// Helper to calculate left position % (10'00" -> 0%, 3'00" -> 100%)
const getPacePosition = (seconds) => {
  if (!seconds) return 0
  const slowest = 600 // 10 min
  const fastest = 180 // 3 min
  
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
    width="800px" 
    destroy-on-close
    align-center
    class="course-detail-modal"
    @opened="onOpened"
    :show-close="false"
  >
    <div v-if="localCourse" class="detail-container">
      
      <!-- Close Button (Absolute) -->
      <button class="absolute-close-btn" @click="dialogVisible = false">
        <el-icon><Close /></el-icon>
      </button>

      <!-- 1. Map Header -->
      <div class="map-header-wrapper">
        <div id="detail-map" class="map-view"></div>
        <div class="map-overlay-gradient"></div>
        
        <div class="header-overlay-content">
           <h2 class="course-title">{{ localCourse.title }}</h2>
           <div class="writer-row" v-if="localCourse.writerNickname || (localCourse.writer && localCourse.writer.nickname)">
              <div class="writer-pill">
                <el-avatar :size="20" :src="localCourse.writerProfileImage || localCourse.writer?.profileImage" :icon="UserFilled" />
                <span>{{ localCourse.writerNickname || localCourse.writer?.nickname }}</span>
              </div>
              <button class="scrap-btn-pill" @click="toggleScrap" :class="{ 'is-scrapped': localCourse.isScrapped }">
                 <el-icon v-if="localCourse.isScrapped"><StarFilled /></el-icon>
                 <el-icon v-else><Star /></el-icon>
                 <span>{{ localCourse.scrapCount || 0 }}</span>
              </button>
           </div>
        </div>
      </div>

      <div class="content-body">
        
        <!-- 2. Key Stats Grid -->
        <div class="stats-grid">
           <div class="stat-item">
              <el-icon class="stat-icon yellow"><StarFilled /></el-icon>
              <div class="stat-text">
                <span class="value">{{ localCourse.rating ? localCourse.rating.toFixed(1) : '0.0' }}</span>
                <span class="label">평점</span>
              </div>
           </div>
           <div class="stat-divider"></div>
           <div class="stat-item">
              <el-icon class="stat-icon blue"><TrendCharts /></el-icon>
              <div class="stat-text">
                <span class="value">{{ localCourse.avgDifficultyScore ? localCourse.avgDifficultyScore.toFixed(1) : '-' }}</span>
                <span class="label">난이도</span>
              </div>
           </div>
           <div class="stat-divider"></div>
           <div class="stat-item">
              <el-icon class="stat-icon green"><Timer /></el-icon>
              <div class="stat-text">
                 <span class="value">{{ localCourse.avgPace || '-' }}</span>
                 <span class="label">평균 페이스</span>
              </div>
           </div>
        </div>

        <!-- 3. Spectrum Bars Section -->
        <div class="section performance-section">
           <h3 class="section-title">코스 분석</h3>
           
           <!-- Pace Spectrum -->
           <div class="spectrum-row">
              <div class="spectrum-label-col">
                 <span class="spec-name">평균 페이스</span>
                 <span class="spec-value">{{ localCourse.avgPace || '정보 없음' }}</span>
              </div>
              <div class="spectrum-bar-area">
                  <div class="spectrum-bar pace-bar">
                    <div class="spectrum-track"></div>
                    <span class="track-label label-start">🐢 10'00"</span>
                    <span class="track-label label-end">🐆 3'00"</span>
                    
                    <!-- AVG Marker -->
                    <div class="spectrum-indicator" v-if="localCourse.avgPaceSeconds"
                      :style="{ left: getPacePosition(localCourse.avgPaceSeconds) + '%' }">
                      <div class="indicator-bubble">AVG</div>
                      <div class="indicator-line"></div>
                      <div class="indicator-dot"></div>
                    </div>
                    <!-- ME Marker -->
                    <div class="spectrum-indicator my-indicator" v-if="myPaceSeconds"
                      :style="{ left: getPacePosition(myPaceSeconds) + '%' }">
                      <div class="indicator-bubble me-bubble">ME</div>
                      <div class="indicator-line me-line"></div>
                      <div class="indicator-dot me-dot"></div>
                    </div>
                  </div>
              </div>
           </div>

           <!-- Difficulty Spectrum -->
           <div class="spectrum-row">
              <div class="spectrum-label-col">
                 <span class="spec-name">체감 난이도</span>
                 <span class="spec-value">{{ localCourse.avgDifficultyScore ? localCourse.avgDifficultyScore.toFixed(1) : '-' }} / 5.0</span>
              </div>
              <div class="spectrum-bar-area">
                  <div class="spectrum-bar difficulty-bar">
                    <div class="spectrum-track"></div>
                    <span class="track-label label-easy">EASY</span>
                    <span class="track-label label-hard">HARD</span>

                    <div class="spectrum-indicator" v-if="localCourse.avgDifficultyScore"
                      :style="{ left: ((localCourse.avgDifficultyScore - 1) / 4 * 100) + '%' }">
                      <div class="indicator-bubble">AVG</div>
                      <div class="indicator-line"></div>
                      <div class="indicator-dot"></div>
                    </div>
                  </div>
              </div>
           </div>
        </div>

        <!-- 4. Description & AI -->
        <div class="section-group">
            <div class="info-card description-card" v-if="localCourse.description">
               <div class="card-icon"><el-icon><Document /></el-icon></div>
               <div class="card-content">
                  <h4>코스 설명</h4>
                  <p>{{ localCourse.description }}</p>
               </div>
            </div>

            <div class="info-card ai-card" v-if="localCourse.aiSummary">
               <div class="card-icon ai-icon"><el-icon><MagicStick /></el-icon></div>
               <div class="card-content">
                  <div class="ai-header">
                     <h4>AI 요약</h4>
                     <el-tag size="small" effect="plain" round>Beta</el-tag>
                  </div>
                  <p class="ai-text">{{ localCourse.aiSummary }}</p>
               </div>
            </div>
            
            <!-- Keywords -->
            <div class="keywords-row" v-if="localCourse.sentiment">
                <div class="keyword-group positive" v-if="localCourse.sentiment.positive.length">
                   <span class="emoji">😊</span>
                   <div class="tags">
                      <span v-for="k in localCourse.sentiment.positive" :key="k" class="keyword-pill green">{{ k }}</span>
                   </div>
                </div>
                <div class="keyword-group negative" v-if="localCourse.sentiment.negative.length">
                   <span class="emoji">😓</span>
                   <div class="tags">
                      <span v-for="k in localCourse.sentiment.negative" :key="k" class="keyword-pill red">{{ k }}</span>
                   </div>
                </div>
            </div>
        </div>

        <!-- 5. Reviews -->
        <div class="section reviews-section">
           <div class="reviews-header">
              <h3>코스 후기 <span class="review-count">{{ localCourse.reviews ? localCourse.reviews.length : 0 }}</span></h3>
              <button 
                v-if="!localCourse.isMyCourse" 
                class="btn-write-pill"
                @click="showReviewForm = !showReviewForm"
              >
                <el-icon><EditPen /></el-icon> 작성하기
              </button>
           </div>

           <!-- Modern Review Form -->
           <transition name="slide-fade">
              <div v-if="showReviewForm" class="review-form-container">
                <div class="form-header">
                   <div class="form-rating-group">
                      <span class="label">평점</span>
                      <el-rate v-model="newReview.rating" size="small" />
                   </div>
                   <div class="form-rating-group">
                      <span class="label">난이도</span>
                      <el-slider v-model="newReview.difficulty" :min="1" :max="5" :step="1" show-stops style="width: 80px;" size="small" />
                      <span class="difficulty-text">{{ newReview.difficulty }}</span>
                   </div>
                </div>

                <div class="input-area">
                   <el-input 
                     v-model="newReview.content" 
                     type="textarea" 
                     :rows="3"
                     placeholder="코스와 함께한 경험을 공유해주세요." 
                     resize="none"
                   />
                   <div v-if="reviewImagePreview" class="image-preview-wrapper">
                      <img :src="reviewImagePreview" />
                      <button class="btn-remove-img" @click="clearReviewImage"><el-icon><Close /></el-icon></button>
                   </div>
                </div>

                <div class="form-footer">
                   <div class="footer-left">
                      <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileChange" />
                      <button class="btn-icon-action" @click="triggerFileUpload">
                         <el-icon><Camera /></el-icon> 사진 추가
                      </button>
                   </div>
                   <div class="footer-right">
                      <button class="btn-text-cancel" @click="showReviewForm = false">취소</button>
                      <button class="btn-primary-submit" @click="submitReview">등록</button>
                   </div>
                </div>
              </div>
           </transition>

           <div class="review-list" v-if="localCourse.reviews && localCourse.reviews.length > 0">
              <div v-for="review in localCourse.reviews" :key="review.id" class="review-card">
                 <div class="review-top">
                    <div class="reviewer-info">
                       <el-avatar :size="32" :src="review.writerProfileImage" class="reviewer-avatar">
                          <el-icon><UserFilled /></el-icon>
                       </el-avatar>
                       <div class="reviewer-meta">
                          <span class="name">{{ review.user }}</span>
                          <span class="date">{{ review.date }}</span>
                       </div>
                    </div>
                    <div class="review-rating">
                       <el-icon color="#FFD700"><StarFilled /></el-icon>
                       <span>{{ review.rating }}</span>
                    </div>
                 </div>
                 <p class="review-text">{{ review.content }}</p>
                 <div v-if="review.image" class="review-img-box">
                    <img :src="review.image" />
                 </div>
              </div>
           </div>
           
           <div v-else class="empty-state">
              <p>아직 등록된 후기가 없습니다.<br>첫 번째 후기의 주인공이 되어보세요! 🎉</p>
           </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* Modal Reset and Layout */
.course-detail-modal :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: #fff;
  padding: 0; 
}
.course-detail-modal :deep(.el-dialog__header) {
  display: none; /* Custom Header used */
}
.course-detail-modal :deep(.el-dialog__body) {
  padding: 0;
  max-height: 85vh; /* Scrollable body */
  overflow-y: auto;
}

.detail-container {
  position: relative;
  width: 100%;
}

.absolute-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}
.absolute-close-btn:hover {
  background: rgba(0,0,0,0.6);
  transform: scale(1.1);
}

/* 1. Map Header */
.map-header-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}
.map-view {
  width: 100%;
  height: 100%;
}
.map-overlay-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
  z-index: 1;
  pointer-events: none;
}
.header-overlay-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.course-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255,255,255,0.8);
}
.writer-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.writer-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.9);
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}
.scrap-btn-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgb(240, 240, 240);
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.scrap-btn-pill.is-scrapped {
  background: white;
  color: #FFB300;
  box-shadow: 0 2px 8px rgba(255, 179, 0, 0.2);
}

/* Body Content */
.content-body {
  padding: 0 24px 32px 24px;
}

/* 2. Stats Grid */
.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  margin-top: 10px; /* Slight offset from map */
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stat-icon {
  font-size: 1.5rem;
  padding: 10px;
  border-radius: 12px;
}
.stat-icon.yellow { background: #fff8e1; color: #ffca28; }
.stat-icon.blue { background: #e3f2fd; color: #42a5f5; }
.stat-icon.green { background: #e8f5e9; color: #66bb6a; }

.stat-text {
  display: flex;
  flex-direction: column;
}
.stat-text .value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #333;
}
.stat-text .label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}
.stat-divider {
  width: 1px;
  height: 30px;
  background: #f0f0f0;
}

/* 3. Section Common */
.section {
  margin-bottom: 32px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 16px 0;
}

/* Spectrum Analysis */
.performance-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 16px;
}
.spectrum-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.spectrum-row:last-child { margin-bottom: 0; }
.spectrum-label-col {
  width: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.spec-name { font-size: 0.85rem; color: #666; font-weight: 600; }
.spec-value { font-size: 0.95rem; color: #111; font-weight: 700; }
.spectrum-bar-area { flex: 1; }

/* REUSING SPECTRUM BAR CSS from old modal, but refining keys */
.spectrum-bar {
  position: relative;
  height: 12px;
  border-radius: 6px;
  width: 100%;
  margin-top: 10px; /* space for indicators */
}
.difficulty-bar {
  background: linear-gradient(90deg, #4CAF50 0%, #FFEB3B 50%, #FF5722 100%);
}
.pace-bar {
  background: linear-gradient(90deg, #10B981 0%, #3B82F6 100%);
}
.spectrum-track {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
}
.track-label {
  position: absolute;
  top: 18px;
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}
.label-start, .label-easy { left: 0; }
.label-end, .label-hard { right: 0; }

.spectrum-indicator {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.indicator-bubble {
  background: #333;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 2px;
}
.indicator-line {
  width: 2px;
  height: 8px;
  background: #333;
}
.indicator-dot {
  width: 8px;
  height: 8px;
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  margin-top: -1px;
}

/* My Marker */
.my-indicator {
  top: auto; 
  bottom: -32px; /* Push down */
  flex-direction: column-reverse;
}
.me-bubble { background: var(--color-primary); margin-bottom: 0; margin-top: 2px; }
.me-line { background: var(--color-primary); }
.me-dot { border-color: var(--color-primary); }

/* 4. Info Cards */
.section-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}
.info-card {
  display: flex;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
  color: #666;
  flex-shrink: 0;
}
.ai-card .card-icon {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #4F46E5;
}
.card-content h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #111;
}
.card-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}
.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.ai-header h4 { margin: 0; }

.keywords-row {
  display: flex;
  gap: 12px;
}
.keyword-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #eee;
}
.emoji { font-size: 1.2rem; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.keyword-pill {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.keyword-pill.green { background: #e8f5e9; color: #2e7d32; }
.keyword-pill.red { background: #ffebee; color: #c62828; }


/* 5. Reviews */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.reviews-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}
.review-count {
  color: var(--color-primary);
  margin-left: 4px;
}

.btn-write-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e0e0e0;
  padding: 6px 16px;
  border-radius: 20px;
  color: #555;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.btn-write-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Modern Review Form (The one user liked) */
.review-form-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}
.form-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.form-rating-group { display: flex; align-items: center; gap: 8px; }
.form-rating-group .label { font-size: 0.85rem; font-weight: 600; color: #666; }
.difficulty-text { font-weight: 700; color: var(--color-primary); width: 24px; text-align: center; }

.input-area { position: relative; margin-bottom: 12px; }
.image-preview-wrapper {
  margin-top: 10px;
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}
.image-preview-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-img {
  position: absolute; top: 4px; right: 4px;
  background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.form-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.footer-left { display: flex; align-items: center; }
.btn-icon-action {
  background: none; border: none; display: flex; align-items: center; gap: 6px; color: #666; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: all 0.2s; font-size: 0.9rem;
}
.btn-icon-action:hover { background-color: #f5f5f5; color: var(--color-primary); }

.footer-right { display: flex; gap: 12px; }
.btn-text-cancel {
  background: none; border: none; color: #888; font-weight: 600; cursor: pointer; padding: 8px 16px; font-size: 0.9rem;
}
.btn-text-cancel:hover { color: #333; }
.btn-primary-submit {
  background: var(--color-primary); color: white; border: none; padding: 8px 24px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: transform 0.1s;
}
.btn-primary-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(0,0,0,0.2); }
.btn-primary-submit:active { transform: translateY(0); }

/* Review List */
.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s;
}
.review-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.review-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.reviewer-avatar { background: #f0f0f0; color: #999; }
.reviewer-meta { display: flex; flex-direction: column; }
.reviewer-meta .name { font-weight: 700; font-size: 0.9rem; color: #111; }
.reviewer-meta .date { font-size: 0.75rem; color: #999; }

.review-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fffdf0;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #fff3c4;
  font-weight: 700;
  font-size: 0.9rem;
  color: #f9a825;
}

.review-text {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.5;
  margin: 0 0 10px 0;
}
.review-img-box {
  width: 100%;
  max-width: 240px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}
.review-img-box img { width: 100%; display: block; }

.empty-state { text-align: center; padding: 40px; background: #fafafa; border-radius: 16px; color: #888; font-size: 0.95rem; line-height: 1.6; }

/* Animation */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }
</style>
