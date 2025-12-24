<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrewStore } from '@/stores/crew'
import { ArrowLeft, Share, Location, User, Clock, Timer, Check, UserFilled, Female, Male, Coordinate } from '@element-plus/icons-vue'
import JoinModal from '../../components/crew/JoinModal.vue'

const route = useRoute()
const router = useRouter()
const crewStore = useCrewStore()
const crewId = route.params.id

const loading = ref(true)
const showJoinModal = ref(false)

const handleShare = () => {
    // Check if Kakao SDK is available
    if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
             window.Kakao.init(import.meta.env.VITE_KAKAO_API_KEY); 
        }
        
        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: crewStore.currentCrew.name,
                description: crewStore.currentCrew.intro,
                imageUrl: crewStore.currentCrew.image,
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: '크루 구경가기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        })
    } else {
        console.warn('Kakao SDK not loaded')
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('주소가 복사되었습니다.');
        })
    }
}

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

const formatPace = (pace) => {
  if (!pace) return '00:00'
  const paceNum = Number(pace)
  if (isNaN(paceNum)) return pace
  
  const minutes = Math.floor(paceNum)
  const seconds = Math.round((paceNum - minutes) * 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
      <button class="btn-icon" @click="handleShare">
        <el-icon :size="24"><Share /></el-icon>
      </button>
    </header>

    <div class="content-container">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-image-wrapper">
                <img :src="crewStore.currentCrew.image" :alt="crewStore.currentCrew.name" class="hero-image" />
            </div>
        </section>

        <!-- Main Info -->
        <section class="info-section">
            <h1 class="crew-title">{{ crewStore.currentCrew.name }}</h1>
            
            <div class="info-grid-container">
                <div class="info-row">
                    <!-- Location -->
                    <div class="info-item">
                        <div class="icon-box location">
                            <el-icon><Location /></el-icon>
                        </div>
                        <div class="info-content">
                            <span class="label">활동 지역</span>
                            <span class="value">{{ crewStore.currentCrew.location }}</span>
                        </div>
                    </div>
                     <!-- Members -->
                     <div class="info-item">
                        <div class="icon-box user">
                             <el-icon><User /></el-icon>
                        </div>
                        <div class="info-content">
                            <span class="label">멤버</span>
                            <span class="value">{{ crewStore.currentCrew.members }}명</span>
                        </div>
                    </div>
                </div>

                <div class="info-row">
                    <!-- Pace -->
                    <div class="info-item">
                        <div class="icon-box timer">
                             <el-icon><Timer /></el-icon>
                        </div>
                         <div class="info-content">
                            <span class="label">평균 페이스</span>
                            <span class="value">{{ formatPace(crewStore.currentCrew.pace) }}</span>
                        </div>
                    </div>
                     <!-- Time -->
                    <div class="info-item">
                         <div class="icon-box time">
                             <el-icon><Clock /></el-icon>
                        </div>
                        <div class="info-content">
                            <span class="label">활동 시간</span>
                            <span class="value">{{ crewStore.currentCrew.activityTime }}</span>
                        </div>
                    </div>
                </div>

                 <div class="info-row">
                    <!-- Age -->
                    <div class="info-item">
                        <div class="icon-box age">
                             <el-icon><UserFilled /></el-icon>
                        </div>
                         <div class="info-content">
                            <span class="label">연령대</span>
                            <span class="value">{{ crewStore.currentCrew.ageRange || '전연령' }}</span>
                        </div>
                    </div>
                     <!-- Gender -->
                    <div class="info-item">
                         <div class="icon-box gender">
                             <el-icon><Coordinate /></el-icon>
                        </div>
                        <div class="info-content">
                            <span class="label">성별 제한</span>
                            <span class="value">{{ crewStore.currentCrew.genderLimit || '무관' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="divider"></div>

        <!-- Description -->
        <section class="content-section">
            <h3 class="section-title">크루 소개</h3>
            <p class="intro-text">{{ crewStore.currentCrew.intro }}</p>
        </section>

         <!-- Activities -->
        <section class="content-section">
             <h3 class="section-title">주요 활동</h3>
            <ul class="activity-list">
                <li v-for="(activity, index) in crewStore.currentCrew.activities" :key="index">
                <el-icon class="check-icon"><Check /></el-icon>
                {{ activity }}
                </li>
            </ul>
        </section>


        <!-- Member Preview -->
        <section class="content-section member-section">
            <div class="section-header-row">
                <h3 class="section-title">멤버 ({{ crewStore.currentCrew.members }})</h3>
                <!-- <button class="btn-text">모두 보기</button> -->
            </div>
            <div class="member-preview-list">
                <div class="member-avatars">
                    <img 
                    v-for="member in crewStore.currentCrew.previewMembers" 
                    :key="member.id" 
                    :src="member.image" 
                    class="member-avatar" 
                    />
                    <div class="more-avatar" v-if="crewStore.currentCrew.members > 5">
                        +{{ crewStore.currentCrew.members - 5 }}
                    </div>
                </div>
            </div>
        </section>

        <!-- Bottom Action -->
        <div class="bottom-action-bar">
            <button class="btn-join" @click="showJoinModal = true">
                가입 신청하기
            </button>
        </div>
    </div>

    <!-- Join Modal -->
    <JoinModal 
      v-model="showJoinModal" 
      :crew-id="crewId" 
    />
  </div>
  <div v-else class="loading-state">
      <div class="spinner"></div>
      Loading...
  </div>
</template>

<style scoped>
.crew-detail-view {
  min-height: 100vh;
  background-color: #F9FAFB; /* Light Gray Background */
  padding-bottom: 120px;
  color: #1F2937;
}

/* Header - Light Glass */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7); /* More transparent */
  backdrop-filter: blur(16px); /* Stronger blur */
  border-bottom: 1px solid rgba(229, 231, 235, 0.5); /* Subtle border */
  transition: all 0.3s ease;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  color: #374151;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(243, 244, 246, 0.8);
  color: #4F46E5; /* Indigo Hover */
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Hero */
.hero-section {
  position: relative;
  width: 100%;
  height: 300px;
  padding: 20px 20px 0;
}

.hero-image-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info Section */
.info-section {
  padding: 24px;
}

.crew-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #111827;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Light Glass Card */
.info-grid-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  
  /* UNIFIED STYLE: Indigo Tint */
  background: #EEF2FF; /* Indigo 50 */
  color: #6366F1;     /* Indigo 500 */
  border: 1px solid #E0E7FF;
}

/* Semantic Overrides (Optional - kept minimal/unified) */
/* Empty rules removed to clear lint warnings */

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: 0.8rem;
  color: #6B7280;
  font-weight: 600;
}

.value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.divider {
  height: 1px;
  background: #E5E7EB;
  width: 100%;
  margin: 20px 0;
}

/* Content Section */
.content-section {
  padding: 0 24px 30px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #111827;
  display: flex; align-items: center; gap: 8px;
}

.intro-text {
  line-height: 1.8;
  color: #4B5563;
  white-space: pre-line;
  font-size: 1rem;
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #4B5563;
  background: white; /* Clean White */
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.check-icon {
  color: #6366f1; /* Primary Indigo */
}

/* Member Section */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.member-avatars {
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.member-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid #FFFFFF;
  margin-left: -14px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Slightly deeper shadow */
  transition: transform 0.2s;
}

.member-avatar:hover {
  transform: translateY(-4px);
  z-index: 5;
}

.more-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #F3F4F6;
  border: 3px solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #6B7280;
  font-size: 0.9rem;
  margin-left: -14px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Bottom Action */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.85); /* Light Glass */
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  justify-content: center;
  z-index: 99;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
}

