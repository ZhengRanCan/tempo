<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../models'

const props = defineProps<{
  extraTaskPreview?: string
  goalTitle?: string
  recommendedFocusWindow: string
  showAllTasks: boolean
  task: Task
  taskCount: number
}>()

defineEmits<{
  done: []
  start: []
  'toggle-all': []
}>()

const priorityLabels: Record<Task['priority'], string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
}

const minimumLine = computed(() =>
  props.task.minimumLine.trim().length > 0 ? props.task.minimumLine : '先完成一个最小可交付步骤。'
)
const isCompleted = computed(() => props.task.status === 'done')
</script>

<template>
  <view class="focus-card">
    <view class="focus-tag">
      <image
        class="tag-icon"
        src="/static/icons/page/today/star.png"
        mode="aspectFit"
      />
      <text>今日重点任务</text>
    </view>
    <text
      v-if="goalTitle"
      class="goal-title"
    >
      {{ goalTitle }}
    </text>
    <text class="focus-label">当前最值得推进的一步</text>
    <text class="focus-title">{{ task.title }}</text>

    <view class="focus-meta">
      <view class="meta-item">
        <image
          class="meta-icon"
          src="/static/icons/page/today/clock.png"
          mode="aspectFit"
        />
        <text>预计 {{ task.estimatedMinutes }} 分钟</text>
      </view>
      <view class="meta-divider" />
      <view class="meta-item">
        <image
          class="meta-icon"
          src="/static/icons/page/today/flag.png"
          mode="aspectFit"
        />
        <text>{{ priorityLabels[task.priority] }}</text>
      </view>
    </view>

    <view class="minimum-box">
      <image
        class="minimum-icon"
        src="/static/icons/page/today/star.png"
        mode="aspectFit"
      />
      <text class="minimum-label">最低完成线：</text>
      <text class="minimum-text">{{ minimumLine }}</text>
    </view>

    <button
      v-if="taskCount > 1"
      class="all-task-entry"
      @tap="$emit('toggle-all')"
    >
      <view class="all-task-head">
        <view class="all-task-title">
          <image
            class="entry-icon"
            src="/static/icons/page/today/list.png"
            mode="aspectFit"
          />
          <text>今日共 {{ taskCount }} 个任务 · {{ showAllTasks ? '收起' : '查看全部' }}</text>
        </view>
        <text class="entry-arrow">{{ showAllTasks ? '⌃' : '›' }}</text>
      </view>
      <text
        v-if="extraTaskPreview"
        class="all-task-preview"
      >
        其余任务：{{ extraTaskPreview }}
      </text>
    </button>

    <text
      v-if="task.caution"
      class="caution"
    >
      {{ task.caution }}
    </text>

    <view class="action-row">
      <button
        class="primary-action"
        :class="{ completed: isCompleted }"
        :disabled="isCompleted"
        @tap="$emit('start')"
      >
        {{ isCompleted ? '已完成' : '开始专注' }}
      </button>
      <button
        class="secondary-action"
        @tap="$emit('done')"
      >
        标记完成
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use "../styles/ui" as ui;

.focus-card {
  @include ui.card(28rpx, 26rpx);

  border-left: 6rpx solid ui.$accent;
}

.focus-tag {
  @include ui.status-tag(ui.$warm-soft, ui.$warm);

  display: inline-flex;
  gap: 8rpx;
  align-items: center;
  align-self: flex-start;
  padding: 8rpx 18rpx;
  font-size: 26rpx;
}

.focus-label,
.goal-title,
.focus-title,
.minimum-label,
.minimum-text,
.all-task-preview,
.caution {
  display: block;
}

.tag-icon,
.meta-icon,
.minimum-icon,
.entry-icon {
  display: block;
  flex: 0 0 auto;
  width: 32rpx;
  height: 32rpx;
}

.focus-label {
  margin-top: 12rpx;
  color: ui.$muted;
  font-size: 28rpx;
  line-height: 1.5;
}

.focus-title {
  margin-top: 6rpx;
  color: ui.$ink;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 1.35;
}

.goal-title {
  margin-top: 22rpx;
  color: ui.$ink;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.focus-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
  margin-top: 16rpx;
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.5;
}

.meta-item {
  display: inline-flex;
  gap: 8rpx;
  align-items: center;
}

.meta-divider {
  width: 2rpx;
  height: 28rpx;
  background: ui.$border;
}

.minimum-box {
  @include ui.soft-block(18rpx 20rpx, 18rpx);

  display: flex;
  gap: 10rpx;
  align-items: center;
  margin-top: 20rpx;
  background: ui.$accent-soft;
}

.minimum-icon {
  width: 34rpx;
  height: 34rpx;
}

.minimum-label {
  flex: 0 0 auto;
  color: ui.$accent-pressed;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.45;
}

.minimum-text {
  flex: 1 1 auto;
  min-width: 0;
  color: ui.$ink;
  font-size: 26rpx;
  line-height: 1.45;
}

.all-task-entry {
  @include ui.button-reset;

  width: 100%;
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border: 2rpx solid #d8d4ff;
  border-radius: 20rpx;
  background: rgba(236, 236, 255, 0.56);
  color: ui.$accent-pressed;
  text-align: left;
}

.all-task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.all-task-title {
  display: inline-flex;
  gap: 10rpx;
  align-items: center;
  min-width: 0;
}

.entry-icon {
  width: 34rpx;
  height: 34rpx;
}

.entry-arrow {
  flex: 0 0 auto;
  color: ui.$ink;
  font-size: 34rpx;
  font-weight: 400;
}

.all-task-preview {
  margin-top: 10rpx;
  color: ui.$body;
  font-size: 24rpx;
  font-weight: 400;
  line-height: 1.5;
}

.caution {
  margin-top: 14rpx;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.5;
}

.action-row {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 16rpx;
  align-items: center;
  margin-top: 24rpx;
}

.primary-action {
  @include ui.primary-button(86rpx);

  border-radius: 22rpx;
  background: linear-gradient(135deg, #6b5bea, ui.$accent);
  font-size: 30rpx;
}

.primary-action.completed {
  background: ui.$surface-muted;
  color: ui.$muted;
}

.secondary-action {
  @include ui.text-button(86rpx);

  color: ui.$accent-pressed;
  font-size: 28rpx;
}
</style>
