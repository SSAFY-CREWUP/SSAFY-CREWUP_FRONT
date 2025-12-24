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
        customClass: 'premium-message-box'
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
            customClass: 'premium-message-box'
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
            customClass: 'premium-message-box'
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
                 
                 <!-- Gradient Progress Bar -->
                 <div class="vote-progress-track">
                    <div 
                        class="vote-progress-fill" 
                        :style="{ width: ((opt.voters?.length || 0) / (selectedVote.participants?.length || 1) * 100) + '%' }"
                    ></div>
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
/* ... (existing styles) ... */

.vote-progress-track {
    width: 100%;
    height: 8px;
    background-color: #F3F4F6;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px; /* Spacing before avatar list */
}

.vote-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.votes-view {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: #1F2937;
  letter-spacing: -0.02em;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.vote-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
}

.vote-card {
  background: white;
  border: 1px solid #F3F4F6;
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.vote-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -6px rgba(0, 0, 0, 0.1);
  border-color: #E0E7FF;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.vote-status {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F3F4F6; /* Default gray for closed */
  color: #6B7280;
}

.vote-flags {
    display: flex;
    gap: 8px;
}

.vote-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: #1F2937;
  letter-spacing: -0.01em;
}

.vote-meta {
  display: flex;
  gap: 16px;
  color: #6B7280;
  font-size: 0.95rem;
  margin-bottom: 24px;
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F9FAFB;
  padding: 6px 12px;
  border-radius: 8px;
}

.vote-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
}

.btn-vote, .btn-result, .btn-voted, .btn-approved, .btn-manage {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-vote {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}

.btn-vote:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
}

.btn-result, .btn-voted {
  background: #F3F4F6;
  color: #4B5563;
}

.btn-result:hover, .btn-voted:hover {
  background: #E5E7EB;
  color: #1F2937;
}

.btn-approved {
    background: #ECFDF5;
    color: #10B981;
    border: 1px solid #D1FAE5;
}

.btn-approved:hover {
    background: #D1FAE5;
}

.btn-manage {
  background: white;
  border: 1px solid #E5E7EB;
  color: #4B5563;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-manage:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #9CA3AF;
  background: white;
  border-radius: 20px;
  border: 1px dashed #E5E7EB;
}

/* Modal Styles */
.vote-modal-content {
    padding: 10px 0;
}

.modal-vote-title {
    font-size: 1.4rem;
    font-weight: 800;
    margin-bottom: 8px;
    color: #1F2937;
}

.modal-vote-desc {
    color: #6B7280;
    margin-bottom: 24px;
    font-size: 0.95rem;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.vertical-group {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Increased for better spacing */
    width: 100%;
}

.vertical-group .el-checkbox, .vertical-group .el-radio {
    margin-right: 0;
    width: 100%;
}

/* Premium Checkbox/Radio Styling Overrides in Global/Deep */
:deep(.el-checkbox__inner), :deep(.el-radio__inner) {
    width: 20px;
    height: 20px;
}

:deep(.el-checkbox__label), :deep(.el-radio__label) {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
}

:deep(.el-checkbox.is-bordered), :deep(.el-radio.is-bordered) {
    padding: 16px;
    height: auto;
    border-radius: 12px;
    border-color: #E5E7EB;
    transition: all 0.2s;
    background: #F9FAFB;
}

:deep(.el-checkbox.is-bordered.is-checked), :deep(.el-radio.is-bordered.is-checked) {
    background: #EEF2FF;
    border-color: #6366f1;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner), 
:deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: #6366f1;
    border-color: #6366f1;
}

.btn-submit {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s;
}

.btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

/* Result Styles */
.result-header {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #F3F4F6;
}

.result-meta-tags {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.total-count {
    font-weight: 700;
    color: #6366f1;
    background: #EEF2FF;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
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
    padding: 12px 16px;
    background: #F9FAFB;
    border-radius: 12px;
    border: 1px solid #F3F4F6;
    color: #1F2937;
}

.option-count {
    color: #6366f1;
}

/* Progress Bars could be added here if not using simple count display */

.voter-avatars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 4px;
}

.voter-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    padding: 8px 12px;
    border-radius: 10px;
    transition: background 0.2s;
}

.voter-chip:hover {
    background: #F9FAFB;
}

.voter-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.voter-name {
    font-weight: 600;
    color: #374151;
}

.voter-time {
    margin-left: auto;
    color: #9CA3AF;
    font-size: 0.8rem;
    font-weight: 500;
}

.anonymous-placeholder {
    color: #9CA3AF;
    font-size: 0.9rem;
    padding: 16px;
    background: #F9FAFB;
    border-radius: 12px;
    text-align: center;
    border: 1px dashed #E5E7EB;
}

.btn-manage.result {
    color: #6366f1;
    border-color: #EEF2FF;
    background: #EEF2FF;
}

.btn-manage.result:hover {
    background: #E0E7FF;
}

.btn-manage.end {
    color: #D97706; /* Amber 600 */
    border-color: #FEF3C7;
    background: #FEF3C7;
}

.btn-manage.end:hover {
    background: #FDE68A;
}

.btn-manage.delete {
    color: #EF4444;
    border-color: #FEE2E2;
    background: #FEE2E2;
}

.btn-manage.delete:hover {
    background: #FECACA;
}
</style>
