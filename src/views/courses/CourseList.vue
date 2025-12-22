<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, MapLocation, Filter, Sort, Refresh, Search, Star, StarFilled, View, Clock } from '@element-plus/icons-vue'
import CourseDetailModal from '../../components/course/CourseDetailModal.vue'
import { useKakaoMap } from '../../composables/useKakaoMap'

const router = useRouter()
const { loadKakaoMap } = useKakaoMap()

const loading = ref(false)
const sortOrder = ref('popularity')
const difficultyFilter = ref('ALL')
const searchQuery = ref('')

// Detail Modal State
const showDetail = ref(false)
const selectedCourse = ref(null)

// Map State
const mapContainer = ref(null)
let map = null
let markers = []
const showSearchButton = ref(false)

// Interaction State
const highlightedId = ref(null)
const itemRefs = ref({})

const setItemRef = (el, id) => {
  if (el) itemRefs.value[id] = el
}

// Dummy Data matching CourseListResponse DTO
const courses = ref([
  {
    courseId: 1,
    title: '서울 시청 주변 러닝',
    thumbnail: 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?w=400&h=300&fit=crop',
    distance: 3500, // meters
    expectedTime: 20, // minutes
    difficulty: 'EASY',
    scrapCount: 42,
    viewCount: 1240,
    mainPointWkt: 'POINT(126.9786567 37.566826)',
    // Detail Data
    rating: 4.8,
    description: '서울 시청 광장에서 시작하여 광화문을 돌아오는 도심 속 러닝 코스입니다. 점심시간이나 퇴근 후 가볍게 뛰기 좋습니다.',
    aiSummary: '이 코스는 도심 접근성이 뛰어나며 평탄한 지형 덕분에 초보 러너들에게 인기가 많습니다. 특히 야간의 도시 조명이 아름다워 야경 명소로도 꼽힙니다. 다만 퇴근 시간대에는 인파가 다소 몰릴 수 있다는 점이 언급되었습니다.',
    sentiment: { positive: ['상쾌함', '평지', '야경'], negative: ['사람많음'] },
    reviews: [
      { id: 1, user: 'Runnerkiwi', rating: 5, date: '2023-10-12', content: '퇴근하고 뛰기 딱 좋아요. 사람 좀 많긴 함.', image: null },
      { id: 2, user: 'Marathoner', rating: 4, date: '2023-10-10', content: '가볍게 뛰기 좋습니다.', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&fit=crop' }
    ],
    path: [
      { lat: 37.5668, lng: 126.9786 }, { lat: 37.5678, lng: 126.9790 }, { lat: 37.5685, lng: 126.9800 }, { lat: 37.5692, lng: 126.9850 }
    ]
  },
  {
    courseId: 2,
    title: '청계천 야간 러닝',
    thumbnail: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    distance: 5000,
    expectedTime: 35,
    difficulty: 'NORMAL',
    scrapCount: 15,
    viewCount: 856,
    mainPointWkt: 'POINT(126.9850 37.5692)',
    rating: 4.5,
    description: '청계천 물길을 따라 달리는 시원한 코스입니다. 여름철 야간 러닝에 제격입니다.',
    aiSummary: '물소리를 들으며 달릴 수 있어 심리적인 안정감을 주는 코스입니다. 주로 여름 밤에 이용자가 많으며 시원하다는 평이 주를 이룹니다. 벌레가 다소 많다는 점은 유의해야 합니다.',
    sentiment: { positive: ['시원함', '물소리'], negative: ['벌레'] },
    reviews: [
       { id: 3, user: 'NightRun', rating: 5, date: '2023-09-20', content: '시원하고 좋아요!', image: null }
    ],
    path: [
      { lat: 37.5692, lng: 126.9850 }, { lat: 37.5700, lng: 126.9900 }, { lat: 37.5710, lng: 127.0000 }
    ]
  },
  {
    courseId: 3,
    title: '남산 둘레길 코스',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop',
    distance: 7200,
    expectedTime: 50,
    difficulty: 'HARD',
    scrapCount: 88,
    viewCount: 2150,
    mainPointWkt: 'POINT(126.988227 37.551169)',
    rating: 4.9,
    description: '남산 둘레길을 크게 도는 중급자 코스입니다. 업힐과 다운힐이 적절히 섞여 있어 훈련용으로 추천합니다.',
    aiSummary: '남산의 맑은 공기와 수려한 경치를 즐길 수 있어 만족도가 매우 높은 코스입니다. 오르막 구간이 있어 운동 효과가 확실하다는 평이 많으며, 초보자에게는 다소 힘들 수 있습니다.',
    sentiment: { positive: ['운동됨', '경치', '공기좋음'], negative: ['오르막', '힘듦'] },
    reviews: [],
    path: [
      { lat: 37.5511, lng: 126.9882 }, { lat: 37.5530, lng: 126.9900 }, { lat: 37.5550, lng: 126.9920 }
    ]
  },
  {
    courseId: 4,
    title: '광화문 광장 런',
    thumbnail: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop',
    distance: 2100,
    expectedTime: 15,
    difficulty: 'EASY',
    scrapCount: 12,
    viewCount: 520,
    mainPointWkt: 'POINT(126.9768 37.5714)',
    rating: 4.2,
    description: '새롭게 정비된 광화문 광장을 달리는 코스입니다. 넓은 보행로가 확보되어 있어 쾌적합니다.',
    aiSummary: '탁 트인 개방감을 느낄 수 있으며 바닥 관리가 잘 되어 있어 안전하게 달릴 수 있습니다. 주변에 사진 찍기 좋은 스팟이 많으나, 그늘이 부족해 한낮에는 더울 수 있다는 의견이 있습니다.',
    sentiment: { positive: ['넓음', '사진맛집'], negative: ['그늘없음'] },
    reviews: [],
    path: [
       { lat: 37.5714, lng: 126.9768 }, { lat: 37.5730, lng: 126.9770 }, { lat: 37.5750, lng: 126.9780 }
    ]
  },
  {
    courseId: 5,
    title: '덕수궁 돌담길',
    thumbnail: 'https://images.unsplash.com/photo-1595188800169-dc349b819f39?w=400&h=300&fit=crop',
    distance: 1500,
    expectedTime: 10,
    difficulty: 'EASY',
    scrapCount: 156,
    viewCount: 3200,
    mainPointWkt: 'POINT(126.9750 37.5658)',
    rating: 4.7,
    description: '돌담길의 고즈넉한 분위기를 즐길 수 있는 짧은 산책 겸 러닝 코스입니다.',
    aiSummary: '로맨틱한 분위기 덕분에 데이트 코스로도 인기가 높습니다. 길이는 짧지만 감성적인 사진을 남기기에 좋습니다. 다만 길이 좁은 구간이 있어 속도를 내기에는 적합하지 않습니다.',
    sentiment: { positive: ['낭만', '데이트'], negative: ['좁음'] },
    reviews: [],
    path: [
       { lat: 37.5658, lng: 126.9750 }, { lat: 37.5650, lng: 126.9740 }, { lat: 37.5640, lng: 126.9730 }
    ]
  }
])

const filteredCourses = computed(() => {
  let result = courses.value

  // 1. Filter by Name (Search)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => c.title.toLowerCase().includes(query))
  }

  // 2. Filter by Difficulty
  if (difficultyFilter.value !== 'ALL') {
    result = result.filter(c => c.difficulty === difficultyFilter.value)
  }

  // 3. Sort
  if (sortOrder.value === 'distance') {
    result = [...result].sort((a, b) => a.distance - b.distance)
  } else if (sortOrder.value === 'name') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortOrder.value === 'popularity') {
    result = [...result].sort((a, b) => b.viewCount - a.viewCount)
  }

  return result
})

