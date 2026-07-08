<script setup lang="ts">
defineOptions({ name: 'RatingStar' })

const props = withDefaults(
  defineProps<{
    modelValue: number
    count?: number
    size?: string
  }>(),
  {
    count: 5,
    size: '24px',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const stars = Array.from({ length: props.count }, (_, i) => i + 1)

const handleClick = (index: number) => {
  emit('update:modelValue', index === props.modelValue ? 0 : index)
}
</script>

<template>
  <div class="rating-star">
    <span
      v-for="i in stars"
      :key="i"
      class="star"
      :style="{
        fontSize: size,
        color: i <= modelValue ? 'var(--color-star-active)' : 'var(--color-star-inactive)',
      }"
      @click="handleClick(i)"
    >{{ i <= modelValue ? '\u2605' : '\u2606' }}</span>
  </div>
</template>

<style scoped>
.rating-star {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star {
  cursor: pointer;
  user-select: none;
  line-height: 1;
  transition: color 0.15s;
}
</style>
