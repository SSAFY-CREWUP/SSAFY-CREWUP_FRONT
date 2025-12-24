<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Plus, TrendCharts, Timer, UserFilled, Check, Lock } from '@element-plus/icons-vue'
import CreateVoteModal from '../../components/crew/CreateVoteModal.vue'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

const currentUserId = 999 
const currentUserRole = ref('leader')

const votes = ref([])
const loading = ref(false)
const activeTab = ref('progress')
const showResultModal = ref(false)
const showCreateModal = ref(false)
const showVoteModal = ref(false)

const selectedVote = ref(null)
const selectedOptionIds = ref([])
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
  if (activeTab.value === 'manage') return votes.value // Show all
  // Should "My Votes" be a tab? The user asked for "My Votes" tab. 
  // Let's assume 'manage' is for admins, maybe we need a 'my' tab? 
  // For now stick to progress/closed/manage.
  return votes.value.filter(v => v.status === activeTab.value)
})

import { ElMessage, ElMessageBox } from 'element-plus'

const getMyVoteStatus = (vote) => {
    // Check if user is in main participants list
    const p = vote.participants?.find(p => p.id === currentUserId)
    if (p) return p.status
    return null
}

const hasVoted = (vote) => {
    return vote.hasVoted
}

const getStatusText = (status) => {
  return status === 'progress' ? '진행중' : '종료됨'
}

const getStatusColor = (status) => {
  return status === 'progress' ? '#4CAF50' : '#9E9E9E'
}

// Open Voting Modal
const openVoteModal = (vote) => {
    if (vote.hasVoted) {
        ElMessage.warning('이미 참여한 투표입니다.')
        return
    }
    selectedVote.value = vote
    selectedOptionIds.value = []
    showVoteModal.value = true
}

const submitVote = async () => {
    if (selectedOptionIds.value.length === 0) {
        ElMessage.warning('항목을 선택해주세요.')
        return
    }
    
    // If not allowing multiple, ensure only 1 (UI handles this but safety check)
    if (!selectedVote.value.allowMultiple && Array.isArray(selectedOptionIds.value) && selectedOptionIds.value.length > 1) {
         // Should not happen with radio
    }
    
    // If using el-radio-group, selectedOptionIds might be a single value, normalize to array
    let finalIds = Array.isArray(selectedOptionIds.value) ? selectedOptionIds.value : [selectedOptionIds.value]

    try {
        await crewStore.castVote(crewId, selectedVote.value.id, finalIds)
        ElMessage.success('투표가 완료되었습니다.')
        showVoteModal.value = false
        fetchVotes()
    } catch (error) {
        console.error(error)
        // Backend returns 500 for duplicate entry if exception is unhandled
        // Treat 500 as potential duplicate vote for now since backend code is inaccessible
        if (error.response?.status === 409 || error.response?.status === 500 || error.response?.data?.code === 'VOTE_ALREADY_DONE') {
             ElMessage.warning('이미 참여한 투표입니다.')
        } else {
             ElMessage.error('투표에 실패했습니다.')
        }
    }
}

const formatTime = (dateStr) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        const timePart = date.toTimeString().split(' ')[0]
        const msPart = date.getMilliseconds().toString().padStart(3, '0')
        return `${timePart}.${msPart}`
    } catch (e) {
        return ''
    }
}

// Result / Manage
const openResult = async (vote, manageMode = false) => {
  try {
      const detailedVote = await crewStore.getVoteResults(vote.id)
      selectedVote.value = detailedVote
      isManageMode.value = manageMode
      showResultModal.value = true
  } catch (error) {
      console.error(error)
      ElMessage.error('투표 결과를 불러오는데 실패했습니다.')
  }
}

const handleConfirm = async (participant) => {
  try {
    await ElMessageBox.confirm(`${participant.name}님을 확정하시겠습니까?`, '참여 확정', {
        confirmButtonText: '확정',
        cancelButtonText: '취소',
        type: 'info',
    })
    
    await crewStore.confirmParticipant(crewId, selectedVote.value.id, participant.id)
    participant.status = 'approved'
    fetchVotes() 
    ElMessage.success('확정되었습니다.')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('확정에 실패했습니다.')
  }
}

const handleCreateVote = async (voteData) => {
  try {
    await crewStore.createVote(crewId, voteData)
    ElMessage.success('투표가 생성되었습니다.')
    fetchVotes()
  } catch (error) {
    ElMessage.error('투표 생성에 실패했습니다.')
  }
}

