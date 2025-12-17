<script setup>
import { computed } from 'vue'
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()

const estimatedTime = computed(() => {
  // Assuming average pace of 6:00 min/km
  const totalMinutes = courseStore.course.distance * 6
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  }
  return `${minutes}분`
})

const calories = computed(() => {
  // Approx 60kcal per km
  return Math.round(courseStore.course.distance * 60)
})
</script>

<template>
  <div class="course-analysis">
    <h3>실시간 분석</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="label">총 거리</span>
        <span class="value">{{ courseStore.course.distance }} <span class="unit">km</span></span>
      </div>
      <div class="stat-item">
        <span class="label">예상 소요시간</span>
        <span class="value">{{ estimatedTime }}</span>
      </div>
      <div class="stat-item">
        <span class="label">예상 칼로리</span>
        <span class="value">{{ calories }} <span class="unit">kcal</span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-analysis {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  margin-top: 20px;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
