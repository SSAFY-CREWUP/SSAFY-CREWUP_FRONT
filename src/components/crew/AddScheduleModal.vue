<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { useCrewStore } from '../../stores/crew'
import { useRoute } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  maxParticipants: 10,
  content: '',
  type: 'REGULAR',
  courseId: null
})

const scrappedCourses = ref([])
const crewStore = useCrewStore()
const route = useRoute()
const crewId = route.params.id

import courseApi from '../../api/course'

// ... existing imports

onMounted(async () => {
  try {
    const response = await courseApi.getMyScrapCourses({ page: 0, size: 100 })
    if (response.data.status === 200) {
      // API 응답 데이터 구조에 따라 courseId와 name 매핑이 필요할 수 있음
      scrappedCourses.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch scrapped courses, using mock data:', error)
    // 백엔드 API 에러(500) 시 테스트를 위한 임시 데이터
    scrappedCourses.value = [
      { courseId: 1, title: '한강 공원 러닝 코스' },
      { courseId: 2, title: '남산 둘레길 코스' },
      { courseId: 3, title: '올림픽 공원 한바퀴' },
      { courseId: 4, title: '대전 갑천 5km' }
    ]
  }
})

const eventTypes = [
  { label: '정기 러닝', value: 'REGULAR' },
  { label: '이벤트', value: 'EVENT' },
  { label: '번개', value: 'LIGHTNING' }
]

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: 10,
    content: '',
    type: 'REGULAR',
    courseId: null
  }
}

const handleSubmit = () => {
  if (!form.value.title || !form.value.date || !form.value.time) {
    alert('필수 정보를 입력해주세요.')
    return
  }
  emit('submit', { ...form.value })
  close()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="일정 추가"
    width="500px"
    @close="close"
  >
    <div class="form-container">
      <div class="form-group">
        <label>일정 유형</label>
        <el-radio-group v-model="form.type">
          <el-radio-button 
            v-for="type in eventTypes" 
            :key="type.value" 
            :label="type.value" 
          >
            {{ type.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-group">
        <label>제목</label>
        <el-input v-model="form.title" placeholder="일정 제목을 입력하세요" />
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label>날짜</label>
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="날짜 선택"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
        <div class="form-group half">
          <label>시간</label>
          <el-time-picker
            v-model="form.time"
            placeholder="시간 선택"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </div>
      </div>

      <div class="form-group">
        <label>장소</label>
        <el-input v-model="form.location" placeholder="모임 장소를 입력하세요" />
      </div>

      <div class="form-group">
        <label>코스 선택 (스크랩한 코스)</label>
        <el-select v-model="form.courseId" placeholder="코스를 선택하세요" clearable>
          <el-option
            v-for="course in scrappedCourses"
            :key="course.courseId"
            :label="course.title"
            :value="course.courseId"
          />
        </el-select>
      </div>

      <div class="form-group">
        <label>최대 참여 인원</label>
        <el-input-number v-model="form.maxParticipants" :min="2" :max="100" />
      </div>

      <div class="form-group">
        <label>내용</label>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="일정에 대한 상세 내용을 입력하세요"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="close">취소</button>
        <button class="btn-submit" @click="handleSubmit">추가</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* Premium Form Styles */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
  color: #374151;
  font-size: 0.95rem;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

/* Custom Radio Group (Segmented Control) */
:deep(.el-radio-group) {
  display: flex;
  width: 100%;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 12px;
}

:deep(.el-radio-button) {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  background: transparent;
  border: none !important;
  box-shadow: none !important;
  color: #6B7280;
  font-weight: 600;
  padding: 10px 0;
  border-radius: 8px !important;
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: white !important;
  color: #6366f1 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

/* Premium Input Styles (Global for this component) */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper),
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: #F3F4F6;
  box-shadow: none !important;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  transition: all 0.2s;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  border-radius: 8px; /* Slightly smaller radius for buttons */
  background-color: white;
  border: 1px solid #E5E7EB;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover),
:deep(.el-select__wrapper:hover) {
  background-color: #E5E7EB;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select__wrapper.is-focused) {
  background-color: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

/* Dialog Footer */
:deep(.el-dialog__footer) {
  padding-top: 20px;
  border-top: 1px solid #F3F4F6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #F3F4F6;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #E5E7EB;
  color: #374151;
}

.btn-submit {
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
}

:deep(.el-dialog__title) {
  font-weight: 800;
  font-size: 1.2rem;
  color: #1F2937;
}

:deep(.el-dialog__body) {
  padding: 24px;
}
</style>
