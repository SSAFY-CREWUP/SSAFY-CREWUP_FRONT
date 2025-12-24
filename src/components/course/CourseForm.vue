<script setup>
import { ref } from 'vue'
import { useCourseStore } from '../../stores/course'
import { useRouter, useRoute } from 'vue-router'
import { Camera, Close, RefreshLeft } from '@element-plus/icons-vue'

const courseStore = useCourseStore()
const router = useRouter()
const route = useRoute()

const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    courseStore.course.thumbnailFile = file
    courseStore.course.thumbnailPreview = URL.createObjectURL(file)
  }
}

const removeThumbnail = () => {
  courseStore.course.thumbnailFile = null
  if (courseStore.course.thumbnailPreview) {
    URL.revokeObjectURL(courseStore.course.thumbnailPreview)
    courseStore.course.thumbnailPreview = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getDifficultyLabel = (val) => {
  const map = {
    'Easy': '초급',
    'Normal': '중급',
    'Hard': '고급'
  }
  return map[val] || val
}

const handleSave = async () => {
  if (!courseStore.course.name) {
    alert('코스 이름을 입력해주세요.')
    return
  }
  if (courseStore.course.path.length < 2) {
    alert('최소 2개 이상의 지점을 연결해주세요.')
    return
  }
  if (!courseStore.course.expectedTime) {
    alert('예상 소요 시간을 입력해주세요.')
    return
  }

  // Check if Editing
  const editId = route.query.edit
  let success = false

  if (editId) {
      success = await courseStore.updateCourseAction(editId)
      if (success) {
          alert('코스가 성공적으로 수정되었습니다!')
          router.push('/profile') // Or wherever appropriate
      }
  } else {
      const crewId = route.params.id
      success = await courseStore.saveCourse(crewId)
      
      if (success) {
        alert('코스가 성공적으로 저장되었습니다!')
        if (crewId) {
          router.push(`/crews/${crewId}/courses`)
        } else {
          router.push('/courses')
        }
      }
  }

  if (!success) {
    alert('저장에 실패했습니다. 관리자에게 문의하세요.')
  }
}

const handleResetPath = () => {
  if (confirm('그려진 경로를 초기화하시겠습니까? (입력 정보는 유지됩니다)')) {
    courseStore.course.path = []
    courseStore.course.distance = 0
  }
}
</script>

<template>
  <div class="course-form-container">
    <div class="form-header">
      <h2>{{ route.query.edit ? '코스 수정하기' : '코스 만들기' }}</h2>
    </div>

    <div class="scrollable-content">
      <!-- Section 1: Thumbnail -->
      <div class="section thumbnail-section">
        <input 
          type="file" 
          ref="fileInput" 
          accept="image/*" 
          class="hidden-input" 
          @change="handleFileChange" 
        />
        
        <div 
          v-if="courseStore.course.thumbnailPreview" 
          class="preview-wrapper"
        >
          <img :src="courseStore.course.thumbnailPreview" class="thumbnail-img" />
          <div class="overlay">
            <button class="btn-remove-img" @click.stop="removeThumbnail">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </div>
        
        <div 
          v-else 
          class="placeholder-wrapper"
          @click="triggerFileInput"
        >
          <div class="placeholder-content">
            <el-icon class="camera-icon" :size="32"><Camera /></el-icon>
            <span>대표 사진을 등록해주세요</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Basic Info -->
      <div class="section info-section">
        <div class="form-group">
          <label>코스 이름</label>
          <input 
            v-model="courseStore.course.name" 
            type="text" 
            placeholder="예: 한강 야경 코스" 
            maxlength="50"
          />
        </div>
        <div class="form-group">
          <label>코스 설명</label>
          <textarea 
            v-model="courseStore.course.description" 
            placeholder="코스에 대한 상세한 설명을 적어주세요."
          ></textarea>
        </div>
      </div>

      <!-- Section 3: Running Specs -->
      <div class="section specs-section">
        <div class="spec-row">
          <div class="spec-group">
            <label>총 거리</label>
            <div class="readonly-value">
              <span class="value">{{ courseStore.course.distance }}</span>
              <span class="unit">km</span>
            </div>
          </div>
          <div class="spec-group">
            <label>예상 소요 시간</label>
            <div class="input-with-unit">
              <input 
                v-model="courseStore.course.expectedTime" 
                type="number" 
                placeholder="60" 
                min="0"
              />
              <span class="unit">분</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>난이도</label>
          <div class="difficulty-group">
            <div 
              v-for="opt in ['Easy', 'Normal', 'Hard']" 
              :key="opt"
              class="diff-chip"
              :class="{ active: courseStore.course.difficulty === opt }"
              @click="courseStore.course.difficulty = opt"
            >
              {{ getDifficultyLabel(opt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Footer Actions -->
    <div class="form-footer">
      <div class="footer-top">
        <button class="btn-reset-path" @click="handleResetPath">
          <el-icon><RefreshLeft /></el-icon> 경로 초기화
        </button>
      </div>
      <button 
        class="btn-save" 
        @click="handleSave"
        :disabled="courseStore.loading"
      >
        {{ courseStore.loading ? '저장 중...' : '저장하기' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.course-form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.form-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.form-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Scrollable Content Area */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

/* Thumbnail */
.hidden-input {
  display: none;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 10px;
  right: 10px;
}

.btn-remove-img {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-remove-img:hover {
  background: rgba(0, 0, 0, 0.7);
}

.placeholder-wrapper {
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  border: 2px dashed var(--color-border-medium);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.placeholder-wrapper:hover {
  border-color: var(--color-primary);
  background: #f0f9eb;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-tertiary);
}

.camera-icon {
  font-size: 2rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

input[type="text"],
input[type="number"],
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border-medium);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  background: #fff;
}

input:focus,
textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

textarea {
  height: 100px;
  resize: none;
}

/* Running Specs */
.spec-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.spec-group {
  flex: 1;
}

.spec-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.readonly-value {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: var(--color-text-primary);
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit input {
  padding-right: 32px;
}

.input-with-unit .unit {
  position: absolute;
  right: 12px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.value {
  font-size: 1.1rem;
}

.unit {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Difficulty Chips */
.difficulty-group {
  display: flex;
  gap: 10px;
}

.diff-chip {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--color-border-medium);
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  font-size: 0.9rem;
}

.diff-chip:hover {
  background: #f8f9fa;
}

.diff-chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

/* Footer & Actions */
.form-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--color-border-light);
  background: #fff;
}

.footer-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.btn-reset-path {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-reset-path:hover {
  color: var(--color-energy-red);
  background: rgba(255, 0, 0, 0.05);
}

.btn-save {
  width: 100%;
  padding: 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.btn-save:hover {
  background: #45a049; /* Darker primary */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.btn-save:disabled {
  background: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
