<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Plus, TrendCharts, Timer, UserFilled, Check } from '@element-plus/icons-vue'
import CreateVoteModal from '../../components/crew/CreateVoteModal.vue'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

const currentUserId = 999 // Mock current user ID

const getMyVote = (vote) => {
  if (!vote.participants) return null
  return vote.participants.find(p => p.id === currentUserId)
}
const currentUserRole = ref('leader') // Mock role: 'leader', 'manager', 'member'

const votes = ref([])
const loading = ref(false)
const activeTab = ref('progress')
const showResultModal = ref(false)
const showCreateModal = ref(false)
const selectedVote = ref(null)
const isManageMode = ref(false)

const fetchVotes = async () => {
  loading.value = true
  try {
    const data = await crewStore.fetchVotes(crewId)
    votes.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVotes()
})

const filteredVotes = computed(() => {
  if (activeTab.value === 'manage') return votes.value // Show all votes in manage tab
  return votes.value.filter(v => v.status === activeTab.value)
})



const getStatusText = (status) => {
  return status === 'progress' ? '진행중' : '종료됨'
}

const getStatusColor = (status) => {
  return status === 'progress' ? '#4CAF50' : '#9E9E9E'
}

const handleVote = async (vote) => {
  if (!confirm('투표하시겠습니까?')) return
  try {
    await crewStore.castVote(crewId, vote.id)
    alert('투표가 완료되었습니다.')
    fetchVotes()
  } catch (error) {
    alert('투표에 실패했습니다.')
  }
}

const openResult = (vote, manageMode = false) => {
  selectedVote.value = JSON.parse(JSON.stringify(vote)) // Deep copy
  isManageMode.value = manageMode
  // Sort participants by votedAt
  if (selectedVote.value.participants) {
    selectedVote.value.participants.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt))
  }
  showResultModal.value = true
}

const handleConfirm = async (participant) => {
  if (!confirm(`${participant.name}님을 확정하시겠습니까?`)) return
  try {
    await crewStore.confirmParticipant(crewId, selectedVote.value.id, participant.id)
    participant.status = 'approved'
    // Update local state to reflect change immediately
    const originalVote = votes.value.find(v => v.id === selectedVote.value.id)
    if (originalVote) {
      const p = originalVote.participants.find(p => p.id === participant.id)
      if (p) p.status = 'approved'
    }
  } catch (error) {
    alert('확정에 실패했습니다.')
  }
}

const handleCreateVote = async (voteData) => {
  try {
    await crewStore.createVote(crewId, voteData)
    alert('투표가 생성되었습니다.')
    fetchVotes() // Refresh list
  } catch (error) {
    alert('투표 생성에 실패했습니다.')
  }
}
</script>

