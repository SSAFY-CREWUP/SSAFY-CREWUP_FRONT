<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Location, User, Timer, Clock, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  crew: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/crews/${props.crew.id}`)
}
</script>

<template>
  <div class="crew-card" @click="goToDetail">
    <div class="card-image">
      <img :src="props.crew.image" :alt="props.crew.name" loading="lazy" />
      <div class="image-overlay">
         <span class="region-badge">{{ props.crew.location.split(' ')[1] || props.crew.location }}</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="crew-name">{{ props.crew.name }}</h3>
      
      <div class="crew-info">
        <div class="info-row">
          <div class="info-item" title="멤버 수">
            <el-icon><User /></el-icon>
            <span>{{ props.crew.members }}명</span>
          </div>
           <div class="info-item" title="활동 시간">
            <el-icon><Clock /></el-icon>
            <span>{{ props.crew.activityTime.split(' ')[0] }}</span> 
            <!-- Displaying only '오전', '저녁' etc for space -->
          </div>
        </div>
        <div class="info-row">
          <div class="info-item" title="평균 페이스">
            <el-icon><Timer /></el-icon>
            <span>{{ props.crew.pace }}</span>
          </div>
          <div class="info-item" title="모집 대상">
             <!-- Using user icon or info icon -->
            <el-icon><InfoFilled /></el-icon>
            <span>{{ props.crew.memberInfo }}</span>
          </div>
        </div>
      </div>

      <button class="detail-btn">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
.crew-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
}

.crew-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-100);
}

.card-image {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.crew-card:hover .card-image img {
  transform: scale(1.08);
}

.image-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
}

.region-badge {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    backdrop-filter: blur(4px);
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.crew-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crew-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.info-item :deep(.el-icon) {
    color: var(--color-text-tertiary);
}

.detail-btn {
  margin-top: auto;
  width: 100%;
  padding: 12px;
  background-color: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-secondary);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.crew-card:hover .detail-btn {
  background-color: var(--color-primary);
  color: white;
}
</style>
