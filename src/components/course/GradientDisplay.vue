<script setup>
import { computed } from 'vue'
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()

const segments = computed(() => {
  return courseStore.course.gradients.map(grad => {
    let color = '#4CAF50' // Green (< 5%)
    if (Math.abs(grad) > 15) color = '#FF6B6B' // Red (> 15%)
    else if (Math.abs(grad) > 5) color = '#FF9800' // Orange (5-15%)
    
    return { width: 1, color }
  })
})
</script>

<template>
  <div class="gradient-display">
    <div v-if="segments.length > 0" class="gradient-bar">
      <div 
        v-for="(seg, i) in segments" 
        :key="i" 
        class="segment" 
        :style="{ backgroundColor: seg.color, flex: 1 }"
      ></div>
    </div>
    <div v-else class="empty-gradient">
      <p>경사도 분석 대기 중...</p>
    </div>
    
    <div class="legend">
      <div class="legend-item"><span class="dot green"></span> 완만 (&lt;5%)</div>
      <div class="legend-item"><span class="dot orange"></span> 보통 (5-15%)</div>
      <div class="legend-item"><span class="dot red"></span> 급경사 (&gt;15%)</div>
    </div>
  </div>
</template>

<style scoped>
.gradient-display {
  margin-top: 10px;
}

.gradient-bar {
  height: 20px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.empty-gradient {
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.legend {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.green { background: #4CAF50; }
.dot.orange { background: #FF9800; }
.dot.red { background: #FF6B6B; }
</style>