.btn-join {
  width: 100%;
  max-width: 800px;
  padding: 16px;
  background-color: #6366f1; /* Clean Indigo */
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-join:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
}

.btn-join:active {
  transform: scale(0.98);
}

.loading-state {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #9CA3AF;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F3F4F6;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
    padding: 0;
  }
  .hero-image-wrapper {
    border-radius: 0 0 24px 24px;
  }
  .info-section {
    padding: 24px 20px;
  }
  .crew-title {
    font-size: 1.8rem;
  }
  .info-grid-container {
    padding: 20px;
  }
}

/* --- Animations --- */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Apply Animations */
.hero-image-wrapper {
  animation: scaleIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.crew-title {
  opacity: 0; /* Initial state */
  animation: fadeInUp 0.6s ease-out 0.2s forwards;
}

.info-grid-container {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out 0.3s forwards;
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-grid-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.section-title, .intro-text {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out 0.4s forwards;
}

.activity-list li {
  opacity: 0;
  animation: slideInRight 0.5s ease-out forwards;
  transition: all 0.2s;
}

/* Staggered List Items */
.activity-list li:nth-child(1) { animation-delay: 0.5s; }
.activity-list li:nth-child(2) { animation-delay: 0.6s; }
.activity-list li:nth-child(3) { animation-delay: 0.7s; }
.activity-list li:nth-child(4) { animation-delay: 0.8s; }

.activity-list li:hover {
  transform: translateX(5px);
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.member-section {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out 0.6s forwards;
}

/* Icon Box Hover Micromotion */
.icon-box {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.info-item:hover .icon-box {
  transform: scale(1.1) rotate(5deg);
}
</style>
