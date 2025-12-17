<script setup>
import { computed } from 'vue'
import { useAiStore } from '../../../stores/ai'

const aiStore = useAiStore()

const paceRange = computed({
  get: () => aiStore.answers.pace,
  set: (val) => aiStore.updateAnswer('pace', val)
})

const formatPace = (val) => {
  const minutes = Math.floor(val)
  const seconds = Math.round((val - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const paceDescription = computed(() => {
  const avg = (paceRange.value[0] + paceRange.value[1]) / 2
  if (avg < 6) return '고급 러너 (5:00 ~ 6:00)'
  if (avg < 7) return '중급 러너 (6:00 ~ 7:00)'
  return '초보 러너 (7:00 ~ 8:00)'
})
</script>

<template>
  <div class="step-pace">
    <h2>🏃 평균 페이스가 어떻게 되시나요?</h2>
    <p class="subtitle">편안하게 달릴 수 있는 속도를 알려주세요.</p>

    <div class="pace-display">
      <div class="pace-value">{{ formatPace(paceRange[0]) }} ~ {{ formatPace(paceRange[1]) }}</div>
      <div class="pace-desc">{{ paceDescription }}</div>
    </div>

    <div class="slider-wrapper">
      <el-slider 
        v-model="paceRange" 
        range 
        :min="5" 
        :max="8" 
        :step="0.1" 
        :format-tooltip="formatPace"
        class="custom-slider"
      />
      <div class="slider-labels">
        <span>5:00</span>
        <span>6:30</span>
        <span>8:00</span>
      </div>
    </div>

    <div class="pace-guide">
      <div class="guide-item" @click="paceRange = [7, 8]">
        <span class="badge beginner">초보</span>
        <span>7:00 ~ 8:00</span>
      </div>
      <div class="guide-item" @click="paceRange = [6, 7]">
        <span class="badge intermediate">중급</span>
        <span>6:00 ~ 7:00</span>
      </div>
      <div class="guide-item" @click="paceRange = [5, 6]">
        <span class="badge advanced">고급</span>
        <span>5:00 ~ 6:00</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-pace {
  text-align: center;
  padding: 20px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 40px;
}

.pace-display {
  margin-bottom: 50px;
}

.pace-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-running-green);
  margin-bottom: 10px;
}

.pace-desc {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.slider-wrapper {
  max-width: 600px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.pace-guide {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.guide-item {
  background: #9e9e9e;
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.guide-item:hover {
  transform: translateY(-2px);
  background: #757575;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
}

.badge.beginner { background: #4CAF50; } /* Green */
.badge.intermediate { background: #2196F3; } /* Blue */
.badge.advanced { background: #F44336; } /* Red */
</style>
