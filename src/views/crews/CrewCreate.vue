<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, EditPen } from '@element-plus/icons-vue'
import crewApi from '@/api/crew'

import { REGIONS, ACTIVITY_TIMES, MEMBER_AGES, GENDER_LIMITS } from '@/constants/crew'

const router = useRouter()

const form = reactive({
  name: '',
  region: '',
  activityTime: '',
  ageRange: '', 
  genderLimit: '모두',
  description: '',
  image: null,
  imageFile: null,
  mainActivities: ['', '', '', ''] 
})

const placeholders = [
  '예: 인터벌 트레이닝',
  '예: 5km 달리기',
  '예: 마라톤 대회 준비',
  '예: 러닝 후 뒤풀이'
]

const loading = ref(false)

const handleImageChange = (file) => {
  form.image = URL.createObjectURL(file.raw)
  form.imageFile = file.raw
}

const handleSubmit = async () => {
  // Validate required fields
  if (!form.name || !form.region || !form.activityTime || !form.ageRange) {
    ElMessage.warning('필수 정보를 모두 입력해주세요.')
    return
  }

  // Validate mainActivities (at least 1, max 30 chars each)
  if (form.mainActivities.some(a => a.length > 30)) {
    ElMessage.warning('주요 활동 키워드는 각각 30자 이내로 작성해주세요.')
    return
  }

  loading.value = true
  try {
    const requestData = {
      name: form.name,
      region: form.region,
      description: form.description,
      activityTime: form.activityTime,
      ageGroup: form.ageRange,
      genderLimit: form.genderLimit,
      keywords: form.mainActivities.filter(a => a.trim().length > 0)
    }

    const formData = new FormData()
    // 1. Request Part (JSON)
    const jsonBlob = new Blob([JSON.stringify(requestData)], { type: 'application/json' })
    formData.append('request', jsonBlob)

    // 2. Image Part (File)
    if (form.imageFile) {
      formData.append('crewImage', form.imageFile)
    }

    await crewApi.createCrew(formData)
    
    ElMessage.success('크루가 성공적으로 생성되었습니다!')
    router.push('/crews')
  } catch (error) {
    console.error(error)
    ElMessage.error('크루 생성에 실패했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="crew-create-view">
    <div class="create-container">
      <div class="header">
        <h1>크루 만들기</h1>
        <p>함께 달릴 멋진 크루를 만들어보세요.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="create-form">
        <!-- Image Upload -->
        <div class="form-section image-section">
          <h3>대표 이미지</h3>
          <p class="section-desc">크루를 가장 잘 나타내는 사진을 올려주세요.</p>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <div v-if="form.image" class="image-preview-wrapper">
              <img :src="form.image" class="avatar" />
              <div class="image-overlay">
                <el-icon><EditPen /></el-icon>
              </div>
            </div>
            <div v-else class="avatar-uploader-icon">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>이미지 업로드</span>
            </div>
          </el-upload>
        </div>

        <!-- Crew Name -->
        <div class="form-section">
          <h3>크루 이름</h3>
          <el-input 
            v-model="form.name" 
            placeholder="멋진 크루 이름을 지어주세요" 
            size="large"
            class="premium-input"
          />
        </div>

        <!-- Crew Description -->
        <div class="form-section">
           <h3>크루 소개</h3>
            <el-input 
              v-model="form.description" 
              type="textarea" 
              :rows="4" 
              placeholder="크루의 목표나 분위기 등을 자유롭게 소개해 주세요." 
              class="premium-input"
            />
        </div>

        <!-- Region -->
        <div class="form-section">
          <h3>활동 지역</h3>
           <el-select 
            v-model="form.region" 
            placeholder="주 활동 지역 선택" 
            class="full-width premium-select" 
            size="large"
            filterable
          >
            <el-option v-for="region in REGIONS" :key="region" :label="region" :value="region" />
          </el-select>
        </div>

        <!-- Time -->
         <div class="form-section">
          <h3>주 활동 시간대</h3>
          <div class="chip-grid">
            <div 
              v-for="time in ACTIVITY_TIMES" 
              :key="time"
              class="chip"
              :class="{ active: form.activityTime === time }"
              @click="form.activityTime = time"
            >
              {{ time }}
            </div>
          </div>
        </div>

        <!-- Age -->
        <div class="form-section">
          <h3>주 연령대</h3>
          <div class="chip-grid-3">
             <div 
              v-for="age in MEMBER_AGES" 
              :key="age"
              class="chip"
              :class="{ active: form.ageRange === age }"
              @click="form.ageRange = age"
            >
              {{ age }}
            </div>
          </div>
        </div>


        <!-- Gender -->
        <div class="form-section">
          <h3>성별 제한</h3>
          <div class="chip-grid-3">
             <div 
              v-for="gender in GENDER_LIMITS" 
              :key="gender"
              class="chip"
              :class="{ active: form.genderLimit === gender }"
              @click="form.genderLimit = gender"
            >
              {{ gender }}
            </div>
          </div>
        </div>

        <!-- Keywords -->
        <div class="form-section">
          <h3>주요 활동 키워드 (4개)</h3>
          <div class="keywords-list">
             <el-input 
                v-for="(keyword, index) in 4" 
                :key="index"
                v-model="form.mainActivities[index]"
                :placeholder="placeholders[index]"
                maxlength="30"
                class="premium-input keyword-input"
                size="large"
              >
                <template #prefix>
                  <span class="hash">#</span>
                </template>
              </el-input>
          </div>
        </div>
        
        <div class="form-actions">
          <el-button class="cancel-btn" @click="router.back()" size="large">취소</el-button>
          <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn" size="large">
            크루 생성하기
          </el-button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.crew-create-view {
  padding: 40px 20px;
  background-color: var(--color-bg-secondary);
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.create-container {
  width: 100%;
  max-width: 640px; /* Reduced width for "App-style" focus */
  background: white;
  padding: 40px 30px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.06);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.header p {
  color: var(--color-text-tertiary);
  font-size: 1rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.section-desc {
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  margin-bottom: 20px;
  margin-top: -10px;
}

/* Image Upload Styling */
.image-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  width: 100%;
}

.avatar-uploader :deep(.el-upload) {
  width: 160px; /* Smaller circular avatar default look common in apps */
  height: 160px;
  border-radius: 50%;
  border: 2px dashed var(--color-border-medium);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--color-bg-tertiary);
  margin: 0 auto;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--color-primary);
  background-color: var(--color-primary-50);
}

.avatar-uploader-icon {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 32px;
  color: var(--color-primary-300);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Inputs */
.premium-input :deep(.el-input__wrapper),
.premium-select :deep(.el-input__wrapper),
.premium-input :deep(.el-textarea__inner) {
  box-shadow: none;
  background-color: var(--color-bg-tertiary); /* Filled input style */
  border-radius: 16px;
  padding: 12px 20px;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.premium-input :deep(.el-input__wrapper):hover,
.premium-select :deep(.el-input__wrapper):hover {
  background-color: #f0f0f5; 
}

.premium-input :deep(.el-input__wrapper.is-focus),
.premium-select :deep(.el-input__wrapper.is-focus),
.premium-input :deep(.el-textarea__inner:focus) {
  background-color: white;
  box-shadow: 0 0 0 2px var(--color-primary) inset !important;
}

.premium-input :deep(.el-textarea__inner) {
  padding: 16px;
  background-color: var(--color-bg-tertiary);
}

.full-width {
    width: 100%;
}

/* Chips / Buttons Selection */
.chip-grid, .chip-grid-3 {
  display: grid;
  gap: 10px;
}

.chip-grid {
  grid-template-columns: repeat(2, 1fr);
}

.chip-grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

.chip {
  padding: 14px;
  text-align: center;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.chip:hover {
  background-color: #f0f0f5;
}

.chip.active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(94, 106, 210, 0.3);
}

/* Keywords */
.keywords-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hash {
  color: var(--color-primary);
  font-weight: bold;
  margin-right: 4px;
}

/* Actions */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  padding: 24px;
  font-weight: 700;
  border-radius: 16px;
  font-size: 1.1rem;
}

.cancel-btn {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
}

.cancel-btn:hover {
    background: transparent;
    color: var(--color-text-primary);
    text-decoration: underline;
}

@media (max-width: 600px) {
  .create-container {
    padding: 30px 20px;
    border-radius: 0;
    min-height: 100vh;
    box-shadow: none;
  }
  
  .crew-create-view {
      padding: 0;
      background-color: white;
  }
  
  .chip-grid-3 {
      grid-template-columns: repeat(2, 1fr); /* Fallback to 2 cols on mobile if small */
  }
}
</style>
