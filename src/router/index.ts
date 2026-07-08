import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/lock',
    name: 'lock',
    meta: { noAuth: true },
    component: () => import('@/views/LockScreen.vue'),
  },
  {
    path: '/',
    name: 'reviews',
    meta: { tabBar: true },
    component: () => import('@/views/ReviewListPage.vue'),
  },
  {
    path: '/reviews/add',
    name: 'addReview',
    component: () => import('@/views/AddReviewPage.vue'),
  },
  {
    path: '/reviews/edit/:id',
    name: 'editReview',
    component: () => import('@/views/AddReviewPage.vue'),
  },
  {
    path: '/places',
    name: 'places',
    meta: { tabBar: true },
    component: () => import('@/views/PlaceListPage.vue'),
  },
  {
    path: '/places/:id',
    name: 'placeDetail',
    component: () => import('@/views/PlaceDetailPage.vue'),
  },
  {
    path: '/places/add',
    name: 'addPlace',
    component: () => import('@/views/PlaceAddPage.vue'),
  },
  {
    path: '/places/edit/:id',
    name: 'editPlace',
    component: () => import('@/views/PlaceEditPage.vue'),
  },
  {
    path: '/places/map-pick',
    name: 'mapPick',
    component: () => import('@/views/MapPickerPage.vue'),
  },
  {
    path: '/stats',
    name: 'stats',
    meta: { tabBar: true },
    component: () => import('@/views/StatsPage.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { tabBar: true },
    component: () => import('@/views/SettingsPage.vue'),
  },
  {
    path: '/settings/categories',
    name: 'categoryManage',
    component: () => import('@/views/CategoryManagePage.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  if (to.meta.noAuth) {
    next()
    return
  }

  const pwdEnabled = localStorage.getItem('pwd_enabled') === 'true'
  if (!pwdEnabled) {
    next()
    return
  }

  const autoLockMinutes = Number(localStorage.getItem('auto_lock_minutes') || '5')
  const unlockTime = Number(sessionStorage.getItem('unlock_time') || '0')
  const now = Date.now()
  const isLocked = unlockTime === 0 || (autoLockMinutes > 0 && now - unlockTime > autoLockMinutes * 60 * 1000)

  if (isLocked) {
    next({ name: 'lock', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
