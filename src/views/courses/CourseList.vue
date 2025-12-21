<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, MapLocation, Filter, Sort, Refresh, Search, Star, StarFilled } from '@element-plus/icons-vue'
import CourseDetailModal from '../../components/course/CourseDetailModal.vue'
import { useKakaoMap } from '../../composables/useKakaoMap'

const router = useRouter()

const loading = ref(false)
const sortOrder = ref('distance')
const difficultyFilter = ref('전체')
const searchQuery = ref('') // Search State

// Detail Modal State
const showDetail = ref(false)
const selectedCourse = ref(null)

// Map State
const mapContainer = ref(null)
let map = null
let markers = []
const showSearchButton = ref(false)
const { loadKakaoMap } = useKakaoMap()

// Interaction State
const highlightedId = ref(null)
const itemRefs = ref({})

const setItemRef = (el, id) => {
  if (el) itemRefs.value[id] = el
}

// Dummy Data
const courses = ref([
  {
    id: 1,
    title: '서울 시청 주변 러닝',
    distance: 3.5,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?w=400&h=300&fit=crop',
    savedImage: 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?w=800&fit=crop',
    lat: 37.566826,
    lng: 126.9786567,
    sentiment: { positive: ['상쾌함', '평지'], negative: ['사람많음'] },
    reviews: [],
    isScrapped: false
  },
  {
    id: 2,
    title: '청계천 야간 러닝',
    distance: 5.0,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    savedImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&fit=crop',
    lat: 37.5692,
    lng: 126.9850,
    sentiment: { positive: ['야경', '시원함'], negative: ['벌레'] },
    reviews: [],
    isScrapped: true
  },
  {
    id: 3,
    title: '남산 둘레길 코스',
    distance: 7.2,
    difficulty: 'Hard',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop',
    savedImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&fit=crop',
    lat: 37.551169,
    lng: 126.988227,
    sentiment: { positive: ['운동됨', '경치'], negative: ['오르막'] },
    reviews: [],
    isScrapped: false
  },
  {
    id: 4,
    title: '광화문 광장 런',
    distance: 2.1,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop',
    savedImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&fit=crop',
    lat: 37.5714,
    lng: 126.9768,
    sentiment: { positive: ['넓음', '깨끗함'], negative: ['그늘없음'] },
    reviews: [],
    isScrapped: false
  },
  {
    id: 5,
    title: '덕수궁 돌담길',
    distance: 1.5,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1595188800169-dc349b819f39?w=400&h=300&fit=crop',
    savedImage: 'https://images.unsplash.com/photo-1595188800169-dc349b819f39?w=800&fit=crop',
    lat: 37.5658,
    lng: 126.9750,
    sentiment: { positive: ['낭만', '사진맛집'], negative: ['좁음'] },
    reviews: [],
    isScrapped: false
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
  if (difficultyFilter.value !== '전체') {
    result = result.filter(c => c.difficulty === difficultyFilter.value)
  }

  // 3. Sort
  if (sortOrder.value === 'distance') {
    result = [...result].sort((a, b) => a.distance - b.distance)
  } else if (sortOrder.value === 'name') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})

const fetchCourses = async () => {
  // Mock API call
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

const initMap = () => {
  const options = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // Seoul City Hall
    level: 5
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
    const markerPosition = new window.kakao.maps.LatLng(course.lat, course.lng)
    
    // Choose marker image based on difficulty or default
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map,
      title: course.title,
      clickable: true
    })

    // Click event for marker to highlight list item
    window.kakao.maps.event.addListener(marker, 'click', () => {
      handleMarkerClick(course)
    })

    markers.push(marker)
  })
}