const fetchCourses = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
  updateMarkers()
}

onMounted(async () => {
  try {
    await loadKakaoMap()
    initMap()
  } catch (error) {
    console.error('Failed to load Kakao Map:', error)
  }
})

// Helper to parse POINT(lng lat)
const parseWktToLatLng = (wkt) => {
  if (!wkt) return null
  try {
    const match = wkt.match(/POINT\s*\(\s*([0-9.]+)\s+([0-9.]+)\s*\)/)
    if (match) {
      const lng = parseFloat(match[1])
      const lat = parseFloat(match[2])
      // Use window.kakao safely
      if (window.kakao && window.kakao.maps) {
        return new window.kakao.maps.LatLng(lat, lng)
      }
    }
  } catch (e) {
    console.error('WKT parse error:', e)
  }
  return null
}

const initMap = () => {
  if (!window.kakao || !window.kakao.maps) {
    console.error('Kakao Map not loaded')
    return
  }

  const options = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // Seoul City Hall
    level: 7
  }
  map = new window.kakao.maps.Map(mapContainer.value, options)

  // Map Event Listeners
  window.kakao.maps.event.addListener(map, 'dragend', () => {
    showSearchButton.value = true
  })

  // Initial markers
  updateMarkers()
}

const updateMarkers = () => {
  if (!map) return

  // Clear existing markers
  markers.forEach(marker => marker.setMap(null))
  markers = []

  // Add new markers based on FILTERED courses
  filteredCourses.value.forEach(course => {
    const latLng = parseWktToLatLng(course.mainPointWkt)
    if (!latLng) return
    
    const marker = new window.kakao.maps.Marker({
      position: latLng,
      map: map,
      title: course.title,
      clickable: true
    })

    // Click event for marker to highlight list item
    window.kakao.maps.event.addListener(marker, 'click', () => {
      handleMarkerClick(course)
    })

    marker.courseId = course.courseId
    markers.push(marker)
  })
}

