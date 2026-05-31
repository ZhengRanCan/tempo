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
.focus-card {
  padding: 40rpx 32rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 36rpx;
  background: #ffffff;
}

.keyword {
  display: inline-block;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #fff2e8;
  color: #d68a5a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
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
  margin-top: 28rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.4;
}

.focus-title {
  margin-top: 10rpx;
  color: #24211c;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 1.35;
}

.goal-title {
  margin-top: 8rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.4;
}

.minimum-box {
  margin-top: 28rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ececff;
}

.minimum-label {
  color: #555ac0;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.minimum-text {
  margin-top: 8rpx;
  color: #24211c;
  font-size: 30rpx;
  line-height: 1.5;
}

.focus-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}

.caution {
  margin-top: 18rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
