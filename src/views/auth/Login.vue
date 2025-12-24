<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import { ElMessage } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const rules = computed(() => ({
  email: { required, email },
  password: { required, minLength: minLength(6) }
}))

const v$ = useVuelidate(rules, form)

const showPassword = ref(false)
const isLoaded = ref(false)

onMounted(() => {
  // Trigger animations
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

const handleLogin = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  const result = await authStore.login({
    email: form.email,
    password: form.password
  })

  if (result.success) {
    ElMessage.success('환영합니다!')
    if (result.isNewUser) {
      router.push('/onboarding')
    } else {
      router.push('/crews')
    }
  } else {
    ElMessage.error(authStore.error || '이메일 또는 비밀번호가 일치하지 않습니다.')
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
// Force HMR update
</script>

<template>
  <div class="login-page">
    <div class="split-layout">
      
      <!-- Left: Form Section -->
      <div class="form-section">
        <div class="form-container" :class="{ 'fade-in-up': isLoaded }">
          
          <div class="brand-header">
            <h1 class="logo-text">CrewUp</h1>
            <p class="subtitle">러닝 크루 전용 올인원 플랫폼</p>
          </div>

          <div class="welcome-text">
            <h2>운영은 스마트하게,<br>러닝은 뜨겁게.</h2>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            
            <div class="form-item" style="--d: 0.1s">
              <label for="email">이메일</label>
              <div class="input-container" :class="{ error: v$.email.$error }">
                <input 
                  id="email"
                  v-model="form.email" 
                  type="email" 
                  placeholder="name@example.com"
                  @blur="v$.email.$touch"
                  autocomplete="username"
                />
              </div>
              <span v-if="v$.email.$error" class="error-text">
                유효한 이메일을 입력해주세요.
              </span>
            </div>

            <div class="form-item" style="--d: 0.2s">
              <label for="password">비밀번호</label>
              <div class="input-container" :class="{ error: v$.password.$error }">
                <input 
                  id="password"
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="비밀번호 입력"
                  @blur="v$.password.$touch"
                  autocomplete="current-password"
                />
                <button type="button" class="eye-btn" @click="togglePasswordVisibility">
                  <el-icon v-if="showPassword"><View /></el-icon>
                  <el-icon v-else><Hide /></el-icon>
                </button>
              </div>
              <span v-if="v$.password.$error" class="error-text">
                비밀번호는 6자 이상이어야 합니다.
              </span>
            </div>

            <div class="form-options form-item" style="--d: 0.3s">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="form.rememberMe">
                <span class="checkmark"></span>
                <span class="label-text">로그인 유지</span>
              </label>
              <a href="#" class="link-text">비밀번호 찾기</a>
            </div>

            <div class="action-area form-item" style="--d: 0.4s">
              <button type="submit" class="submit-btn" :disabled="authStore.loading">
                <span v-if="!authStore.loading">로그인</span>
                <span v-else class="loader"></span>
              </button>
            </div>

            <div class="signup-area form-item" style="--d: 0.5s">
              아직 회원이 아니신가요? 
              <RouterLink to="/signup">회원가입</RouterLink>
            </div>

          </form>
        </div>
        
        <div class="copyright">© 2025 SSAFY 관통프로젝트.</div>
        
        <!-- Running Track Background Elements -->
        <div class="track-bg">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path class="track-line" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128" fill="none" stroke="rgba(99, 102, 241, 0.1)" stroke-width="2"/>
            <path class="track-line delay-1" d="M0,126L48,142C96,158,192,190,288,190C384,190,480,158,576,142C672,126,768,126,864,142C960,158,1056,190,1152,195.3C1248,201,1344,179,1392,168.7L1440,158" fill="none" stroke="rgba(99, 102, 241, 0.08)" stroke-width="2"/>
             <path class="track-line delay-2" d="M0,156L48,172C96,188,192,220,288,220C384,220,480,188,576,172C672,156,768,156,864,172C960,188,1056,220,1152,225.3C1248,231,1344,209,1392,198.7L1440,188" fill="none" stroke="rgba(99, 102, 241, 0.05)" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- Right: Visual Section -->
      <div class="visual-section">
        <div class="visual-bg-image"></div> <!-- Animated Background -->
        
        <!-- Monitor Platform (iMac Style) -->
        <div class="monitor-container" :class="{ 'fade-in': isLoaded }">
            
             <!-- Feature Bubbles -->
             <div class="feature-bubble bubble-1">
                <span class="bubble-icon">🗺️</span>
                <div class="bubble-content">
                    <strong>나만의 코스 제작</strong>
                    <p>지도 위에 그리는 우리만의 러닝 코스</p>
                </div>
             </div>
             <div class="feature-bubble bubble-2">
                <span class="bubble-icon">🗳️</span>
                <div class="bubble-content">
                    <strong>편리한 투표 & 일정</strong>
                    <p>복잡한 출석 체크, 투표로 한번에</p>
                </div>
             </div>

            <!-- Monitor Head (Screen + Chin) -->
            <div class="monitor-head">
                <div class="monitor-screen">
                     <!-- Service UI (Dashboard) -->
                    <div class="service-ui">
                        <!-- Sidebar -->
                        <div class="ui-sidebar">
                            <div class="ui-menu-dot active"></div>
                            <div class="ui-menu-dot"></div>
                            <div class="ui-menu-dot"></div>
                        </div>

                        <!-- Main Content -->
                        <div class="ui-main">
                             <div class="ui-header">
                                <span class="ui-title">내 코스</span>
                                <div class="ui-profile"></div>
                             </div>
                             
                             <div class="map-view">
                                 <!-- Header -->
                                <div class="map-overlay-header">
                                    <span class="badge">러닝 코스</span>
                                    <span class="route-name">여의도 공원 루프</span>
                                </div>
                                
                                <!-- Map SVG (Refined) -->
                                 <svg class="map-svg" viewBox="0 0 300 200" style="background-color: #f8f8f8;">
                                    <!-- Map Elements (Kakao-ish Style) -->
                                    <!-- River (Han River) -->
                                    <path d="M0,20 C100,25 200,10 300,20 L300,0 L0,0 Z" fill="#dbeafe" />
                                    
                                    <!-- Park Area (Yeouido Park) -->
                                    <rect x="180" y="50" width="100" height="120" rx="4" fill="#dcfce7" />
                                    <path d="M40,60 C60,60 80,80 80,100 C80,120 60,140 40,140" fill="#dcfce7" opacity="0.6"/>

                                    <!-- Roads (Grid) -->
                                    <g stroke="#ffffff" stroke-width="6">
                                        <line x1="0" y1="100" x2="300" y2="100" />
                                        <line x1="150" y1="0" x2="150" y2="200" />
                                        <line x1="240" y1="0" x2="240" y2="200" />
                                    </g>
                                    
                                    <!-- Course Path Background (Gray trace) -->
                                    <path class="map-street" d="M20,100 Q80,50 150,100 T280,100" stroke="#e2e8f0" stroke-width="8" fill="none" stroke-linecap="round"/>
                                    
                                    <!-- Animated Route Path -->
                                    <path class="map-route" d="M20,100 Q80,50 150,100 T280,100" stroke="#6366F1" stroke-width="5" fill="none" stroke-dasharray="320" stroke-dashoffset="320" stroke-linecap="round">
                                        <animate attributeName="stroke-dashoffset" from="320" to="0" begin="0.5s" dur="2s" fill="freeze" />
                                    </path>
                                    
                                    <!-- Pins Dropping (Start/End Only) -->
                                    <g class="pin-start">
                                        <circle cx="20" cy="100" r="5" fill="#312E81">
                                            <animate attributeName="r" values="0;6;5" dur="0.5s" begin="0s" fill="freeze" />
                                        </circle>
                                    </g>
                                    <!-- Middle Pin Removed as requested -->
                                    <g class="pin-end">
                                        <circle cx="280" cy="100" r="5" fill="#ef4444">
                                            <animate attributeName="r" values="0;6;5" dur="0.5s" begin="2s" fill="freeze" />
                                        </circle>
                                    </g>
                                    
                                    <!-- Moving User Marker (Looping) -->
                                    <g>
                                        <circle r="8" fill="rgba(99, 102, 241, 0.3)">
                                            <animateMotion path="M20,100 Q80,50 150,100 T280,100" begin="2.5s" dur="3s" repeatCount="indefinite" />
                                            <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                        <circle r="4" fill="#6366F1">
                                            <animateMotion path="M20,100 Q80,50 150,100 T280,100" begin="2.5s" dur="3s" repeatCount="indefinite" />
                                        </circle>
                                    </g>
                                 </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Monitor Chin (Bottom Bezel) -->
                <div class="monitor-chin">
                    
                </div>
            </div>
            <!-- Stand - L Shape -->
            <div class="monitor-stand"></div>
            <div class="monitor-base"></div>
        </div>
        
        <!-- Restored Slogan Box -->
        <div class="visual-content" :class="{ 'fade-in': isLoaded }">
          <div class="slogan-box">
            <h3>Make Culture,<br>CrewUp!</h3>
            <p>함께 달리는 즐거움의 시작</p>
          </div>
        </div>
        
        <div class="overlay"></div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Feature Bubbles - Moved further out */
/* Laptop Mockup Styles - Robust 2D Clean Design */
/* Monitor Style (Blue iMac M3 Inspired) */
.monitor-container {
    position: absolute;
    top: 38%; /* Moved Up further */ 
    right: 5%;
    transform: translateY(-50%);
    width: 600px;
    height: 400px; /* Taller */
    z-index: 3;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1.5s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.monitor-container.fade-in {
    opacity: 1;
}

/* Head: Screen + Chin */
.monitor-head {
    width: 100%;
    height: 380px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    padding: 12px 12px 0 12px; /* White bezel around screen */
    background: #f8fafc; /* Bezel color */
    border: 1px solid #e2e8f0;
    position: relative;
    z-index: 5;
}

.monitor-screen {
    width: 100%;
    flex: 1; /* Fills remaining space */
    background: #000; /* Screen when off, but we have content */
    border-radius: 12px 12px 4px 4px;
    overflow: hidden;
    position: relative;
    border: 1px solid #cbd5e1;
}

.monitor-chin {
    width: 100%;
    height: 48px;
    background: #f8fafc; /* Same as bezel */
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0 0 20px 20px;
}

/* Stand Setup */
.monitor-stand {
    width: 140px;
    height: 60px;
    background: linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%);
    margin-top: -10px; /* Tuck under chin */
    z-index: 4;
    position: relative;
}

.monitor-base {
    width: 160px;
    height: 12px;
    background: #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    z-index: 4;
}
/* Dashboard UI Enhancements */
.service-ui {
    display: flex;
    height: 100%;
    background: #f8fafc;
}
.ui-sidebar {
    width: 50px;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    gap: 12px;
}
.ui-menu-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
}
.ui-menu-dot.active { background: #6366F1; }

.ui-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
}
.ui-header {
    height: 36px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #fff;
}
.ui-title { font-size: 0.65rem; font-weight: 700; color: #1e1b4b; }
.ui-profile { width: 20px; height: 20px; background: #cbd5e1; border-radius: 50%; }

.map-view {
    flex: 1;
    position: relative;
    /* Map now fills this space */
}

/* Feature Bubbles - Adjusted positions */
.bubble-content {
    display: flex;
    flex-direction: column;
}
.bubble-content strong {
    font-size: 0.85rem;
    color: #1e1b4b;
    margin-bottom: 2px;
}
.bubble-content p {
    font-size: 0.7rem;
    color: #64748b;
    margin: 0;
}
.feature-bubble {
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    z-index: 10;
    animation: floatBubble 6s ease-in-out infinite;
    border: 1px solid rgba(255,255,255,0.8);
    white-space: nowrap;
}

.bubble-1 {
    top: 50%;
    left: -70px;
    animation-delay: 0s;
}

.bubble-2 {
    bottom: 20px;
    right: -30px;
    animation-delay: 2s;
}

@keyframes floatBubble {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}


/* Checkbox Fix - Strict Flex Row */
.form-options {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.checkbox-wrapper {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 20;
  user-select: none;
  padding: 0;
}

/* ... existing checkbox internal styles ... */
.checkmark {
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #6366F1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

/* ... content inside screen ... */
.map-view {
    width: 100%;
    height: 100%;
    position: relative;
    background: #eff6ff;
    /* Removed center alignment to allow absolute positioning */
}

/* Header fix */
.map-overlay-header {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255, 255, 255, 0.9);
    padding: 6px 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 10; /* Higher than SVG */
}
.map-overlay-header .badge {
    font-size: 0.6rem;
    color: #6366F1;
    font-weight: 700;
}
.map-overlay-header .route-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: #1e1b4b;
}

/* Map SVG full cover */
.map-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1; /* Lowest */
}

/* ... existing avatars, goal-card ... */
.crew-avatars {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    z-index: 10;
}
.avatar-circle {
    width: 28px;
    height: 28px;
    font-size: 0.6rem;
    border: 2px solid #fff;
    border-radius: 50%;
    background: #cbd5e1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    margin-left: -8px;
    font-weight: 700;
}
.bg-indigo { background: #6366F1; }
.bg-pink { background: #EC4899; }
.bg-purple { background: #8B5CF6; }

.goal-card {
    position: absolute;
    bottom: 15px;
    left: 15px;
    background: white;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
}
.goal-icon { font-size: 1rem; }
.goal-info { display: flex; flex-direction: column; }
.goal-label { font-size: 0.6rem; color: #64748b; }
.goal-value { font-size: 0.8rem; font-weight: 700; color: #1e1b4b; }

.checkbox-wrapper:hover .checkmark {
  background-color: #eef2ff;
  border-color: #4338CA;
  box-shadow: none;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #6366F1;
  border-color: #6366F1;
}

.checkmark:after {
  content: "";
  display: none;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.label-text {
  font-size: 0.9rem;
  color: #334155 !important;
  font-weight: 600;
  white-space: nowrap;
  line-height: normal; 
  margin-top: 0;
}

.link-text {
  margin-left: auto;
}

.laptop-container.fade-in {
    opacity: 1;
}

.laptop-body {
    position: relative;
    width: 100%;
    height: 100%;
}

.laptop-screen {
    width: 100%;
    height: 340px;
    background: #0f172a; /* Dark bezel */
    border-radius: 16px 16px 0 0;
    padding: 12px 12px 0 12px; /* Bezel thickness */
    position: relative;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.screen-header {
    position: absolute;
    top: 5px;
    width: 100%;
    display: flex;
    justify-content: center;
}
.camera-dot {
    width: 4px;
    height: 4px;
    background: #334155;
    border-radius: 50%;
}

.laptop-base {
    width: 120%;
    height: 18px;
    background: #e2e8f0; /* Silver base */
    border-radius: 0 0 16px 16px;
    position: absolute;
    bottom: 22px;
    left: -10%;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    background: linear-gradient(to bottom, #f1f5f9, #cbd5e1);
}

.laptop-base::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 90px;
    height: 4px;
    background: #94a3b8;
    border-radius: 0 0 4px 4px;
}

/* Service Internal UI (Map & Running) */
.service-ui {
    width: 100%;
    height: 100%;
    background: #f8fafc;
    border-radius: 6px 6px 0 0;
    display: flex;
    overflow: hidden;
}

.map-sidebar {
    width: 100px;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.map-sidebar .tab {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 20px;
}

.map-sidebar .active-tab {
    background: #6366F1;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(99, 102, 241, 0.3);
}

.map-view {
    flex: 1;
    position: relative;
    background: #e0f2fe; /* Map water/bg color */
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* Simulated Map Look */
.map-view::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
        linear-gradient(#cbd5e1 1px, transparent 1px),
        linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.3;
}

.map-overlay-header {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255,255,255,0.9);
    padding: 10px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
}

.badge {
    font-size: 0.65rem;
    color: #6366F1;
    font-weight: 700;
    text-transform: uppercase;
}
.route-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1e1b4b;
}

.map-svg {
    width: 100%;
    height: 100%;
    z-index: 1;
}

/* ... existing map-view styling ... */

.crew-avatars {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
}
.avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: #cbd5e1;
    margin-left: -10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.6rem;
    font-weight: bold;
    color: #fff;
}
.bg-indigo { background-color: #6366F1; }
.bg-pink { background-color: #EC4899; }
.bg-purple { background-color: #8B5CF6; }

.goal-card {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(255,255,255,0.95);
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    width: 180px;
}
.goal-icon {
    width: 36px;
    height: 36px;
    background: #FEF3C7;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
}
.goal-info {
    display: flex;
    flex-direction: column;
}
.goal-label { font-size: 0.7rem; color: #64748b; }
.goal-value { font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }


.dash-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 140px;
    gap: 16px;
}

.dash-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    padding: 16px;
}

.big-chart {
    display: flex;
    align-items: flex-end;
}

.chart-area {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 20px;
    gap: 8px;
}

.bar {
    flex: 1;
    background: #e2e8f0;
    border-radius: 4px 4px 0 0;
}

.bar.active {
    background: #818CF8; /* Indigo 400 */
}

.info-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-line { width: 80%; height: 8px; background: #e2e8f0; border-radius: 4px; }
.info-line.short { width: 50%; }
.info-circle { width: 40px; height: 40px; border-radius: 50%; border: 4px solid #e2e8f0; border-top-color: #6366F1; }

/* Reset & Base */
.login-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fff;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #1a1a1a;
}

.split-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

/* --- Left: Form Section --- */
.form-section {
  flex: 0 0 480px; /* Fixed width for cleaner ERP tool look */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 40px;
  background: #ffffff;
  z-index: 2;
  overflow: hidden; /* Ensure SVG doesn't overflow */
}

.track-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  z-index: -1;
  pointer-events: none;
  opacity: 0.6;
}

.track-bg svg {
  width: 100%;
  height: 100%;
}

.track-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 4s ease-out forwards infinite;
}

.track-line.delay-1 {
  animation-delay: 0.5s;
}

.track-line.delay-2 {
  animation-delay: 1s;
}

@keyframes drawLine {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

.form-container {
  width: 100%;
  max-width: 360px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.form-container.fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

/* Header */
.brand-header {
  margin-bottom: 24px;
}

/* Urban Night Purple Theme */

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #312E81; /* Deep Indigo */
  letter-spacing: -0.02em;
  margin: 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #4338ca; /* Indigo 700 */
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.welcome-text {
  margin-bottom: 40px;
}

.welcome-text h2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  color: #312E81; /* Deep Indigo */
  margin: 0;
  letter-spacing: -0.01em;
}

/* Form Fields */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  opacity: 0;
  animation: slideUp 0.6s ease-out forwards;
  animation-delay: var(--d);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e1b4b; /* Indigo 950 */
  margin-bottom: 8px;
}

.input-container {
  position: relative;
  width: 100%;
  height: 52px;
  background: #eef2ff; /* Indigo 50 */
  border: 1px solid #c7d2fe; /* Indigo 200 */
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.input-container:focus-within {
  background: #fff;
  border-color: #6366F1; /* Modern Indigo */
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-container.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-container input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #333;
  outline: none;
}

.input-container input::placeholder {
  color: #6366f1; /* Indigo 500 (muted) */
  opacity: 0.6;
}

.eye-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6366f1;
  display: flex;
  padding: 4px;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 6px;
  display: block;
}

/* Robust Checkbox Fix */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px; /* Add slight margin */
  width: 100%;
  padding: 0; 
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  z-index: 10;
  user-select: none;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #a5b4fc;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-wrapper:hover input ~ .checkmark {
  background-color: #eef2ff;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #6366F1;
  border-color: #6366F1;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.label-text {
  font-size: 0.9rem;
  color: #334155 !important;
  font-weight: 600;
  white-space: nowrap;
}

.link-text {
  font-size: 0.875rem;
  color: #4338ca; /* Indigo 700 */
  text-decoration: none;
  transition: color 0.2s;
}

.link-text:hover {
  color: #312E81;
  text-decoration: underline;
}

/* Submit Button - Neon Shimmer */
.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(90deg, #6366F1, #818CF8, #6366F1); /* Brighter Neon Gradient */
  background-size: 200% 100%;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: shimmer 3s infinite linear;
}

.highlight-text {
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
}

.submit-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
  box-shadow: none;
  animation: none;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Signup Link */
.signup-area {
  text-align: center;
  font-size: 0.875rem;
  color: #4338ca; /* Indigo 700 */
  margin-top: 12px;
}

.signup-area a {
  color: #6366F1; /* Modern Indigo */
  font-weight: 700;
  text-decoration: none;
  margin-left: 6px;
  position: relative;
}

.signup-area a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #6366F1;
  transition: width 0.3s;
}

.signup-area a:hover::after {
  width: 100%;
}

.copyright {
  position: absolute;
  bottom: 24px;
  font-size: 0.75rem;
  color: #6366f1; /* Indigo 500 */
  opacity: 0.7;
}

/* --- Right: Visual Section --- */
.visual-section {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Background Image with Zoom Effect */
.visual-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1552674605-469555f1e316?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80');
  background-size: cover;
  background-position: center;
  animation: zoomPulse 20s infinite alternate;
}

@keyframes zoomPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Urban Night Overlay */
  background: linear-gradient(135deg, rgba(49, 46, 129, 0.7) 0%, rgba(99, 102, 241, 0.6) 100%);
  z-index: 1;
}

.visual-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 80px;
  opacity: 0;
  transition: opacity 1.2s ease-out;
}

.visual-content.fade-in {
  opacity: 1;
}

.slogan-box {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.slogan-box h3 {
  font-size: 4rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.slogan-box p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* Loaders */
.loader {
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 960px) {
  .form-section {
    flex: 1;
    width: 100%;
  }
  .visual-section {
    display: none;
  }
}
</style>
