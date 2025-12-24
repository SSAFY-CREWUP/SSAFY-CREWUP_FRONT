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
      <el-tag size="small" effect="dark" color="#6366f1" class="role-badge" style="border: none;">{{ userStats.role }}</el-tag>
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

      <!-- Manager Section Removed -->

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
  border: 2px solid #6366f1;
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
  background-color: #F9FAFB;
  color: #6366f1;
}

.nav-item.active {
  background-color: #EEF2FF; /* Light Indigo */
  color: #6366f1;
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
