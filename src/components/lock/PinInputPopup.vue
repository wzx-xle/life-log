<script setup lang="ts">
import { ref, watch } from 'vue'
import NumberKeyboard from './NumberKeyboard.vue'

const props = defineProps<{
  show: boolean
  title: string
  subtitle?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  complete: [pin: string]
  cancel: []
}>()

const digits = ref<number[]>([])

// 每次打开、切换步骤（标题变化）或出错重试时清空已输入
watch(() => props.show, (v) => { if (v) digits.value = [] })
watch(() => props.title, () => { digits.value = [] })
watch(() => props.error, (e) => { if (e) digits.value = [] })

function onInput(digit: number) {
  if (digits.value.length >= 4) return
  digits.value.push(digit)
  if (digits.value.length === 4) {
    emit('complete', digits.value.join(''))
  }
}

function onDelete() {
  digits.value.pop()
}

function onCancel() {
  emit('update:show', false)
  emit('cancel')
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :close-on-click-overlay="false"
    @update:show="onCancel"
  >
    <div class="pin-popup">
      <h4 class="pin-title">{{ title }}</h4>
      <p class="pin-subtitle">{{ subtitle || '请输入 4 位数字密码' }}</p>

      <div class="dots-row">
        <div
          v-for="i in 4"
          :key="i"
          :class="['dot', { filled: digits.length >= i }]"
        />
      </div>

      <div class="pin-error">{{ error || '' }}</div>

      <NumberKeyboard :disabled="false" @input="onInput" @delete="onDelete" />

      <div class="pin-cancel">
        <van-button block round plain @click="onCancel">取消</van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.pin-popup {
  padding: var(--spacing-xl) 0 calc(var(--spacing-md) + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pin-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.pin-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
}

.dots-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
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

.pin-error {
  min-height: 20px;
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.pin-cancel {
  width: 100%;
  padding: 0 var(--spacing-lg);
}
</style>
