<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseStore } from '../../stores/course'
import MapEditor from '../../components/course/MapEditor.vue'
import CourseForm from '../../components/course/CourseForm.vue'

const router = useRouter()
const route = useRoute()
const courseStore = useCourseStore()

// Enable drawing mode by default
onMounted(async () => {
    if (route.query.edit) {
        await courseStore.fetchCourseDetailAction(route.query.edit)
    } else {
        courseStore.resetCourse()
        courseStore.startDrawing()
    }
})

// Mobile Tab State
const activeTab = ref('info') // 'info' or 'map'
const isMobile = ref(window.innerWidth <= 768)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})
</script>

<template>
  <div class="course-create-view">
    <!-- Mobile Tabs -->
    <div class="mobile-tabs" v-if="isMobile">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'info' }"
        @click="activeTab = 'info'"
      >
        코스 정보
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'map' }"
        @click="activeTab = 'map'"
      >
        지도 / 경로
      </button>
    </div>

    <div class="layout-container">
      <!-- Left Panel: Info form -->
      <aside class="left-panel" :class="{ hidden: isMobile && activeTab !== 'info' }">
        <!-- CourseForm now handles the entire sidebar UI -->
        <CourseForm />
      </aside>

      <!-- Right Panel: Map -->
      <main class="right-panel" :class="{ hidden: isMobile && activeTab !== 'map' }">
        <MapEditor />
      </main>
    </div>
  </div>
</template>

<style scoped>
.course-create-view {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: white;
}

.layout-container {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.left-panel {
  width: 400px; /* Fixed width for better sidebar feel */
  min-width: 350px;
  border-right: 1px solid var(--color-border-light);
  overflow: hidden; /* Scroll handled inside CourseForm */
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  height: 100%;
}

.mobile-tabs {
  display: none;
  height: 50px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  background: white;
  border: none;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

@media (max-width: 768px) {
  .course-create-view {
    height: calc(100vh - 56px);
  }

  .mobile-tabs {
    display: flex;
  }

  .left-panel, .right-panel {
    width: 100%;
  }

  .hidden {
    display: none;
  }
}
</style>
