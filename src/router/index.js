import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        // Auth
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/auth/Login.vue'),
            meta: { hideNavbar: true, hideFooter: true }
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/auth/Signup.vue'),
            meta: { hideNavbar: true, hideFooter: true }
        },
        {
            path: '/profile/setup',
            name: 'profile-setup',
            component: () => import('../views/auth/ProfileSetup.vue'),
            meta: { hideNavbar: true, hideFooter: true }
        },
        {
            path: '/onboarding',
            name: 'onboarding',
            component: () => import('../views/auth/Onboarding.vue'),
            meta: { hideNavbar: true, hideFooter: true }
        },
        // Crew Exploration
        {
            path: '/crews',
            name: 'crews',
            component: () => import('../views/crews/CrewList.vue')
        },

        {
            path: '/crews/create',
            name: 'crews-create',
            component: () => import('../views/crews/CrewCreate.vue')
        },
        {
            path: '/crews/:id',
            name: 'crew-detail',
            component: () => import('../views/crews/CrewDetail.vue')
        },
        // My Crew Activity
        {
            path: '/my-crews',
            name: 'my-crews',
            component: () => import('../views/my-crews/Dashboard.vue')
        },
        {
            path: '/notifications',
            name: 'notifications',
            component: () => import('../views/Notifications.vue')
        },
        {
            path: '/crews/:id',
            component: () => import('../views/my-crews/Layout.vue'),
            children: [
                {
                    path: 'home',
                    name: 'crew-home',
                    component: () => import('../views/my-crews/Dashboard.vue') // Reusing Dashboard or should be separate Home? User tree has Dashboard in my-crews. Let's map to Dashboard for now or create a specific Home if needed. The user tree has `Dashboard.vue` in `my-crews`. I'll map /my-crews to Dashboard. For /crews/:id/home, I'll use Board or maybe I should have kept CrewHomeView? The user tree has `Board.vue`. I'll map 'home' to Board for now or maybe Dashboard? Let's look at the tree again.
                    // Tree: my-crews/Dashboard.vue, Board.vue, Schedule.vue...
                    // I'll map 'home' to Dashboard for now, assuming it's the crew's dashboard.
                },
                {
                    path: 'board',
                    name: 'crew-board',
                    component: () => import('../views/my-crews/Board.vue')
                },
                {
                    path: 'schedule',
                    name: 'crew-schedule',
                    component: () => import('../views/my-crews/Schedule.vue')
                },
                {
                    path: 'courses',
                    name: 'crew-courses',
                    component: () => import('../views/my-crews/Courses.vue')
                },
                {
                    path: 'courses/create',
                    name: 'crew-course-create',
                    component: () => import('../views/course/CourseCreateView.vue')
                },
                {
                    path: 'votes',
                    name: 'crew-votes',
                    component: () => import('../views/my-crews/Votes.vue')
                },
                {
                    path: 'members',
                    name: 'crew-members',
                    component: () => import('../views/my-crews/Members.vue')
                },
                {
                    path: 'special-sessions',
                    name: 'special-sessions',
                    component: () => import('../views/my-crews/SpecialSessions.vue')
                },
                // Crew Management
                {
                    path: 'manage/requests',
                    name: 'manage-requests',
                    component: () => import('../views/manage/RequestManage.vue')
                },
                {
                    path: 'settings',
                    name: 'crew-settings',
                    component: () => import('../views/manage/CrewSettings.vue')
                }
            ]
        },
        // Course Management
        {
            path: '/courses',
            name: 'courses',
            component: () => import('../views/courses/CourseList.vue')
        },
        {
            path: '/courses/create',
            name: 'courses-create',
            component: () => import('../views/course/CourseCreateView.vue')
        },
        {
            path: '/courses/:id',
            name: 'course-detail',
            component: () => import('../views/courses/CourseDetail.vue')
        },
        // My Page
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/profile/Profile.vue')
        },
        {
            path: '/profile/edit',
            name: 'profile-edit',
            component: () => import('../views/profile/ProfileEdit.vue')
        },
        {
            path: '/profile/activities',
            name: 'profile-activities',
            component: () => import('../views/profile/Activities.vue')
        },
        {
            path: '/profile/settings',
            name: 'profile-settings',
            component: () => import('../views/profile/Settings.vue')
        },
        // Demo Page
        {
            path: '/demo',
            name: 'demo',
            component: () => import('../views/ComponentsView.vue')
        }
    ]
})

export default router
