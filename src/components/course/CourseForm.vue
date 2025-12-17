<script setup>
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()
</script>

<template>
  <div class="course-form">
    <div class="form-group">
      <label>코스 이름 <span class="required">*</span></label>
      <input 
        v-model="courseStore.course.name" 
        type="text" 
        placeholder="예: 한강 야경 코스" 
        maxlength="50"
      />
    </div>
    <div class="form-group">
      <label>설명 (선택)</label>
      <textarea 
        v-model="courseStore.course.description" 
        placeholder="코스에 대한 설명을 적어주세요."
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.course-form {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-energy-red);
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border-medium);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  border-color: var(--color-primary);
  outline: none;
}

textarea {
  height: 80px;
  resize: vertical;
}
</style>
