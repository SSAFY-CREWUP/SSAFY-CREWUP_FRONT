<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Check, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await crewStore.fetchWaitingMembers(crewId)
    console.log('Waiting Members fetched:', crewStore.requests)
  } finally {
    loading.value = false
  }
})

const waitingMembers = computed(() => {
  return crewStore.requests || []
})

const handleApprove = async (memberId) => {
  try {
    await crewStore.approveMember(crewId, memberId)
    ElMessage.success('가입이 승인되었습니다.')
  } catch (error) {
    ElMessage.error('승인 처리에 실패했습니다.')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}
</script>

<template>
  <div class="request-manage-view">
    <div class="page-header">
      <div class="header-text">
        <h2>가입 신청 관리</h2>
        <p>크루 가입을 대기 중인 러너들입니다.</p>
      </div>
    </div>

    <div v-loading="loading" class="request-list">
      <div v-if="waitingMembers.length === 0" class="empty-state">
        <el-empty description="대기 중인 가입 신청이 없습니다." />
      </div>

      <div v-else class="request-grid">
        <div v-for="member in waitingMembers" :key="member.memberId" class="request-card">
          <div class="card-header">
            <el-avatar :size="50" :src="member.profileImage || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            <div class="member-info">
              <span class="nickname">{{ member.nickname }}</span>
            </div>
          </div>
          
          <div class="card-body">
             <!-- Message field might not be in member list API -->
          </div>

          <div class="card-actions">
            <el-button type="primary" class="approve-btn" @click="handleApprove(member.memberId)">
              <el-icon><Check /></el-icon> 승인하기
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-manage-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
}

.header-text p {
  color: var(--color-text-secondary);
  margin: 0;
}

.request-grid {
  display: grid;
  gap: 16px;
}

.request-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s;
}

.request-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nickname {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.date {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.approve-btn {
  width: 100px;
}

@media (max-width: 600px) {
  .request-card {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
  }
  
  .approve-btn {
    width: 100%;
  }
}
</style>
