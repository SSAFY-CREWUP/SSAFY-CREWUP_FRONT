<script setup>
import { ref, onMounted, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import crewApi from '../../api/crew'
import CrewCard from '../../components/crew/CrewCard.vue'
import CrewFilter from '../../components/crew/CrewFilter.vue'
import Loading from '../../components/common/Loading.vue'

// State
const crews = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const totalElements = ref(0)

// Filters & Search
const searchQuery = ref('')
const activeFilters = ref({})
const sortBy = ref('latest')
const sortDirection = ref('desc')

// Infinite Scroll Target
const loadMoreTrigger = ref(null)

// Fetch Crews
const fetchCrews = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return

  loading.value = true
  
  if (reset) {
    page.value = 1
    crews.value = []
    hasMore.value = true
  }

  try {
    const params = {
      page: page.value,
      size: 12,
      search: searchQuery.value,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
      ...activeFilters.value
    }

    const response = await crewApi.getCrews(params)
    const { content, last, totalElements: total } = response.data

    if (reset) {
      crews.value = content
    } else {
      crews.value.push(...content)
    }

    hasMore.value = !last
    totalElements.value = total
    page.value++
  } catch (error) {
    console.error('Failed to fetch crews:', error)
  } finally {
    loading.value = false
  }
}

// Search Handler
const handleSearch = () => {
  fetchCrews(true)
}

// Filter Change Handler
const handleFilterChange = (filters) => {
  activeFilters.value = filters
  fetchCrews(true)
}

// Sort Change Handler
const handleSortChange = (type) => {
  if (sortBy.value === type) {
    // Toggle direction
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  } else {
    // New sort type, default to desc for latest/popular, asc for pace?
    // User said "asc/desc toggle". Let's default to desc for all for consistency, or:
    // Latest: desc (newest first)
    // Popular: desc (most members first)
    // Pace: asc (fastest first? or slowest? usually pace is number, smaller is faster. But user might want "fastest" first. 
    // Let's default to 'asc' for pace (smaller number), 'desc' for others.
    sortBy.value = type
    sortDirection.value = type === 'pace' ? 'asc' : 'desc'
  }
  fetchCrews(true)
}

// Infinite Scroll
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value) {
      fetchCrews()
    }
  }
)

onMounted(() => {
  fetchCrews(true)
})
</script>

<template>
  <div class="crew-list-view">
    <!-- Header: Search Bar -->
    <div class="search-header">
      <div class="search-container">
        <div class="search-input-wrapper">
          <el-icon class="search-icon"><Search /></el-icon>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="크루 이름, 지역 검색" 
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">검색</button>
        </div>
      </div>
    </div>

    <div class="content-container">
      <!-- Sidebar: Filters -->
      <aside class="sidebar">
        <CrewFilter @filter-change="handleFilterChange" />
      </aside>

      <!-- Main: Grid -->
      <main class="main-content">
        <!-- Sort & Count -->
        <!-- Sort & Count -->
        <div class="list-header">
          <span class="total-count">전체 {{ totalElements }}개</span>
          <div class="sort-buttons">
            <button 
              class="sort-btn" 
              :class="{ active: sortBy === 'latest' }"
              @click="handleSortChange('latest')"
            >
              최신순
              <span v-if="sortBy === 'latest'">{{ sortDirection === 'desc' ? '↓' : '↑' }}</span>
            </button>
            <span class="divider">|</span>
            <button 
              class="sort-btn" 
              :class="{ active: sortBy === 'popular' }"
              @click="handleSortChange('popular')"
            >
              인기순
              <span v-if="sortBy === 'popular'">{{ sortDirection === 'desc' ? '↓' : '↑' }}</span>
            </button>
            <span class="divider">|</span>
            <button 
              class="sort-btn" 
              :class="{ active: sortBy === 'pace' }"
              @click="handleSortChange('pace')"
            >
              페이스순
              <span v-if="sortBy === 'pace'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div v-if="crews.length > 0" class="crew-grid">
          <CrewCard v-for="crew in crews" :key="crew.id" :crew="crew" />
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <el-empty description="검색 결과가 없습니다." />
        </div>

        <!-- Loading Spinner & Infinite Scroll Trigger -->
        <div ref="loadMoreTrigger" class="loading-trigger">
          <Loading v-if="loading" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.crew-list-view {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

/* Search Header */
.search-header {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 60px; /* Adjust based on actual Navbar height */
  z-index: 99;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-input-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 1px solid var(--color-border-medium);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  background-color: var(--color-bg-tertiary);
}

.search-input:focus {
  border-color: var(--color-primary);
  background-color: white;
  box-shadow: 0 0 0 4px var(--color-primary-50);
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background-color: var(--color-primary-600);
}

/* Content Layout */
.content-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 40px;
  align-items: flex-start; /* Important for sticky sidebar */
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 160px; /* Header (60) + Search (approx 80) + gap */
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  /* Hide scrollbar for cleaner look */
  scrollbar-width: thin;
}

.main-content {
  flex: 1;
  min-width: 0; /* Prevents flex item from overflowing */
}

/* List Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.total-count {
  font-weight: 700;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.sort-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

.sort-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.sort-btn.active {
  color: var(--color-primary);
  font-weight: 700;
}

.sort-btn:hover {
  color: var(--color-text-primary);
}

.divider {
  color: var(--color-border-medium);
  font-size: 0.8rem;
  height: 12px;
  width: 1px;
  background-color: var(--color-border-medium);
}

/* Grid */
.crew-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Empty State */
.empty-state {
    padding: 60px 0;
    text-align: center;
}

/* Loading */
.loading-trigger {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
}

/* Responsive */
@media (max-width: 1200px) {
    .crew-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 900px) {
  .content-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
    margin-bottom: 20px;
  }

  .crew-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-header {
    top: 56px; 
  }
}

@media (max-width: 600px) {
    .crew-grid {
        grid-template-columns: 1fr;
    }
    
    .sort-buttons {
        gap: 8px;
        padding: 4px 8px;
    }
}
</style>
