import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { hashPassword, constantTimeCompare } from '@/utils/crypto'
import { db } from '@/db'

const MAX_ERRORS = 5
const LOCKOUT_DURATION = 30 * 1000

function loadErrorCount(): number {
  return Number(sessionStorage.getItem('lock_error_count') || '0')
}

function loadLockUntil(): number {
  return Number(sessionStorage.getItem('lock_until') || '0')
}

const errorCount = ref(loadErrorCount())
const lockUntil = ref(loadLockUntil())

function saveErrorCount(count: number) {
  sessionStorage.setItem('lock_error_count', String(count))
}

function saveLockUntil(until: number) {
  sessionStorage.setItem('lock_until', String(until))
}

export function useLock() {
  const router = useRouter()

  const isLockedOut = computed(() => Date.now() < lockUntil.value)

  function isPasswordSet(): boolean {
    return !!localStorage.getItem('pwd_hash')
  }

  async function verifyPassword(pwd: string): Promise<boolean> {
    if (isLockedOut.value) return false

    const storedHash = localStorage.getItem('pwd_hash')
    if (!storedHash) return false

    const inputHash = await hashPassword(pwd)
    if (constantTimeCompare(storedHash, inputHash)) {
      errorCount.value = 0
      lockUntil.value = 0
      saveErrorCount(0)
      saveLockUntil(0)
      return true
    }

    errorCount.value++
    saveErrorCount(errorCount.value)

    if (errorCount.value >= MAX_ERRORS) {
      lockUntil.value = Date.now() + LOCKOUT_DURATION
      saveLockUntil(lockUntil.value)
    }

    return false
  }

  async function createPassword(pwd: string) {
    const h = await hashPassword(pwd)
    localStorage.setItem('pwd_hash', h)
    localStorage.setItem('pwd_enabled', 'true')
    if (!localStorage.getItem('auto_lock_minutes')) {
      localStorage.setItem('auto_lock_minutes', '5')
    }
  }

  async function changePassword(oldPwd: string, newPwd: string): Promise<boolean> {
    const storedHash = localStorage.getItem('pwd_hash')
    if (!storedHash) return false

    const oldHash = await hashPassword(oldPwd)
    if (!constantTimeCompare(storedHash, oldHash)) return false

    const newHash = await hashPassword(newPwd)
    localStorage.setItem('pwd_hash', newHash)
    return true
  }

  async function resetPassword(): Promise<boolean> {
    try {
      await showConfirmDialog({
        title: '重置密码',
        message: '重置密码将清除所有数据（包括地点和消费记录），确定继续吗？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
    } catch {
      return false
    }

    localStorage.removeItem('pwd_hash')
    localStorage.removeItem('pwd_enabled')
    localStorage.removeItem('auto_lock_minutes')

    sessionStorage.removeItem('lock_error_count')
    sessionStorage.removeItem('lock_until')
    sessionStorage.removeItem('unlock_time')

    errorCount.value = 0
    lockUntil.value = 0
    saveErrorCount(0)
    saveLockUntil(0)

    await db.places.clear()
    await db.reviews.clear()

    router.push({ name: 'settings' })
    return true
  }

  function checkAutoLock(): boolean {
    const enabled = localStorage.getItem('pwd_enabled') === 'true'
    if (!enabled) return false

    const autoLockMinutes = Number(localStorage.getItem('auto_lock_minutes') || '5')
    if (autoLockMinutes === 0) return false

    const unlockTime = Number(sessionStorage.getItem('unlock_time') || '0')
    if (unlockTime === 0) return true

    return Date.now() - unlockTime > autoLockMinutes * 60 * 1000
  }

  function unlock(targetRoute: string) {
    sessionStorage.setItem('unlock_time', String(Date.now()))
    errorCount.value = 0
    lockUntil.value = 0
    saveErrorCount(0)
    saveLockUntil(0)
    // 用 replace 而非 push：解锁后用目标页替换掉历史中的锁屏页，避免残留导致
    // 后续 router.back()（如地图选点“确认”）退回锁屏页而陷入锁屏循环
    router.replace(targetRoute)
  }

  return {
    errorCount,
    lockUntil,
    isLockedOut,
    isPasswordSet,
    verifyPassword,
    createPassword,
    changePassword,
    resetPassword,
    checkAutoLock,
    unlock,
    MAX_ERRORS,
  }
}
