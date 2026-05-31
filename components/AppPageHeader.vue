<script setup lang="ts">
defineProps<{
  title: string
  hint?: string
}>()
</script>

<template>
  <view class="app-page-header">
    <view class="header-main">
      <text class="title">{{ title }}</text>
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
  justify-content: space-between;
  gap: 16rpx;
}

.title {
  display: block;
  color: #24211c;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 1.3;
}

.hint {
  display: block;
  margin-top: 8rpx;
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
