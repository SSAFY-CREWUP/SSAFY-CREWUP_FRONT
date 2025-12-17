<script setup>
import { reactive, defineProps, defineEmits } from 'vue'
import { useCrewStore } from '../../stores/crew'
import Swal from 'sweetalert2'

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
    class="join-modal"
    align-center
  >
    <div class="modal-content">
  <div class="form-group">
    <label>한 줄 소개</label>
        <el-input
          v-model="joinForm.message"
          type="textarea"
          :rows="3"
          placeholder="크루장에게 보낼 간단한 인사를 남겨주세요."
        />
  </div>

      <div class="form-group checkbox-group">
        <el-checkbox v-model="joinForm.agreed">
          크루의 운영 규칙을 준수하며 성실히 활동하겠습니다.
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
  padding: 10px 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
}



.checkbox-group {
  margin-bottom: 0;
}

.checkbox-group :deep(.el-checkbox__label) {
  color: #2c2c2c !important;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #2c2c2c;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  padding: 10px 20px;
  background: #4CAF50;
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

<style>
/* Ensure SweetAlert appears above Element Plus Dialog (z-index ~2000) */
.swal2-container {
  z-index: 3000 !important;
}
</style>