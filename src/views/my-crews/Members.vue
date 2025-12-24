<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Search, UserFilled, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

// Mock current User Role - In real app, this comes from store/auth
const currentUserRole = ref('leader') // 'leader', 'manager', 'member'

const activeTab = ref('members')
const searchQuery = ref('')
const activeSearch = ref('')
const loading = ref(false)

const fetchMembers = async () => {
  loading.value = true
  try {
    await crewStore.fetchMembers(crewId)
    if (['leader', 'manager'].includes(currentUserRole.value)) {
        await crewStore.fetchWaitingMembers(crewId)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMembers()
})

const handleSearch = () => {
  activeSearch.value = searchQuery.value
}

const filteredMembers = computed(() => {
  if (!activeSearch.value) return crewStore.members
  const query = activeSearch.value.toLowerCase()
  return crewStore.members.filter(m => m.nickname.toLowerCase().includes(query))
})

const pendingRequests = computed(() => crewStore.requests || [])

const getRoleBadgeType = (role) => {
  if (role === 'LEADER') return 'danger'
  if (role === 'MANAGER') return 'warning'
  return 'info'
}

const formatRole = (role) => {
  const roleMap = {
    'LEADER': '크루장',
    'MANAGER': '매니저',
    'MEMBER': '정회원'
  }
  return roleMap[role] || role
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}

// Application Management
const approveMember = async (member) => {
    try {
        await ElMessageBox.confirm(`${member.nickname}님의 가입을 승인하시겠습니까?`, '가입 승인', {
            confirmButtonText: '승인',
            cancelButtonText: '취소',
            type: 'success',
            customClass: 'premium-message-box'
        })
        await crewStore.approveRequest(crewId, member.id || member.memberId) // Adjust based on API response structure
        // Note: Store's approveRequest uses 'requestId', check if it maps to memberId or separate ID
        // The api js mocks getRequests returning objects with 'id'. Real api uses memberId probably.
        // Assuming wait-list item has a unique ID used for approval.
        ElMessage.success('승인되었습니다.')
        fetchMembers()
    } catch (e) {
        if (e !== 'cancel') ElMessage.error('승인 처리 중 오류가 발생했습니다.')
    }
}

const rejectMember = async (member) => {
    try {
        await ElMessageBox.confirm(`${member.nickname}님의 가입을 거절하시겠습니까?`, '가입 거절', {
             confirmButtonText: '거절',
             cancelButtonText: '취소',
             type: 'warning',
             customClass: 'premium-message-box'
        })
        // Simple reject without reason for now as per minimal UI, or add prompt if needed
        await crewStore.rejectRequest(crewId, member.id || member.memberId)
        ElMessage.success('거절되었습니다.')
        fetchMembers()
    } catch (e) {
        if (e !== 'cancel') ElMessage.error('거절 처리 중 오류가 발생했습니다.')
    }
}
</script>

<template>
  <div class="members-view">
    <div class="page-header">
      <div class="header-text">
        <h2>멤버 관리</h2>
        <p>함께 달리는 {{ crewStore.members.length }}명의 러너들</p>
      </div>
      
      <div class="header-actions">
           <div class="search-box">
            <el-input
            v-model="searchQuery"
            placeholder="멤버 이름 검색"
            prefix-icon="Search"
            @keyup.enter="handleSearch"
            class="premium-input-search"
            >
            </el-input>
        </div>
      </div>
    </div>

    <!-- Tabs for Managers -->
    <el-tabs v-if="['leader', 'manager'].includes(currentUserRole)" v-model="activeTab" class="member-tabs">
        <el-tab-pane label="멤버 목록" name="members"></el-tab-pane>
        <el-tab-pane label="가입 신청" name="applications">
             <template #label>
                <span class="custom-tab-label">
                    가입 신청
                    <el-badge v-if="pendingRequests.length > 0" :value="pendingRequests.length" class="tab-badge" type="danger" />
                </span>
            </template>
        </el-tab-pane>
    </el-tabs>

    <div class="content-container" v-loading="loading">
        <!-- Members List -->
        <div v-if="activeTab === 'members'" class="member-list">
             <el-table 
                :data="filteredMembers" 
                style="width: 100%" 
                :header-cell-style="{ background: '#F9FAFB', color: '#6B7280', fontWeight: '600' }"
                row-class-name="premium-table-row"
            >
                <!-- Profile Image & Name -->
                <el-table-column label="멤버" min-width="200">
                <template #default="scope">
                    <div class="member-profile">
                    <img :src="scope.row.profileImage || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" alt="Profile" class="profile-img" />
                    <span class="member-name">{{ scope.row.nickname }}</span>
                    </div>
                </template>
                </el-table-column>

                <!-- Role -->
                <el-table-column label="권한" width="120" align="center">
                <template #default="scope">
                    <el-tag :type="getRoleBadgeType(scope.row.role)" size="small" effect="light" round class="role-badge">
                    {{ formatRole(scope.row.role) }}
                    </el-tag>
                </template>
                </el-table-column>

                <!-- Stats -->
                <el-table-column label="총 거리" prop="totalDistance" align="right">
                <template #default="scope">
                    <span class="stat-text">{{ scope.row.totalDistance }} km</span>
                </template>
                </el-table-column>

                <el-table-column label="평균 페이스" prop="averagePace" align="right">
                <template #default="scope">
                    <span class="stat-text">{{ scope.row.averagePace }}/km</span>
                </template>
                </el-table-column>

                <!-- Join Date -->
                <el-table-column label="가입일" prop="joinedAt" align="right">
                <template #default="scope">
                    <span class="date-text">{{ formatDate(scope.row.joinedAt) }}</span>
                </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- Application List -->
        <div v-else class="application-list">
            <div v-if="pendingRequests.length === 0" class="empty-state">
                <p>대기 중인 가입 신청이 없습니다.</p>
            </div>
            <div v-else class="requests-grid">
                <div v-for="req in pendingRequests" :key="req.id" class="request-card">
                    <div class="req-header">
                         <img :src="req.profileImage || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="req-img" />
                         <div class="req-info">
                             <div class="req-name">{{ req.nickname || req.name }}</div>
                             <div class="req-meta">{{ req.location }} · {{ req.age }}세</div>
                         </div>
                    </div>
                    <div class="req-message">
                        "{{ req.message || '가입하고 싶습니다!' }}"
                    </div>
                    <div class="req-actions">
                        <button class="btn-action reject" @click="rejectMember(req)">
                            <el-icon><Close /></el-icon> 거절
                        </button>
                        <button class="btn-action approve" @click="approveMember(req)">
                            <el-icon><Check /></el-icon> 승인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.members-view {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-text h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #1F2937;
}

.header-text p {
  color: #6B7280;
  margin: 0;
  font-size: 0.95rem;
}

.search-box {
  width: 280px;
}

/* Premium Search Input */
:deep(.premium-input-search .el-input__wrapper) {
    border-radius: 12px;
    background-color: #F9FAFB;
    box-shadow: none !important;
    border: 1px solid #E5E7EB;
    padding: 8px 16px;
    transition: all 0.2s;
}

:deep(.premium-input-search .el-input__wrapper:hover) {
    background-color: white;
    border-color: #D1D5DB;
}

:deep(.premium-input-search .el-input__wrapper.is-focus) {
    background-color: white;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}

.content-container {
  background: white;
  border-radius: 20px;
  border: 1px solid #F3F4F6;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  min-height: 400px;
}

/* Member Table Styling */
:deep(.el-table .el-table__cell) {
    padding: 16px 0 !important; /* Increase vertical padding for all cells */
}

.member-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 8px; /* Slight left padding for the first column content */
}