<template>
  <div class="votes-view">
    <div class="page-header">
      <h2>투표</h2>
      <button 
        v-if="activeTab === 'manage'"
        class="btn-create" 
        @click="showCreateModal = true"
      >
        <el-icon><Plus /></el-icon>
        투표 만들기
      </button>
    </div>

    <el-tabs v-model="activeTab" class="vote-tabs">
      <el-tab-pane label="진행중인 투표" name="progress"></el-tab-pane>
      <el-tab-pane label="종료된 투표" name="closed"></el-tab-pane>
      <el-tab-pane 
        v-if="['leader', 'manager'].includes(currentUserRole)" 
        label="투표관리" 
        name="manage"
      ></el-tab-pane>
    </el-tabs>

    <div class="vote-list" v-loading="loading">
      <div v-if="filteredVotes.length === 0" class="empty-state">
        <el-icon :size="50"><TrendCharts /></el-icon>
        <p>투표 내역이 없습니다.</p>
      </div>

      <div v-else v-for="vote in filteredVotes" :key="vote.id" class="vote-card">
        <div class="vote-status" :style="{ color: getStatusColor(vote.status) }">
          ● {{ getStatusText(vote.status) }}
        </div>
        <h3 class="vote-title">{{ vote.title }}</h3>
        
        <div class="vote-meta">
          <span class="meta-item">
            <el-icon><Timer /></el-icon>
            {{ vote.endDate }} 마감
          </span>
          <span class="meta-item">
            <el-icon><UserFilled /></el-icon>
            제한인원 {{ vote.maxParticipants }}명
          </span>
        </div>

        <div class="vote-actions">
          <!-- Management Tab Actions -->
          <template v-if="activeTab === 'manage'">
            <button class="btn-manage" @click="openResult(vote, true)">
              관리하기
            </button>
          </template>

          <!-- User Tab Actions -->
          <template v-else>
            <template v-if="vote.status === 'progress'">
              <button 
                v-if="!getMyVote(vote)"
                class="btn-vote" 
                @click="handleVote(vote)"
              >
                투표하기
              </button>
              <button 
                v-else-if="getMyVote(vote).status === 'pending'"
                class="btn-voted" 
                disabled
              >
                투표완료
              </button>
              <button 
                v-else
                class="btn-approved" 
                disabled
              >
                <el-icon><Check /></el-icon> 참여확정
              </button>
            </template>
            <button 
              v-else
              class="btn-result" 
              @click="openResult(vote, false)"
            >
              결과보기
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <el-dialog
      v-model="showResultModal"
      :title="isManageMode ? '투표 관리' : '투표 결과'"
      width="600px"
    >
      <div v-if="selectedVote" class="result-content">
        <div class="result-header">
          <h3>{{ selectedVote.title }}</h3>
          <div class="result-meta">
            <span>마감일: {{ selectedVote.endDate }}</span>
            <span>제한인원: {{ selectedVote.maxParticipants }}명</span>
            <span>투표인원: {{ selectedVote.participants?.length || 0 }}명</span>
          </div>
        </div>

        <div class="participants-list">
          <h4>투표 참여자 (선착순)</h4>
          <div v-if="!selectedVote.participants || selectedVote.participants.length === 0" class="no-participants">
            참여자가 없습니다.
          </div>
          <div v-else class="participant-item" v-for="(p, index) in selectedVote.participants" :key="p.id">
            <div class="participant-info">
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ p.name }}</span>
              <span class="time">{{ p.votedAt }}</span>
            </div>
            <div class="participant-action">
              <span v-if="p.status === 'approved'" class="status-approved">
                <el-icon><Check /></el-icon> 확정됨
              </span>
              <button 
                v-else-if="isManageMode"
                class="btn-confirm" 
                @click="handleConfirm(p)"
              >
                확정
              </button>
              <span v-else class="status-pending">
                대기중
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Create Vote Modal -->
    <CreateVoteModal
      v-model="showCreateModal"
      @submit="handleCreateVote"
    />
  </div>
</template>

<style scoped>
.votes-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #45a049;
}

.vote-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.vote-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s;
}

.vote-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.vote-status {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.vote-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.vote-meta {
  display: flex;
  gap: 16px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-vote, .btn-result {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-vote {
  background: var(--color-primary);
  color: white;
}

.btn-vote:hover {
  background: #45a049;
}

.btn-result {
  background: #f5f5f5;
  color: var(--color-text-primary);
}

.btn-result:hover {
  background: #e0e0e0;
}

.btn-voted {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.btn-approved {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  background: #E8F5E9;
  color: #4CAF50;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-tertiary);
}

.empty-state .el-icon {
  margin-bottom: 10px;
  color: #e0e0e0;
}

/* Result Modal Styles */
.result-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.result-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.result-meta {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #666;
}

.participants-list h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #333;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank {
  font-weight: 700;
  color: var(--color-primary);
  width: 20px;
}

.name {
  font-weight: 500;
}

.time {
  font-size: 0.85rem;
  color: #999;
}

.btn-confirm {
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: var(--color-primary);
  color: white;
}

.status-approved {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4CAF50;
  font-size: 0.85rem;
  font-weight: 600;
}

.no-participants {
  text-align: center;
  padding: 20px;
  color: #999;
}

.btn-manage {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 600;
  background: white;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-manage:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.status-pending {
  color: #999;
  font-size: 0.85rem;
}
</style>
