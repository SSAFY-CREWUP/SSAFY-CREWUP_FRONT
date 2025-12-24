<script setup>
import { defineProps } from 'vue'
import { 
  HomeFilled, List, Calendar, MapLocation, 
  TrendCharts, UserFilled, Bell, Setting 
} from '@element-plus/icons-vue'

const props = defineProps({
  crew: Object,
  userStats: Object,
  menuItems: Array,
  isActive: Function,
  navigateTo: Function
})
</script>

<template>
  <div class="sidebar-content">
    <!-- Crew Info -->
    <div class="crew-info" v-if="crew">
      <img :src="crew.image" alt="Crew Logo" class="crew-logo" />
      <h2 class="crew-name">{{ crew.name }}</h2>
      <el-tag size="small" effect="dark" type="success" class="role-badge">{{ userStats.role }}</el-tag>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <el-icon :size="20"><component :is="item.icon" /></el-icon>
        <span>{{ item.name }}</span>
      </div>

      <!-- Manager Section -->
      <div v-if="['크루장', '매니저', 'LEADER', 'MANAGER'].includes(userStats.role)" class="nav-section">
        <div class="nav-section-title">크루 관리</div>
        <div 
          class="nav-item"
          :class="{ active: isActive('manage/requests') }"
          @click="navigateTo('manage/requests')"
        >
          <el-icon :size="20"><UserFilled /></el-icon>
          <span>가입 신청 관리</span>
        </div>
      </div>
    </nav>



    <!-- Notifications Removed -->
  </div>
</template>

<style scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.crew-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.crew-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.crew-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background-color: #e8f5e9; /* Light Green */
  color: var(--color-primary);
  font-weight: 700;
}

.nav-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.nav-section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin-bottom: 8px;
  padding-left: 12px;
}

/* User Stats */
.user-stats-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.stats-value {
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Notifications */
.notification-section {
  border-top: 1px solid var(--color-border-light);
  padding-top: 20px;
}

.noti-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 0.95rem;
}

.noti-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.noti-list li {
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
