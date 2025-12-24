<script setup>
import { ref, watch, computed } from 'vue'
import { regions } from '@/constants/regions' // Correct import for {label, value}
import { MEMBER_AGES, GENDER_LIMITS, ACTIVITY_TIMES } from '@/constants/crew'
import { Location, Timer, Clock, User, Female, Male } from '@element-plus/icons-vue'

const emit = defineEmits(['filter-change'])

const filters = ref({
  region: '',
  paceRange: [3, 10], 
  times: [],
  ages: [],
  genders: []
})

// Region Options (Flatten or Group if needed, here just flat list)
const regionOptions = computed(() => {
    return [{ label: '모든 지역', value: '' }, ...regions]
})

// Watch & Emit
watch(filters, (newFilters) => {
  // Deep clone to avoid direct mutation issues if any
  const payload = {
    ...newFilters,
    region: newFilters.region === '모든 지역' ? '' : newFilters.region
  }
  emit('filter-change', payload)
}, { deep: true })
</script>

<template>
  <div class="crew-filter-card">
    <div class="filter-header">
      <h2>필터</h2>
      <button class="reset-btn" @click="filters = { region: '', paceRange: [3, 10], times: [], ages: [], genders: [] }">초기화</button>
    </div>

    <!-- Region -->
    <div class="filter-group">
      <div class="group-title">
        <el-icon><Location /></el-icon>
        <span>지역</span>
      </div>
      <el-select 
        v-model="filters.region" 
        placeholder="어디서 달릴까요?" 
        class="glass-select" 
        filterable
        :teleported="false"
      >
        <el-option
          v-for="item in regionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- Pace -->
    <div class="filter-group">
      <div class="group-title">
        <el-icon><Timer /></el-icon>
        <span>평균 페이스</span>
        <span class="value-badge">{{ filters.paceRange[0] }}:00 ~ {{ filters.paceRange[1] }}:00</span>
      </div>
      <div class="slider-wrapper">
        <el-slider 
          v-model="filters.paceRange" 
          range 
          :min="3" :max="10" :step="0.5" 
          :show-tooltip="false" 
          class="custom-slider"
        />
        <div class="slider-ticks">
          <span>3:00</span>
          <span>10:00</span>
        </div>
      </div>
    </div>

    <!-- Time -->
    <div class="filter-group">
      <div class="group-title">
        <el-icon><Clock /></el-icon>
        <span>활동 시간</span>
      </div>
      <div class="chip-grid time-grid">
        <div 
          v-for="time in ACTIVITY_TIMES" 
          :key="time"
          class="filter-chip"
          :class="{ active: filters.times.includes(time) }"
          @click="filters.times.includes(time) ? filters.times = filters.times.filter(t => t !== time) : filters.times.push(time)"
        >
          {{ time.split(' ')[0] }}
        </div>
      </div>
    </div>

    <!-- Age -->
    <div class="filter-group">
      <div class="group-title">
        <el-icon><User /></el-icon>
        <span>연령대</span>
      </div>
      <div class="chip-grid age-grid">
        <div 
          v-for="age in MEMBER_AGES" 
          :key="age"
          class="filter-chip"
          :class="{ active: filters.ages.includes(age) }"
          @click="filters.ages.includes(age) ? filters.ages = filters.ages.filter(a => a !== age) : filters.ages.push(age)"
        >
          {{ age === '전연령' ? '전체' : age }}
        </div>
      </div>
    </div>

    <!-- Gender -->
    <div class="filter-group">
      <div class="group-title">
        <el-icon v-if="filters.genders.includes('남성')"><Male /></el-icon>
        <el-icon v-else-if="filters.genders.includes('여성')"><Female /></el-icon>
        <el-icon v-else><User /></el-icon>
        <span>성별</span>
      </div>
      <div class="chip-grid">
         <div 
          v-for="gender in GENDER_LIMITS" 
          :key="gender"
          class="filter-chip"
          :class="{ active: filters.genders.includes(gender) }"
          @click="filters.genders.includes(gender) ? filters.genders = filters.genders.filter(g => g !== gender) : filters.genders.push(gender)"
        >
          {{ gender }}
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.crew-filter-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid white;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}
.crew-filter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(0,0,0,0.08);
}

.filter-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 28px;
}
.filter-header h2 {
  font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0;
}
.reset-btn {
  background: none; border: none; font-size: 0.85rem; color: #64748b;
  cursor: pointer; text-decoration: underline;
}
.reset-btn:hover { color: #6366f1; }

.filter-group { margin-bottom: 32px; }
.filter-group:last-child { margin-bottom: 0; }

.group-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.95rem; font-weight: 700; color: #334155;
  margin-bottom: 12px;
}
.group-title .el-icon { color: #6366f1; }

.value-badge {
  margin-left: auto; background: #e0e7ff; color: #4338ca;
  font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: 600;
}

/* Glass Select Customization */
.glass-select { width: 100%; }
.glass-select :deep(.el-input__wrapper) {
  background: #f8fafc; border-radius: 12px;
  box-shadow: none !important; border: 1px solid #e2e8f0;
  padding: 4px 12px;
}
.glass-select :deep(.el-input__wrapper:hover) { border-color: #cbd5e1; }
.glass-select :deep(.el-input__wrapper.is-focus) { 
  border-color: #6366f1; background: white; 
}

/* Slider */
.slider-wrapper { padding: 0 4px; }
.custom-slider :deep(.el-slider__bar) { background-color: #6366f1; }
.custom-slider :deep(.el-slider__button) { border-color: #6366f1; }
.slider-ticks {
  display: flex; justify-content: space-between; margin-top: 4px;
  font-size: 0.8rem; color: #94a3b8;
}

/* Chips */
.chip-grid {
  display: grid; gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); /* Default auto */
}

/* Time Grid: 2 columns */
.chip-grid.time-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* Age Grid: 3 columns */
.chip-grid.age-grid {
  grid-template-columns: repeat(3, 1fr);
}

.filter-chip {
  background: #f1f5f9; color: #64748b;
  border-radius: 12px; padding: 10px 0; /* Slightly taller */
  text-align: center; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
}
.filter-chip:hover { background: #e2e8f0; }
.filter-chip.active {
  background: #eef2ff; color: #4f46e5; border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}
</style>
