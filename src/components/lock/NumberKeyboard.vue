<script setup lang="ts">
defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  input: [digit: number]
  delete: []
}>()

interface Key {
  value: number
  type: 'number' | 'empty' | 'delete'
}

const keys: Key[][] = [
  [
    { value: 1, type: 'number' },
    { value: 2, type: 'number' },
    { value: 3, type: 'number' },
  ],
  [
    { value: 4, type: 'number' },
    { value: 5, type: 'number' },
    { value: 6, type: 'number' },
  ],
  [
    { value: 7, type: 'number' },
    { value: 8, type: 'number' },
    { value: 9, type: 'number' },
  ],
  [
    { value: -1, type: 'empty' },
    { value: 0, type: 'number' },
    { value: -1, type: 'delete' },
  ],
]

function handleKey(key: Key) {
  if (key.type === 'number') {
    emit('input', key.value)
  } else if (key.type === 'delete') {
    emit('delete')
  }
}
</script>

<template>
  <div class="keyboard" :class="{ 'keyboard--disabled': disabled }">
    <div v-for="(row, ri) in keys" :key="ri" class="key-row">
      <div
        v-for="key in row"
        :key="`${ri}-${key.value}-${key.type}`"
        class="key"
        :class="{
          'key--number': key.type === 'number',
          'key--empty': key.type === 'empty',
          'key--delete': key.type === 'delete',
        }"
        @click="handleKey(key)"
      >
        <template v-if="key.type === 'number'">
          <span class="key-digit">{{ key.value }}</span>
        </template>
        <template v-else-if="key.type === 'delete'">
          <svg class="key-backspace" viewBox="0 0 24 24" aria-label="回退">
            <path
              fill="currentColor"
              d="M22 3H7c-.69 0-1.23.35-1.6.88L0 12l5.4 8.11c.37.53.91.89 1.6.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"
            />
          </svg>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-xl);
}

.keyboard--disabled {
  pointer-events: none;
  opacity: 0.4;
}

.key-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.key-row:last-child {
  margin-bottom: 0;
}

.key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 56px;
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.15s;
}

.key--number {
  background: var(--color-bg-white);
  color: var(--color-text);
  font-size: 24px;
  font-weight: 500;
}

.key--number:active {
  background: var(--color-border);
}

.key--empty {
  background: transparent;
  cursor: default;
}

.key--delete {
  background: transparent;
  color: var(--color-text-secondary);
}

.key--delete:active {
  background: var(--color-border);
}

.key-digit {
  line-height: 1;
}

.key-backspace {
  width: 28px;
  height: 28px;
}
</style>
