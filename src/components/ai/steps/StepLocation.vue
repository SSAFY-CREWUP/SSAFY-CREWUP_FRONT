<script setup>
import { ref, onMounted } from 'vue'
import { useAiStore } from '../../../stores/ai'

const aiStore = useAiStore()
const mapContainer = ref(null)
const address = ref('')
let map = null
let marker = null
let geocoder = null

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    initMap()
  } else {
    const script = document.createElement('script')
    script.onload = () => kakao.maps.load(initMap)
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false&libraries=services'
    document.head.appendChild(script)
  }
})

const initMap = () => {
  const options = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // Seoul City Hall
    level: 5
  }
  map = new kakao.maps.Map(mapContainer.value, options)
  geocoder = new kakao.maps.services.Geocoder()

  // Map Click Event
  kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
    const latlng = mouseEvent.latLng
    updateLocation(latlng.getLat(), latlng.getLng())
  })
}

const updateLocation = (lat, lng) => {
  // Remove existing marker
  if (marker) marker.setMap(null)

  // Add new marker
  const position = new kakao.maps.LatLng(lat, lng)
  marker = new kakao.maps.Marker({
    position: position,
    map: map
  })
  map.panTo(position)

  // Reverse Geocoding
  searchDetailAddrFromCoords(position, (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      address.value = result[0].address.address_name
      aiStore.updateAnswer('location', {
        lat,
        lng,
        address: address.value
      })
    }
  })
}

const searchDetailAddrFromCoords = (coords, callback) => {
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback)
}

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      updateLocation(lat, lng)
    }, (error) => {
      console.error(error)
      alert('위치 정보를 가져올 수 없습니다.')
    })
  }
}
</script>

<template>
  <div class="step-location">
    <h2>📍 어디에서 주로 달리시나요?</h2>
    <p class="subtitle">가장 자주 달리는 장소를 선택해주세요.</p>

    <div class="map-wrapper">
      <div ref="mapContainer" class="map-canvas"></div>
      <button class="current-location-btn" @click="getCurrentLocation">
        현재 위치 찾기
      </button>
    </div>

    <div v-if="address" class="selected-address">
      <span class="label">선택된 위치:</span>
      <span class="value">{{ address }}</span>
    </div>
  </div>
</template>

<style scoped>
.step-location {
  text-align: center;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 30px;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  margin-bottom: 20px;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.current-location-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--color-primary);
  transition: background 0.2s;
  z-index: 10;
}

.current-location-btn:hover {
  background: #f9f9f9;
}

.selected-address {
  background: var(--color-bg-secondary);
  padding: 15px;
  border-radius: 8px;
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.value {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
