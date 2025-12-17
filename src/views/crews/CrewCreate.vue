<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  name: '',
  region: '',
  pace: 5, // Default pace (min/km)
  activityTime: '',
  memberInfo: '',
  description: '',
  image: null
})

const regions = [
  '서울 강남구', '서울 마포구', '서울 영등포구', '서울 송파구', '경기 성남시'
]

const activityTimes = [
  '평일 아침', '평일 저녁', '주말 오전', '주말 오후'
]

const loading = ref(false)

const handleImageChange = (file) => {
  form.image = URL.createObjectURL(file.raw)
}

const handleSubmit = async () => {
  if (!form.name || !form.region || !form.activityTime || !form.memberInfo) {
    ElMessage.warning('필수 정보를 모두 입력해주세요.')
    return
  }

  loading.value = true
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('크루가 성공적으로 생성되었습니다!')
    router.push('/crews')
  } catch (error) {
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
        <p>새로운 러닝 크루를 만들어보세요.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="create-form">
        <!-- Image Upload -->
        <div class="form-section">
          <h3>대표 이미지</h3>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </div>

        <!-- Basic Info -->
        <div class="form-section">
          <h3>기본 정보</h3>
          
          <div class="form-group">
            <label>크루명</label>
            <el-input v-model="form.name" placeholder="크루 이름을 입력하세요" />
          </div>

          <div class="form-group">
            <label>활동 지역</label>
            <el-select v-model="form.region" placeholder="주 활동 지역을 선택하세요" class="full-width">
              <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
            </el-select>
          </div>

          <div class="form-group">
            <label>팀원 평균 페이스 (min/km)</label>
            <div class="pace-slider">
              <el-slider v-model="form.pace" :min="3" :max="10" :step="0.1" show-input />
            </div>
          </div>
        </div>

        <!-- Activity Info -->
        <div class="form-section">
          <h3>활동 정보</h3>
          
          <div class="form-group">
            <label>주 활동 시간대</label>
            <el-select v-model="form.activityTime" placeholder="활동 시간대를 선택하세요" class="full-width">
              <el-option v-for="time in activityTimes" :key="time" :label="time" :value="time" />
            </el-select>
          </div>

          <div class="form-group">
            <label>활동 인원 정보</label>
            <el-input v-model="form.memberInfo" placeholder="예: 2030 / 혼성" />
          </div>

          <div class="form-group">
            <label>크루 소개</label>
            <el-input 
              v-model="form.description" 
              type="textarea" 
              :rows="4" 
              placeholder="크루에 대해 자유롭게 소개해 주세요." 
            />
          </div>
        </div>

        <div class="form-actions">
          <el-button @click="router.back()">취소</el-button>
          <el-button type="primary" native-type="submit" :loading="loading">크루 생성하기</el-button>
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
}

.create-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
}

.header p {
  color: #666;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.full-width {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Image Upload Styles */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}
</style>
