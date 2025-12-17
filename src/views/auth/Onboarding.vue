<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1) // 1: Intro, 2: User Info
const loading = ref(false)

// Intro Slides
const slides = [
  {
    title: '나에게 딱 맞는\n러닝 크루 찾기',
    desc: '나의 목적과 스타일에 맞는\n러닝 크루를 찾아 함께 달려보세요.',
    image: 'https://images.unsplash.com/photo-1552674605-469523170d9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '내 크루를\n편하게 관리하세요',
    desc: '일정 관리부터 멤버 관리까지,\n크루 운영이 더 쉬워집니다.',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '나만의 코스를\n공유해보세요',
    desc: '내가 좋아하는 러닝 코스를 만들고\n크루원들과 함께 공유해요.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
]

// User Info Form
const form = reactive({
  birthdate: '',
  gender: '',
  pace: 30, // minutes for 5km? No, user said "Average Pace". Usually min/km. Let's use slider 3'00" ~ 10'00"
  region: ''
})

// Pace formatting (min/km)
const formatPace = (val) => {
  const totalSeconds = 180 + (val * 6) // 3:00 starts at 0. 60 steps.
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}'${sec.toString().padStart(2, '0')}"`
}

const handleStart = () => {
  step.value = 2
}

const handleComplete = async () => {
  if (!form.birthdate || !form.gender || !form.region) {
    alert('모든 정보를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const success = await authStore.submitOnboarding({
      ...form,
      pace: formatPace(form.pace)
    })
    
    if (success) {
      router.push('/crews')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="onboarding-view">
    <!-- Step 1: Intro Slides -->
    <div v-if="step === 1" class="intro-step">
      <Swiper
        :modules="[Pagination, Navigation]"
        pagination
        navigation
        class="intro-swiper"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <div class="slide-content">
            <div class="image-wrapper">
              <img :src="slide.image" :alt="slide.title" />
              <div class="overlay"></div>
            </div>
            <div class="text-content">
              <h2>{{ slide.title }}</h2>
              <p>{{ slide.desc }}</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      
      <div class="bottom-action">
        <button class="btn-start" @click="handleStart">시작하기</button>
      </div>
    </div>

    <!-- Step 2: User Info Form -->
    <div v-else class="form-step">
      <div class="form-header">
        <h2>환영합니다!</h2>
        <p>더 정확한 추천을 위해<br>간단한 정보를 알려주세요.</p>
      </div>

      <div class="form-content">
        <div class="form-group">
          <label>생년월일</label>
          <input type="date" v-model="form.birthdate" class="input-field" />
        </div>

        <div class="form-group">
          <label>성별</label>
          <div class="gender-options">
            <label class="gender-option" :class="{ active: form.gender === 'male' }">
              <input type="radio" v-model="form.gender" value="male" />
              <span>남성</span>
            </label>
            <label class="gender-option" :class="{ active: form.gender === 'female' }">
              <input type="radio" v-model="form.gender" value="female" />
              <span>여성</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>평균 페이스 (1km)</label>
          <div class="pace-slider-wrapper">
            <el-slider v-model="form.pace" :format-tooltip="formatPace" :max="70" />
            <div class="pace-display">{{ formatPace(form.pace) }}</div>
          </div>
        </div>

        <div class="form-group">
          <label>활동 지역</label>
          <select v-model="form.region" class="input-field">
            <option value="" disabled>지역을 선택해주세요</option>
            <option value="seoul">서울</option>
            <option value="gyeonggi">경기</option>
            <option value="incheon">인천</option>
            <option value="busan">부산</option>
            <option value="daegu">대구</option>
            <option value="daejeon">대전</option>
            <option value="gwangju">광주</option>
            <option value="ulsan">울산</option>
          </select>
        </div>
      </div>

      <div class="bottom-action">
        <button class="btn-complete" @click="handleComplete" :disabled="loading">
          {{ loading ? '처리중...' : '시작하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-view {
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

/* Intro Step */
.intro-step {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.intro-swiper {
  flex: 1;
  width: 100%;
}

.slide-content {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 100px; /* Space for button */
}

.image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-wrapper .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));
}

.text-content {
  padding: 40px;
  color: white;
  z-index: 1;
}

.text-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.3;
  white-space: pre-line;
}

.text-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
  white-space: pre-line;
}

/* Form Step */
.form-step {
  padding: 40px 24px;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-header {
  margin-bottom: 40px;
  text-align: center;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
}

.form-header p {
  color: #666;
  line-height: 1.5;
}

.form-content {
  flex: 1;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.input-field {
  width: 100%;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
}

.gender-options {
  display: flex;
  gap: 12px;
}

.gender-option {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.gender-option input {
  position: absolute;
  opacity: 0;
}

.gender-option span {
  display: block;
  text-align: center;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.gender-option.active span {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pace-slider-wrapper {
  padding: 0 10px;
}

.pace-display {
  text-align: center;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.2rem;
  margin-top: 8px;
}

/* Bottom Action */
.bottom-action {
  padding: 20px;
  background: white;
}

.btn-start, .btn-complete {
  width: 100%;
  padding: 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-start:hover, .btn-complete:hover {
  background: #45a049;
}

/* Swiper Customization */
:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: var(--color-primary);
}
</style>
