<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NumberKeyboard from '@/components/lock/NumberKeyboard.vue'
import { useLock } from '@/composables/useLock'

const route = useRoute()
const { verifyPassword, unlock, isLockedOut, lockUntil, errorCount, MAX_ERRORS } = useLock()

const digits = ref<number[]>([])
const shaking = ref(false)
const redirect = computed(() => (route.query.redirect as string) || '/')
const remainingSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

function updateRemaining() {
  const diff = lockUntil.value - Date.now()
  if (diff <= 0) {
    remainingSeconds.value = 0
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  } else {
    remainingSeconds.value = Math.ceil(diff / 1000)
  }
}

watch(isLockedOut, (locked) => {
  if (locked) {
    updateRemaining()
    countdownTimer = setInterval(updateRemaining, 200)
    digits.value = []
  } else {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    remainingSeconds.value = 0
  }
}, { immediate: true })

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

function onInput(digit: number) {
  if (isLockedOut.value) return
  if (digits.value.length >= 4) return

  digits.value.push(digit)

  if (digits.value.length === 4) {
    handleSubmit()
  }
}

function onDelete() {
  if (digits.value.length > 0) {
    digits.value.pop()
  }
}

async function handleSubmit() {
  const pwd = digits.value.join('')
  const ok = await verifyPassword(pwd)

  if (ok) {
    unlock(redirect.value)
    return
  }

  shaking.value = true
  setTimeout(() => {
    shaking.value = false
    digits.value = []
  }, 500)
}

const remainingErrors = computed(() => MAX_ERRORS - errorCount.value)
</script>

<template>
  <div class="lock-screen">
    <div class="lock-content">
      <div class="lock-header">
        <div class="lock-icon">
          <van-icon name="lock" size="32" color="var(--color-primary)" />
        </div>
        <h2 class="lock-title">输入密码</h2>
      </div>

      <div :class="['dots-row', { shaking: shaking }]">
        <div
          v-for="i in 4"
          :key="i"
          :class="['dot', { filled: digits.length >= i }]"
        />
      </div>

      <div v-if="isLockedOut" class="lockout-msg">
        锁定中，请 {{ remainingSeconds }} 秒后重试
      </div>
      <div v-else-if="errorCount > 0" class="error-msg">
        密码错误，还剩 {{ remainingErrors }} 次机会
      </div>
      <div v-else class="hint-msg">
        请输入 4 位数字密码
      </div>
    </div>

    <div class="keyboard-area">
      <NumberKeyboard
        :disabled="isLockedOut"
        @input="onInput"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.lock-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--spacing-xl);
}

.lock-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  width: 100%;
}

.lock-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: 48px;
}

.lock-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: var(--border-thick);
  background: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-title {
  font-size: var(--font-size-xxl);
  color: var(--color-text);
  font-weight: 700;
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
}

.dots-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: transparent;
  transition: background-color 0.2s, border-color 0.2s;
}

.dot.filled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.shaking {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 50%, 90% { transform: translateX(-6px); }
  30%, 70% { transform: translateX(6px); }
}

.lockout-msg {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  min-height: 20px;
}

.error-msg {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  min-height: 20px;
}

.hint-msg {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  min-height: 20px;
}

.keyboard-area {
  width: 100%;
  padding-bottom: var(--safe-bottom);
}
</style>
