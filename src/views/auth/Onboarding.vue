<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { regions } from '../../constants/regions'
/* Swiper removed */

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1) // 1: Intro, 2: User Info
const loading = ref(false)

// Custom Carousel Logic
const currentSlide = ref(0)
const nextSlide = () => {
    if (currentSlide.value < slides.length - 1) {
        currentSlide.value++
    } else {
        handleStart()
    }
}

// Intro Slides
const slides = [
  {
    title: '나에게 딱 맞는\n러닝 크루 찾기',
    desc: '나의 목적과 스타일에 맞는\n러닝 크루를 찾아 함께 달려보세요.',
    // Image: Group Jogging Together (Literal 'Running Crew')
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2600&auto=format&fit=crop'
  },
  {
    title: '내 크루를\n편하게 관리하세요',
    desc: '일정 관리부터 멤버 관리까지,\n크루 운영이 더 쉬워집니다.',
    // Image: Planner/Schedule (Literal 'Management')
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop'
  },
  {
    title: '나만의 코스를\n공유해보세요',
    desc: '내가 좋아하는 러닝 코스를 만들고\n크루원들과 함께 공유해요.',
    // Image: Scenic Running Road (Literal 'Cool Course')
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop' 
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

// Dynamic Pace Feedback
const getPaceInfo = (val) => {
    const pace = 180 + (val * 6) // seconds per km
    if (pace < 270) return { text: '엘리트 러너 🔥', desc: '놀라운 속도입니다!' } // < 4'30"
    if (pace < 330) return { text: '고수 러너 ⚡', desc: '상위권 실력이네요!' } // < 5'30"
    if (pace < 390) return { text: '중급 러너 🏃', desc: '꾸준히 달리는 러너!' } // < 6'30"
    if (pace < 450) return { text: '입문 러너 🌱', desc: '성장하는 단계입니다.' } // < 7'30"
    return { text: '가벼운 조깅 🚶', desc: '건강을 위해 달려요.' } // > 7'30"
}
const paceInfo = computed(() => getPaceInfo(form.pace))

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
    <!-- Animated Decoration Background -->
    <div class="bg-decoration">
       <div class="orb orb-1"></div>
       <div class="orb orb-2"></div>
    </div>

    <!-- Step 1: Intro Slides (Custom Carousel) -->
    <div v-if="step === 1" class="intro-step fade-in">
      <div class="carousel-container">
        <transition-group name="slide-fade" tag="div" class="slides-wrapper">
          <div 
            v-for="(slide, index) in slides" 
            :key="index"
            v-show="currentSlide === index"
            class="slide-content"
          >
            <div class="image-wrapper">
              <img :src="slide.image" :alt="slide.title" />
              <div class="overlay"></div>
            </div>
            <div class="text-content">
              <h2 class="slide-title">{{ slide.title }}</h2>
              <p class="slide-desc">{{ slide.desc }}</p>
            </div>
          </div>
        </transition-group>

        <!-- Pagination Dots -->
        <div class="pagination">
          <span 
            v-for="(_, index) in slides" 
            :key="index" 
            class="dot" 
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>
      
      <div class="bottom-action">
        <button class="btn-primary" @click="nextSlide">
            {{ currentSlide === slides.length - 1 ? '시작하기' : '다음' }}
            <span class="btn-icon">➜</span>
        </button>
      </div>
    </div>

    <!-- Step 2: User Info Form -->
    <div v-else class="form-step slide-up">
      <div class="form-card">
        <div class="form-header">
            <div class="step-indicator">Step 2 of 2</div>
            <h2>마지막 단계에요</h2>
            <p>더 정확한 크루 추천을 위해<br>러너님의 정보를 알려주세요.</p>
        </div>

        <div class="form-content">
            <div class="form-group">
            <label>생년월일</label>
            <input type="date" v-model="form.birthDate" class="modern-input" />
            </div>
            <!-- Gender -->
            <div class="form-group stagger-2">
                <label>성별</label>
                <div class="gender-options">
                    <label class="gender-card male-card" :class="{ active: form.gender === 'male' }">
                        <input type="radio" v-model="form.gender" value="male">
                        <div class="gender-icon-wrapper">
                            <svg class="gender-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-8 1.67-8 5v2h16v-2c0-3.33-4.69-5-8-5z" />
                                <!-- Simple User Icon for now, or Mars? Let's use a stylized Mars-like or just clean person icon distinctive? -->
                                <!-- Actually, standard Mars/Venus is clearest. -->
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14.66V19a2 2 0 002 2h0a2 2 0 002-2v-4.34" />
                            </svg>
                            <!-- Let's use clearer standard Gender Icons -->
                        </div>
                        <span class="gender-label">남성</span>
                    </label>
                    <label class="gender-card female-card" :class="{ active: form.gender === 'female' }">
                        <input type="radio" v-model="form.gender" value="female">
                        <div class="gender-icon-wrapper">
                             <svg class="gender-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="7" r="4" />
                                <path d="M12 11v10" />
                                <path d="M9 17h6" /> <!-- Skirt-like or just abstract -->
                                <!-- Let's use standard Mars/Venus for clarity -->
                            </svg>
                        </div>
                        <span class="gender-label">여성</span>
                    </label>
                </div>
            </div>

            <!-- Pace -->
            <div class="form-group stagger-3">
                <label>평균 페이스 (1km)</label>
                <div class="pace-container">
                    <div class="pace-top">
                        <div class="pace-main">
                             <span class="pace-value">{{ formatPace(form.pace) }}</span>
                             <span class="pace-unit">/ km</span>
                        </div>
                        <div class="pace-dynamic-badge">
                            {{ paceInfo.text }}
                        </div>
                    </div>
                   
                    <el-slider 
                        v-model="form.pace" 
                        :format-tooltip="formatPace" 
                        :max="70" 
                        class="pace-slider"
                    ></el-slider>
                    
                    <p class="pace-desc-text">{{ paceInfo.desc }}</p>
                </div>
            </div>

            <!-- Region -->
            <div class="form-group stagger-4">
                <label>활동 지역</label>
                <div class="select-wrapper">
                    <select v-model="form.region" class="modern-select">
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
                        <option value="부산_부산진구">부산진구</option>
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
                <div class="select-icon">▼</div>
            </div>
            </div>
        </div>

        <div class="bottom-action">
            <button class="btn-primary" @click="handleComplete" :disabled="loading">
            {{ loading ? '처리중...' : '시작하기' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-view {
  height: 100vh;
  /* Urban Night Theme: Deep, Muted Navy Gradient */
  background: radial-gradient(circle at center, #2e3458 0%, #1e2040 60%, #0f1020 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Apple SD Gothic Neo', sans-serif;
}

/* Background Decoration */
.bg-decoration {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}
.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
}
.orb-1 {
    width: 300px; height: 300px;
    background: #6366F1;
    top: -50px; left: -50px;
    animation: floatOrb 8s infinite alternate;
}
.orb-2 {
    width: 250px; height: 250px;
    background: #EC4899;
    bottom: -50px; right: -50px;
    animation: floatOrb 10s infinite alternate-reverse;
}
@keyframes floatOrb {
    0% { transform: translate(0, 0); }
    100% { transform: translate(30px, 30px); }
}

/* Common Text Styles */
h2 { color: #1e1b4b; margin: 0; }
p { color: #64748b; margin: 0; }

/* Intro Step */
.intro-step {
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
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
  padding-bottom: 110px; 
}

.image-wrapper {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: -1;
}
.image-wrapper img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 10s ease;
}
.swiper-slide-active .image-wrapper img {
    transform: scale(1.1);
}

.image-wrapper .overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(30,27,75,0.1), rgba(30,27,75,0.95));
}

.text-content {
  padding: 40px;
  color: white;
  z-index: 1;
  transform: translateY(20px);
  opacity: 0;
  animation: slideUpFade 0.8s forwards 0.3s;
}

/* Custom Carousel Styles */
.carousel-container {
    flex: 1; /* Take remaining height */
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex; /* Ensure children can size correctly */
    flex-direction: column;
}
.slides-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}
.slide-content {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 110px;
}

/* Slide Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease-in-out;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Pagination Dots */
.pagination {
    position: absolute;
    top: 60px; /* Moved to top to avoid text overlap */
    left: 30px;
    display: flex;
    gap: 8px;
    z-index: 10;
}
.dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(4px);
}
.dot.active {
    background: #6366F1;
    width: 24px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.slide-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.25;
  white-space: pre-line;
  color: white;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.slide-desc {
  font-size: 1.05rem;
  opacity: 0.9;
  line-height: 1.6;
  white-space: pre-line;
  color: #e2e8f0;
}

/* Form Step */
.form-step {
  padding: 40px 24px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  /* Background removed to show Urban Night theme */
}

.form-card {
    background: white;
    width: 100%;
    max-width: 480px;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow-y: auto;
}

.form-header {
  margin-bottom: 30px;
  text-align: center;
}
.step-indicator {
    font-size: 0.8rem;
    font-weight: 700;
    color: #6366F1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
}
.form-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.form-content { flex: 1; }

.form-group { margin-bottom: 24px; }
.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #334155;
}

.modern-input, .modern-select {
  width: 100%;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s;
  appearance: none;
}
.modern-input:focus, .modern-select:focus {
    outline: none;
    border-color: #6366F1;
    background: white;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
}

/* Gender Cards (Icon Based) */
.gender-options { display: flex; gap: 16px; margin-top: 8px; }
.gender-card {
    flex: 1; height: 130px; /* Taller for icons */
    position: relative; cursor: pointer;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    display: flex; flex-direction: column; 
    align-items: center; justify-content: center; gap: 12px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    text-align: center;
}
.gender-card input { position: absolute; opacity: 0; }

.gender-icon-wrapper {
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    background: #f1f5f9;
    border-radius: 50%;
    transition: all 0.3s;
}
.gender-icon {
    width: 28px; height: 28px;
    color: #94a3b8;
    transition: all 0.3s;
}

.gender-label {
    font-size: 1.05rem;
    font-weight: 700;
    color: #64748b;
    transition: all 0.3s;
}

/* Hover */
.gender-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Active - Male */
.gender-card.male-card.active {
    background: #F0F9FF; /* Sky 50 */
    border-color: #0EA5E9;
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2);
}
.gender-card.male-card.active .gender-icon-wrapper { background: #bae6fd; }
.gender-card.male-card.active .gender-icon { color: #0284C7; }
.gender-card.male-card.active .gender-label { color: #0284C7; }

/* Active - Female */
.gender-card.female-card.active {
    background: #FFF1F2; /* Rose 50 */
    border-color: #F43F5E;
    box-shadow: 0 8px 20px rgba(244, 63, 94, 0.2);
}
.gender-card.female-card.active .gender-icon-wrapper { background: #fecdd3; }
.gender-card.female-card.active .gender-icon { color: #be123c; }
.gender-card.female-card.active .gender-label { color: #be123c; }

/* Pace Slider & Dynamic Feedback */
.pace-container { 
    background: #f8fafc; /* Light Slate */
    padding: 24px; border-radius: 20px; 
    border: 1px solid #e2e8f0; 
}
.pace-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.pace-main { display: flex; align-items: baseline; gap: 6px; }
.pace-value { 
    font-size: 2.2rem; font-weight: 800; 
    color: #4F46E5; /* Indigo-600 */
    font-variant-numeric: tabular-nums; line-height: 1; 
}
.pace-unit { font-size: 1rem; font-weight: 600; color: #64748b; }

.pace-dynamic-badge {
    font-size: 0.85rem;
    font-weight: 700;
    color: #4F46E5;
    background: #EEF2FF;
    padding: 6px 12px;
    border-radius: 12px;
    border: 1px solid #C7D2FE;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:deep(.el-slider__bar) { background-color: #818cf8; height: 6px; border-radius: 3px; }
:deep(.el-slider__button) { 
    border-color: #818cf8; background: #6366F1; 
    width: 20px; height: 20px; 
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
    transition: transform 0.1s;
}
:deep(.el-slider__button:hover) { transform: scale(1.1); }
:deep(.el-slider__runway) { background-color: #cbd5e1; height: 6px; margin: 12px 0; }

.pace-desc-text {
    text-align: center;
    font-size: 0.9rem;
    color: #94a3b8;
    margin-top: 16px;
    font-weight: 500;
}

@keyframes popIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}


/* Bottom Action */
.bottom-action {
  margin-top: 20px;
}

.btn-primary {
  width: 100%;
  padding: 18px;
  background: linear-gradient(90deg, #6366F1, #818CF8);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}
.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}
.btn-icon { font-size: 1rem; transition: transform 0.2s; }
.btn-primary:hover .btn-icon { transform: translateX(5px); }

/* Animations */
.fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.slide-up { animation: slideUp 0.6s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@keyframes slideUpFade {
    to { transform: translateY(0); opacity: 1; }
}

/* Swiper Customization */
:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
  width: 8px; height: 8px;
  transition: all 0.3s;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #6366F1;
  width: 24px;
  border-radius: 4px;
}
:deep(.swiper-button-next), :deep(.swiper-button-prev) {
    color: white;
    opacity: 0.7;
    transform: scale(0.7);
}
</style>
