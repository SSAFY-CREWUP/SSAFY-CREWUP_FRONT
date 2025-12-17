<script setup>
import { onMounted, computed } from 'vue'
import { useCrewStore } from '../stores/crew'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { Bell } from '@element-plus/icons-vue'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const crewStore = useCrewStore()
const notifications = computed(() => crewStore.notifications)

onMounted(() => {
  crewStore.fetchNotifications()
})

const formatTime = (time) => {
  const date = dayjs(time)
  const now = dayjs()
  const diffDays = now.diff(date, 'day')

  if (diffDays >= 3) {
    return date.format('YYYY.MM.DD HH:mm')
  }
  return date.fromNow()
}
</script>

<template>
  <div class="notifications-page">
    <div class="page-header">
      <h2>알림 센터</h2>
      <p>모든 알림을 확인하세요.</p>
    </div>

    <div class="notification-list">
      <div v-if="notifications.length === 0" class="empty-state">
        <el-icon :size="50"><Bell /></el-icon>
        <p>새로운 알림이 없습니다.</p>
      </div>

      <div v-else v-for="item in notifications" :key="item.id" class="notification-card">
        <div class="card-header">
          <span class="crew-name">{{ item.crewName }}</span>
          <span class="time">{{ formatTime(item.time) }}</span>
        </div>
        <div class="card-body">
          <p class="title">{{ item.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: transform 0.2s;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.crew-name {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.time {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.title {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-tertiary);
}

.empty-state .el-icon {
  margin-bottom: 16px;
  color: #e0e0e0;
}
</style>
