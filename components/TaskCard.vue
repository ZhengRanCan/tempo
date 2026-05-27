<script setup lang="ts">
import type { Task } from '../models'
import { getTaskStatusLabel } from '../services/plan-view'

const props = defineProps<{
  task: Task
}>()

const priorityLabels: Record<Task['priority'], string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
}
</script>

<template>
  <view
    class="task-card"
    :class="[`status-${task.status}`, { priority: task.priority === 'high' }]"
  >
    <view class="meta-row">
      <text class="status-label">{{ getTaskStatusLabel(props.task.status) }}</text>
      <text class="meta-label">预计 {{ task.estimatedMinutes }} 分钟</text>
      <text class="meta-label">{{ priorityLabels[task.priority] }}</text>
    </view>

    <text class="task-title">{{ task.title }}</text>

    <view class="minimum-box">
      <text class="minimum-label">最低完成线</text>
      <text class="minimum-text">{{ task.minimumLine }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.task-card.priority {
  border-left: 6rpx solid #6b6fd6;
}

.status-todo {
  background: #ffffff;
}

.status-done {
  background: #eaf6ee;
}

.status-partial {
  background: #fff5da;
}

.status-skipped {
  background: #f3efe7;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  align-items: center;
}

.status-label,
.meta-label {
  display: inline-block;
  border-radius: 999rpx;
  font-size: 24rpx;
  line-height: 1.4;
}

.status-label {
  padding: 6rpx 14rpx;
  background: #f3efe7;
  color: #4b463d;
  font-weight: 500;
}

.status-done .status-label {
  background: #eaf6ee;
  color: #4f9d69;
}

.status-partial .status-label {
  background: #fff5da;
  color: #8a6727;
}

.status-skipped .status-label {
  background: #ece6da;
  color: #7c7568;
}

.meta-label {
  color: #7c7568;
}

.task-title {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.minimum-box {
  padding: 18rpx;
  border-radius: 18rpx;
  background: #ececff;
}

.minimum-label,
.minimum-text {
  display: block;
}

.minimum-label {
  color: #555ac0;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.minimum-text {
  margin-top: 6rpx;
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
