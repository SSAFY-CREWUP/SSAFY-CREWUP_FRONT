<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { StarFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import courseApi from '../../api/course'
import CourseDetailModal from '../course/CourseDetailModal.vue'

const router = useRouter()
const scrappedCourses = ref([])
const loading = ref(false)
const showDetail = ref(false)
const selectedCourse = ref(null)

const fetchScrappedCourses = async () => {
    loading.value = true
    try {
        const response = await courseApi.getMyScrapCourses()
        scrappedCourses.value = response.data.data || []
    } catch (e) {
        console.error('Failed to fetch scrapped courses', e)
        ElMessage.error('스크랩 목록을 불러오지 못했습니다.')
    } finally {
        loading.value = false
    }
}

const openDetail = (course) => {
    selectedCourse.value = course
    showDetail.value = true
}

const handleUnscrap = async (course) => {
    try {
        await ElMessageBox.confirm('스크랩을 해제하시겠습니까?', '확인', {
            confirmButtonText: '해제',
            cancelButtonText: '취소',
            type: 'warning'
        })
        
        await courseApi.toggleScrap(course.courseId)
        ElMessage.success('스크랩이 해제되었습니다.')
        // Remove from list immediately
        scrappedCourses.value = scrappedCourses.value.filter(c => c.courseId !== course.courseId)
        
    } catch (e) {
        // Cancelled or Error
        if (e !== 'cancel') console.error(e)
    }
}

onMounted(() => {
    fetchScrappedCourses()
})
</script>

<template>
    <div class="course-list-container">
        <div v-if="loading" class="loading-state">
             <p>로딩 중...</p>
        </div>
        <div v-else-if="scrappedCourses.length === 0" class="empty-state">
             <el-icon :size="40" color="#ddd"><StarFilled /></el-icon>
             <p>스크랩한 코스가 없습니다.</p>
             <button class="btn-create-sm" @click="$router.push('/courses')">코스 구경하기</button>
        </div>
           
        <div v-else class="course-cards">
             <div v-for="course in scrappedCourses" :key="course.courseId" class="mini-course-card" @click="openDetail(course)">
               <div class="card-thumb">
                 <img :src="course.thumbnail" loading="lazy" />
               </div>
               <div class="card-info">
                 <h4 class="card-title">{{ course.title }}</h4>
                 <div class="card-meta">
                    <span class="writer">by {{ course.writerNickname }}</span>
                 </div>
               </div>
               <div class="card-actions">
                 <!-- Unscrap Button -->
                 <button class="btn-icon active-scrap" @click.stop="handleUnscrap(course)">
                   <el-icon><StarFilled /></el-icon>
                 </button>
               </div>
             </div>
        </div>

        <CourseDetailModal v-model="showDetail" :course="selectedCourse"></CourseDetailModal>
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
  cursor: pointer;
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
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  flex: 1;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
}

.card-meta {
  font-size: 0.8rem;
  color: #888;
}

.writer {
  font-size: 0.8rem;
  color: #666;
}

.card-actions {
  display: flex;
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

.btn-icon.active-scrap {
    color: #ffca28; /* Star Color */
    background: #fff8e1;
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
}
</style>
