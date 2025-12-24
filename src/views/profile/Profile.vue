<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { regions } from '../../constants/regions'
import { 
  Trophy, 
  Timer, 
  ArrowRight, 
  SwitchButton,
  MapLocation,
  Camera,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// New Components
import MyCourseList from '../../components/profile/MyCourseList.vue'
import ScrappedCourseList from '../../components/profile/ScrappedCourseList.vue'

const authStore = useAuthStore()
const router = useRouter()

const isEditing = ref(false)
const loading = ref(false)
const activeTab = ref('stats') // 'stats', 'my_courses', 'scrapped'

const mockUser = {
  nickname: '김싸피',
  profileImage: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  introduction: '안녕하세요! 러닝을 좋아하는 개발자입니다.',
  totalDistance: 120,
  averagePace: '05:30',
  activityRegion: '서울_강남구',
  birthdate: '1995-01-01',
  gender: 'male'
}

const currentUser = computed(() => {
    return authStore.user || mockUser
})

// Form data for editing
const editForm = reactive({
  nickname: '',
  birthdate: '',
  gender: '',
  pace: 30,
  region: '',
  profileImage: null
})

// Initialize form when entering edit mode or user changes
watch(() => isEditing.value, (newVal) => {
  if (newVal && currentUser.value) {
    editForm.nickname = currentUser.value.nickname || currentUser.value.name
    // editForm.introduction = currentUser.value.introduction
    editForm.gender = (currentUser.value.gender === 'MALE' ? 'male' : (currentUser.value.gender === 'FEMALE' ? 'female' : currentUser.value.gender))
    editForm.birthdate = currentUser.value.birthDate || currentUser.value.birthdate
    editForm.region = currentUser.value.activityRegion
    editForm.pace = 30 // Simplified
  }
})

const formatPace = (val) => {
  const totalSeconds = 180 + (val * 6) 
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}'${sec.toString().padStart(2, '0')}"`
}

const getRegionLabel = (val) => {
  const found = regions.find(r => r.value === val)
  return found ? found.label : val
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const saveProfile = async () => {
  if (!editForm.nickname || !editForm.region) {
    ElMessage.warning('필수 정보를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const success = await authStore.updateProfile({ 
      ...editForm, 
      pace: formatPace(editForm.pace) 
    })
    
    if (success) {
      ElMessage.success('프로필이 수정되었습니다.')
      isEditing.value = false
    } else {
      ElMessage.error('프로필 수정에 실패했습니다.')
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 409) {
        ElMessage.error('이미 사용 중인 닉네임입니다.')
    } else if (error.response && error.response.data && error.response.data.message) {
        ElMessage.error(error.response.data.message)
    } else {
        ElMessage.error('프로필 수정 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
  }
}

// Image upload handling
const fileInput = ref(null)
const previewImage = ref(null)

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('이미지 크기는 5MB 이하여야 합니다.')
      return
    }
    editForm.profileImage = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const menuItems = [
  {
    title: '계정',
    items: [
      { icon: SwitchButton, label: '로그아웃', action: 'logout', danger: true }
    ]
  }
]

const handleAction = (item) => {
  if (item.action === 'logout') {
    if (confirm('로그아웃 하시겠습니까?')) {
        authStore.logout()
        alert('로그아웃 되었습니다.')
        router.push('/login')
    }
  }
}

// Fetch latest profile data when component mounts
onMounted(() => {
    authStore.fetchProfile()
})
</script>

<template>
  <div class="profile-view">
    <div v-if="currentUser" class="profile-content">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="header-top">
           <div class="profile-image-section">
             <div class="image-wrapper" @click="isEditing ? triggerFileUpload() : null" :class="{ 'editable': isEditing }">
                <img :src="isEditing && previewImage ? previewImage : (currentUser.profileImage || currentUser.image)" alt="Profile" class="profile-img" />
                <div v-if="isEditing" class="edit-overlay">
                  <el-icon><Camera /></el-icon>
                </div>
             </div>
             <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
          </div>
          <div class="action-buttons">
            <button v-if="!isEditing" class="btn-edit-profile" @click="toggleEdit">
              프로필 수정
            </button>
            <div v-else class="edit-actions">
              <button class="btn-action cancel" @click="toggleEdit">
                취소
              </button>
              <button class="btn-action save" @click="saveProfile">
                수정완료
              </button>
            </div>
          </div>
        </div>

        <div class="profile-info-form">
          <!-- Nickname -->
          <div class="info-row">
            <h2 v-if="!isEditing" class="name">{{ currentUser.nickname || currentUser.name }}</h2>
            <input v-else v-model="editForm.nickname" class="edit-input name-input" placeholder="닉네임" />
          </div>


          <!-- Additional Info (Gender/Birthdate) - Only show in Edit or if exists -->
          <div v-if="isEditing" class="additional-edit-section">
             <div class="form-group">
              <label>성별</label>
              <div class="gender-options">
                <label class="gender-option" :class="{ active: editForm.gender === 'male' }">
                  <input type="radio" v-model="editForm.gender" value="male" />
                  <span>남성</span>
                </label>
                <label class="gender-option" :class="{ active: editForm.gender === 'female' }">
                  <input type="radio" v-model="editForm.gender" value="female" />
                  <span>여성</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>생년월일</label>
              <input type="date" v-model="editForm.birthdate" class="input-field" />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-value">{{ currentUser.totalDistance || 0 }}km</div>
          <div class="stat-label">총 거리</div>
        </div>
        
        <div class="stat-divider"></div>
        
        <div class="stat-item editable-stat">
          <div class="stat-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div v-if="!isEditing">
            <div class="stat-value">{{ currentUser.averagePace || '-' }}</div>
            <div class="stat-label">평균 페이스</div>
          </div>
          <div v-else class="stat-edit">
             <div class="stat-label">평균 페이스</div>
             <el-slider v-model="editForm.pace" :format-tooltip="formatPace" :max="70" size="small" />
             <div class="pace-preview">{{ formatPace(editForm.pace) }}</div>
          </div>
        </div>

         <div class="stat-divider"></div>

        <div class="stat-item editable-stat">
          <div class="stat-icon">
             <el-icon><MapLocation /></el-icon>
          </div>
          <div v-if="!isEditing">
            <div class="stat-value region-text">{{ getRegionLabel(currentUser.activityRegion) || '-' }}</div>
            <div class="stat-label">활동 지역</div>
          </div>
          <div v-else class="stat-edit">
            <div class="stat-label">활동 지역</div>
            <select v-model="editForm.region" class="region-select">
              <option v-for="region in regions" :key="region.value" :value="region.value">
                {{ region.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="profile-tabs">
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'stats' }" 
          @click="activeTab = 'stats'"
        >
          내 정보
        </button>
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'my_courses' }" 
          @click="activeTab = 'my_courses'"
        >
          나의 코스
        </button>
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'scrapped' }" 
          @click="activeTab = 'scrapped'"
        >
          스크랩
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        
        <!-- 1. Stats & Account (Menu) -->
        <div v-if="activeTab === 'stats'">
           <div class="menu-section">
            <div v-for="(section, index) in menuItems" :key="index" class="menu-group">
              <h3 class="menu-title">{{ section.title }}</h3>
              <div class="menu-list">
                <div 
                  v-for="(item, i) in section.items" 
                  :key="i" 
                  class="menu-item"
                  :class="{ 'danger': item.danger }"
                  @click="item.route ? $router.push(item.route) : handleAction(item)"
                >
                  <div class="item-left">
                    <el-icon class="item-icon"><component :is="item.icon"></component></el-icon>
                    <span class="item-label">{{ item.label }}</span>
                  </div>
                  <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. My Created Courses -->
        <div v-if="activeTab === 'my_courses'" class="component-tab">
           <MyCourseList />
        </div>

        <!-- 3. Scrapped Courses -->
        <div v-if="activeTab === 'scrapped'" class="component-tab">
           <ScrappedCourseList />
        </div>

      </div>

    </div>
    <div v-else class="loading-state">
      <p>로그인 정보가 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.profile-header {
  background: white;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 20px;
  /* box-shadow: 0 4px 20px rgba(0,0,0,0.05); */
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.profile-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: opacity 0.2s;
}

