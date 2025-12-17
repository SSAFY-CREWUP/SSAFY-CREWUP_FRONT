<script setup>
import { useAiStore } from '../../../stores/ai'

const aiStore = useAiStore()

const purposes = [
  { id: 'social', label: '친목 위주', desc: '즐겁게 달리고 뒤풀이도 함께해요', icon: 'ChatDotRound' },
  { id: 'fitness', label: '체력 향상', desc: '꾸준한 러닝으로 건강해지고 싶어요', icon: 'Bicycle' },
  { id: 'competition', label: '대회 준비', desc: '마라톤 완주와 기록 단축이 목표예요', icon: 'Trophy' },
  { id: 'diet', label: '다이어트', desc: '러닝으로 체중 감량에 도전해요', icon: 'Fire' }
]

const selectPurpose = (id) => {
  aiStore.updateAnswer('purpose', id)
}

const isSelected = (id) => aiStore.answers.purpose === id
</script>

<template>
  <div class="step-purpose">
    <h2>🎯 러닝의 목적은 무엇인가요?</h2>
    <p class="subtitle">가장 중요한 목적 하나를 선택해주세요.</p>

    <div class="purpose-grid">
      <div 
        v-for="item in purposes" 
        :key="item.id"
        class="purpose-card"
        :class="{ selected: isSelected(item.id) }"
        @click="selectPurpose(item.id)"
      >
        <div class="icon-wrapper">
          <el-icon :size="32"><component :is="item.icon" /></el-icon>
        </div>
        <div class="card-content">
          <h3>{{ item.label }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <div class="radio-indicator"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-purpose {
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

.purpose-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.purpose-card {
  background: white;
  border: 2px solid var(--color-border-light);
  border-radius: 16px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
}

.purpose-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.purpose-card.selected {
  border-color: var(--color-running-green);
  background-color: #f0fdf4;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: all 0.3s;
}

.purpose-card.selected .icon-wrapper {
  background: var(--color-running-green);
  color: white;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-content p {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

.radio-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-medium);
  border-radius: 50%;
  position: relative;
}

.purpose-card.selected .radio-indicator {
  border-color: var(--color-running-green);
}

.purpose-card.selected .radio-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: var(--color-running-green);
  border-radius: 50%;
}

@media (max-width: 640px) {
  .purpose-grid {
    grid-template-columns: 1fr;
  }
}
</style>
