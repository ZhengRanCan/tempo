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
@use "../styles/ui" as ui;

.empty-state {
  @include ui.card(32rpx, 28rpx);
}

.empty-title,
.empty-copy {
  display: block;
}

.empty-title {
  color: ui.$ink;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.empty-copy {
  margin: 14rpx 0 24rpx;
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.55;
}

.primary-button {
  @include ui.primary-button;
}
</style>
