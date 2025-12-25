<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, MapLocation, Filter, Sort, Refresh, Search, Star, StarFilled, View, Clock } from '@element-plus/icons-vue'
import CourseDetailModal from '../../components/course/CourseDetailModal.vue'
import { useKakaoMap } from '../../composables/useKakaoMap'
import courseApi from '../../api/course' // Import real API

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
let clusterer = null
let markers = []
let overlays = [] // Keep track of overlays to close them
const showSearchButton = ref(false)

// Interaction State
const highlightedId = ref(null)
const itemRefs = ref({})

const setItemRef = (el, id) => {
  if (el) itemRefs.value[id] = el
}

// Course Data State
const courses = ref([]) // Initialize as empty array

const filteredCourses = computed(() => courses.value)

// Watch filters to trigger re-fetch (since backend handles filtering)
watch([searchQuery, difficultyFilter, sortOrder], () => {
  fetchCourses()
})

const fetchCourses = async () => {
  loading.value = true
  try {
    const params = {
      keyword: searchQuery.value, // 검색어 (Backend might use 'keyword' or 'query' - checking CourseSearchCondition)
      difficulty: difficultyFilter.value !== 'ALL' ? difficultyFilter.value : null,
      sort: sortOrder.value,
      page: 0,
      size: 20
    }
    
    // Add coordinates if map is initialized
    // Add coordinates and radius if map is initialized
    if (map) {
      const center = map.getCenter()
      params.lat = center.getLat()
      params.lng = center.getLng()
      
      // Calculate radius based on bounds (distance from center to corner)
      // Only apply radius filter if NOT searching by keyword (allow global search)
      if (!searchQuery.value) {
        const bounds = map.getBounds()
        const ne = bounds.getNorthEast()
        
        // Approximate distance in meters
        const polyline = new window.kakao.maps.Polyline({
          path: [center, ne]
        })
        params.radius = Math.round(polyline.getLength())
      }
    } else {
       // Fallback for initial load if map isn't ready (though we moved fetch after init)
       // Optional: Default to Seoul City Hall
       params.lat = 37.566826
       params.lng = 126.9786567
    }

    // Remove null/empty params
    if (!params.keyword) delete params.keyword
    if (!params.difficulty) delete params.difficulty
    
    // Call API
    const response = await courseApi.getCourseList(params)
    courses.value = response.data.data // ApiResponseBody.data
  } catch (error) {
    console.error('Failed to fetch courses:', error)
  } finally {
    loading.value = false
    updateMarkers() // Update map markers with new data
  }
}

onMounted(async () => {
  // Load Map First, then Fetch Data
  loadKakaoMap().then(() => {
    console.log('Kakao Map Loaded')
    initMap()
    // Fetch courses exactly after map is ready to get center coords
    fetchCourses() 
  }).catch(error => {
    console.error('Failed to load Kakao Map:', error)
    // Fallback fetch if map fails
    fetchCourses()
  })
})

// Helper to parse POINT(lat lng)
const parseWktToLatLng = (wkt) => {
  if (!wkt) return null
  try {
    const match = wkt.match(/POINT\s*\(\s*([0-9.]+)\s+([0-9.]+)\s*\)/)
    if (match) {
      // Backend seems to send POINT(lat lng) based on logs
      const lat = parseFloat(match[1]) 
      const lng = parseFloat(match[2])
      
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

  // Initialize Clusterer
  clusterer = new window.kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 6,
    disableClickZoom: false // Allow zoom on click
  })

  // Map Event Listeners
  const onMapChange = () => {
    showSearchButton.value = true
  }

  window.kakao.maps.event.addListener(map, 'dragend', onMapChange)
  window.kakao.maps.event.addListener(map, 'zoom_changed', onMapChange)

  // Initial markers
  updateMarkers()
}

// Close all open overlays
const closeAllOverlays = () => {
  overlays.forEach(o => o.setMap(null))
  overlays = []
}

