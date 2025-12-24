<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Location, User, Timer, Clock, InfoFilled, 
  Calendar, Male, Female, Check 
} from '@element-plus/icons-vue'

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
    </div>
    <div class="card-content">
      <div class="header-row">
        <h3 class="crew-name">{{ props.crew.name }}</h3>
        <span class="location-tag">{{ props.crew.location.split(' ')[1] || props.crew.location }}</span>
      </div>
      
      <div class="crew-info">
        <div class="info-row">
          <div class="info-item highlight">
            <el-icon><User /></el-icon>
            <span>{{ props.crew.members }}명</span>
          </div>
          <div class="info-item highlight">
            <el-icon><Timer /></el-icon>
            <span>{{ formatPace(props.crew.pace) }}</span>
          </div>
        </div>
        
        <div class="info-row secondary-stats">
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span>{{ props.crew.activityTime.split(' ')[0] }}</span> 
          </div>
          <div class="info-item">
            <el-icon><Calendar /></el-icon>
            <span>{{ props.crew.ageRange === '전연령' ? '전체' : props.crew.ageRange }}</span>
          </div>
          <div class="info-item error-color" v-if="props.crew.genderLimit === '여성'">
            <el-icon><Female /></el-icon>
            <span>여성</span>
          </div>
          <div class="info-item info-color" v-else-if="props.crew.genderLimit === '남성'">
            <el-icon><Male /></el-icon>
            <span>남성</span>
          </div>
          <div class="info-item success-color" v-else>
            <el-icon><Check /></el-icon>
            <span>성별무관</span>
          </div>
        </div>
      </div>

      <button class="detail-btn">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
/* Clean Modern Card Style with 3D Depth */
.crew-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transform: translateY(0);
}

.crew-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(99, 102, 241, 0.2);
  border-color: transparent;
  z-index: 10;
}

.card-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.crew-card:hover .card-image img { transform: scale(1.1); }

/* Content Area */
.card-content {
  padding: 20px;
  flex: 1; display: flex; flex-direction: column;
}

.header-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 12px; gap: 8px;
}

.crew-name {
  font-size: 1.15rem; font-weight: 800; color: #1e1b4b;
  line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; margin: 0;
}

.location-tag {
  background: #f1f5f9; color: #64748b;
  font-size: 0.75rem; font-weight: 700;
  padding: 4px 8px; border-radius: 6px;
  white-space: nowrap; flex-shrink: 0;
}

.crew-info {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
}


.info-row { display: flex; align-items: center; gap: 12px; }
.info-row.secondary-stats { gap: 16px; margin-top: 4px; }

.info-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: #64748b; font-weight: 600;
}
.info-item.highlight { color: #334155; font-size: 0.95rem; }
.info-item :deep(.el-icon) { color: #94a3b8; font-size: 1rem; }

/* Gender Colors */
.info-item.info-color :deep(.el-icon) { color: #3b82f6; }   /* Male Blue */
.info-item.error-color :deep(.el-icon) { color: #ef4444; }  /* Female Red */
.info-item.success-color :deep(.el-icon) { color: #10b981; } /* All Green */
.info-tag.time { background: #fff7ed; color: #c2410c; } /* Orange tint */
.info-tag.age { background: #f0fdf4; color: #15803d; } /* Green tint */

.info-tag.gender.male { background: #eff6ff; color: #1d4ed8; }
.info-tag.gender.female { background: #fdf2f8; color: #be123c; }
.info-tag.gender.all { background: #f3f4f6; color: #4b5563; }

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
