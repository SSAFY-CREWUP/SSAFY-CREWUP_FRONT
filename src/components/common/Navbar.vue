<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCrewStore } from '../../stores/crew'
import { useAuthStore } from '../../stores/auth'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const router = useRouter()
const crewStore = useCrewStore()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

const notifications = computed(() => crewStore.notifications)
const unreadNotifications = computed(() => crewStore.unreadCount)

onMounted(() => {
  crewStore.fetchNotifications()
  crewStore.fetchUnreadCount()
  crewStore.fetchMyCrews()
  authStore.fetchProfile()
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    await useAuthStore().logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/profile/settings')
  }
}

const handleCrewCommand = (command) => {
  if (command === 'create') {
    router.push('/crews/create')
  } else {
    router.push(`/crews/${command}/home`)
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleViewAllNotifications = async () => {
  await crewStore.markAllNotificationsRead()
  router.push('/notifications')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Left: Logo -->
      <div class="navbar-left">
        <RouterLink to="/crews" class="logo">
          <span class="logo-text">CrewUp</span>
        </RouterLink>
      </div>

      <!-- Center: Desktop Menu -->
      <div class="navbar-center desktop-only">
        <RouterLink to="/crews" class="nav-link" active-class="active">크루 찾기</RouterLink>

        
        <!-- My Crew Dropdown -->
        <el-dropdown trigger="click" @command="handleCrewCommand">
          <span class="nav-link dropdown-link" :class="{ active: $route.path.startsWith('/crews/') && $route.params.id }">
            내 크루 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
           <template #dropdown>
             <el-dropdown-menu>
               <el-dropdown-item v-if="crewStore.myCrews.length === 0" disabled>가입된 크루가 없습니다</el-dropdown-item>
               <el-dropdown-item v-else v-for="crew in crewStore.myCrews" :key="crew.id" :command="crew.id">{{ crew.name }}</el-dropdown-item>
               <el-dropdown-item divided command="create">크루 만들기</el-dropdown-item>
             </el-dropdown-menu>
           </template>
        </el-dropdown>

        <RouterLink to="/courses" class="nav-link" active-class="active">코스</RouterLink>
      </div>

      <!-- Right: Actions -->
      <div class="navbar-right desktop-only">
        <!-- Notifications -->
        <el-dropdown trigger="click" class="notification-dropdown">
          <div class="notification-trigger">
            <el-badge :value="unreadNotifications" :max="99" class="notification-badge" :hidden="unreadNotifications === 0">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="notification-menu">
              <div v-if="notifications.length === 0" class="empty-noti">
                알림이 없습니다.
              </div>
              <el-dropdown-item v-else v-for="item in notifications" :key="item.id" class="notification-item">
                <div class="notification-content">
                  <div class="noti-top">
                    <span class="noti-crew">{{ item.crewName }}</span>
                    <span class="noti-time">{{ item.relativeTime }}</span>
                  </div>
                  <p class="notification-title">{{ item.content }}</p>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided class="view-all" @click="handleViewAllNotifications">
                <span>모두 보기 →</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Profile -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="profile-trigger">
            <el-avatar :size="32" :src="authStore.user?.profileImage || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
            <span class="profile-name">{{ authStore.user?.nickname || 'Guest' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">내 프로필</el-dropdown-item>
              <el-dropdown-item command="settings">설정</el-dropdown-item>
              <el-dropdown-item divided command="logout">로그아웃</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Mobile Hamburger -->
      <div class="navbar-mobile-toggle mobile-only" @click="toggleMobileMenu">
        <el-icon :size="24"><Menu /></el-icon>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu mobile-only">
      <RouterLink to="/crews" class="mobile-nav-link" @click="isMobileMenuOpen = false">크루 찾기</RouterLink>
      <RouterLink to="/my-crews" class="mobile-nav-link" @click="isMobileMenuOpen = false">내 크루</RouterLink>
      <RouterLink to="/courses" class="mobile-nav-link" @click="isMobileMenuOpen = false">코스</RouterLink>
      <div class="mobile-divider"></div>
      <RouterLink to="/profile" class="mobile-nav-link" @click="isMobileMenuOpen = false">내 프로필</RouterLink>
      <RouterLink to="/profile/settings" class="mobile-nav-link" @click="isMobileMenuOpen = false">설정</RouterLink>
      <div class="mobile-nav-link logout" @click="handleCommand('logout'); isMobileMenuOpen = false">로그아웃</div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-light);
  height: 64px;
}

.navbar-container {
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Left */
.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

/* Center */
.navbar-center {
  display: flex;
  gap: var(--space-8);
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: color var(--duration-fast) var(--ease-default);
}

.nav-link:hover, .nav-link.active {
  color: var(--color-text-primary);
}

.dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Right */
.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.notification-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
}

.notification-trigger:hover {
  color: var(--color-text-primary);
}

.profile-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.profile-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

/* Notification Dropdown */
.notification-menu {
  width: 300px;
}

.notification-item {
  padding: var(--space-3) var(--space-4);
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.noti-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.noti-crew {
  font-weight: 700;
  color: var(--color-primary);
}

.noti-time {
  color: var(--color-text-tertiary);
}

.notification-title {
  font-weight: var(--font-medium);
  margin: 0;
  line-height: 1.4;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.empty-noti {
  padding: 20px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.view-all {
  text-align: center;
  color: var(--color-text-link);
  font-weight: var(--font-medium);
}

/* Mobile */
.mobile-only {
  display: none;
}

.navbar-mobile-toggle {
  cursor: pointer;
  color: var(--color-text-primary);
}

.mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-4) 0;
  display: flex;
  flex-direction: column;
}

.mobile-nav-link {
  padding: var(--space-3) var(--container-padding);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: var(--font-medium);
  transition: background-color var(--duration-fast);
}

.mobile-nav-link:hover {
  background-color: var(--color-bg-secondary);
}

.mobile-divider {
  height: 1px;
  background-color: var(--color-border-light);
  margin: var(--space-2) 0;
}

.logout {
  color: var(--color-accent-red);
  cursor: pointer;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }
}
</style>
