<script setup>
import { ref, watch } from 'vue'
import { REGIONS, MEMBER_AGES, GENDER_LIMITS, ACTIVITY_TIMES } from '@/constants/crew'

const emit = defineEmits(['filter-change'])

const filters = ref({
  region: '전체',
  paceRange: [3, 10], // Default range to cover most
  times: [],
  ages: [],
  genders: []
})

// Format regions for Select
const regionOptions = ['전체', ...REGIONS]

// Time options from constants (which are full strings, maybe simplify for display or use as is)
// ACTIVITY_TIMES = ['오전 (06:00 ~ 12:00)', ...]
// Let's use them as is for value, but maybe simplified label if needed. For now use full.

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
      <el-select v-model="filters.region" placeholder="지역 선택" class="full-width" filterable>
        <el-option
          v-for="region in regionOptions"
          :key="region"
          :label="region"
          :value="region"
        />
      </el-select>
    </div>

    <!-- Pace -->
    <div class="filter-section">
      <h3>평균 페이스 (min/km)</h3>
      <div class="slider-container">
        <el-slider v-model="filters.paceRange" range :min="3" :max="10" :step="0.1" :show-tooltip="false" />
        <div class="slider-labels">
          <span>{{ filters.paceRange[0] }}:00</span>
          <span>{{ filters.paceRange[1] }}:00</span>
        </div>
      </div>
    </div>

    <!-- Time -->
    <div class="filter-section">
      <h3>주 활동 시간대</h3>
      <div class="checkbox-container">
        <el-checkbox-group v-model="filters.times" class="checkbox-group">
          <el-checkbox v-for="time in ACTIVITY_TIMES" :key="time" :label="time" :value="time">
            {{ time.split(' ')[0] }} <!-- Display '오전', '오후' etc only? Or full -->
            <!-- Use simplified text for filter chips to save space if needed, but constant has ranges. -->
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <!-- Age -->
    <div class="filter-section">
      <h3>연령대</h3>
      <div class="checkbox-container">
        <el-checkbox-group v-model="filters.ages" class="checkbox-group">
          <el-checkbox v-for="age in MEMBER_AGES" :key="age" :label="age" :value="age" />
        </el-checkbox-group>
      </div>
    </div>

    <!-- Gender -->
    <div class="filter-section">
      <h3>성별</h3>
      <div class="checkbox-container">
        <el-checkbox-group v-model="filters.genders" class="checkbox-group">
          <el-checkbox v-for="gender in GENDER_LIMITS" :key="gender" :label="gender" :value="gender" />
        </el-checkbox-group>
      </div>
    </div>

  </div>
</template>

<style scoped>
.crew-filter {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.filter-section {
  margin-bottom: 32px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.slider-container {
  padding: 0 8px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width {
  width: 100%;
}
</style>
