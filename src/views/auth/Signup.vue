<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, sameAs } from '@vuelidate/validators'

import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = computed(() => ({
  name: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAs: sameAs(form.password) }
}))

const v$ = useVuelidate(rules, form)

const fileInput = ref(null)
const profileImage = ref(null)
const previewImage = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type and size if needed
    if (!file.type.startsWith('image/')) {
        ElMessage.error('이미지 파일만 업로드 가능합니다.')
        return
    }
    
    profileImage.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const handleSignup = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  const success = await authStore.signup({
    name: form.name,
    email: form.email,
    password: form.password,
    profileImage: profileImage.value
  })

  if (success) {
    ElMessage.success('회원가입 성공!')
    router.push('/onboarding')
  } else {
    ElMessage.error(authStore.error || '회원가입에 실패했습니다.')
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="form-header">
        <h1>회원가입</h1>
        <p>CrewUp과 함께 러닝을 시작하세요.</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="profile-upload-section">
            <div class="avatar-wrapper" @click="triggerFileInput">
                <img v-if="previewImage" :src="previewImage" class="avatar-preview" />
                <div v-else class="avatar-placeholder">
                    <el-icon :size="40" color="#999"><Camera /></el-icon>
                </div>
                <div class="avatar-overlay">
                    <span>변경</span>
                </div>
            </div>
            <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileChange" 
                accept="image/*" 
                style="display: none" 
            />
            <p class="profile-hint">프로필 사진</p>
        </div>

        <div class="form-group">
          <label>이름</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="이름을 입력하세요"
            class="input-field"
            :class="{ error: v$.name.$error }"
            @blur="v$.name.$touch"
          />
          <span v-if="v$.name.$error" class="error-message">이름을 입력해주세요.</span>
        </div>

        <div class="form-group">
          <label>이메일</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="example@crewup.com"
            class="input-field"
            :class="{ error: v$.email.$error }"
            @blur="v$.email.$touch"
          />
          <span v-if="v$.email.$error" class="error-message">유효한 이메일을 입력해주세요.</span>
        </div>

        <div class="form-group">
          <label>비밀번호</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="6자 이상 입력하세요"
            class="input-field"
            :class="{ error: v$.password.$error }"
            @blur="v$.password.$touch"
          />
          <span v-if="v$.password.$error" class="error-message">비밀번호는 6자 이상이어야 합니다.</span>
        </div>

        <div class="form-group">
          <label>비밀번호 확인</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="비밀번호를 다시 입력하세요"
            class="input-field"
            :class="{ error: v$.confirmPassword.$error }"
            @blur="v$.confirmPassword.$touch"
          />
          <span v-if="v$.confirmPassword.$error" class="error-message">비밀번호가 일치하지 않습니다.</span>
        </div>

        <button type="submit" class="btn-signup" :disabled="authStore.loading">
          {{ authStore.loading ? '가입 중...' : '회원가입' }}
        </button>

        <div class="login-link">
          이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink>
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
  background-color: #f5f5f5;
  padding: 20px;
}

.signup-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}

.form-header p {
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.profile-upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
}

.avatar-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background-color: #f0f0f0;
    border: 2px solid #ddd;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar-wrapper:hover {
    border-color: var(--color-primary);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
    opacity: 1;
}

.avatar-overlay span {
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
}

.profile-hint {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #666;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: var(--color-primary);
  outline: none;
}

.input-field.error {
  border-color: var(--color-energy-red);
}

.error-message {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
  color: var(--color-energy-red);
}

.btn-signup {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}

.btn-signup:hover {
  background: #45a049;
}

.btn-signup:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.login-link a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
