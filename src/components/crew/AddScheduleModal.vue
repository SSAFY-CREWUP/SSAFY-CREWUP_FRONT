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
  type: 'regular',
  courseId: null
})

const scrappedCourses = ref([])
const crewStore = useCrewStore()
const route = useRoute()
const crewId = route.params.id

onMounted(async () => {
  try {
    scrappedCourses.value = await crewStore.fetchScrappedCourses(crewId)
  } catch (error) {
    console.error('Failed to fetch scrapped courses', error)
  }
})

const eventTypes = [
  { label: '정기 러닝', value: 'regular' },
  { label: '이벤트', value: 'special' },
  { label: '번개', value: 'lightning' }
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
    type: 'regular',
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
            :label="type.label" 
            :value="type.value" 
          />
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
            :key="course.id"
            :label="course.title"
            :value="course.id"
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
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #666;
}

.btn-submit {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:hover {
  background: #45a049;
}
</style>
