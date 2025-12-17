<script setup>
import { defineProps, ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import MemberModal from './MemberModal.vue'

defineProps({
  crew: {
    type: Object,
    required: true
  }
})

const showMemberModal = ref(false)
</script>

<template>
  <div class="detail-column">
    <!-- Intro -->
    <section class="detail-section">
      <h3>크루 소개</h3>
      <p class="intro-text">{{ crew.intro }}</p>
    </section>

    <!-- Activities -->
    <section class="detail-section">
      <h3>주요 활동</h3>
      <ul class="activity-list">
        <li v-for="(activity, index) in crew.activities" :key="index">
          <el-icon color="#4CAF50" class="check-icon"><Check /></el-icon>
          {{ activity }}
        </li>
      </ul>
    </section>

    <!-- Members Preview -->
    <section class="detail-section">
      <div class="section-header">
        <h3>멤버 미리보기</h3>
      </div>
      <div class="member-avatars">
        <img 
          v-for="member in crew.previewMembers" 
          :key="member.id" 
          :src="member.image" 
          class="member-avatar" 
        />
      </div>
    </section>

    <!-- Member Modal -->
    <MemberModal 
      v-model="showMemberModal" 
      :crew-id="crew.id" 
    />
  </div>
</template>

<style scoped>
.detail-column {
  width: 100%;
}

.detail-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
  .detail-section {
    padding: 0 0 40px 0;
    border-bottom: none;
  }
}

.detail-section h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333;
}

.intro-text {
  line-height: 1.6;
  color: #444;
  white-space: pre-line;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  line-height: 1.5;
  color: #444;
}

.check-icon {
  margin-top: 2px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.more-link {
  color: #888;
  font-size: 0.9rem;
  cursor: pointer;
}

.member-avatars {
  display: flex;
  gap: -10px; /* Overlap effect */
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
  margin-right: -10px;
}

.more-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f2f5;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  z-index: 1;
}
</style>
