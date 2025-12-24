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
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-group.half {
    flex: 1;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.option-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border: 1px solid var(--color-border);
    background: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #f5f5f5;
    color: #E53935;
    border-color: #E53935;
}

.btn-add-option {
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--color-border);
    background: #fafafa;
    border-radius: 8px;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
}

.btn-add-option:hover {
    background: #f0f0f0;
    border-color: #ccc;
    color: var(--color-text-primary);
}

.divider {
    height: 1px;
    background: #eee;
    margin: 4px 0;
}

.toggles-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    color: var(--color-text-primary);
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
