<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import AOS from 'aos'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'aos/dist/aos.css'

const router = useRouter()

// Stats Data
const stats = ref([
  { id: 1, label: '크루 수', value: 500, suffix: '+', current: 0 },
  { id: 2, label: '러너 수', value: 3200, suffix: '+', current: 0 },
  { id: 3, label: '평균 거리', value: 15, suffix: 'km', current: 0 }
])

// Popular Crews Data
const popularCrews = ref([
  { id: 1, name: '한강 러너스', location: '서울 여의도', members: 120, pace: '5:30', badge: '🔥 Hot' },
  { id: 2, name: '남산 거북이', location: '서울 남산', members: 85, pace: '6:00', badge: '⛰️ Hill' },
  { id: 3, name: '강남 스프린터', location: '서울 강남', members: 200, pace: '4:30', badge: '⚡ Fast' },
  { id: 4, name: '부산 갈매기', location: '부산 해운대', members: 150, pace: '5:45', badge: '🌊 Ocean' },
  { id: 5, name: '대구 달리기', location: '대구 수성못', members: 90, pace: '6:15', badge: '🌳 Park' }
])

// Features Data
const features = ref([
  { id: 1, title: 'AI 매칭', description: '나의 러닝 스타일과 목표에 딱 맞는 크루를 AI가 추천해드립니다.', icon: 'Cpu' },
  { id: 2, title: '코스 분석', description: '고도, 경사도, 난이도 등 상세한 코스 정보를 미리 확인하세요.', icon: 'MapLocation' },
  { id: 3, title: '멤버 관리', description: '출석 체크부터 회비 관리까지, 크루 운영이 쉬워집니다.', icon: 'UserFilled' }
])

// Count Up Animation
const startCountUp = () => {
  stats.value.forEach(stat => {
    let start = 0
    const end = stat.value
    const duration = 2000
    const startTime = performance.now()

    const animate = (currentTime) => {
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4)
      
      stat.current = Math.floor(start + (end - start) * ease)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  })
}

onMounted(() => {
  AOS.init({
    duration: 1000,
    once: true
  })
  startCountUp()
})

const navigateToCrews = () => {
  router.push('/crews')
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content" data-aos="fade-up">
        <h1 class="slogan">운영은 스마트하게,<br>러닝은 뜨겁게</h1>
        <p class="sub-slogan">CrewUp과 함께 더 즐거운 러닝 라이프를 시작하세요.</p>
        <button class="cta-button" @click="navigateToCrews">
          크루 찾으러 가기
        </button>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-container">
        <div v-for="stat in stats" :key="stat.id" class="stat-card" data-aos="fade-up" :data-aos-delay="stat.id * 100">
          <div class="stat-number">{{ stat.current }}{{ stat.suffix }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Popular Crews Section -->
    <section class="popular-crews-section">
      <div class="section-header" data-aos="fade-right">
        <h2>지금 뜨는 인기 크루</h2>
        <p>열정적인 러너들이 모인 곳을 확인해보세요.</p>
      </div>
      <div class="swiper-container" data-aos="fade-up">
        <Swiper
          :modules="[Navigation, Pagination, Autoplay]"
          :slides-per-view="1"
          :space-between="20"
          :breakpoints="{
            '640': { slidesPerView: 2, spaceBetween: 20 },
            '1024': { slidesPerView: 3, spaceBetween: 30 }
          }"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          navigation
          pagination
          class="crew-swiper"
        >
          <SwiperSlide v-for="crew in popularCrews" :key="crew.id">
            <div class="crew-card">
              <div class="crew-badge">{{ crew.badge }}</div>
              <h3 class="crew-name">{{ crew.name }}</h3>
              <div class="crew-info">
                <span>📍 {{ crew.location }}</span>
                <span>👥 {{ crew.members }}명</span>
                <span>⏱️ {{ crew.pace }}</span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="features-section">
      <div class="section-header" data-aos="fade-right">
        <h2>주요 기능</h2>
        <p>크루 운영과 활동에 필요한 모든 기능을 제공합니다.</p>
      </div>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.id" class="feature-card" data-aos="fade-up" :data-aos-delay="feature.id * 100">
          <div class="feature-icon">
            <el-icon :size="40"><component :is="feature.icon" /></el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  font-family: 'Noto Sans KR', sans-serif;
}

/* Hero Section */
.hero-section {
  height: 600px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1552674605-469523170d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  padding: 0 20px;
}

.slogan {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.sub-slogan {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-button {
  background: linear-gradient(45deg, var(--color-running-green), #45a049);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.4);
}

/* Stats Section */
.stats-section {
  padding: 80px 0;
  background-color: #f9fafb;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 0 20px;
}

.stat-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-running-green);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
}

/* Popular Crews Section */
.popular-crews-section {
  padding: 100px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.section-header p {
  font-size: 1.1rem;
  color: #666;
}

.swiper-container {
  padding: 20px;
}

.crew-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: transform 0.3s ease;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #eee;
}

.crew-card:hover {
  transform: scale(1.05);
  border-color: var(--color-running-green);
}

.crew-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #fff0f0;
  color: var(--color-energy-red);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.crew-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.crew-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #666;
}

/* Features Section */
.features-section {
  padding: 100px 0;
  background-color: #f9fafb;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 0 20px;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-10px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: #e8f5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: var(--color-running-green);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.feature-desc {
  color: #666;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .slogan {
    font-size: 2.5rem;
  }
  
  .stats-container, .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section {
    height: 500px;
  }
}
</style>
