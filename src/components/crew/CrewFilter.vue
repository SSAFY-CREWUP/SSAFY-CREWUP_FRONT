<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = ref({
  region: '전체',
  paceRange: [5, 8],
  times: []
})

const regions = [
  { label: '전체', value: '전체' },
  { label: '서울 전체', value: '서울' },
  { label: '서울 강남구', value: '서울 강남구' },
  { label: '서울 마포구', value: '서울 마포구' },
  { label: '서울 영등포구', value: '서울 영등포구' },
  { label: '경기 성남시', value: '경기 성남시' }
]

const times = ['오전', '점심', '저녁', '야간']

// Watch for changes and emit
watch(filters, (newFilters) => {
  emit('filter-change', newFilters)
}, { deep: true })
</script>

<template>
  <div class="crew-filter">
    <!-- Region -->
    <div class="filter-section">
      <h3>지역</h3>
      <el-select v-model="filters.region" placeholder="지역 선택" class="full-width">
        <el-option
          v-for="item in regions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- Pace -->
    <div class="filter-section">
      <h3>페이스 범위 (min/km)</h3>
      <div class="slider-container">
        <el-slider v-model="filters.paceRange" range :min="3" :max="10" :step="0.5" />
        <div class="slider-labels">
          <span>{{ filters.paceRange[0] }}:00</span>
          <span>{{ filters.paceRange[1] }}:00</span>
        </div>
      </div>
    </div>

    <!-- Time -->
    <div class="filter-section">
      <h3>시간대</h3>
      <el-checkbox-group v-model="filters.times" class="checkbox-group">
        <el-checkbox v-for="time in times" :key="time" :label="time" :value="time" />
      </el-checkbox-group>
    </div>


  </div>
</template>

<style scoped>
.crew-filter {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
}

.filter-section {
  margin-bottom: 30px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.ai-recommend-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.ai-recommend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.full-width {
  width: 100%;
}

.slider-container {
  padding: 0 10px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.checkbox-group, .radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