// Map Marker -> List Interaction
const handleMarkerClick = (course) => {
  highlightedId.value = course.id
  
  // Scroll to list item
  const el = itemRefs.value[course.id]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// List Card -> Map Interaction
const handleCardClick = (course) => {
  highlightedId.value = course.id
  if (map) {
    const moveLatLon = new window.kakao.maps.LatLng(course.lat, course.lng)
    map.panTo(moveLatLon)
  }
}

const handleSearchHere = () => {
  if (!map) return
  const center = map.getCenter()
  console.log(`Searching at Lat: ${center.getLat()}, Lng: ${center.getLng()}`)
  
  // Call API logic here
  fetchCourses() // Reload (Mock)
  showSearchButton.value = false
}

const toggleScrap = (course) => {
  course.isScrapped = !course.isScrapped
  // Here you would typically call an API endpoint to save the scrap status
  console.log(`Course ${course.id} scrap status: ${course.isScrapped}`)
}

// Watch filteredCourses to update map markers whenever filter changes (search, sort, etc.)
watch(filteredCourses, () => {
  updateMarkers()
})

const navigateToCreate = () => {
  router.push('/courses/create')
}

const openDetail = (course) => {
  selectedCourse.value = course
  showDetail.value = true
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
  <div class="course-page-container">
    <!-- Top: Map Section -->
    <div class="map-section">
      <div ref="mapContainer" class="map-container"></div>
      
      <!-- Re-search Button -->
      <button v-if="showSearchButton" class="btn-search-here" @click="handleSearchHere">
        <el-icon><Refresh /></el-icon>
        현 위치에서 검색
      </button>
    </div>

    <!-- Bottom: List Section -->
    <div class="list-section">
      <div class="list-content-wrapper">
        <div class="page-header">
          <div class="header-text">
            <h2>러닝 코스</h2>
            <p>다양한 러닝 코스를 탐색하고 도전해보세요.</p>
          </div>
          <button class="btn-create" @click="navigateToCreate">
            <el-icon><Plus /></el-icon>
            코스 만들기
          </button>
        </div>

        <!-- Controls -->
        <div class="controls-bar">
          <div class="control-group">
            <!-- Search Input -->
            <el-input 
              v-model="searchQuery" 
              placeholder="코스 이름 검색..." 
              style="width: 220px;"
              clearable
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>

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
          <div v-if="filteredCourses.length === 0" class="empty-state">
            <el-icon :size="50"><MapLocation /></el-icon>
            <p>검색 결과가 없습니다.</p>
          </div>
          
          <div 
            v-else 
            v-for="course in filteredCourses" 
            :key="course.id" 
            class="course-card" 
            :class="{ 'highlighted': highlightedId === course.id }"
            :ref="(el) => setItemRef(el, course.id)"
            @click="handleCardClick(course)"
          >
            <div class="course-image-wrapper">
              <img :src="course.image" alt="Course Map" class="course-image" />
              
              <!-- Scrap Button -->
              <button class="btn-scrap" @click.stop="toggleScrap(course)">
                <el-icon v-if="course.isScrapped" class="icon-scrapped"><StarFilled /></el-icon>
                <el-icon v-else class="icon-unscrapped"><Star /></el-icon>
              </button>

              <span 
                class="difficulty-badge"
                :style="{ backgroundColor: getDifficultyColor(course.difficulty) }"
              >
                {{ course.difficulty }}
              </span>
            </div>
            <div class="course-content">
              <div class="course-header-row">
                <h3 class="course-title">{{ course.title }}</h3>
              </div>
              <div class="course-stats">
                <span class="stat-item">{{ course.distance }}km</span>
                <span class="stat-sep">•</span>
                <span class="stat-item user-count">24명 러닝중</span>
              </div>
              <!-- Optional Detail Button to separate actions -->
              <button class="btn-detail-view" @click.stop="openDetail(course)">
                상세보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <CourseDetailModal v-model="showDetail" :course="selectedCourse" />
  </div>
</template>

<style scoped>
.course-page-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); 
  overflow: hidden;
}

.map-section {
  flex: 1; 
  min-height: 40%;
  position: relative;
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
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search-here:hover {
  background: #f0f9eb;
  transform: translateX(-50%) translateY(2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.list-section {
  flex: 1; 
  overflow-y: auto; 
  background: #fff;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
  z-index: 10;
}

.list-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.btn-create:hover {
  background: #45a049;
}

.controls-bar {
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap; /* Allow wrapping for mobile */
}

/* Compact Grid & Card Styles */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 16px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  border: 2px solid transparent; 
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.course-card.highlighted {
  border-color: var(--color-primary);
  background-color: #f0f9eb;
}

.course-image-wrapper {
  position: relative;
  height: 120px; 
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Scrap Button Styles */
.btn-scrap {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
}

.btn-scrap:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

.icon-scrapped {
  color: #FFD700; /* Gold/Yellow for Star */
  font-size: 1.2rem;
}

.icon-unscrapped {
  color: white;
  font-size: 1.2rem;
}

.difficulty-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.course-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-header-row {
  margin-bottom: 6px;
}

.course-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.stat-item {
  font-weight: 500;
}

.stat-sep {
  color: #ddd;
}

.user-count {
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
}

.btn-detail-view {
  margin-top: auto;
  background: transparent;
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  padding: 6px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-detail-view:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-tertiary);
}
</style>
