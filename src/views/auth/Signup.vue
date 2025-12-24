<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, sameAs } from '@vuelidate/validators'

import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 1. 상태 관리 정의
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const previewImage = ref(null)      // 화면 표시용 URL
const profileImageFile = ref(null)  // 서버 전송용 File 객체
const fileInput = ref(null)         // input 태그 참조용

// 2. 파일 변경 처리 함수 (중복 해결)
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 타입 검증
    if (!file.type.startsWith('image/')) {
      ElMessage.error('이미지 파일만 업로드 가능합니다.')
      return
    }
    // 용량 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    profileImageFile.value = file
    
    // 이전 미리보기 URL 메모리 해제
    if (previewImage.value && previewImage.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage.value)
    }
    // 새 미리보기 생성
    previewImage.value = URL.createObjectURL(file)
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

// 3. 유효성 검사 규칙
const rules = computed(() => ({
  name: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAs: sameAs(form.password) }
}))

const v$ = useVuelidate(rules, form)

// 4. 회원가입 제출 함수
const handleSignup = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  const success = await authStore.signup({
    name: form.name,
    email: form.email,
    password: form.password,
    profileImage: profileImageFile.value
  })

  if (success) {
    ElMessage.success('회원가입 성공!')
    router.push('/onboarding')
  } else {
    ElMessage.error(authStore.error || '회원가입에 실패했습니다.')
  }
}

// 컴포넌트 소멸 시 메모리 해제
onUnmounted(() => {
  if (previewImage.value && previewImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewImage.value)
  }
})
</script>

<template>
  <div class="signup-container">
    <!-- Muted & Deep Background -->
    <div class="background-wrapper"></div>

    <!-- 3D Card with Scale Animation -->
    <div class="signup-card zoom-in-center">
      <div class="card-header">
        <h1 class="logo-text">CrewUp</h1>
        <p class="subtitle">나만의 러닝 크루를 시작하세요</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <!-- Profile Upload -->
        <div class="profile-section stagger-1">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img v-if="previewImage" :src="previewImage" class="avatar-preview" />
            <div v-else class="avatar-placeholder">
              <el-icon :size="28" color="#94a3b8"><Camera /></el-icon>
            </div>
            <div class="avatar-overlay">
              <el-icon :size="24" color="#fff"><Camera /></el-icon>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileChange" 
            accept="image/*" 
            style="display: none" 
          />
          <span class="profile-label">프로필 사진 추가</span>
        </div>

        <!-- Inputs -->
        <div class="input-group stagger-2">
          <label>이름</label>
          <div class="input-wrapper">
             <input 
                v-model="form.name" 
                type="text" 
                placeholder="이름을 입력하세요"
                class="modern-input"
                :class="{ error: v$.name.$error }"
                @blur="v$.name.$touch"
              />
          </div>
          <span v-if="v$.name.$error" class="error-msg">이름을 입력해주세요.</span>
        </div>

        <div class="input-group stagger-3">
          <label>이메일</label>
          <div class="input-wrapper">
             <input 
                v-model="form.email" 
                type="email" 
                placeholder="example@crewup.com"
                class="modern-input"
                :class="{ error: v$.email.$error }"
                @blur="v$.email.$touch"
              />
          </div>
          <span v-if="v$.email.$error" class="error-msg">유효한 이메일을 입력해주세요.</span>
        </div>

        <div class="input-group stagger-4">
          <label>비밀번호</label>
          <div class="input-wrapper">
            <input 
                v-model="form.password" 
                type="password" 
                placeholder="6자 이상 입력하세요"
                class="modern-input"
                :class="{ error: v$.password.$error }"
                @blur="v$.password.$touch"
              />
          </div>
          <span v-if="v$.password.$error" class="error-msg">비밀번호는 6자 이상이어야 합니다.</span>
        </div>

        <div class="input-group stagger-5">
          <label>비밀번호 확인</label>
           <div class="input-wrapper">
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                placeholder="비밀번호를 다시 입력하세요"
                class="modern-input"
                :class="{ error: v$.confirmPassword.$error }"
                @blur="v$.confirmPassword.$touch"
              />
           </div>
          <span v-if="v$.confirmPassword.$error" class="error-msg">비밀번호가 일치하지 않습니다.</span>
        </div>

        <button type="submit" class="submit-btn stagger-6" :disabled="authStore.loading">
          {{ authStore.loading ? '가입 중...' : '회원가입' }}
          <span class="btn-shine"></span>
        </button>

        <div class="login-link stagger-6">
          이미 계정이 있으신가요? <RouterLink to="/login" class="link-text">로그인</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Apple SD Gothic Neo', sans-serif;
  
  /* Deep, Muted Navy Gradient (Less Saturated / "Jjeng-haji an-hgue") */
  background: radial-gradient(circle at center, #2e3458 0%, #1e2040 60%, #0f1020 100%);
}

