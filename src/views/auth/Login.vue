<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import { ElMessage } from 'element-plus'

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

const handleLogin = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  const result = await authStore.login({
    email: form.email,
    password: form.password
  })

  if (result.success) {
    ElMessage.success('로그인 성공!')
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
</script>

<template>
  <div class="login-container">
    <!-- Left: Login Form -->
    <div class="login-form-section">
      <div class="form-wrapper">
        <div class="form-header">
          <h1>로그인</h1>
          <p>CrewUp에 오신 것을 환영합니다.</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Input -->
          <div class="form-group">
            <label for="email">이메일</label>
            <div class="input-wrapper" :class="{ error: v$.email.$error }">
              <input 
                id="email"
                v-model="form.email" 
                type="email" 
                placeholder="example@crewup.com"
                @blur="v$.email.$touch"
              />
            </div>
            <span v-if="v$.email.$error" class="error-message">
              {{ v$.email.required.$invalid ? '이메일을 입력해주세요.' : '유효한 이메일 형식이 아닙니다.' }}
            </span>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password">비밀번호</label>
            <div class="input-wrapper" :class="{ error: v$.password.$error }">
              <input 
                id="password"
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="비밀번호 입력"
                @blur="v$.password.$touch"
              />
              <span class="toggle-password" @click="togglePasswordVisibility">
                <el-icon v-if="showPassword"><View /></el-icon>
                <el-icon v-else><Hide /></el-icon>
              </span>
            </div>
            <span v-if="v$.password.$error" class="error-message">
              {{ v$.password.required.$invalid ? '비밀번호를 입력해주세요.' : '비밀번호는 6자 이상이어야 합니다.' }}
            </span>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.rememberMe">
              <span>로그인 상태 유지</span>
            </label>
            <a href="#" class="forgot-password">비밀번호 찾기</a>
          </div>

          <!-- Login Button -->
          <button type="submit" class="login-button" :disabled="authStore.loading">
            {{ authStore.loading ? '로그인 중...' : '로그인' }}
          </button>

          <!-- Signup Link -->
          <div class="signup-link">
            계정이 없으신가요? <RouterLink to="/signup">회원가입</RouterLink>
          </div>


        </form>
      </div>
    </div>

    <!-- Right: Image Section -->
    <div class="login-image-section">
      <div class="image-overlay">
        <h2>함께 달리면<br>더 멀리 갑니다</h2>
        <p>CrewUp에서 당신의 러닝 메이트를 찾아보세요.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* Left Section */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: white;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 40px;
  text-align: center;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
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
  font-weight: 500;
  color: #333;
}

.input-wrapper {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: var(--color-running-green);
}

.input-wrapper.error {
  border-color: var(--color-energy-red);
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
}

.error-message {
  display: block;
  margin-top: 5px;
  font-size: 0.85rem;
  color: var(--color-energy-red);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.forgot-password {
  color: #666;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(45deg, var(--color-running-green), #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.login-button:hover {
  opacity: 0.9;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.signup-link {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.signup-link a {
  color: var(--color-running-green);
  font-weight: 600;
  text-decoration: none;
}



/* Right Section */
.login-image-section {
  flex: 1;
  background: url('https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover no-repeat;
  position: relative;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 60px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
}

.image-overlay h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.2;
}

.image-overlay p {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column-reverse;
  }

  .login-image-section {
    height: 200px;
    flex: none;
  }

  .image-overlay {
    padding: 20px;
  }

  .image-overlay h2 {
    font-size: 1.5rem;
  }

  .login-form-section {
    padding: 30px 20px;
  }
}
</style>
