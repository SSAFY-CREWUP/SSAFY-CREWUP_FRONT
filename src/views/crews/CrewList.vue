<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import crewApi from '../../api/crew'
import CrewCard from '../../components/crew/CrewCard.vue'
import CrewFilter from '../../components/crew/CrewFilter.vue'
import Loading from '../../components/common/Loading.vue'
import { Search, InfoFilled } from '@element-plus/icons-vue'

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

// Parallax State
const mouseX = ref(0)
const mouseY = ref(0)

// Mouse Move Handler for Parallax
const handleMouseMove = (e) => {
  const { innerWidth, innerHeight } = window
  mouseX.value = (e.clientX - innerWidth / 2) / 20
  mouseY.value = (e.clientY - innerHeight / 2) / 20
}

onMounted(() => {
  fetchCrews(true)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

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
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  } else {
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
</script>

<template>
  <div class="crew-list-view">
    
    <!-- Hero Section (Urban Night + Parallax) -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="orb orb-1" :style="{ transform: `translate(${mouseX * -1.5}px, ${mouseY * -1.5}px)` }"></div>
        <div class="orb orb-2" :style="{ transform: `translate(${mouseX}px, ${mouseY}px)` }"></div>
        <div class="glow-overlay"></div>
      </div>
      
      <div class="hero-content stagger-container">
        <h1 class="hero-title stagger-item">
          함께 달리는 즐거움,<br>
          <span class="highlight-text">새로운 크루</span>를 만나보세요
        </h1>
        <p class="hero-subtitle stagger-item">나의 페이스와 스타일에 딱 맞는 러닝 메이트가 기다리고 있어요.</p>
        
        <!-- Glass Search Bar -->
        <div class="search-glass-wrapper stagger-item">
          <el-icon class="search-icon"><Search /></el-icon>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="지역이나 크루 이름을 검색해보세요" 
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <span>검색</span>
            <span class="btn-shine"></span>
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content (Clean Layout) -->
    <div class="content-wrapper">
      
      <!-- Sticky Filter Sidebar -->
      <aside class="sidebar">
        <CrewFilter @filter-change="handleFilterChange" />
      </aside>

      <!-- Main List Area -->
      <main class="main-area">
        <!-- List Header -->
        <div class="list-header">
          <div class="count-badge">
            <span class="count-label">전체 크루</span>
            <span class="count-value">{{ totalElements }}</span>
          </div>

          <div class="sort-controls">
            <button 
              v-for="type in ['latest', 'popular', 'pace']"
              :key="type"
              class="sort-pill"
              :class="{ active: sortBy === type }"
              @click="handleSortChange(type)"
            >
              {{ type === 'latest' ? '최신순' : type === 'popular' ? '인기순' : '페이스순' }}
              <span class="arrow" v-if="sortBy === type">
                {{ sortDirection === (type === 'pace' ? 'asc' : 'desc') ? '↓' : '↑' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Crew Grid -->
        <div v-if="crews.length > 0" class="crew-grid">
          <CrewCard v-for="crew in crews" :key="crew.id" :crew="crew" />
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon-wrapper">
            <el-icon :size="48"><InfoFilled /></el-icon>
          </div>
          <p>조건에 맞는 크루를 찾지 못했어요.<br>검색 조건을 변경해보세요.</p>
        </div>

        <!-- Loading -->
        <div ref="loadMoreTrigger" class="loading-area">
          <Loading v-if="loading" />
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.crew-list-view {
  min-height: 100vh;
  background-color: #f8fafc; /* Light Slate base */
  font-family: 'Inter', 'Apple SD Gothic Neo', sans-serif;
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 300px; /* Reduced height */
  background: radial-gradient(circle at center, #2e3458 0%, #1e2040 60%, #0f1020 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: -50px; /* More overlap */
  padding-top: 60px; /* Navbar space */
}

.hero-bg {
  position: absolute; inset: 0; pointer-events: none;
}
.orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
  transition: transform 0.1s linear; /* Smooth mouse tracking */
  will-change: transform;
}
.orb-1 { width: 300px; height: 300px; background: #6366F1; top: -50px; left: 15%; }
.orb-2 { width: 220px; height: 220px; background: #EC4899; bottom: -20px; right: 15%; }

.glow-overlay {
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.3) 100%);
    pointer-events: none;
}

.hero-content {
  position: relative; z-index: 10;
  text-align: center; width: 100%; max-width: 800px; padding: 0 20px;
  display: flex; flex-direction: column; align-items: center;
}

.hero-title {
  font-size: 2.4rem; /* Slightly smaller for natural look */
  font-weight: 800; color: white;
  margin-bottom: 16px; line-height: 1.3; 
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.highlight-text {
    background: linear-gradient(to right, #818cf8, #c084fc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero-subtitle {
  font-size: 1.05rem; color: #cbd5e1; margin-bottom: 32px; font-weight: 500;
  opacity: 0.9;
}

/* Glass Search Bar */
.search-glass-wrapper {
  width: 100%; max-width: 600px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 6px;
  display: flex; align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}
.search-glass-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.3rem; color: #cbd5e1; margin-left: 16px; margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent; border: none; outline: none;
  font-size: 1rem; color: white;
  height: 48px;
}
.search-input::placeholder { color: #94a3b8; }

.search-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white; border: none;
  padding: 0 24px; height: 44px;
  border-radius: 40px;
  font-weight: 700; font-size: 0.95rem;
  cursor: pointer;
  position: relative; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex; align-items: center;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
.btn-shine {
    position: absolute; top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: skewX(-20deg);
    animation: shine 3s infinite;
}
@keyframes shine {
    0% { left: -100%; }
    20% { left: 200%; }
    100% { left: 200%; }
}

/* Animations */
.stagger-container .stagger-item {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Content Layout */
.content-wrapper {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; gap: 40px; position: relative;
  z-index: 20; /* Above Hero Bottom */
}

/* Sidebar */
.sidebar {
  width: 280px; flex-shrink: 0;
  position: sticky; top: 100px;
  height: fit-content;
}

/* Main Area */
.main-area { flex: 1; margin-top: 40px; }

/* List Header */
.list-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
}

.count-badge {
  display: flex; align-items: center; gap: 8px;
  background: white; padding: 8px 16px; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
}
.count-label { font-size: 0.9rem; color: #64748b; font-weight: 600; }
.count-value { font-size: 1.1rem; color: #1e1b4b; font-weight: 800; }

.sort-controls {
  display: flex; gap: 8px;
}
.sort-pill {
  background: white; border: 1px solid #e2e8f0;
  padding: 8px 16px; border-radius: 20px;
  color: #64748b; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 4px;
}
.sort-pill:hover { background: #f1f5f9; color: #334155; }
.sort-pill.active {
  background: #EEF2FF; color: #4F46E5; border-color: #6366F1;
}
.arrow { font-size: 0.8rem; font-weight: 800; }

/* Grid */
.crew-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}

/* Empty State */
.empty-state {
  margin-top: 60px; text-align: center;
  background: white; padding: 60px; border-radius: 24px;
  border: 1px dashed #cbd5e1;
}
.empty-icon-wrapper {
  width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%;
  display: flex; justify-content: center; align-items: center; margin: 0 auto 20px;
  color: #94a3b8;
}
.empty-state p {
  color: #64748b; font-size: 1rem; line-height: 1.6;
}

/* Loading */
.loading-area {
  height: 80px; display: flex; justify-content: center; align-items: center; margin-top: 40px;
}

/* Responsive */
@media (max-width: 1024px) {
  .crew-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .content-wrapper { flex-direction: column; }
  .sidebar { width: 100%; position: static; margin-top: 20px; }
  .hero-title { font-size: 2rem; }
  .hero-section { height: 320px; }
  .main-area { margin-top: 20px; }
}
@media (max-width: 600px) {
  .crew-grid { grid-template-columns: 1fr; }
  .list-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
