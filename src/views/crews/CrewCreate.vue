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
      <div class="header animate-item">
        <h1>크루 만들기</h1>
        <p>함께 달릴 멋진 크루를 만들어보세요.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="create-form">
        <!-- Image Upload -->
        <div class="form-section image-section animate-item" style="animation-delay: 0.1s">
          <h3>대표 이미지</h3>
          <p class="section-desc">크루를 가장 잘 나타내는 사진을 올려주세요.</p>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <div v-if="form.image" class="image-preview-wrapper key-visual">
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
        <div class="form-section animate-item" style="animation-delay: 0.2s">
          <h3>크루 이름</h3>
          <el-input 
            v-model="form.name" 
            placeholder="멋진 크루 이름을 지어주세요" 
            size="large"
            class="premium-input"
          />
        </div>

        <!-- Crew Description -->
        <div class="form-section animate-item" style="animation-delay: 0.3s">
           <h3>크루 소개</h3>
            <el-input 
              v-model="form.description" 
              type="textarea" 
              :rows="4" 
              placeholder="크루의 목표나 분위기 등을 자유롭게 소개해 주세요." 
              class="premium-input description-input"
            />
        </div>

        <!-- Region -->
        <div class="form-section animate-item" style="animation-delay: 0.4s">
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
         <div class="form-section animate-item" style="animation-delay: 0.5s">
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
        <div class="form-section animate-item" style="animation-delay: 0.6s">
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
        <div class="form-section animate-item" style="animation-delay: 0.7s">
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
        <div class="form-section animate-item" style="animation-delay: 0.8s">
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
        
        <div class="form-actions animate-item" style="animation-delay: 0.9s">
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
  background-color: #F9FAFB;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.create-container {
  width: 100%;
  max-width: 640px; 
  background: white;
  padding: 50px 40px;
  border-radius: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05); /* Soft Shadow */
  border: 1px solid #F3F4F6;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-item {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: #111827;
  letter-spacing: -0.03em;
}

.header p {
  color: #6B7280;
  font-size: 1.05rem;
  font-weight: 500;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.form-section h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1F2937;
  display: flex;
  align-items: center;
}

.form-section h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 20px;
  background-color: #6366f1; /* Indigo Accent */
  margin-right: 12px;
  border-radius: 4px;
}

.section-desc {
  color: #9CA3AF;
  font-size: 0.95rem;
  margin-bottom: 24px;
  margin-top: -8px;
  margin-left: 16px;
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
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  width: 180px; 
  height: 180px;
  border-radius: 50%;
  border: 2px dashed #D1D5DB;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #F9FAFB;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #6366f1;
  background-color: #EEF2FF;
}

.avatar-uploader-icon {
  font-size: 1rem;
  color: #9CA3AF;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 40px;
  color: #818CF8;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  color: white;
  font-size: 2rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.key-visual:hover .image-overlay {
  opacity: 1;
}

/* Inputs */
.premium-input :deep(.el-input__wrapper),
.premium-select :deep(.el-input__wrapper),
.premium-input :deep(.el-textarea__inner) {
  box-shadow: none !important;
  background-color: #F3F4F6; /* Filled input style */
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 14px 20px;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.premium-input :deep(.el-input__wrapper:hover),
.premium-select :deep(.el-input__wrapper:hover) {
  background-color: #E5E7EB; 
}

.premium-input :deep(.el-input__wrapper.is-focus),
.premium-select :deep(.el-input__wrapper.is-focus),
.premium-input :deep(.el-textarea__inner:focus) {
  background-color: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.premium-input :deep(.el-textarea__inner) {
  padding: 16px;
  background-color: #F3F4F6;
  min-height: 120px !important;
}

.full-width {
    width: 100%;
}

/* Chips / Buttons Selection */
.chip-grid, .chip-grid-3 {
  display: grid;
  gap: 12px;
}

.chip-grid {
  grid-template-columns: repeat(2, 1fr);
}

.chip-grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

.chip {
  padding: 16px;
  text-align: center;
  background-color: white;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  box-shadow: 0 2px 4px transparent;
}

.chip:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
  transform: translateY(-2px);
}

.chip.active {
  background-color: #6366f1;
  color: white;
  border-color: #6366f1;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

/* Keywords */
.keywords-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hash {
  color: #6366f1;
  font-weight: bold;
  margin-right: 4px;
  font-size: 1.1rem;
}

/* Actions */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 30px;
}

.submit-btn {
  width: 100%;
  padding: 24px;
  font-weight: 700;
  border-radius: 16px;
  font-size: 1.1rem;
  background-color: #6366f1;
  border: none;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: #4F46E5;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
}

.cancel-btn {
  width: 100%;
  border: none;
  background: transparent;
  color: #9CA3AF;
  font-weight: 600;
}

.cancel-btn:hover {
    background: #F3F4F6;
    color: #111827;
}

@media (max-width: 600px) {
  .create-container {
    padding: 30px 20px;
    border-radius: 0;
    min-height: 100vh;
    box-shadow: none;
    border: none;
  }
  
  .crew-create-view {
      padding: 0;
      background-color: white;
  }
  
  .chip-grid-3 {
      grid-template-columns: repeat(2, 1fr); /* Fallback to 2 cols on mobile */
  }
  
  .chip-grid-3 .chip:last-child {
      grid-column: span 2;
  }
}
</style>
