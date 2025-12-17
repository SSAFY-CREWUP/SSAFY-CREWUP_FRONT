<script setup>
import { useAiStore } from '../../stores/ai'
import { useRouter } from 'vue-router'

const aiStore = useAiStore()
const router = useRouter()

const getRankIcon = (index) => {
  const icons = ['🏆', '🥈', '🥉']
  return icons[index] || ''
}

const goToDetail = (id) => {
  router.push(`/crews/${id}`)
}
</script>

<template>
  <div class="recommend-result">
    <div class="result-header">
      <h1>🎉 당신에게 딱 맞는 크루 TOP 3!</h1>
      <p>AI가 분석한 최적의 러닝 메이트입니다.</p>
    </div>

    <div class="result-list">
      <div 
        v-for="(crew, index) in aiStore.recommendations" 
        :key="crew.id"
        class="result-card animate__animated animate__fadeInUp"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <div class="rank-badge">{{ getRankIcon(index) }}</div>
        
        <div class="card-header">
          <img :src="crew.image" :alt="crew.name" class="crew-image" />
          <div class="match-info">
            <span class="match-label">매칭률</span>
            <div class="match-bar-wrapper">
              <el-progress 
                :percentage="crew.matchRate" 
                :color="crew.matchRate > 90 ? '#FF6B6B' : '#4CAF50'"
                :stroke-width="10"
              />
            </div>
          </div>
        </div>

        <div class="card-body">
          <h3 class="crew-name">{{ crew.name }}</h3>
          <div class="crew-meta">
            <span>📍 {{ crew.location }}</span>
            <span>⏱️ {{ crew.pace }}</span>
            <span>👥 {{ crew.members }}명</span>
          </div>
          
          <div class="ai-reason">
            <div class="ai-icon">🤖</div>
            <p>{{ crew.reason }}</p>
          </div>

          <div class="action-buttons">
            <button class="detail-btn" @click="goToDetail(crew.id)">크루 상세보기</button>
            <button class="join-btn">가입 신청하기</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="restart-section">
      <button class="restart-btn" @click="aiStore.reset">다시 추천받기</button>
    </div>
  </div>
</template>

<style scoped>
.recommend-result {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.result-header {
  text-align: center;
  margin-bottom: 50px;
}

.result-header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--color-text-primary);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.result-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  border: 1px solid var(--color-border-light);
}

.rank-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 2.5rem;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.card-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  align-items: center;
}

.crew-image {
  width: 120px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.match-info {
  flex: 1;
}

.match-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
  display: block;
}

.card-body {
  padding: 25px;
}

.crew-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.crew-meta {
  display: flex;
  gap: 15px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.ai-reason {
  background: #f0fdf4;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.ai-icon {
  font-size: 1.5rem;
}

.ai-reason p {
  color: #166534;
  line-height: 1.5;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.detail-btn, .join-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: white;
  border: 1px solid var(--color-border-medium);
  color: var(--color-text-primary);
}

.detail-btn:hover {
  background: #f9fafb;
}

.join-btn {
  background: var(--color-running-green);
  border: none;
  color: white;
}

.join-btn:hover {
  background: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.restart-section {
  text-align: center;
  margin-top: 40px;
}

.restart-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  text-decoration: underline;
  cursor: pointer;
}
</style>
