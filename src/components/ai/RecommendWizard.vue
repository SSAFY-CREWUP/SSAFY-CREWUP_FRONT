<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useAiStore } from '../../stores/ai'
import StepLocation from './steps/StepLocation.vue'
import StepPace from './steps/StepPace.vue'
import StepTime from './steps/StepTime.vue'
import StepPurpose from './steps/StepPurpose.vue'
import RecommendResult from './RecommendResult.vue'
import Loading from '../common/Loading.vue'
import 'animate.css'

const aiStore = useAiStore()

// Loading State
const loadingText = ref('🤖 AI가 열심히 분석 중이에요...')
let loadingInterval

const startLoading = () => {
  const texts = [
    '🤖 AI가 열심히 분석 중이에요...',
    '📊 수백 개의 크루를 비교하는 중...',
    '✨ 당신에게 딱 맞는 크루를 찾고 있어요!'
  ]
  let index = 0
  loadingInterval = setInterval(() => {
    index = (index + 1) % texts.length
    loadingText.value = texts[index]
  }, 1000)
}

const stopLoading = () => {
  clearInterval(loadingInterval)
}

onUnmounted(() => {
  stopLoading()
})

// Navigation
const handleNext = async () => {
  if (aiStore.step === 4) {
    startLoading()
    await aiStore.getRecommendations()
    stopLoading()
  } else {
    aiStore.nextStep()
  }
}

const handlePrev = () => {
  aiStore.prevStep()
}

const progressPercentage = computed(() => {
  return (aiStore.step / aiStore.totalSteps) * 100
})

const isNextDisabled = computed(() => {
  if (aiStore.step === 1) return !aiStore.answers.location
  if (aiStore.step === 3) return aiStore.answers.timeSlots.length === 0
  if (aiStore.step === 4) return !aiStore.answers.purpose
  return false
})
</script>

<template>
  <div class="recommend-wizard">
    <!-- Loading Screen -->
    <div v-if="aiStore.loading" class="loading-screen">
      <Loading />
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- Result Screen -->
    <RecommendResult v-else-if="aiStore.recommendations.length > 0" />

    <!-- Wizard Steps -->
    <div v-else class="wizard-container">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="step-indicator">Step {{ aiStore.step }} / {{ aiStore.totalSteps }}</div>
        <el-progress :percentage="progressPercentage" :show-text="false" :stroke-width="8" color="#4CAF50" />
      </div>

      <!-- Step Content with Transition -->
      <div class="step-content">
        <Transition name="slide-fade" mode="out-in">
          <component 
            :is="[StepLocation, StepPace, StepTime, StepPurpose][aiStore.step - 1]" 
            :key="aiStore.step"
          />
        </Transition>
      </div>

      <!-- Navigation Buttons -->
      <div class="wizard-actions">
        <button 
          v-if="aiStore.step > 1" 
          class="nav-btn prev" 
          @click="handlePrev"
        >
          ← 이전
        </button>
        <button 
          class="nav-btn next" 
          :class="{ 'ai-btn': aiStore.step === 4 }"
          @click="handleNext"
          :disabled="isNextDisabled"
        >
          {{ aiStore.step === 4 ? 'AI 추천 받기! 🤖' : '다음 →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recommend-wizard {
  min-height: 600px;
  display: flex;
  justify-content: center;
}

.wizard-container {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.progress-section {
  margin-bottom: 40px;
}

.step-indicator {
  text-align: right;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.step-content {
  flex: 1;
  margin-bottom: 40px;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.nav-btn {
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.nav-btn.prev {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.nav-btn.prev:hover {
  background: #e5e7eb;
}

.nav-btn.next {
  background: var(--color-running-green);
  color: black;
  margin-left: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-btn.next:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  filter: brightness(1.1);
}

.nav-btn.next:disabled {
  background: #e0e0e0;
  color: black;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  filter: none;
}

.nav-btn.ai-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.nav-btn.ai-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

/* Loading Screen */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
}

.loading-text {
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