const updateMarkers = () => {
  if (!map) return

  // 0. Clear existing clusterer markers
  if (clusterer) {
    clusterer.clear()
  }

  markers = []
  closeAllOverlays()

  // 1. Group courses by location (lat,lng)
  const locationGroups = new Map()

  filteredCourses.value.forEach(course => {
    const latLng = parseWktToLatLng(course.mainPointWkt)
    if (!latLng) return
    
    // Key with high precision to detect exact overlaps
    const key = `${latLng.getLat().toFixed(6)},${latLng.getLng().toFixed(6)}`
    
    if (!locationGroups.has(key)) {
      locationGroups.set(key, {
        latLng: latLng,
        courses: []
      })
    }
    locationGroups.get(key).courses.push(course)
  })

  // 2. Create Markers for each group
  locationGroups.forEach((group) => {
    const isMultiple = group.courses.length > 1
    const mainCourse = group.courses[0] // Representative course for single view or first in list
    
    // 3. Mark Presentation (Single vs Group)
    let mapObject = null // Marker or CustomOverlay (for group pin)

    if (isMultiple) {
      // --- GROUP MARKER (Custom Overlay) ---
      const groupMarkerContent = document.createElement('div')
      groupMarkerContent.className = 'group-marker-pin'
      groupMarkerContent.innerHTML = `<span class="count">${group.courses.length}</span>`
      
      // Style logic is in CSS, or inline here for simplicity
      Object.assign(groupMarkerContent.style, {
        background: '#3B82F6', // Blue
        color: 'white',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        border: '2px solid white',
        cursor: 'pointer',
        position: 'relative',
        top: '-15px' // Center anchor adjustment
      })

      // Create Overlay for the Pin itself
      mapObject = new window.kakao.maps.CustomOverlay({
        position: group.latLng,
        content: groupMarkerContent,
        map: map, // Add immediately
        zIndex: 5
      })

      // We attach the Click Listener to the DOM element directly
      groupMarkerContent.onclick = (e) => {
        e.stopPropagation()
        closeAllOverlays()
        overlay.setMap(map) // Show the Info List Overlay
        overlays.push(overlay)
      }

    } else {
      // --- SINGLE MARKER (Standard) ---
      mapObject = new window.kakao.maps.Marker({
        position: group.latLng,
        title: mainCourse.title,
        clickable: true
      })
      mapObject.setMap(map)

      // Click Listener
      window.kakao.maps.event.addListener(mapObject, 'click', () => {
        closeAllOverlays()
        overlay.setMap(map)
        overlays.push(overlay)
        handleMarkerClick(mainCourse)
      })
    }

    // Construct Info Overlay Content (List or Single Info)
    const contentFn = () => {
    // ... existing contentFn logic (no changes needed inside, just reuse)
      const wrapper = document.createElement('div')
      wrapper.className = 'custom-overlay-wrapper'
      
      if (isMultiple) {
        // ... (Same List Logic)
        const listContainer = document.createElement('div')
        listContainer.className = 'custom-overlay list-overlay'
        Object.assign(listContainer.style, {
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid #ddd',
          width: '220px',
          maxHeight: '250px',
          overflowY: 'auto',
          overflowX: 'hidden'
        })

        // Prevent Map Zoom
        listContainer.addEventListener('wheel', (e) => { e.stopPropagation() }, { passive: true })

        // Header
        const header = document.createElement('div')
        Object.assign(header.style, {
          padding: '10px 12px',
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          fontSize: '13px',
          color: '#333',
          position: 'sticky',
          top: '0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        })
        header.innerHTML = `<span>📍 선택된 위치</span> <span style="background:#eee; padding:2px 6px; borderRadius:4px; font-size:11px;">${group.courses.length}개 코스</span>`
        listContainer.appendChild(header)

        // Items
        group.courses.forEach(c => {
          const item = document.createElement('div')
          item.className = 'overlay-list-item'
          Object.assign(item.style, {
            padding: '10px 12px',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.2s'
          })
          item.onmouseover = () => item.style.background = '#f9f9f9'
          item.onmouseout = () => item.style.background = 'white'
          
          item.innerHTML = `
             <div style="font-weight: 500; font-size: 13px; color:#333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px;">${c.title}</div>
             <div style="font-size: 11px; color: #888;">${formatDistance(c.distance)}</div>
          `
          item.onclick = (e) => {
             e.stopPropagation() 
             handleMarkerClick(c) 
             openDetail(c)
          }
          listContainer.appendChild(item)
        })
        wrapper.appendChild(listContainer)
      } else {
        // ... (Same Single Logic)
        wrapper.innerHTML = `
          <div class="custom-overlay" style="padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 1px solid #ddd; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 5px; color: #333;">${mainCourse.title}</div>
            <div style="font-size: 12px; color: #666; display: flex; gap: 5px;">
               <span style="color:${getDifficultyColor(mainCourse.difficulty)}; font-weight:600;">${mainCourse.difficulty}</span>
               <span>|</span>
               <span>${formatDistance(mainCourse.distance)}</span>
            </div>
          </div>
        `
      }
      return wrapper
    }

    const overlayContent = contentFn()
    
    // The Info Window Overlay
    const overlay = new window.kakao.maps.CustomOverlay({
      content: overlayContent,
      map: null,
      position: group.latLng,
      yAnchor: 1.5, // slightly higher
      zIndex: 20
    })

    // Store reference
    // If it's a CustomOverlay (Group), we store it. If Marker, we store it.
    // We add a unifying 'setMap' interface or just use `markers` array differently?
    // Clusterer expects MARKERS. CustomOverlay cannot be added to Clusterer directly easily.
    // BUT since we are handling overlaps manually with 'locationGroups', do we strictly NEED Clusterer?
    // User liked clustering ("Clusterer is good"), but if we group overlaps manually, 
    // we only need Clusterer for *separate* groups that are close by.
    // Fortunately, we can pass CustomOverlay to Clusterer? No.
    // So for Group Pins (CustomOverlay), they won't cluster automatically with built-in clusterer.
    // However, since we manually grouped exact overlaps, maybe that's enough for "Pins overlap" issue.
    // If the user zooms out, `MarkerClusterer` handles *proximity* clustering.
    // To support `MarkerClusterer` with Custom Views, we usually use `Marker` with custom image.
    // But maintaining DOM elements is nicer.
    // Let's stick to: Group Pin = CustomOverlay. 
    // Note: This effectively removes them from the Kakao Clusterer management, 
    // so they won't merge with *other* distant pins when zooming out.
    // If we want both, we should create a transparent Marker at that position for the Clusterer, 
    // and bind the Overlay visibility to it. But that's complex.
    // Given the user said "List style is better for overlaps", manual grouping is the priority.
    
    // Let's add ONLY Single Markers to clusterer for now, or add invisible markers for groups?
    // Simplest: Just render them. If they overlap with *other* groups, they just overlap.
    
    mapObject.courseId = mainCourse.courseId // Representative ID
    mapObject.groupCourses = group.courses
    mapObject.overlay = overlay
    
    markers.push(mapObject) // We track them
  })

  // Add only MARKERS to clusterer (CustomOverlay doesn't work with clusterer addMarkers directly)
  // We will filter only Markers.
  const validMarkers = markers.filter(m => m instanceof window.kakao.maps.Marker)
  if (clusterer && validMarkers.length > 0) {
    clusterer.addMarkers(validMarkers)
  }
}

// Global handler not needed anymore as we attach onclick directly
// window.exposedHandleItemClick = ...

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
    
    // Find marker that contains this course
    const marker = markers.find(m => {
        // m.groupCourses is array
        return m.groupCourses && m.groupCourses.some(c => c.courseId === course.courseId)
    })

    if (marker && marker.overlay) {
      closeAllOverlays()
      marker.overlay.setMap(map)
      overlays.push(marker.overlay)
    }
  }
}


