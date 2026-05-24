<script setup lang="ts">
import type { EnergyLevel } from '../models'

defineProps<{
  modelValue: EnergyLevel
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EnergyLevel]
}>()

const options: Array<{
  value: EnergyLevel
  label: string
}> = [
  {
    value: 'low',
    label: '低能量'
  },
  {
    value: 'normal',
    label: '普通'
  },
  {
    value: 'high',
    label: '高能量'
  }
]

function selectEnergy(value: EnergyLevel): void {
  emit('update:modelValue', value)
}
</script>

<template>
  <view class="energy-options">
    <button
      v-for="option in options"
      :key="option.value"
      class="energy-option"
      :class="{ active: modelValue === option.value }"
      @tap="selectEnergy(option.value)"
    >
      {{ option.label }}
    </button>
  </view>
</template>

<style scoped lang="scss">
.energy-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #f3efe7;
}

.energy-option {
  min-height: 68rpx;
  padding: 0 12rpx;
  border: 0;
  border-radius: 999rpx;
  background: transparent;
  color: #4b463d;
  font-size: 24rpx;
  line-height: 68rpx;
}

.energy-option.active {
  background: #ececff;
  color: #555ac0;
}
</style>
