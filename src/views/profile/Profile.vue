<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { 
  User, 
  Trophy, 
  Timer, 
  ArrowRight, 
  Setting, 
  InfoFilled, 
  Document, 
  SwitchButton,
  MapLocation,
  Collection
} from '@element-plus/icons-vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchProfile()
})

const menuItems = [
  { 
    title: '내 활동',
    items: [
      { icon: Collection, label: '가입한 크루', route: '/my-crews' },
      { icon: MapLocation, label: '저장한 코스', route: '/courses' }
    ]
  },
  {
    title: '서비스 정보',
    items: [
      { icon: InfoFilled, label: '서비스 소개', route: '#' },
      { icon: Document, label: '약관 및 정책', route: '#' }
    ]
  },
  {
    title: '계정',
    items: [
      { icon: Setting, label: '프로필 수정', route: '/profile/edit' },
      { icon: SwitchButton, label: '로그아웃', action: 'logout', danger: true }
    ]
  }
]

const handleAction = (item) => {
  if (item.action === 'logout') {
    if (confirm('로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.')
      // Implement logout logic here
    }
  }
}
</script>

<template>
  <div class="profile-view" v-loading="userStore.loading">
    <div v-if="userStore.profile" class="profile-content">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="profile-info">
          <img :src="userStore.profile.image" alt="Profile" class="profile-img" />
          <div class="text-info">
            <h2 class="name">{{ userStore.profile.name }}</h2>
            <p class="join-date">{{ userStore.profile.joinDate }} 가입</p>
            <p class="intro">{{ userStore.profile.introduction }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-value">{{ userStore.profile.stats.totalDistance }}km</div>
          <div class="stat-label">총 거리</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="stat-value">{{ userStore.profile.stats.totalRuns }}회</div>
          <div class="stat-label">러닝 횟수</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-value">{{ userStore.profile.stats.avgPace }}</div>
          <div class="stat-label">평균 페이스</div>
        </div>
      </div>

      <!-- Menu Section -->
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
                <el-icon class="item-icon"><component :is="item.icon" /></el-icon>
                <span class="item-label">{{ item.label }}</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.profile-header {
  background: white;
  padding: 30px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.text-info {
  flex: 1;
}

.name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
}

.join-date {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  margin: 0 0 12px 0;
}

.intro {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border-light);
}

.menu-group {
  margin-bottom: 24px;
}

.menu-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin: 0 0 12px 12px;
}

.menu-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--color-border-light);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--color-background-soft);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

.item-label {
  font-size: 1rem;
  color: var(--color-text-primary);
}

.arrow-icon {
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.menu-item.danger .item-icon,
.menu-item.danger .item-label {
  color: var(--color-danger);
}
</style>
