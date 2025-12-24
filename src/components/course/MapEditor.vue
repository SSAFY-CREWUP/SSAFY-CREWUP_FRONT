<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCourseStore } from '../../stores/course'
import { useKakaoMap } from '../../composables/useKakaoMap'
import { useRoute } from 'vue-router'

const courseStore = useCourseStore()
const mapContainer = ref(null)
const { loadKakaoMap } = useKakaoMap()
const route = useRoute()

let map = null
let markers = []
let polyline = null
let isPolylineClick = false

onMounted(async () => {
  try {
    await loadKakaoMap()
    initMap()
  } catch (error) {
    console.error('Failed to load Kakao Map:', error)
  }
})

const initMap = () => {
  // Default: Seoul City Hall
  let lat = 37.566826
  let lng = 126.9786567
  let level = 5

  // Override with Query Params if available (Preserve View)
  if (route.query.lat && route.query.lng) {
      lat = parseFloat(route.query.lat)
      lng = parseFloat(route.query.lng)
  }
  if (route.query.zoom) {
      level = parseInt(route.query.zoom)
  }

  const options = {
    center: new window.kakao.maps.LatLng(lat, lng),
    level: level
  }
  map = new window.kakao.maps.Map(mapContainer.value, options)

  // 클릭 이벤트
  window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
    // 폴리라인 클릭 시 발생한 이벤트라면 무시 (0.1초 딜레이 고려)
    if (isPolylineClick) {
      isPolylineClick = false
      return
    }
    
    const latlng = mouseEvent.latLng
    courseStore.addPoint({ 
      lat: latlng.getLat(), 
      lng: latlng.getLng() 
    })
  })

  // Draw initial path if exists
  if (courseStore.course.path.length > 0) {
      renderPath(courseStore.course.path)
  }
}

const renderPath = (newPath) => {
  if (!map) return
  
  // Clear existing
  markers.forEach(m => m.setMap(null))
  markers = []
  if (polyline) polyline.setMap(null)

  newPath.forEach((point, index) => {
    const position = new window.kakao.maps.LatLng(point.lat, point.lng)
    
    // Center map on the first point
    if (index === 0) {
        map.setCenter(position)
    }

    let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
    if (index === 0) imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png'
    if (index === newPath.length - 1 && newPath.length > 1) imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png'

    const marker = new window.kakao.maps.Marker({
      position,
      image: new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(24, 35)),
      map: map,
      draggable: true
    })

    window.kakao.maps.event.addListener(marker, 'dragend', () => {
      const newPos = marker.getPosition()
      courseStore.course.path[index] = { lat: newPos.getLat(), lng: newPos.getLng() }
      courseStore.calculateDistance()
    })

    window.kakao.maps.event.addListener(marker, 'rightclick', () => {
      courseStore.course.path.splice(index, 1)
      courseStore.calculateDistance()
    })
    markers.push(marker)
  })

  // Polyline Drawing and Events
  if (newPath.length > 1) {
    const linePath = newPath.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
    polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 6, // 넓혀서 클릭 쉽게
      strokeColor: '#FF6B6B',
      strokeOpacity: 0.8,
      strokeStyle: 'solid' 
    })
    polyline.setMap(map)

    // Add Click Event to Insert Point
    window.kakao.maps.event.addListener(polyline, 'click', (mouseEvent) => {
      isPolylineClick = true // Set flag immediately
      
      const latLng = mouseEvent.latLng
      const newPoint = { lat: latLng.getLat(), lng: latLng.getLng() }
      
      const idx = findClosestSegmentIndex(courseStore.course.path, newPoint)
      if (idx !== -1) {
        // Insert AFTER the found index (between idx and idx+1)
        courseStore.insertPoint(idx + 1, newPoint)
      }
      
      // Safety reset (though map click handler handles it mostly)
      setTimeout(() => { isPolylineClick = false }, 200)
    })
  }
}

// Helper to calculate squared distance from point (p) to line segment (v - w)
const sqr = (x) => x * x
const distToSegmentSquared = (p, v, w) => {
  const l2 = sqr(v.lat - w.lat) + sqr(v.lng - w.lng)
  if (l2 === 0) return sqr(p.lat - v.lat) + sqr(p.lng - v.lng)
  let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2
  t = Math.max(0, Math.min(1, t))
  return sqr(p.lat - (v.lat + t * (w.lat - v.lat))) +
         sqr(p.lng - (v.lng + t * (w.lng - v.lng)))
}

const findClosestSegmentIndex = (path, point) => {
  let minDistSq = Infinity
  let bestIndex = -1
  
  for (let i = 0; i < path.length - 1; i++) {
    const d = distToSegmentSquared(point, path[i], path[i+1])
    if (d < minDistSq) {
      minDistSq = d
      bestIndex = i
    }
  }
  return bestIndex
}

// (watch 로직은 기존과 동일하므로 생략하지 않고 그대로 둡니다)
watch(() => courseStore.course.path, (newPath) => {
  renderPath(newPath)
}, { deep: true })
</script>

<template>
  <div class="map-editor">
    <div ref="mapContainer" class="map-canvas"></div>
    
    <!-- Top Right: Pin Counter -->
    <div class="map-control-panel">
       <div class="pin-counter" :class="{ 'is-limit': courseStore.course.path.length >= 20 }">
         <span class="label">📍 핀 개수</span>
         <span class="count">{{ courseStore.course.path.length }} / 20</span>
       </div>
    </div>

    <!-- Bottom Center: Friendly Guide -->
    <div class="map-guide-card">
       <div class="guide-header">🚩 코스 그리기 가이드</div>
       <ul class="guide-list">
         <li><span class="icon">👆</span> <strong>지도 빈 곳 클릭</strong> : 핀 추가</li>
         <li><span class="icon">✋</span> <strong>핀 드래그</strong> : 위치 이동</li>
         <li><span class="icon">➕</span> <strong>경로(선) 클릭</strong> : 중간 지점 추가</li>
         <li><span class="icon">🗑️</span> <strong>핀 우클릭</strong> : 핀 삭제</li>
       </ul>
    </div>
  </div>
</template>

<style scoped>
/* Map Editor Container */
.map-editor {
  width: 100%;
  height: 100%; /* Fill parent container */
  position: relative;
  overflow: hidden; /* Prevent overlays from spilling */
}
.map-canvas {
  width: 100%;
  height: 100%;
}

/* 1. Pin Counter (Top Right) */
.map-control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.pin-counter {
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #333;
  border: 2px solid white;
  transition: all 0.3s;
}

.pin-counter.is-limit {
  border-color: #F44336;
  color: #F44336;
  animation: shake 0.5s;
}

.pin-counter .label {
  font-size: 0.9rem;
}

.pin-counter .count {
  font-size: 1rem;
  color: var(--color-primary);
}
.pin-counter.is-limit .count {
  color: #F44336;
}

/* 2. Friendly Guide (Bottom Center) */
.map-guide-card {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.5);
  
  text-align: center;
  width: 90%;
  max-width: 500px;
}

.guide-header {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: #333;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px; 
}

.guide-list li {
  font-size: 0.85rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}

.guide-list li .icon {
  font-size: 1.1rem;
}

.guide-list li strong {
  color: #333;
  font-weight: 700;
}

/* Limit Shake Animation */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

@media (max-width: 600px) {
  .map-guide-card {
    padding: 12px;
    bottom: 20px;
  }
  .guide-list {
    gap: 10px 20px;
  }
}
</style>