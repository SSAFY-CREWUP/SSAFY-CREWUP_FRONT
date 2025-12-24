<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useAuthStore } from '../../stores/auth'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

const form = ref({
  nickname: '',
  profileImage: '',
  averagePace: '',
  activityRegion: ''
})

const loading = ref(false)

const regions = [
  '서울', '경기', '인천', '강원', '대전', '충청', '대구', '부산', '경상', '광주', '전라', '제주'
]

onMounted(async () => {
  const user = authStore.user
  if (user) {
    form.value = {
      nickname: user.nickname || '',
      profileImage: user.profileImage || '',
      averagePace: user.averagePace || '',
      activityRegion: user.activityRegion || ''
    }
  }
})

const handleImageClick = () => {
  // Mock image upload
  const images = [
    'https://picsum.photos/seed/user1/200/200',
    'https://picsum.photos/seed/user2/200/200',
    'https://picsum.photos/seed/user3/200/200',
    'https://picsum.photos/seed/user4/200/200'
  ]
  const currentIdx = images.indexOf(form.value.profileImage)
  const nextIdx = (currentIdx + 1) % images.length
  form.value.profileImage = images[nextIdx]
  alert('프로필 이미지가 변경되었습니다 (Mock)')
}

const handleSave = async () => {
  if (!form.value.nickname.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const success = await userStore.updateProfile(form.value)
    if (success) {
      // Sync authStore and localStorage
      const updatedUser = { 
        ...authStore.user,
        ...form.value
      }
      
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))

      alert('프로필이 수정되었습니다.')
      router.push('/profile')
    } else {
      alert('수정에 실패했습니다 (API 미연동)')
      // For now, simulate success for UI testing if API fails
      // router.push('/profile')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-edit-view">
    <div class="page-header">
      <h2>프로필 수정</h2>
    </div>

    <div class="edit-form" v-loading="loading">
      <div class="image-section">
        <div class="image-wrapper" @click="handleImageClick">
          <img :src="form.profileImage" alt="Profile" class="profile-img" />
          <div class="camera-icon">
            <el-icon><Camera /></el-icon>
          </div>
        </div>
        <p class="image-hint">이미지를 클릭하여 변경하세요</p>
      </div>

      <div class="form-group">
        <label>닉네임</label>
        <el-input v-model="form.nickname" placeholder="닉네임을 입력하세요" />
      </div>
      
      <div class="form-group">
        <label>평균 페이스</label>
        <el-input v-model="form.averagePace" placeholder="예: 05:30" />
      </div>

      <div class="form-group">
        <label>활동 지역</label>
        <el-select v-model="form.activityRegion" placeholder="지역 선택" style="width: 100%">
          <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
        </el-select>
      </div>

      <div class="button-group">
        <button class="btn-cancel" @click="router.back()">취소</button>
        <button class="btn-save" @click="handleSave">저장</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-edit-view {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.edit-form {
  background: white;
  padding: 30px 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.image-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-wrapper:hover {
  transform: scale(1.05);
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.camera-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--color-primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.image-hint {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-cancel {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: var(--color-primary);
  color: white;
}

.btn-save:hover {
  background: #45a049;
}
</style>
