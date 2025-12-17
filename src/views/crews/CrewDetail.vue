<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { ArrowLeft, Share } from '@element-plus/icons-vue'
import CrewInfo from '../../components/crew/CrewInfo.vue'
import CrewDescription from '../../components/crew/CrewDescription.vue'
import JoinModal from '../../components/crew/JoinModal.vue'

const route = useRoute()
const router = useRouter()
import kakao from '../../api/kakao'

const crewStore = useCrewStore()

const handleShare = () => {
  // Placeholder for Kakao share integration
  console.log('Sharing crew via Kakao')
  // Example: kakao.shareCrew(crewStore.currentCrew)
}
const crewId = route.params.id

const loading = ref(true)
const showJoinModal = ref(false)

onMounted(async () => {
  try {
    await crewStore.fetchCrew(crewId)
  } catch (error) {
    console.error('Failed to load crew detail', error)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="crew-detail-view" v-if="!loading && crewStore.currentCrew">
    <!-- Header -->
    <header class="detail-header">
      <button class="btn-icon" @click="goBack">
        <el-icon :size="24"><ArrowLeft /></el-icon>
      </button>
      <h1 class="header-title">{{ crewStore.currentCrew.name }}</h1>
      <div class="header-actions">
        <button class="btn-icon" @click="handleShare">
          <el-icon :size="24"><Share /></el-icon>
        </button>
      </div>
    </header>

    <div class="content-wrapper">
      <!-- Left Column: Crew Info -->
      <CrewInfo 
        :crew="crewStore.currentCrew" 
        class="info-column-wrapper"
        @open-join-modal="showJoinModal = true" 
      />

      <!-- Right Column: Details -->
      <CrewDescription 
        :crew="crewStore.currentCrew" 
        class="detail-column-wrapper"
      />
    </div>

    <!-- Join Modal -->
    <JoinModal 
      v-model="showJoinModal" 
      :crew-id="crewId" 
    />
  </div>
  <div v-else class="loading-state">Loading...</div>
</template>

<style scoped>
.crew-detail-view {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 40px;
  background: #fff;
  min-height: 100vh;
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #333;
}

/* Content Layout */
.content-wrapper {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row;
    padding: 20px;
    gap: 30px;
  }

  .info-column-wrapper {
    flex: 0 0 40%;
    position: sticky;
    top: 80px;
    height: fit-content;
  }

  .detail-column-wrapper {
    flex: 1;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #888;
}
</style>

<style scoped>
.crew-detail-view {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 40px;
  background: #fff;
  min-height: 100vh;
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #333;
}

/* Content Layout */
.content-wrapper {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row;
    padding: 20px;
    gap: 30px;
  }

  .info-column {
    flex: 0 0 40%;
    position: sticky;
    top: 80px;
    height: fit-content;
  }

  .detail-column {
    flex: 1;
  }
}

/* Info Column */
.crew-image-container {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  position: relative;
}

@media (min-width: 768px) {
  .crew-image-container {
    border-radius: 16px;
  }
}

.crew-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-card {
  padding: 20px;
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.rating-score {
  font-weight: 700;
  font-size: 1.1rem;
}

.review-count {
  color: #888;
  font-size: 0.9rem;
}

.crew-name-large {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.meta-info {
  display: flex;
  gap: 16px;
  color: #666;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  background: #f0f2f5;
  color: #555;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.btn-join-large {
  width: 100%;
  padding: 16px;
  background: var(--color-primary);
  color: black;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.btn-join-large:active {
  transform: scale(0.98);
}

/* Detail Column */
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

/* Modal */
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
  color: #333;
}

.pace-slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pace-value {
  font-weight: 700;
  color: var(--color-primary);
  min-width: 50px;
  text-align: right;
}

.checkbox-group {
  margin-bottom: 0;
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
}

.btn-submit {
  padding: 10px 20px;
  background: var(--color-primary);
  color: black;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #888;
}
</style>
