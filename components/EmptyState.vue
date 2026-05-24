<script setup lang="ts">
defineProps<{
  title: string
  copy: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="empty-state">
    <text class="empty-title">{{ title }}</text>
    <text class="empty-copy">{{ copy }}</text>
    <button
      v-if="actionLabel"
      class="primary-button"
      @tap="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </view>
</template>

<style scoped lang="scss">
.empty-state {
  padding: 40rpx 32rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 28rpx;
  background: #ffffff;
}

.empty-title,
.empty-copy {
  display: block;
}

.empty-title {
  color: #24211c;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.35;
}

.empty-copy {
  margin: 16rpx 0 28rpx;
  color: #4b463d;
  font-size: 28rpx;
  line-height: 1.55;
}

.primary-button {
  height: 88rpx;
  border-radius: 20rpx;
  background: #6b6fd6;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 88rpx;
}
</style>
