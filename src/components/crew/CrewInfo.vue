<script setup>
import { defineProps, defineEmits } from 'vue'
import { StarFilled, Location, User, Calendar, UserFilled, Timer } from '@element-plus/icons-vue'

defineProps({
  crew: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['open-join-modal'])
</script>

<template>
  <div class="info-column">
    <div class="crew-image-container">
      <img :src="crew.image" alt="Crew Image" class="crew-image" />
      <div class="image-overlay"></div>
    </div>
    
    <div class="info-card">


      <h2 class="crew-name-large">{{ crew.name }}</h2>
      
      <div class="meta-info">
        <div class="meta-row">
          <span class="meta-item"><el-icon><Location /></el-icon> {{ crew.location }}</span>
          <span class="meta-item"><el-icon><User /></el-icon> {{ crew.members }}명</span>
        </div>
        <div class="meta-row">
          <span class="meta-item"><el-icon><Calendar /></el-icon> {{ crew.activityTime }}</span>
          <span class="meta-item"><el-icon><UserFilled /></el-icon> {{ crew.memberInfo }}</span>
          <span class="meta-item"><el-icon><Timer /></el-icon> {{ crew.pace }}</span>
        </div>
      </div>



      <button class="btn-join-large" @click="emit('open-join-modal')">
        가입 신청하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.info-column {
  width: 100%;
}

.crew-image-container {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  position: relative;
}

@media (min-width: 768px) {
  .crew-image-container {
    border-radius: 16px;
  }
}

.crew-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-card {
  padding: 20px;
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.rating-score {
  font-weight: 700;
  font-size: 1.1rem;
}

.review-count {
  color: #888;
  font-size: 0.9rem;
}

.crew-name-large {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.meta-info {
  flex-direction: column;
  gap: 8px;
  color: #666;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.meta-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  background: #f0f2f5;
  color: #555;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.btn-join-large {
  width: 100%;
  padding: 16px;
  background: var(--color-primary);
  color: black;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.btn-join-large:active {
  transform: scale(0.98);
}
</style>