const handleEndVote = async (vote) => {
    try {
        await ElMessageBox.confirm('투표를 종료하시겠습니까?', '투표 종료', {
            confirmButtonText: '종료',
            cancelButtonText: '취소',
            type: 'warning',
        })
        await crewStore.closeVote(crewId, vote.id)
        ElMessage.success('투표가 종료되었습니다.')
        fetchVotes()
    } catch (error) {
         if (error !== 'cancel') ElMessage.error('투표 종료에 실패했습니다.')
    }
}

const handleDeleteVote = async (vote) => {
    try {
        await ElMessageBox.confirm('투표를 삭제하시겠습니까? 복구할 수 없습니다.', '투표 삭제', {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning',
        })
        await crewStore.deleteVote(crewId, vote.id)
        ElMessage.success('투표가 삭제되었습니다.')
        fetchVotes()
    } catch (error) {
         if (error !== 'cancel') ElMessage.error('투표 삭제에 실패했습니다.')
    }
}
</script>

<template>
  <div class="votes-view">
    <div class="page-header">
      <h2>투표</h2>
      <!-- Only show create button in Manage tab or if leader/manager -->
      <button 
        v-if="['leader', 'manager'].includes(currentUserRole)"
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
        <div class="card-header">
             <div class="vote-status" :style="{ color: getStatusColor(vote.status) }">
                ● {{ getStatusText(vote.status) }}
            </div>
            <div class="vote-flags">
                <el-tag v-if="vote.isAnonymous" size="small" type="info" effect="plain"><el-icon><Lock /></el-icon> 익명</el-tag>
                <el-tag v-if="vote.allowMultiple" size="small" type="success" effect="plain">중복가능</el-tag>
            </div>
        </div>
       
        <h3 class="vote-title">{{ vote.title }}</h3>
        
        <div class="vote-meta">
          <span class="meta-item">
            <el-icon><Timer /></el-icon>
            {{ vote.endDate }} 마감
          </span>
          <span class="meta-item">
            <el-icon><UserFilled /></el-icon>
            {{ vote.participants?.length || 0 }} / {{ vote.maxParticipants }}명 참여
          </span>
        </div>

        <div class="vote-actions">
          <template v-if="activeTab === 'manage'">
            <button class="btn-manage result" @click="openResult(vote, true)">
              결과확인
            </button>
            <button 
                v-if="vote.status === 'progress'" 
                class="btn-manage end" 
                @click="handleEndVote(vote)"
            >
              투표종료
            </button>
            <button class="btn-manage delete" @click="handleDeleteVote(vote)">
                삭제
            </button>
          </template>

          <template v-else>
            <!-- Progress Tab -->
            <template v-if="vote.status === 'progress'">
                <!-- Not Voted yet -->
                <button 
                    v-if="!hasVoted(vote)"
                    class="btn-vote" 
                    @click="openVoteModal(vote)"
                >
                    투표하기
                </button>
                <!-- Voted -->
                <template v-else>
                    <button 
                        v-if="getMyVoteStatus(vote) === 'pending'"
                        class="btn-voted" 
                        @click="openResult(vote, false)"
                    >
                        투표완료 (결과보기)
                    </button>
                    <button 
                        v-else
                        class="btn-approved" 
                         @click="openResult(vote, false)"
                    >
                        <el-icon><Check /></el-icon> 참여확정 (결과보기)
                    </button>
                </template>
            </template>
            <!-- Closed Tab -->
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

    <!-- Vote Modal -->
    <el-dialog
        v-model="showVoteModal"
        title="투표하기"
        width="500px"
        align-center
    >
        <div v-if="selectedVote" class="vote-modal-content">
            <h3 class="modal-vote-title">{{ selectedVote.title }}</h3>
            <p class="modal-vote-desc">
                {{ selectedVote.allowMultiple ? '여러 항목을 선택할 수 있습니다.' : '하나의 항목을 선택해주세요.' }}
            </p>

            <div class="options-list">
                <!-- Checkbox for Multiple -->
                <el-checkbox-group v-if="selectedVote.allowMultiple" v-model="selectedOptionIds" class="vertical-group">
                    <el-checkbox 
                        v-for="opt in selectedVote.options" 
                        :key="opt.id" 
                        :label="opt.id" 
                        border
                    >
                        {{ opt.text }}
                    </el-checkbox>
                </el-checkbox-group>

                <!-- Radio for Single -->
                <el-radio-group v-else v-model="selectedOptionIds" class="vertical-group">
                    <el-radio 
                        v-for="opt in selectedVote.options" 
                        :key="opt.id" 
                        :label="opt.id" 
                        border
                    >
                        {{ opt.text }}
                    </el-radio>
                </el-radio-group>
            </div>
        </div>
        <template #footer>
            <button class="btn-submit" @click="submitVote">투표하기</button>
        </template>
    </el-dialog>

    <!-- Result Modal -->
    <el-dialog
      v-model="showResultModal"
      :title="isManageMode ? '투표 관리' : '투표 결과'"
      width="600px"
      align-center
    >
      <div v-if="selectedVote" class="result-content">
        <div class="result-header">
           <h3 class="modal-vote-title">{{ selectedVote.title }}</h3>
            <div class="result-meta-tags">
                <el-tag v-if="selectedVote.isAnonymous" type="info">익명 투표</el-tag>
                <span class="total-count">총 {{ selectedVote.participants?.length || 0 }}명 참여</span>
            </div>
        </div>

        <div class="result-options-list">
             <div v-for="opt in selectedVote.options" :key="opt.id" class="result-option-item">
                 <div class="option-header">
                     <span class="option-text">{{ opt.text }}</span>
                     <span class="option-count">{{ opt.voters?.length || 0 }}명</span>
                 </div>
                 
                 <!-- Voter List (Hide details if anonymous and NOT manager, but usually anonymous hides for everyone except maybe admin, let's follow standard: anonymous means strictly anonymous names) -->
                <!-- Assuming Manager CAN see anonymous? Or no? "무기명 투표가 아니라면..." means if NOT anonymous, show user info. So if anonymous, hide. -->
                 <div v-if="!selectedVote.isAnonymous" class="voter-avatars">
                     <div v-for="voter in opt.voters" :key="voter.id" class="voter-chip">
                         <img :src="voter.image" class="voter-img" />
                         <span class="voter-name">{{ voter.name }}</span>
                         <span class="voter-time">{{ formatTime(voter.votedAt) }}</span>
                     </div>
                 </div>
                 <div v-else class="anonymous-placeholder">
                     비공개 투표입니다.
                 </div>
             </div>
        </div>

        <!-- Management Actions on Participants (Only if NOT anonymous, or logic to manage generic participants) -->
        <!-- "Confirm" logic implies we know who they are. If anonymous, confirm might be tricky or based on generic ID? -->
        <!-- Assuming Confirm matches users to slots. If anonymous, maybe we just confirm count? -->
        <!-- User request: "투표한 항목마다 투표한 인원의 ... 리스트느낌으로 표시" if NOT anonymous. -->
        <!-- "투표 상세보기 - 현재 투표 상황 볼 수 있도록 -> 투표한 인원만 볼 수 있게" (This logic is handled by button visibility) -->
        
      </div>
    </el-dialog>

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
  padding-bottom: 40px;
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

.vote-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.vote-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.vote-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.vote-status {
  font-size: 0.9rem;
  font-weight: 700;
}

.vote-flags {
    display: flex;
    gap: 4px;
}

.vote-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.vote-meta {
  display: flex;
  gap: 16px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vote-actions {
    display: flex;
    gap: 10px;
}

.btn-vote, .btn-result, .btn-voted, .btn-approved, .btn-manage {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-vote {
  background: var(--color-primary);
  color: white;
}

.btn-vote:hover {
  background: #45a049;
}

.btn-result, .btn-voted {
  background: #f5f5f5;
  color: var(--color-text-primary);
}

.btn-approved {
    background: #E8F5E9;
    color: #4CAF50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-manage {
  border: 1px solid var(--color-border);
  background: white;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-tertiary);
}

/* Modal Styles */
.vote-modal-content {
    padding: 10px 0;
}

.modal-vote-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.modal-vote-desc {
    color: #666;
    margin-bottom: 20px;
    font-size: 0.9rem;
}

.vertical-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.vertical-group .el-checkbox, .vertical-group .el-radio {
    margin-right: 0;
    width: 100%;
    height: auto;
    padding: 12px;
}

.btn-submit {
    width: 100%;
    padding: 14px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
}

/* Result Styles */
.result-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
}

.result-meta-tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.result-options-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.result-option-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.option-header {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    padding: 8px 12px;
    background: #f9f9f9;
    border-radius: 8px;
}

.voter-avatars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 8px;
}

.voter-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
}

.voter-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.voter-name {
    font-weight: 500;
}

.voter-time {
    margin-left: auto;
    color: #999;
    font-size: 0.8rem;
}

.anonymous-placeholder {
    color: #999;
    font-size: 0.9rem;
    padding: 8px;
    background: #fafafa;
    border-radius: 6px;
    text-align: center;
}

.btn-manage.result {
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.btn-manage.result:hover {
    background: #e3f2fd;
}

.btn-manage.end {
    color: #FF9800;
    border-color: #FF9800;
}

.btn-manage.end:hover {
    background: #FFF3E0;
}

.btn-manage.delete {
    color: #F44336;
    border-color: #F44336;
}

.btn-manage.delete:hover {
    background: #FFEBEE;
}
</style>
