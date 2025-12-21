<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCourseStore } from '../../stores/course'
import { useKakaoMap } from '../../composables/useKakaoMap'

const courseStore = useCourseStore()
const mapContainer = ref(null)
const { loadKakaoMap } = useKakaoMap()

let map = null
let markers = []
let polyline = null

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
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
    level: 5
  }
  map = new window.kakao.maps.Map(mapContainer.value, options)

  // 클릭 이벤트
  window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
    const latlng = mouseEvent.latLng
    courseStore.addPoint({ 
      lat: latlng.getLat(), 
      lng: latlng.getLng() 
    })
  })
}

// (watch 로직은 기존과 동일하므로 생략하지 않고 그대로 둡니다)
watch(() => courseStore.course.path, (newPath) => {
  if (!map) return
  markers.forEach(m => m.setMap(null))
  markers = []
  if (polyline) polyline.setMap(null)

  newPath.forEach((point, index) => {
    const position = new window.kakao.maps.LatLng(point.lat, point.lng)
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

  if (newPath.length > 1) {
    const linePath = newPath.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
    polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#FF6B6B',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    })
    polyline.setMap(map)
  }
}, { deep: true })
</script>

<template>
  <div class="map-editor">
    <div ref="mapContainer" class="map-canvas"></div>
    <div v-if="courseStore.course.path.length === 0" class="instruction-overlay">
      지도를 클릭하여 경로를 그려주세요
    </div>
  </div>
</template>

<style scoped>
.map-editor {
  width: 100%;
  height: 600px; /* 여기 높이 지정 필수! */
  position: relative;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.instruction-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  pointer-events: none;
  z-index: 10;
}
</style>