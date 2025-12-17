<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Location, User, Timer, Calendar, UserFilled } from '@element-plus/icons-vue'

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
    </div>
    <div class="card-content">
      <h3 class="crew-name">{{ props.crew.name }}</h3>
      
      <div class="crew-info">
        <div class="info-row">
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ props.crew.location }}</span>
          </div>
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ props.crew.members }}명</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <el-icon><Timer /></el-icon>
            <span>{{ props.crew.pace }}</span>
          </div>
          <div class="info-item">
            <el-icon><Calendar /></el-icon>
            <span>{{ props.crew.activityTime }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item full-width">
            <el-icon><UserFilled /></el-icon>
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}

.crew-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-image {
  height: 160px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.crew-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.crew-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.crew-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.info-item.full-width {
  width: 100%;
}

.crew-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.tag {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.detail-btn {
  margin-top: auto;
  width: 100%;
  padding: 10px;
  background-color: transparent;
  border: 1px solid var(--color-running-green);
  color: var(--color-running-green);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn:hover {
  background-color: var(--color-running-green);
  color: white;
}
</style>
