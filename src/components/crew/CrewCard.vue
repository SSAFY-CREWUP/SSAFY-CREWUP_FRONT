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

const formatPace = (pace) => {
  if (!pace) return '00:00'
  const paceNum = Number(pace)
  if (isNaN(paceNum)) return pace
  
  // Assuming pace is in minutes (e.g., 5.5 = 5:30, 6 = 6:00)
  const minutes = Math.floor(paceNum)
  const seconds = Math.round((paceNum - minutes) * 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
            <span>{{ formatPace(props.crew.pace) }}</span>
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
/* Clean Modern Card Style */
.crew-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.crew-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); /* Softer, deeper shadow */
  border-color: #cbd5e1;
}

.card-image {
  height: 200px; /* Taller image */
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.crew-card:hover .card-image img { transform: scale(1.1); }

.image-overlay {
    position: absolute; top: 16px; left: 16px; /* Moved to left for better scan */
}
.region-badge {
    background: rgba(15, 23, 42, 0.75); /* Dark Slate 900 */
    color: white;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 700;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-content {
  padding: 24px;
  flex: 1; display: flex; flex-direction: column;
}

.crew-name {
  font-size: 1.25rem; /* Larger Title */
  font-weight: 800;
  margin-bottom: 8px;
  color: #1e1b4b; /* Deep Navy */
  line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.crew-info {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;
}

.info-row { display: flex; align-items: center; gap: 16px; }

.info-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.9rem;
  color: #64748b; /* Slate 500 */
  font-weight: 500;
}
.info-item :deep(.el-icon) { color: #94a3b8; font-size: 1rem; }

.detail-btn {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  background: #f1f5f9; /* Slate 100 */
  border: none;
  color: #64748b;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.crew-card:hover .detail-btn {
  background: #6366F1; /* Primary Indigo */
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}
</style>
