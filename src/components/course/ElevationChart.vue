<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useCourseStore } from '../../stores/course'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const courseStore = useCourseStore()

const chartData = computed(() => {
  const labels = courseStore.course.elevations.map((_, i) => i)
  return {
    labels,
    datasets: [
      {
        label: '고도 (m)',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4CAF50',
        pointRadius: 0,
        fill: true,
        data: courseStore.course.elevations,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: { display: false },
    y: {
      beginAtZero: false,
      grid: { color: '#f0f0f0' }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}
</script>

<template>
  <div class="elevation-chart">
    <Line v-if="courseStore.course.elevations.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="empty-chart">
      <p>경로를 그리면 고도 정보가 표시됩니다.</p>
    </div>
  </div>
</template>

<style scoped>
.elevation-chart {
  height: 200px;
  width: 100%;
  position: relative;
}

.empty-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}
</style>
