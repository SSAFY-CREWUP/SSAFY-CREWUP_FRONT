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
                <el-icon color="var(--color-primary)" class="check-icon"><Check /></el-icon>
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
  background-color: #fff;
  padding-bottom: 100px; /* Space for bottom bar */
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 56px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  border-bottom: 1px solid var(--color-border-light);
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  color: var(--color-text-primary);
  transition: color 0.2s;
}

.btn-icon:hover {
    color: var(--color-primary);
}

.content-container {
    max-width: 800px;
    margin: 0 auto;
}

/* Hero */
.hero-section {
    padding: 20px;
}

.hero-image-wrapper {
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    bottom: 16px;
    left: 16px;
}

.location-badge {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(4px);
}

/* Info Section */
.info-section {
    padding: 20px 24px;
}

.crew-title {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 24px;
    color: var(--color-text-primary);
    line-height: 1.3;
}

.info-grid-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #FAFAFA;
    padding: 24px;
    border-radius: 20px;
    margin-bottom: 20px;
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
}

/* Icon Colors */
.icon-box.location { background: #E3F2FD; color: #1E88E5; }
.icon-box.user { background: #E8F5E9; color: #43A047; }
.icon-box.timer { background: #FFF3E0; color: #FB8C00; }
.icon-box.time { background: #F3E5F5; color: #8E24AA; }
.icon-box.age { background: #E0F7FA; color: #00ACC1; }
.icon-box.gender { background: #FCE4EC; color: #D81B60; }

.info-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.label {
    font-size: 0.8rem;
    color: var(--color-text-tertiary);
    font-weight: 500;
}

.value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
}

.divider {
    height: 8px;
    background: var(--color-bg-secondary);
    width: 100%;
}

/* Content Section */
.content-section {
    padding: 30px 24px;
    border-bottom: 1px solid var(--color-border-light);
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--color-text-primary);
}

.intro-text {
    line-height: 1.7;
    color: var(--color-text-secondary);
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
    gap: 10px;
    margin-bottom: 12px;
    font-size: 1rem;
    color: var(--color-text-secondary);
}

.check-icon {
    font-size: 1.2rem;
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
}

.member-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid white;
    margin-right: -12px;
    object-fit: cover;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.more-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-bg-secondary);
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin-left: -12px;
    z-index: 2;
}

/* Bottom Action */
.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: white;
    border-top: 1px solid var(--color-border-light);
    display: flex;
    justify-content: center;
    z-index: 99;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.btn-join {
    width: 100%;
    max-width: 800px;
    padding: 18px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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
    color: var(--color-text-tertiary);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-bg-secondary);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .content-container {
        padding: 0;
    }
    
    .hero-section {
        padding: 0;
    }
    
    .hero-image-wrapper {
        border-radius: 0;
        aspect-ratio: 16/10;
    }
    
    .info-grid {
        gap: 8px;
    }
    
    .label {
        font-size: 0.75rem;
    }
    
    .value {
        font-size: 0.9rem;
    }
}
</style>