.profile-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.member-name {
  font-weight: 700;
  color: #1F2937;
  font-size: 0.95rem;
}

.role-badge {
    border: none;
    padding: 4px 12px;
    font-weight: 600;
}

.stat-text {
    font-weight: 600;
    color: #4B5563;
}

.date-text {
    color: #9CA3AF;
    font-size: 0.9rem;
}

/* Application List Grid */
.application-list {
    padding: 24px;
    background: #F9FAFB;
}

.requests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.request-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    border: 1px solid #F3F4F6;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
}

.request-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.req-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.req-img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.req-name {
    font-weight: 700;
    color: #1F2937;
    font-size: 1rem;
}

.req-meta {
    font-size: 0.85rem;
    color: #6B7280;
}

.req-message {
    background: #F3F4F6;
    padding: 12px;
    border-radius: 10px;
    color: #4B5563;
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.4;
    font-style: italic;
    flex-grow: 1;
}

.req-actions {
    display: flex;
    gap: 10px;
}

.btn-action {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
}

.btn-action.approve {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}

.btn-action.approve:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
}

.btn-action.reject {
    background: #F3F4F6;
    color: #6B7280;
}

.btn-action.reject:hover {
    background: #FEF2F2;
    color: #EF4444;
}

.empty-state {
    text-align: center;
    padding: 60px 0;
    color: #9CA3AF;
}

/* Tabs */
.member-tabs {
    margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
    background-color: transparent !important;
}

:deep(.el-tabs__item) {
    font-size: 1rem;
    font-weight: 600;
    color: #6B7280;
    padding: 0 20px !important;
}

:deep(.el-tabs__item.is-active) {
    color: #6366f1;
    font-weight: 800;
}

:deep(.el-tabs__active-bar) {
    background-color: #6366f1;
    height: 3px;
    border-radius: 3px;
}

.custom-tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab-badge :deep(.el-badge__content) {
    border: none;
    transform: translateY(-1px);
}
</style>
