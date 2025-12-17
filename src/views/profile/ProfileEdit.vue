<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  name: '',
  introduction: '',
  image: ''
})

const loading = ref(false)

onMounted(async () => {
  if (!userStore.profile) {
    await userStore.fetchProfile()
  }
  if (userStore.profile) {
    form.value = {
      name: userStore.profile.name,
      introduction: userStore.profile.introduction,
      image: userStore.profile.image
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
  const currentIdx = images.indexOf(form.value.image)
  const nextIdx = (currentIdx + 1) % images.length
  form.value.image = images[nextIdx]
  alert('프로필 이미지가 변경되었습니다 (Mock)')
}

const handleSave = async () => {
  if (!form.value.name.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const success = await userStore.updateProfile(form.value)
    if (success) {
      alert('프로필이 수정되었습니다.')
      router.push('/profile')
    } else {
      alert('수정에 실패했습니다.')
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
          <img :src="form.image" alt="Profile" class="profile-img" />
          <div class="camera-icon">
            <el-icon><Camera /></el-icon>
          </div>
        </div>
        <p class="image-hint">이미지를 클릭하여 변경하세요</p>
      </div>

      <div class="form-group">
        <label>이름</label>
        <el-input v-model="form.name" placeholder="이름을 입력하세요" />
      </div>

      <div class="form-group">
        <label>자기소개</label>
        <el-input
          v-model="form.introduction"
          type="textarea"
          :rows="4"
          placeholder="자기소개를 입력하세요"
        />
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
