<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Plus, Minus, CircleCheck, Lock } from '@element-plus/icons-vue'

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
  maxParticipants: 10,
  options: ['', ''],
  allowMultiple: false,
  isAnonymous: false
})

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    endDate: '',
    maxParticipants: 10,
    options: ['', ''],
    allowMultiple: false,
    isAnonymous: false
  }
}

const addOption = () => {
  if (form.value.options.length < 5) {
    form.value.options.push('')
  }
}

const removeOption = (index) => {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1)
  }
}

const handleSubmit = () => {
  if (!form.value.title || !form.value.endDate) {
    alert('필수 정보를 입력해주세요.')
    return
  }
  
  // Validate options
  const validOptions = form.value.options.filter(opt => opt.trim() !== '')
  if (validOptions.length < 2) {
    alert('최소 2개의 투표 항목을 입력해주세요.')
    return
  }

  emit('submit', { 
    ...form.value,
    options: validOptions 
  })
  close()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="투표 만들기"
    width="500px"
    @close="close"
    align-center
  >
    <div class="form-container">
      <div class="form-group">
        <label>투표 제목</label>
        <el-input v-model="form.title" placeholder="투표 제목을 입력하세요" />
      </div>

      <div class="form-group">
        <label>투표 항목 (최대 5개)</label>
        <div v-for="(option, index) in form.value?.options || form.options" :key="index" class="option-row">
            <el-input 
              v-model="form.options[index]" 
              :placeholder="`항목 ${index + 1}`" 
            />
            <button 
              v-if="form.options.length > 2" 
              class="btn-icon remove" 
              @click="removeOption(index)"
            >
                <el-icon><Minus /></el-icon>
            </button>
        </div>
        <button 
            v-if="form.options.length < 5" 
            class="btn-add-option" 
            @click="addOption"
        >
            <el-icon><Plus /></el-icon> 항목 추가하기
        </button>
      </div>

      <div class="form-row">
          <div class="form-group half">
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

        <div class="form-group half">
            <label>제한 인원</label>
            <el-input-number v-model="form.maxParticipants" :min="2" :max="100" />
        </div>
      </div>

      <div class="divider"></div>

      <div class="toggles-container">
          <div class="toggle-item">
              <div class="toggle-label">
                  <el-icon><CircleCheck /></el-icon>
                  <span>중복 선택 허용</span>
              </div>
              <el-switch v-model="form.allowMultiple" />
          </div>
          <div class="toggle-item">
              <div class="toggle-label">
                  <el-icon><Lock /></el-icon>
                  <span>익명 투표</span>
              </div>
               <el-switch v-model="form.isAnonymous" />
          </div>
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
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
    display: flex;
    gap: 20px;
}

.form-group.half {
    flex: 1;
}

.form-group label {
  font-weight: 700;
  color: #1F2937;
  font-size: 0.95rem;
}

/* Premium Input Styles - Consistent with Board/Schedule */
:deep(.el-input__wrapper), :deep(.el-textarea__inner) {
    background-color: #F3F4F6;
    box-shadow: none !important;
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 12px 16px;
    height: auto;
    transition: all 0.3s ease;
}

:deep(.el-input__inner) {
    height: 24px;
    font-size: 1rem;
    color: #1F2937;
    background: transparent;
}

:deep(.el-input__wrapper:hover), :deep(.el-textarea__inner:hover) {
    background-color: #E5E7EB;
}

:deep(.el-input__wrapper.is-focus), :deep(.el-textarea__inner:focus) {
    background-color: white;
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1) !important;
}

.option-row {
    display: flex;
    gap: 10px;
    align-items: center;
}

.btn-icon {
    width: 44px;
    height: 44px;
    border: none;
    background: #FFEBEE;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #EF4444;
    transition: all 0.2s;
    flex-shrink: 0;
}

.btn-icon:hover {
    background: #FECACA;
    transform: scale(1.05);
}

.btn-add-option {
    width: 100%;
    padding: 14px;
    border: 1px dashed #D1D5DB;
    background: #F9FAFB;
    border-radius: 12px;
    color: #6B7280;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.btn-add-option:hover {
    background: white;
    border-color: #6366f1;
    color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.divider {
    height: 1px;
    background: #F3F4F6;
    margin: 8px 0;
}

.toggles-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #F9FAFB;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #F3F4F6;
}

.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 14px 24px;
  background: #F3F4F6;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #6B7280;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
    background: #E5E7EB;
    color: #1F2937;
}

.btn-submit {
  padding: 14px 24px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}
</style>