.image-wrapper {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  width: 80px;
  height: 80px;
}

.image-wrapper.editable {
  cursor: pointer;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.btn-edit-profile {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #555;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-edit-profile:hover {
  background: #f8f8f8;
  border-color: #ccc;
  color: #333;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-action.save {
  background: var(--color-primary);
  color: white;
}

.btn-action.save:hover {
  opacity: 0.9;
}

.btn-action.cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-action.cancel:hover {
  background: #eee;
  color: #333;
}

.name {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: #333;
}

.name-input {
  font-size: 1.4rem;
  font-weight: 700;
}

.additional-edit-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.gender-options {
  display: flex;
  gap: 10px;
}

.gender-option {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.gender-option input {
  position: absolute;
  opacity: 0;
}

.gender-option span {
  display: block;
  text-align: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #888;
  transition: all 0.2s;
}

.gender-option.active span {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* Stats Card */
.stats-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
 /*  box-shadow: 0 4px 20px rgba(0,0,0,0.05); */
}

.stat-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editable-stat {
  min-width: 0; /* Prevents overflow */
}

.stat-icon {
  margin-bottom: 8px;
  color: var(--color-primary);
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 4px;
}

.region-text {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.stat-label {
  font-size: 0.75rem;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #eee;
  margin: 0 10px;
}

.stat-edit {
  width: 100%;
  padding: 0 10px;
}

.pace-preview {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 4px;
}

.region-select {
  width: 100%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* Tabs */
.profile-tabs {
  display: flex;
  background: white;
  padding: 4px; /* small padding for pill shape container if needed, or just border-bottom */
  margin-bottom: 20px;
  border-radius: 12px;
  background-color: #f5f5f5;
}

.tab-item {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.tab-item.active {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-weight: 800;
}

/* Menu Section */
.menu-section {
  padding-bottom: 40px;
}

.menu-group {
  margin-bottom: 24px;
}

.menu-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #999;
  margin-bottom: 12px;
  padding-left: 4px;
}

.menu-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  /* box-shadow: 0 2px 12px rgba(0,0,0,0.03); */
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f9f9f9;
}

.menu-item.danger .item-label, .menu-item.danger .item-icon {
  color: #ff4d4f;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 1.2rem;
  color: #333;
}

.item-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.arrow-icon {
  color: #ccc;
  font-size: 0.9rem;
}

.loading-state {
    text-align: center;
    padding: 20px;
    color: #888;
}

.component-tab {
    /* min-height: 200px; */
}
</style>
