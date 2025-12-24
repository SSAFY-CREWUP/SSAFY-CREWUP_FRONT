<script setup>
import { reactive, defineProps, defineEmits } from 'vue'
import { useCrewStore } from '../../stores/crew'
import Swal from 'sweetalert2'
import { EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  crewId: [String, Number]
})

const emit = defineEmits(['update:modelValue', 'success'])
const crewStore = useCrewStore()

const joinForm = reactive({
  message: '',
  agreed: false
})

const handleJoin = async () => {
  if (!joinForm.message.trim()) {
    Swal.fire('입력 오류', '한 줄 소개를 입력해주세요.', 'warning')
    return
  }
  if (!joinForm.agreed) {
    Swal.fire('동의 필요', '크루 규칙에 동의해주세요.', 'warning')
    return
  }

  // 1. 먼저 모달 닫기 (즉시)
  emit('update:modelValue', false)

  try {
    // 2. 비동기 요청 수행
    await crewStore.joinCrew(props.crewId, {
          message: joinForm.message
        })
    
    emit('success')
    
    // 3. 폼 리셋
    joinForm.agreed = false
    joinForm.message = ''
    
    // 4. 성공 알림
    setTimeout(() => {
      Swal.fire('신청 완료', '가입 신청이 성공적으로 전송되었습니다.', 'success')
    }, 300)
    
  } catch (error) {
    // 에러 발생 시 알림
    setTimeout(() => {
      Swal.fire('오류', '가입 신청 중 문제가 발생했습니다.', 'error')
    }, 300)
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="가입 신청"
    width="500px"
    class="premium-modal join-modal"
    align-center
    :show-close="false"
  >
    <div class="modal-content">
        <div class="modal-header-visual">
             <div class="icon-circle">
                 <el-icon><EditPen /></el-icon>
             </div>
             <h3>크루에 합류하세요!</h3>
             <p>멤버들에게 전할 간단한 인사말을 남겨주세요.</p>
        </div>

      <div class="form-group">
        <label class="premium-label">한 줄 소개</label>
        <el-input
          v-model="joinForm.message"
          type="textarea"
          :rows="4"
          placeholder="자기소개나 가입 동기를 짧게 적어주세요!"
          class="premium-textarea"
          resize="none"
        />
      </div>

      <div class="agreement-box">
        <el-checkbox v-model="joinForm.agreed" class="premium-checkbox">
          <span class="checkbox-text">크루의 운영 규칙을 준수하며<br>성실히 활동하겠습니다.</span>
        </el-checkbox>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <button class="btn-cancel" @click="close">취소</button>
        <button class="btn-submit" @click="handleJoin">신청하기</button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.modal-content {
  padding: 10px 10px 0;
}

.modal-header-visual {
    text-align: center;
    margin-bottom: 30px;
}

.icon-circle {
    width: 60px;
    height: 60px;
    background: #EEF2FF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: #6366f1;
    font-size: 1.8rem;
    border: 1px solid #E0E7FF;
}

.modal-header-visual h3 {
    font-size: 1.4rem;
    font-weight: 800;
    color: #1F2937;
    margin: 0 0 8px 0;
}

.modal-header-visual p {
    color: #6B7280;
    font-size: 0.95rem;
    margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.premium-label {
  display: block;
  font-weight: 700;
  margin-bottom: 10px;
  color: #374151;
  font-size: 1rem;
}

/* Premium Textarea */
.premium-textarea :deep(.el-textarea__inner) {
  background-color: #F9FAFB;
  border: 2px solid #F3F4F6;
  border-radius: 16px;
  padding: 16px;
  color: #1F2937;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
}

.premium-textarea :deep(.el-textarea__inner:hover) {
    background-color: white;
    border-color: #E5E7EB;
}

.premium-textarea :deep(.el-textarea__inner:focus) {
  border-color: #6366f1;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.agreement-box {
    background: #F9FAFB;
    padding: 16px;
    border-radius: 16px;
    border: 1px dashed #D1D5DB;
    display: flex;
    justify-content: center;
}

.premium-checkbox :deep(.el-checkbox__label) {
    color: #4B5563 !important;
    font-weight: 600;
    line-height: 1.4;
    white-space: normal; /* Allow branding text wrap */
}

.premium-checkbox :deep(.el-checkbox__inner) {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border-width: 2px;
}

.premium-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #6366f1;
  border-color: #6366f1;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: center; /* Centered buttons */
  padding-top: 10px;
  width: 100%;
}

.btn-cancel, .btn-submit {
  flex: 1; /* Equal width buttons */
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-cancel:hover {
  background: #E5E7EB;
  color: #1F2937;
}

.btn-submit {
  background: linear-gradient(135deg, #6366f1, #8b5cf6); /* Gradient */
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.btn-submit:active {
  transform: scale(0.98);
}
</style>

<style>
/* Global Override to ensure SweetAlert z-index */
.swal2-container {
  z-index: 9999 !important;
}

/* Premium Modal styling override */
.premium-modal {
    border-radius: 24px !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.premium-modal .el-dialog__header {
    margin-right: 0 !important;
    text-align: center;
    border-bottom: none !important;
    padding-top: 24px;
}

.premium-modal .el-dialog__title {
    font-weight: 800;
    font-size: 1.2rem;
    color: #111827;
    display: none; /* Hidden as we have custom header visual */
}
</style>