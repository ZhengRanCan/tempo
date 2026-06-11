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

</style>
