<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { 
  HomeFilled, List, Calendar, MapLocation, 
  TrendCharts, UserFilled, Bell, Setting, Menu 
} from '@element-plus/icons-vue'
import SidebarContent from '../../components/crew/SidebarContent.vue'

const route = useRoute()
const router = useRouter()
const crewStore = useCrewStore()
const crewId = route.params.id

const isMobileDrawerOpen = ref(false)

// Mock User Stats (In real app, fetch from store/API)
const userStats = ref({
  role: '크루장',
  attendance: '8/10',
  distance: '24km'
})

onMounted(async () => {
  // Fetch crew info if not already loaded
  if (!crewStore.currentCrew || crewStore.currentCrew.id !== parseInt(crewId)) {
    await crewStore.fetchCrew(crewId)
  }
})

const menuItems = [
  { name: '홈', path: 'home', icon: HomeFilled },
  { name: '게시판', path: 'board', icon: List },
  { name: '일정', path: 'schedule', icon: Calendar },
  { name: '투표', path: 'votes', icon: TrendCharts },
  { name: '멤버', path: 'members', icon: UserFilled }
]

const isActive = (path) => {
  return route.path.includes(`/crews/${route.params.id}/${path}`)
}

const navigateTo = (path) => {
  router.push(`/crews/${route.params.id}/${path}`)
  isMobileDrawerOpen.value = false // Close drawer on navigation
}
</script>

<template>
  <div class="crew-layout">
    <!-- Mobile Toggle Button -->
    <div class="mobile-toggle" @click="isMobileDrawerOpen = true">
      <el-icon :size="24"><Menu /></el-icon>
      <span class="mobile-toggle-text">메뉴</span>
    </div>

    <!-- Left Sidebar (Desktop) -->
    <aside class="sidebar desktop-only">
      <SidebarContent 
        :crew="crewStore.currentCrew" 
        :user-stats="userStats" 
        :menu-items="menuItems"
        :is-active="isActive"
        :navigate-to="navigateTo"
      />
    </aside>

    <!-- Mobile Drawer -->
    <el-drawer
      v-model="isMobileDrawerOpen"
      direction="ltr"
      size="80%"
      :with-header="false"
      class="mobile-sidebar-drawer"
    >
      <div class="drawer-content">
        <SidebarContent 
          :crew="crewStore.currentCrew" 
          :user-stats="userStats" 
          :menu-items="menuItems"
          :is-active="isActive"
          :navigate-to="navigateTo"
        />
      </div>
    </el-drawer>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.crew-layout {
  display: flex;
  min-height: calc(100vh - 64px); /* Subtract Navbar height */
  background-color: #F9FAFB; /* Global Light Gray Background */
  position: relative;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  right: 20px;
  background: #6366f1; /* Primary Indigo */
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  z-index: 9999;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.mobile-toggle:active {
  transform: scale(0.95);
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #F3F4F6;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-toggle {
    display: flex;
  }
  
  .main-content {
    padding: 16px;
    padding-bottom: 80px; /* Space for toggle button */
  }
}
</style>
