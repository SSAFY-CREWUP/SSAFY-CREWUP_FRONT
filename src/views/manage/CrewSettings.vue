<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import Swal from 'sweetalert2'
import { Search, Filter, MoreFilled, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const crewStore = useCrewStore()
const activeTab = ref('requests')
const crewId = route.params.id

// Member Filter & Search
const searchQuery = ref('')
const roleFilter = ref('전체')
const sortBy = ref('joinDate')

onMounted(async () => {
  await Promise.all([
    crewStore.fetchRequests(crewId),
    crewStore.fetchMembers(crewId),
    crewStore.fetchWithdrawnMembers(crewId)
  ])
})

// Computed Members
const filteredMembers = computed(() => {
  let result = [...crewStore.members]

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => m.name.toLowerCase().includes(query))
  }

  // Filter
  if (roleFilter.value !== '전체') {
    result = result.filter(m => m.role === roleFilter.value)
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'joinDate') return new Date(b.joinDate) - new Date(a.joinDate)
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    // Mock attendance sort
    return 0
  })

  return result
})

// Actions
const handleApprove = async (request) => {
  const result = await Swal.fire({
    title: '가입 승인',
    text: `${request.name}님의 가입을 승인하시겠습니까?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '승인',
    cancelButtonText: '취소',
    confirmButtonColor: '#4CAF50'
  })

  if (result.isConfirmed) {
    await crewStore.approveRequest(crewId, request.id)
    Swal.fire('승인 완료', '멤버가 추가되었습니다.', 'success')
    await crewStore.fetchMembers(crewId) // Refresh members
  }
}

const handleReject = async (request) => {
  const result = await Swal.fire({
    title: '가입 거절',
    input: 'textarea',
    inputLabel: '거절 사유',
    inputPlaceholder: '거절 사유를 입력해주세요...',
    showCancelButton: true,
    confirmButtonText: '거절',
    cancelButtonText: '취소',
    confirmButtonColor: '#FF6B6B'
  })

  if (result.isConfirmed) {
    await crewStore.rejectRequest(crewId, request.id, result.value)
    Swal.fire('거절 완료', '가입 요청이 거절되었습니다.', 'info')
  }
}

const handleRoleChange = async (member, newRole) => {
  await crewStore.updateMemberRole(crewId, member.id, newRole)
  Swal.fire('권한 변경', `${member.name}님의 등급이 ${newRole}(으)로 변경되었습니다.`, 'success')
}

const handleKick = async (member) => {
  const result = await Swal.fire({
    title: '강제 탈퇴',
    text: `정말 ${member.name}님을 강제 탈퇴시키겠습니까?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '강제 탈퇴',
    cancelButtonText: '취소',
    confirmButtonColor: '#d33'
  })

  if (result.isConfirmed) {
    await crewStore.kickMember(crewId, member.id)
    Swal.fire('탈퇴 처리', '해당 멤버가 강제 탈퇴되었습니다.', 'success')
    await crewStore.fetchWithdrawnMembers(crewId) // Refresh withdrawn
  }
}
</script>