const handleSearchHere = () => {
  if (!map) return
  const center = map.getCenter()
  console.log(`Searching at Lat: ${center.getLat()}, Lng: ${center.getLng()}`)
  // TODO: Add search by location to API if supported. For now, just re-fetch.
  fetchCourses()
  showSearchButton.value = false
}

const toggleScrap = async (course) => {
  try {
    const response = await courseApi.toggleScrap(course.courseId)
    // response.data.data is boolean (true=scrapped, false=unscrapped)
    const isNowScrapped = response.data.data
    
    // Update local state
    // Note: CourseListResponse might NOT have isScrapped field initially, 
    // so we might need to handle it optimistically or rely on API return.
    if (course.isScrapped === undefined) course.isScrapped = false
    
    course.isScrapped = isNowScrapped
    
    // Update count accordingly
    if (isNowScrapped) {
      course.scrapCount = (course.scrapCount || 0) + 1
      alert('코스가 스크랩되었습니다.')
    } else {
      course.scrapCount = (course.scrapCount || 0) - 1
      alert('코스 스크랩이 취소되었습니다.')
    }
  } catch (error) {
    console.error('Scrap failed:', error)
    if (error.response && error.response.status === 401) {
      alert('로그인이 필요한 서비스입니다.')
    }
  }
}

const navigateToCreate = () => {
  if (map) {
      const center = map.getCenter()
      const level = map.getLevel()
      router.push({ 
          path: '/courses/create', 
          query: { 
              lat: center.getLat(), 
              lng: center.getLng(), 
              zoom: level 
          } 
      })
  } else {
      router.push('/courses/create')
  }
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
