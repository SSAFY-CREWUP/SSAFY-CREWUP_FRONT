<script setup>
import { ref } from 'vue'
import { useCourseStore } from '../../stores/course'
import ElevationChart from './ElevationChart.vue'
import GradientDisplay from './GradientDisplay.vue'
import Loading from '../common/Loading.vue'

const courseStore = useCourseStore()
const activeTab = ref('elevation') // 'elevation' or 'gradient'
</script>

<template>
  <div class="analysis-panel">
    <!-- Stats Card -->
    <div class="stats-card">
      <div class="card-header">
        <h3>📊 코스 분석</h3>
        <Loading v-if="courseStore.analyzing" size="small" />
      </div>
      
      <div class="stats-grid">
        <div class="stat-row">
          <span class="label">📏 거리</span>
          <span class="value">{{ courseStore.course.distance }}km</span>
        </div>
        <div class="stat-row">
          <span class="label">⛰️ 상승</span>
          <span class="value">{{ courseStore.course.elevationGain }}m</span>
        </div>
        <div class="stat-row">
          <span class="label">📐 최대경사</span>
          <span class="value">{{ courseStore.course.maxGradient }}%</span>
        </div>
        <div class="stat-row">
          <span class="label">🔄 꺾임</span>
          <span class="value">{{ courseStore.course.curvature }}회</span>
        </div>
      </div>

      <div class="ai-prediction" v-if="courseStore.course.difficulty">
        <div class="ai-header">
          <span>🤖 AI 예측:</span>
          <span class="difficulty-badge" :class="courseStore.course.difficulty.toLowerCase()">
            {{ courseStore.course.difficulty }}
          </span>
        </div>
        <div class="confidence">
          (신뢰도 {{ Math.round(courseStore.course.aiConfidence * 100) }}%)
        </div>
      </div>
    </div>

    <!-- Detailed Analysis Tabs -->
    <div class="detail-tabs">
      <div class="tab-header">
        <button 
          :class="{ active: activeTab === 'elevation' }" 
          @click="activeTab = 'elevation'"
        >
          고도 프로필
        </button>
        <button 
          :class="{ active: activeTab === 'gradient' }" 
          @click="activeTab = 'gradient'"
        >
          경사도 분석
        </button>
      </div>
      
      <div class="tab-content">
        <div v-if="activeTab === 'elevation'">
          <ElevationChart />
        </div>
        <div v-else>
          <GradientDisplay />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.label {
  color: var(--color-text-secondary);
}

.value {
  font-weight: 700;
  color: var(--color-text-primary);
}

.ai-prediction {
  background: #f5f5ff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0ff;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-weight: 600;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.difficulty-badge.easy { background: #4CAF50; }
.difficulty-badge.normal { background: #FF9800; }
.difficulty-badge.hard { background: #FF6B6B; }

.confidence {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: right;
}

/* Tabs */
.detail-tabs {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid var(--color-border-light);
}

.tab-header button {
  flex: 1;
  padding: 12px;
  background: #f9fafb;
  border: none;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-header button.active {
  background: white;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.tab-content {
  padding: 20px;
  min-height: 240px;
}
</style>
