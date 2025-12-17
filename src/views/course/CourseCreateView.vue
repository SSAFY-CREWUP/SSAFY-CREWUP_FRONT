<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseStore } from '../../stores/course'
import MapEditor from '../../components/course/MapEditor.vue'
import CourseForm from '../../components/course/CourseForm.vue'

const router = useRouter()
const route = useRoute()
const courseStore = useCourseStore()

// Enable drawing mode by default
courseStore.startDrawing()

// Mobile Tab State
const activeTab = ref('info') // 'info' or 'map'
const isMobile = ref(window.innerWidth <= 768)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})

const handleReset = () => {
  if (confirm('작성 중인 코스가 초기화됩니다. 계속하시겠습니까?')) {
    courseStore.resetCourse()
  }
}

const handleComplete = async () => {
  if (!courseStore.course.name) {
    alert('코스 이름을 입력해주세요.')
    return
  }
  if (courseStore.course.path.length < 2) {
    alert('최소 2개 이상의 지점을 연결해주세요.')
    return
  }

  const crewId = route.params.id
  const success = await courseStore.saveCourse(crewId)
  if (success) {
    alert('코스가 성공적으로 저장되었습니다!')
    // Redirect back to crew courses list
    if (crewId) {
      router.push(`/crews/${crewId}/courses`)
    } else {
      router.push('/courses')
    }
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.')
  }
}
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
      <!-- Left Panel: Info -->
      <aside class="left-panel" :class="{ hidden: isMobile && activeTab !== 'info' }">
        <div class="panel-content">
          <h1>코스 만들기</h1>
          
          <CourseForm />
          
          <div class="control-section">
            <div class="button-group">
              <button class="btn-secondary" @click="courseStore.undoPoint">↩️ 되돌리기</button>
              <button class="btn-danger" @click="handleReset">초기화</button>
            </div>
          </div>

          <div class="action-section">
            <button 
              class="btn-success full-width" 
              :disabled="courseStore.loading"
              @click="handleComplete"
            >
              {{ courseStore.loading ? '저장 중...' : '💾 코스 저장' }}
            </button>
          </div>
        </div>
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
  width: 30%;
  min-width: 350px;
  border-right: 1px solid var(--color-border-light);
  overflow-y: auto;
  background: white;
  z-index: 10;
}

.panel-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.control-section {
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  flex: 1;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--color-border-medium);
  color: var(--color-text-primary);
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger {
  background: white;
  border: 1px solid var(--color-energy-red);
  color: var(--color-energy-red);
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success {
  background: var(--color-running-green);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.4);
}

.right-panel {
  flex: 1;
  height: 100%;
}

.mobile-tabs {
  display: none;
  height: 50px;
  border-bottom: 1px solid var(--color-border-light);
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
