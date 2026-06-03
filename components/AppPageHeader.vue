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
@use "../styles/ui" as ui;

.app-page-header {
  margin-bottom: 20rpx;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.hint {
  display: block;
  max-width: 560rpx;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
