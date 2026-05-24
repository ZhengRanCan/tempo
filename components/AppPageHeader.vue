<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  hint?: string
}>()
</script>

<template>
  <view class="app-page-header">
    <text
      v-if="eyebrow"
      class="eyebrow"
    >
      {{ eyebrow }}
    </text>
    <text class="title">{{ title }}</text>
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
  margin-bottom: 32rpx;
}

.eyebrow {
  display: inline-block;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #fff2e8;
  color: #d68a5a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.title,
.hint {
  display: block;
}

.title {
  margin-top: 28rpx;
  color: #24211c;
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.3;
}

.hint {
  margin-top: 16rpx;
  color: #4b463d;
  font-size: 30rpx;
  line-height: 1.55;
}
</style>