// Map Marker -> List Interaction
const handleMarkerClick = (course) => {
  highlightedId.value = course.courseId
  
  // Scroll to list item
  const el = itemRefs.value[course.courseId]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// List Item -> Map Interaction (Refined for Split View)
const handleItemHover = (course) => {
  highlightedId.value = course.courseId
}

const handleItemClick = (course) => {
  highlightedId.value = course.courseId
  const latLng = parseWktToLatLng(course.mainPointWkt)
  if (map && latLng) {
    map.panTo(latLng)
  }
}

const handleSearchHere = () => {
  if (!map) return
  const center = map.getCenter()
  console.log(`Searching at Lat: ${center.getLat()}, Lng: ${center.getLng()}`)
  fetchCourses()
  showSearchButton.value = false
}

const toggleScrap = (course) => {
  if (course.isScrapped === undefined) course.isScrapped = false
  
  course.isScrapped = !course.isScrapped
  if (course.isScrapped) {
    course.scrapCount += 1
  } else {
    course.scrapCount -= 1
  }
}

const navigateToCreate = () => {
  router.push('/courses/create')
}

const openDetail = (course) => {
  selectedCourse.value = course
  showDetail.value = true
}

// Helper: Format distance
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
  <div class="split-layout">
    <!-- Left: List Section -->
    <div class="list-sidebar">
      <div class="sidebar-header">
        <div class="header-top">
          <h2>러닝 코스</h2>
          <button class="btn-create" @click="navigateToCreate">
            <el-icon><Plus /></el-icon>
            코스 만들기
          </button>
        </div>
        
        <!-- Controls -->
        <div class="controls-area">
          <el-input 
            v-model="searchQuery" 
            placeholder="코스 이름 검색" 
            class="search-input"
            clearable
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <div class="filter-row">
            <el-select v-model="sortOrder" size="small" style="width: 100px">
              <el-option label="인기순" value="popularity" />
              <el-option label="거리순" value="distance" />
              <el-option label="이름순" value="name" />
            </el-select>
            
            <el-select v-model="difficultyFilter" size="small" style="width: 100px">
              <el-option label="전체" value="ALL" />
              <el-option label="Easy" value="EASY" />
              <el-option label="Normal" value="NORMAL" />
              <el-option label="Hard" value="HARD" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="course-list" v-loading="loading">
        <div v-if="filteredCourses.length === 0" class="empty-state">
           <el-icon :size="50"><MapLocation /></el-icon>
           <p>검색 결과가 없습니다.</p>
        </div>

        <div 
          v-else 
          v-for="course in filteredCourses" 
          :key="course.courseId"
          class="course-item"
          :class="{ 'highlighted': highlightedId === course.courseId }"
          :ref="(el) => setItemRef(el, course.courseId)"
          @mouseenter="handleItemHover(course)"
          @click="handleItemClick(course)"
        >
          <div class="item-thumbnail">
            <img :src="course.thumbnail" loading="lazy" />
            <span class="badge diff-badge" :style="{ background: getDifficultyColor(course.difficulty) }">
              {{ course.difficulty }}
            </span>
          </div>

          <div class="item-info">
            <div class="info-top">
              <h3 class="item-title">{{ course.title }}</h3>
              <button class="btn-scrap" @click.stop="toggleScrap(course)">
                <el-icon v-if="course.isScrapped" color="#FFB300"><StarFilled /></el-icon>
                <el-icon v-else><Star /></el-icon>
              </button>
            </div>
            
            <div class="info-badges">
              <span class="badge dist-badge">{{ formatDistance(course.distance) }}</span>
              <span class="meta-sep">|</span>
              <span class="meta-text"><el-icon><Clock /></el-icon> {{ course.expectedTime }}분</span>
            </div>

            <div class="info-bottom">
              <div class="social-stats">
                <span class="stat view-stat">
                  <el-icon><View /></el-icon> {{ course.viewCount.toLocaleString() }}
                </span>
                <span class="stat scrap-stat">
                  <el-icon><StarFilled /></el-icon> {{ course.scrapCount }}
                </span>
              </div>
              <button class="btn-detail-sm" @click.stop="openDetail(course)">상세</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Map Section -->
    <div class="map-wrapper">
      <div ref="mapContainer" class="map-container"></div>
      
      <button v-if="showSearchButton" class="btn-search-here" @click="handleSearchHere">
        <el-icon><Refresh /></el-icon> 현 위치에서 검색
      </button>
    </div>

    <CourseDetailModal v-model="showDetail" :course="selectedCourse" />
  </div>
</template>

<style scoped>
.split-layout {
  display: flex;
  height: calc(100vh - 64px); 
  overflow: hidden;
  background-color: #f8f9fa;
}

/* Left Sidebar */
.list-sidebar {
  width: 400px; /* Fixed width */
  min-width: 350px;
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

.sidebar-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-top h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.btn-create {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-create:hover { background: #45a049; }

.controls-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  gap: 8px;
}

/* Course List */
.course-list {
  flex: 1;
  overflow-y: auto;
}

.course-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  background: white;
  transition: background 0.2s;
}

.course-item:hover {
  background-color: #f8fcf8; /* Very subtle green tint */
}

.course-item.highlighted {
  background-color: #eaf7ea;
  border-left: 4px solid var(--color-primary);
}

/* Thumbnail Area */
.item-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  margin-right: 16px;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.diff-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Info Area */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #333;
  line-height: 1.3;
}

.btn-scrap {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 1.2rem;
  color: #ccc;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.btn-scrap:hover {
  transform: scale(1.1);
  color: #FFB300;
}

.info-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: auto; /* Push bottom content down */
  margin-top: 4px;
}

.dist-badge {
  font-weight: 600;
  color: var(--color-primary);
}

.meta-sep { color: #ddd; }

.meta-text {
  display: flex;
  align-items: center;
  gap: 2px;
}

.info-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8px;
}

.social-stats {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.view-stat { color: #888; }
.scrap-stat { color: #FFB300; }

.btn-detail-sm {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  color: #666;
}
.btn-detail-sm:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Right Map */
.map-wrapper {
  flex: 1;
  position: relative;
  background: #eee;
}

.map-container {
  width: 100%;
  height: 100%;
}

.btn-search-here {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  color: var(--color-primary);
}

.btn-search-here:hover {
  transform: translateX(-50%) translateY(2px);
  background: #fafafa;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
