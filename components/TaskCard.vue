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

    <view
      v-if="$slots.action"
      class="action-slot"
    >
      <slot name="action" />
    </view>
  </view>
</template>

<style scoped lang="scss">
@use "../styles/ui" as ui;

.task-card {
  @include ui.card(28rpx, 28rpx);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.task-card.priority {
  border-left: 6rpx solid ui.$accent;
}

.status-todo {
  background: ui.$surface;
}

.status-done {
  background: ui.$surface;
}

.status-partial {
  background: ui.$surface;
}

.status-skipped {
  background: ui.$surface;
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
  background: ui.$surface-soft;
  color: ui.$body;
  font-weight: 500;
}

.status-done .status-label {
  background: ui.$success-soft;
  color: ui.$success;
}

.status-partial .status-label {
  background: ui.$warning-soft;
  color: #8a6727;
}

.status-skipped .status-label {
  background: ui.$surface-muted;
  color: ui.$muted;
}

.meta-label {
  color: ui.$muted;
}

.task-title {
  color: ui.$ink;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.minimum-box {
  @include ui.soft-block(18rpx, 20rpx);

  padding: 18rpx;
  background: ui.$accent-soft;
}

.minimum-label,
.minimum-text {
  display: block;
}

.minimum-label {
  color: ui.$accent-pressed;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.minimum-text {
  margin-top: 6rpx;
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.5;
}

.action-slot {
  margin-top: 2rpx;
}
</style>
