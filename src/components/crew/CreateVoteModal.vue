<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({
  title: '',
  endDate: '',
  maxParticipants: 10
})

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    endDate: '',
    maxParticipants: 10
  }
}

const handleSubmit = () => {
  if (!form.value.title || !form.value.endDate) {
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
    title="투표 만들기"
    width="500px"
    @close="close"
  >
    <div class="form-container">
      <div class="form-group">
        <label>투표 제목</label>
        <el-input v-model="form.title" placeholder="투표 제목을 입력하세요" />
      </div>

      <div class="form-group">
        <label>마감일</label>
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="마감일 선택"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <div class="form-group">
        <label>제한 인원</label>
        <el-input-number v-model="form.maxParticipants" :min="2" :max="100" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="close">취소</button>
        <button class="btn-submit" @click="handleSubmit">만들기</button>
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
