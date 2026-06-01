<script setup lang="ts">
defineProps<{
  title: string
  hint?: string
}>()
</script>

<template>
  <view class="app-page-header">
    <view class="header-main">
      <slot name="action" />
    </view>
    <text
      v-if="hint"
      class="hint"
    >
      {{ hint }}
    </text>
  </view>
</template>

<style scoped lang="scss">
.app-page-header {
  margin-bottom: 24rpx;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.hint {
  display: block;
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
