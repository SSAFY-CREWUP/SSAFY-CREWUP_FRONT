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
  return crewStore.members.filter(m => m.name.toLowerCase().includes(query))
})

const getRoleBadgeType = (role) => {
  if (role === '크루장') return 'danger'
  if (role === '매니저') return 'warning'
  return 'info'
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

    <div class="member-grid" v-loading="loading">
      <div v-for="member in filteredMembers" :key="member.id" class="member-card">
        <div class="member-profile">
          <img :src="member.image" alt="Profile" class="profile-img" />
          <div class="member-info">
            <div class="name-row">
              <h3 class="name">{{ member.name }}</h3>
              <el-tag :type="getRoleBadgeType(member.role)" size="small" effect="light">
                {{ member.role }}
              </el-tag>
            </div>
            <div class="stats">
              <span>총 거리 {{ member.distance }}</span>
              <span class="dot">•</span>
              <span>평균 페이스 {{ member.pace }}/km</span>
            </div>
          </div>
        </div>
        <div class="join-date">
          {{ member.joinDate }} 가입
        </div>
      </div>
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

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.member-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.member-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}

.stats {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.dot {
  margin: 0 4px;
}

.join-date {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  text-align: right;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
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
</style>
