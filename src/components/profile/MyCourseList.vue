<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Delete, MapLocation } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import courseApi from '../../api/course'

const router = useRouter()
const myCourses = ref([])
const loading = ref(false)

const fetchMyCourses = async () => {
    loading.value = true
    try {
        const response = await courseApi.getMyCourses()
        // API response structure check: response.data.data or response.data
        myCourses.value = response.data.data || [] 
    } catch (e) {
        console.error('Failed to fetch my courses', e)
        ElMessage.error('코스 목록을 불러오지 못했습니다.')
    } finally {
        loading.value = false
    }
}

const handleEditCourse = (course) => {
    // Navigate to edit page (using CourseCreateView with query or params if needed)
    // Currently standard router push to create page with courseId?
    // Or alerts as placeholder
    // alert('코스 수정 기능은 아직 구현 중입니다. (라우터 설정 필요)')
    // Ideally: router.push(`/courses/edit/${course.courseId}`)
    router.push({ path: '/courses/create', query: { edit: course.courseId } }) 
    // Note: CourseCreateView needs to handle this 'edit' query to load data.
}

const handleDeleteCourse = async (course) => {
    if (!confirm('정말로 이 코스를 삭제하시겠습니까?')) return
    try {
        await courseApi.deleteCourse(course.courseId)
        ElMessage.success('코스가 삭제되었습니다.')
        fetchMyCourses() // Refresh list
    } catch (e) {
        console.error(e)
        ElMessage.error('삭제 실패')
    }
}

onMounted(() => {
    fetchMyCourses()
})
</script>

<template>
    <div class="course-list-container">
        <div v-if="loading" class="loading-state">
            <p>로딩 중...</p>
        </div>
        <div v-else-if="myCourses.length === 0" class="empty-state">
            <el-icon :size="40" color="#ddd"><MapLocation /></el-icon>
            <p>만든 코스가 없습니다.</p>
            <button class="btn-create-sm" @click="$router.push('/courses/create')">코스 만들기</button>
        </div>
        
        <div v-else class="course-cards">
            <div v-for="course in myCourses" :key="course.courseId" class="mini-course-card">
                <div class="card-thumb">
                    <img :src="course.thumbnail" alt="thumbnail" loading="lazy" />
                    <span class="diff-badge" :style="{ background: course.difficulty === 'HARD' ? '#f56c6c' : (course.difficulty === 'NORMAL' ? '#e6a23c' : '#67c23a') }">
                        {{ course.difficulty }}
                    </span>
                </div>
                <div class="card-info">
                    <h4 class="card-title">{{ course.title }}</h4>
                    <div class="card-meta">
                        <span>{{ (course.distance / 1000).toFixed(1) }}km</span>
                        <span class="sep">|</span>
                        <span>{{ course.expectedTime }}분</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" @click="handleEditCourse(course)">
                        <el-icon><Edit /></el-icon>
                    </button>
                    <button class="btn-icon danger" @click="handleDeleteCourse(course)">
                        <el-icon><Delete /></el-icon>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.course-list-container {
    padding: 10px 0;
}

.course-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-course-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.mini-course-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.card-thumb {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.diff-badge {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  font-size: 0.6rem;
  color: white;
  text-align: center;
  padding: 2px 0;
  font-weight: 700;
  opacity: 0.9;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sep { color: #ddd; }

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: #f8f8f8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #eee;
  color: #333;
}

.btn-icon.danger {
  color: #ff6b6b;
  background: #fff0f0;
}
.btn-icon.danger:hover {
  background: #ffe0e0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.empty-state p {
  margin: 10px 0 20px 0;
}

.btn-create-sm {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.loading-state {
    text-align: center;
    padding: 20px;
    color: #888;
}
</style>
