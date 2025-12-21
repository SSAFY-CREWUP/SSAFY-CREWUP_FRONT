<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
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

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const mapContainer = ref(null)
let map = null
const { loadKakaoMap } = useKakaoMap()

// Dummy Path Data (Seoul City Hall Area)
const DUMMY_PATH = [
  { lat: 37.566826, lng: 126.9786567 }, // Start: City Hall
  { lat: 37.5678, lng: 126.9790 },
  { lat: 37.5685, lng: 126.9800 },
  { lat: 37.5690, lng: 126.9815 },
  { lat: 37.5692, lng: 126.9850 }  // End: Cheonggyecheon
]

onMounted(() => {
  // We need to wait for the dialog to be rendered in the DOM
  // Since el-dialog uses lazy rendering or v-if, we might need a watcher or Opened event
})

const onOpened = async () => {
  try {
    await loadKakaoMap()
    initMap()
  } catch (error) {
    console.error('Failed to load Kakao Map:', error)
  }
}

const initMap = () => {
  if (!document.getElementById('map')) return

  const container = document.getElementById('map')
  const options = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
    level: 5
  }
  map = new window.kakao.maps.Map(container, options)

  // Draw Path
  const path = DUMMY_PATH.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
  
  const polyline = new window.kakao.maps.Polyline({
    path: path,
    strokeWeight: 6,
    strokeColor: '#3B82F6', // Blue like Tailwind blue-500
    strokeOpacity: 0.8,
    strokeStyle: 'solid'
  })
  polyline.setMap(map)

  // Markers (Start & End)
  // Start
  new window.kakao.maps.Marker({
    position: path[0],
    map: map,
    title: '출발'
  })
  // End
  new window.kakao.maps.Marker({
    position: path[path.length - 1],
    map: map,
    title: '도착'
  })

  // Set Bounds
  const bounds = new window.kakao.maps.LatLngBounds()
  path.forEach(p => bounds.extend(p))
  map.setBounds(bounds)
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
  <el-dialog
    v-model="dialogVisible"
    title="코스 상세 정보"
    width="600px"
    destroy-on-close
    center
    @opened="onOpened"
  >
    <div v-if="course" class="detail-content">
      <!-- Map Area (Replacing Image) -->
      <div class="map-wrapper">
        <div id="map" class="map-view"></div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <h2>{{ course.title }}</h2>
        <div class="detail-tags">
          <el-tag effect="dark" :color="getDifficultyColor(course.difficulty)" style="border:none; color:white;">
            {{ course.difficulty }}
          </el-tag>
          <el-tag effect="plain">{{ course.distance }}km</el-tag>
        </div>
      </div>

      <!-- Sentiment Analysis -->
      <div class="sentiment-section">
        <h3>💡 AI 코스 분석</h3>
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

      <!-- Reviews -->
      <div class="reviews-section">
        <h3>💬 크루원 후기</h3>
        <ul class="review-list">
          <li v-for="review in course.reviews" :key="review.id" class="review-item">
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
</style>