.background-wrapper {
  position: absolute; inset: 0;
  /* Add subtle texture or noise if needed, but keeping it clean for now */
}

/* 3D Glass Card */
.signup-card {
  width: 100%;
  max-width: 460px;
  /* Gradient background for volume */
  background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,244,255,0.9) 100%);
  backdrop-filter: blur(40px);
  padding: 48px;
  border-radius: 28px;
  
  /* Enhanced 3D Shadows */
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.2), /* Droplight */
    0 30px 60px -10px rgba(0,0,0,0.5), /* Deep Shadow */
    inset 0 1px 0 rgba(255,255,255,0.8), /* Top Highlight */
    inset 0 -1px 0 rgba(200,210,255,0.3); /* Bottom Refl */
    
  border: 1px solid rgba(255,255,255,0.4);
  z-index: 10;
  transform-style: preserve-3d;
}

/* Zoom In Animation */
.zoom-in-center {
    animation: zoomIn 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    transform-origin: center center;
}

@keyframes zoomIn {
    0% {
        opacity: 0;
        transform: scale(0.85) translateY(30px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Header */
.card-header { text-align: center; margin-bottom: 30px; }
.logo-text {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(to right, #1e1b4b, #4338ca);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Profile Upload */
.profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
}
.avatar-wrapper {
    width: 96px; height: 96px;
    border-radius: 50%;
    background: #f8fafc;
    border: 4px solid #fff;
    /* Soft shadow for depth */
    box-shadow: 
        0 4px 12px rgba(0,0,0,0.08),
        inset 0 2px 4px rgba(0,0,0,0.05);
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex; align-items: center; justify-content: center;
}
.avatar-wrapper:hover {
    transform: scale(1.08) rotate(3deg);
    border-color: #818cf8;
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
}
.avatar-preview { width: 100%; height: 100%; object-fit: cover; }
.avatar-overlay {
    position: absolute; inset: 0; background: rgba(99, 102, 241, 0.7);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
    backdrop-filter: blur(2px);
}
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.profile-label { font-size: 0.85rem; color: #64748b; font-weight: 600; }

/* Inputs */
.signup-form { display: flex; flex-direction: column; gap: 18px; }
.input-group label {
    display: block; margin-bottom: 6px;
    font-size: 0.85rem; font-weight: 600; color: #475569;
    margin-left: 4px;
}
.input-wrapper { position: relative; }
.modern-input {
    width: 100%;
    height: 50px;
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    font-size: 0.95rem;
    background: #fff;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.modern-input:focus {
    outline: none;
    border-color: #6366F1;
    background: #fff;
    box-shadow: 
        0 0 0 4px rgba(99, 102, 241, 0.1),
        0 4px 10px rgba(99, 102, 241, 0.05);
    transform: translateY(-1px);
}
.error-msg {
    display: block; margin-top: 4px; margin-left: 4px;
    font-size: 0.75rem; color: #ef4444; font-weight: 500;
}

/* Submit Button & Animations */
.submit-btn {
    margin-top: 12px;
    width: 100%; height: 54px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white; border: none; border-radius: 16px;
    font-size: 1.05rem; font-weight: 700;
    cursor: pointer; position: relative; overflow: hidden;
    transition: all 0.3s;
    box-shadow: 
        0 4px 12px rgba(79, 70, 229, 0.3),
        inset 0 1px 0 rgba(255,255,255,0.2);
}
.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
        0 8px 20px rgba(79, 70, 229, 0.4),
        inset 0 1px 0 rgba(255,255,255,0.3);
}
.submit-btn:disabled { 
    background: #cbd5e1; 
    cursor: not-allowed; box-shadow: none; transform: none; 
}

.btn-shine {
    position: absolute; top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: skewX(-20deg);
    animation: shine 4s infinite;
}
@keyframes shine {
    0% { left: -100%; }
    20% { left: 200%; }
    100% { left: 200%; }
}

.login-link { text-align: center; font-size: 0.95rem; color: #94a3b8; margin-top: 12px; }
.link-text { color: #818cf8; font-weight: 700; text-decoration: none; margin-left: 4px; transition: color 0.2s;}
.link-text:hover { text-decoration: none; color: #a5b4fc; }

/* Stagger Animations */
.stagger-1 { animation: slideIn 0.5s ease-out backwards 0.2s; }
.stagger-2 { animation: slideIn 0.5s ease-out backwards 0.25s; }
.stagger-3 { animation: slideIn 0.5s ease-out backwards 0.3s; }
.stagger-4 { animation: slideIn 0.5s ease-out backwards 0.35s; }
.stagger-5 { animation: slideIn 0.5s ease-out backwards 0.4s; }
.stagger-6 { animation: slideIn 0.5s ease-out backwards 0.45s; }

@keyframes slideIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>