<template>
  <div class="crew-settings-view">
    <div class="page-header">
      <h1>⚙️ 크루 설정</h1>
      <p>크루 멤버 관리 및 설정을 변경할 수 있습니다.</p>
    </div>

    <el-tabs v-model="activeTab" class="manage-tabs">
      <!-- Tab 1: Requests -->
      <el-tab-pane name="requests">
        <template #label>
          <span class="tab-label">
            가입 신청
            <el-badge :value="crewStore.requests.length" class="badge" type="danger" v-if="crewStore.requests.length > 0" />
          </span>
        </template>

        <div v-if="crewStore.requests.length === 0" class="empty-state">
          <el-icon :size="50"><UserFilled /></el-icon>
          <p>대기 중인 가입 신청이 없습니다.</p>
        </div>

        <div class="request-grid" v-else>
          <div v-for="req in crewStore.requests" :key="req.id" class="request-card">
            <div class="card-header">
              <div class="user-info">
                <img :src="req.image" alt="Profile" class="profile-img" />
                <div>
                  <h3>{{ req.name }} <span class="age-gender">({{ req.age }}세, {{ req.gender }})</span></h3>
                  <div class="meta">
                    <span>📍 {{ req.location }}</span>
                    <span>🏃 {{ req.pace }}</span>
                  </div>
                </div>
              </div>
              <span class="date">{{ req.date }}</span>
            </div>
            
            <div class="message-box">
              <p>"{{ req.message }}"</p>
            </div>

            <div class="action-buttons">
              <button class="btn-reject" @click="handleReject(req)">❌ 거절</button>
              <button class="btn-approve" @click="handleApprove(req)">✅ 승인</button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Members -->
      <el-tab-pane label="멤버 목록" name="members">
        <div class="table-controls">
          <div class="left-controls">
            <el-input
              v-model="searchQuery"
              placeholder="이름 검색"
              prefix-icon="Search"
              class="search-input"
            />
          </div>
          <div class="right-controls">
            <el-select v-model="roleFilter" placeholder="등급 필터" style="width: 120px">
              <el-option label="전체" value="전체" />
              <el-option label="크루장" value="크루장" />
              <el-option label="매니저" value="매니저" />
              <el-option label="정회원" value="정회원" />
            </el-select>
            <el-select v-model="sortBy" placeholder="정렬" style="width: 120px">
              <el-option label="가입일순" value="joinDate" />
              <el-option label="이름순" value="name" />
            </el-select>
          </div>
        </div>

        <el-table :data="filteredMembers" style="width: 100%">
          <el-table-column label="프로필" width="80">
            <template #default="scope">
              <img :src="scope.row.image" class="table-profile-img" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="이름" width="120" />
          <el-table-column prop="role" label="등급" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.role === '크루장' ? 'danger' : (scope.row.role === '매니저' ? 'warning' : 'info')">
                {{ scope.row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="attendance" label="출석률" width="100" />
          <el-table-column prop="distance" label="활동 거리" width="100" />
          <el-table-column prop="joinDate" label="가입일" />
          <el-table-column label="관리" width="80" fixed="right">
            <template #default="scope">
              <el-dropdown trigger="click" v-if="scope.row.role !== '크루장'">
                <span class="el-dropdown-link">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="scope.row.role === '정회원'" @click="handleRoleChange(scope.row, '매니저')">매니저로 승격</el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.role === '매니저'" @click="handleRoleChange(scope.row, '정회원')">정회원으로 강등</el-dropdown-item>
                    <el-dropdown-item divided class="danger-text" @click="handleKick(scope.row)">강제 탈퇴</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 3: Withdrawn -->
      <el-tab-pane label="탈퇴 회원" name="withdrawn">
        <el-table :data="crewStore.withdrawnMembers" style="width: 100%">
          <el-table-column label="프로필" width="80">
            <template #default="scope">
              <img :src="scope.row.image" class="table-profile-img grayscale" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="이름" width="120" />
          <el-table-column prop="withdrawDate" label="탈퇴일" width="150" />
          <el-table-column prop="reason" label="탈퇴 사유" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.crew-settings-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--color-text-secondary);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  margin-top: -2px;
}

/* Request Card */
.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.request-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  gap: 12px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.age-gender {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.meta {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.message-box {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-reject {
  background: #fff0f0;
  color: #d32f2f;
}

.btn-reject:hover {
  background: #ffe0e0;
}

.btn-approve {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-approve:hover {
  background: #c8e6c9;
}

/* Table Controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-top: 10px;
}

.search-input {
  width: 250px;
}

.right-controls {
  display: flex;
  gap: 10px;
}

.table-profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.grayscale {
  filter: grayscale(100%);
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.danger-text {
  color: var(--color-energy-red);
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
</style>
