<script setup lang="ts">
import type { Task } from '../models'

defineProps<{
  dailyKeyword: string
  goalTitle?: string
  recommendedFocusWindow: string
  task: Task
}>()
</script>

<template>
  <view class="focus-card">
    <text class="keyword">今日关键词：{{ dailyKeyword }}</text>
    <text class="focus-label">今天最重要的一件事</text>
    <text
      v-if="goalTitle"
      class="goal-title"
    >
      {{ goalTitle }}
    </text>
    <text class="focus-title">{{ task.title }}</text>

    <view class="minimum-box">
      <text class="minimum-label">最低完成线</text>
      <text class="minimum-text">{{ task.minimumLine }}</text>
    </view>

    <view class="focus-meta">
      <text>推荐时段：{{ recommendedFocusWindow }}</text>
      <text>预计 {{ task.estimatedMinutes }} 分钟</text>
    </view>

    <text
      v-if="task.caution"
      class="caution"
    >
      {{ task.caution }}
    </text>
  </view>
</template>

<style scoped lang="scss">
@use "../styles/ui" as ui;

.focus-card {
  @include ui.card(32rpx, 32rpx);

  border-left: 6rpx solid ui.$accent;
}

.keyword {
  @include ui.status-tag(ui.$warm-soft, ui.$warm);
}

.focus-label,
.goal-title,
.focus-title,
.minimum-label,
.minimum-text,
.caution {
  display: block;
}

.focus-label {
  margin-top: 24rpx;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.4;
}

.focus-title {
  margin-top: 10rpx;
  color: ui.$ink;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.35;
}

.goal-title {
  margin-top: 8rpx;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.4;
}

.minimum-box {
  @include ui.soft-block(22rpx, 22rpx);

  margin-top: 24rpx;
  background: ui.$accent-soft;
}

.minimum-label {
  color: ui.$accent-pressed;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.minimum-text {
  margin-top: 8rpx;
  color: ui.$ink;
  font-size: 28rpx;
  line-height: 1.5;
}

.focus-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.5;
}

.caution {
  margin-top: 18rpx;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
