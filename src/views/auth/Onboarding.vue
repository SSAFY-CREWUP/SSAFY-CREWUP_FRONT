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
  birthDate: '',
  gender: '',
  pace: 30, 
  region: ''
})

// Pace formatting (min/km)
const formatPace = (val) => {
  const totalSeconds = 180 + (val * 6) // 3:00 starts at 0. 60 steps.
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}'${sec.toString().padStart(2, '0')}\"`
}

const handleStart = () => {
  step.value = 2
}

const handleComplete = async () => {
  if (!form.birthDate || !form.gender || !form.region) {
    alert('모든 정보를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const success = await authStore.submitOnboarding({
      ...form,
      averagePace: formatPace(form.pace)
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
          <input type="date" v-model="form.birthDate" class="input-field" />
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
            <optgroup label="서울">
                <option value="서울_강남구">강남구</option>
                <option value="서울_강동구">강동구</option>
                <option value="서울_강북구">강북구</option>
                <option value="서울_강서구">강서구</option>
                <option value="서울_관악구">관악구</option>
                <option value="서울_광진구">광진구</option>
                <option value="서울_구로구">구로구</option>
                <option value="서울_금천구">금천구</option>
                <option value="서울_노원구">노원구</option>
                <option value="서울_도봉구">도봉구</option>
                <option value="서울_동대문구">동대문구</option>
                <option value="서울_동작구">동작구</option>
                <option value="서울_마포구">마포구</option>
                <option value="서울_서대문구">서대문구</option>
                <option value="서울_서초구">서초구</option>
                <option value="서울_성동구">성동구</option>
                <option value="서울_성북구">성북구</option>
                <option value="서울_송파구">송파구</option>
                <option value="서울_양천구">양천구</option>
                <option value="서울_영등포구">영등포구</option>
                <option value="서울_용산구">용산구</option>
                <option value="서울_은평구">은평구</option>
                <option value="서울_종로구">종로구</option>
                <option value="서울_중구">중구</option>
                <option value="서울_중랑구">중랑구</option>
            </optgroup>
            <optgroup label="경기">
                <option value="경기_고양시">고양시</option>
                <option value="경기_과천시">과천시</option>
                <option value="경기_광명시">광명시</option>
                <option value="경기_구리시">구리시</option>
                <option value="경기_군포시">군포시</option>
                <option value="경기_김포시">김포시</option>
                <option value="경기_남양주시">남양주시</option>
                <option value="경기_부천시">부천시</option>
                <option value="경기_성남시">성남시</option>
                <option value="경기_수원시">수원시</option>
                <option value="경기_시흥시">시흥시</option>
                <option value="경기_안산시">안산시</option>
                <option value="경기_안양시">안양시</option>
                <option value="경기_용인시">용인시</option>
                <option value="경기_의정부시">의정부시</option>
                <option value="경기_파주시">파주시</option>
                <option value="경기_평택시">평택시</option>
                <option value="경기_하남시">하남시</option>
                <option value="경기_화성시">화성시</option>
            </optgroup>
            <optgroup label="인천">
                <option value="인천_계양구">계양구</option>
                <option value="인천_남동구">남동구</option>
                <option value="인천_부평구">부평구</option>
                <option value="인천_연수구">연수구</option>
                <option value="인천_중구">중구</option>
                <option value="인천_서구">서구</option>
            </optgroup>
            <optgroup label="부산">
                <option value="부산_해운대구">해운대구</option>
                <option value="부산_수영구">수영구</option>
                <option value="부산진구">부산진구</option>
            </optgroup>
            <optgroup label="대구">
                <option value="대구_수성구">수성구</option>
                <option value="대구_중구">중구</option>
            </optgroup>
            <optgroup label="광주">
                <option value="광주_서구">서구</option>
                <option value="광주_동구">동구</option>
            </optgroup>
            <optgroup label="대전">
                <option value="대전_유성구">유성구</option>
                <option value="대전_서구">서구</option>
            </optgroup>
            <optgroup label="울산">
                <option value="울산_남구">남구</option>
                <option value="울산_중구">중구</option>
            </optgroup>
            <optgroup label="세종">
                <option value="세종특별자치시">세종특별자치시</option>
            </optgroup>
            <optgroup label="강원">
                <option value="강원_춘천시">춘천시</option>
                <option value="강원_강릉시">강릉시</option>
                <option value="강원_원주시">원주시</option>
            </optgroup>
            <optgroup label="제주">
                <option value="제주_제주시">제주시</option>
                <option value="제주_서귀포시">서귀포시</option>
            </optgroup>
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
