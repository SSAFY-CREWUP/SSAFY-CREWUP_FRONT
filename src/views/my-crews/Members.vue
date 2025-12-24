<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { Search, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const crewStore = useCrewStore()
const crewId = route.params.id

const searchQuery = ref('')
const activeSearch = ref('')
const loading = ref(false)

const fetchMembers = async () => {
  loading.value = true
  try {
    await crewStore.fetchMembers(crewId)
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
</script>

<template>
  <div class="members-view">
    <div class="page-header">
      <div class="header-text">
        <h2>멤버</h2>
        <p>함께 달리는 {{ crewStore.members.length }}명의 러너들</p>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="멤버 이름 검색"
          prefix-icon="Search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">검색</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="member-list-container" v-loading="loading">
      <el-table :data="filteredMembers" style="width: 100%">
        <!-- Profile Image & Name -->
        <el-table-column label="멤버" width="250">
          <template #default="scope">
            <div class="member-profile">
              <img :src="scope.row.profileImage || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" alt="Profile" class="profile-img" />
              <span class="member-name">{{ scope.row.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Role -->
        <el-table-column label="권한" width="120">
          <template #default="scope">
            <el-tag :type="getRoleBadgeType(scope.row.role)" size="small" effect="light">
              {{ formatRole(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Total Distance -->
        <el-table-column label="총 거리" prop="totalDistance">
          <template #default="scope">
            {{ scope.row.totalDistance }} km
          </template>
        </el-table-column>

        <!-- Average Pace -->
        <el-table-column label="평균 페이스" prop="averagePace">
          <template #default="scope">
            {{ scope.row.averagePace }}/km
          </template>
        </el-table-column>

        <!-- Join Date -->
        <el-table-column label="가입일" prop="joinedAt">
           <template #default="scope">
            {{ formatDate(scope.row.joinedAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.members-view {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-text p {
  color: var(--color-text-secondary);
  margin: 0;
}

.search-box {
  width: 250px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
}

.member-list-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  padding: 20px;
  overflow: hidden;
}

.member-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.member-name {
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
