<script setup>
import { useAiStore } from '../../../stores/ai'

const aiStore = useAiStore()

const timeOptions = [
  { id: 'morning', label: '오전', time: '06:00 - 12:00', icon: 'Sunrise' },
  { id: 'lunch', label: '점심', time: '12:00 - 18:00', icon: 'Sunny' },
  { id: 'evening', label: '저녁', time: '18:00 - 22:00', icon: 'Sunset' },
  { id: 'night', label: '야간', time: '22:00 - 06:00', icon: 'Moon' }
]

const toggleTime = (id) => {
  const current = aiStore.answers.timeSlots
  if (current.includes(id)) {
    aiStore.updateAnswer('timeSlots', current.filter(t => t !== id))
  } else {
    aiStore.updateAnswer('timeSlots', [...current, id])
  }
}

const isSelected = (id) => aiStore.answers.timeSlots.includes(id)
</script>

<template>
  <div class="step-time">
    <h2>🕐 주로 언제 달리시나요?</h2>
    <p class="subtitle">선호하는 시간대를 모두 선택해주세요.</p>

    <div class="time-grid">
      <div 
        v-for="option in timeOptions" 
        :key="option.id"
        class="time-card"
        :class="{ selected: isSelected(option.id) }"
        @click="toggleTime(option.id)"
      >
        <div class="icon-wrapper">
          <el-icon :size="32"><component :is="option.icon" /></el-icon>
        </div>
        <div class="card-content">
          <h3>{{ option.label }}</h3>
          <p>{{ option.time }}</p>
        </div>
        <div class="check-icon" v-if="isSelected(option.id)">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-time {
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

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.time-card {
  background: white;
  border: 2px solid var(--color-border-light);
  border-radius: 16px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.time-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.time-card.selected {
  border-color: var(--color-running-green);
  background-color: #f0fdf4;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: var(--color-bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 0.3s;
}

.time-card.selected .icon-wrapper {
  background: var(--color-running-green);
  color: white;
}

.card-content h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.card-content p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.check-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  color: var(--color-running-green);
  font-size: 1.2rem;
  font-weight: bold;
}

@media (max-width: 640px) {
  .time-grid {
    grid-template-columns: 1fr;
  }
}
</style>
