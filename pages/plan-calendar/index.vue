<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Goal, PlanCalendarDay } from '../../models'
import { buildPlanCalendarDays } from '../../models/plan'
import { formatDate } from '../../services/date'
import { getCurrentGoal, getDailyPlans } from '../../services/storage'

const goal = ref<Goal | null>(null)
const days = ref<PlanCalendarDay[]>([])
const isLoading = ref(true)
const today = formatDate(new Date())

const hasPlan = computed(() => days.value.length > 0)
const totalTasks = computed(() =>
  days.value.reduce((total, day) => total + day.taskCount, 0)
)
const totalMinutes = computed(() =>
  days.value.reduce((total, day) => total + day.totalMinutes, 0)
)

onShow(() => {
  void loadCalendar()
})

async function loadCalendar(): Promise<void> {
  isLoading.value = true

  try {
    const currentGoal = await getCurrentGoal()
    goal.value = currentGoal

    if (!currentGoal) {
      days.value = []
      return
    }

    const plans = await getDailyPlans(currentGoal.id)
    days.value = buildPlanCalendarDays(plans, {
      today,
      limit: 7
    })
  } finally {
    isLoading.value = false
  }
}

function goCreateGoal(): void {
  uni.navigateTo({
    url: '/pages/goal-create/index'
  })
}

function goToday(): void {
  uni.navigateTo({
    url: '/pages/today/index'
  })
}
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="eyebrow">任务日历</text>
      <text class="title">{{ goal?.title || '还没有计划' }}</text>
      <text class="hint">
        先看最近 7 天，每天只保留能执行的小步骤。
      </text>
    </view>

    <view
      v-if="isLoading"
      class="empty-state"
    >
      <text class="empty-title">正在整理计划</text>
      <text class="empty-copy">我在读取已经生成的每日任务。</text>
    </view>

    <view
      v-else-if="!hasPlan"
      class="empty-state"
    >
      <text class="empty-title">还没有任务计划</text>
      <text class="empty-copy">
        先创建一个目标，我会帮你拆成每天能做的小步。
      </text>
      <button
        class="primary-button"
        @tap="goCreateGoal"
      >
        创建目标
      </button>
    </view>

    <template v-else>
      <view class="summary">
        <view class="summary-item">
          <text class="summary-value">{{ days.length }}</text>
          <text class="summary-label">天计划</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ totalTasks }}</text>
          <text class="summary-label">个任务</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ totalMinutes }}</text>
          <text class="summary-label">分钟</text>
        </view>
      </view>

      <button
        class="primary-button"
        @tap="goToday"
      >
        查看今日任务
      </button>

      <view class="day-list">
        <view
          v-for="day in days"
          :key="day.date"
          class="day-block"
          :class="{ today: day.isToday }"
        >
          <view class="day-head">
            <view>
              <text class="date">{{ day.date }}</text>
              <text class="day-summary">{{ day.statusSummary }}</text>
            </view>
            <text
              v-if="day.isToday"
              class="today-tag"
            >
              今天
            </text>
          </view>

          <view
            v-for="task in day.tasks"
            :key="task.id"
            class="task-card"
            :class="[`status-${task.status}`, { priority: task.priority === 'high' }]"
          >
            <view class="task-meta">
              <text class="status-label">{{ task.statusLabel }}</text>
              <text class="minutes">预计 {{ task.estimatedMinutes }} 分钟</text>
            </view>
            <text class="task-title">{{ task.title }}</text>
            <text class="minimum-line">最低完成线：{{ task.minimumLine }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 112rpx 40rpx 48rpx;
  background: #faf8f3;
}

.header {
  margin-bottom: 32rpx;
}

.eyebrow,
.today-tag,
.status-label {
  display: inline-block;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.eyebrow {
  padding: 8rpx 18rpx;
  background: #fff2e8;
  color: #d68a5a;
}

.title {
  display: block;
  margin-top: 28rpx;
  color: #24211c;
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.3;
}

.hint {
  display: block;
  margin-top: 16rpx;
  color: #4b463d;
  font-size: 30rpx;
  line-height: 1.55;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.summary-item {
  padding: 24rpx 16rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
  text-align: center;
}

.summary-value,
.summary-label {
  display: block;
}

.summary-value {
  color: #24211c;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.3;
}

.summary-label {
  margin-top: 4rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.4;
}

.primary-button {
  height: 88rpx;
  margin-bottom: 28rpx;
  border-radius: 20rpx;
  background: #6b6fd6;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.day-block {
  padding: 28rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 28rpx;
  background: #ffffff;
}

.day-block.today {
  border-color: #6b6fd6;
  background: #ececff;
}

.day-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.date,
.day-summary {
  display: block;
}

.date {
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.day-summary {
  margin-top: 6rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.today-tag {
  padding: 8rpx 16rpx;
  background: #6b6fd6;
  color: #ffffff;
}

.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.task-card + .task-card {
  margin-top: 16rpx;
}

.task-card.priority {
  border-left: 6rpx solid #6b6fd6;
}

.task-card.status-done {
  background: #eaf6ee;
}

.task-card.status-partial {
  background: #fff5da;
}

.task-card.status-skipped {
  background: #f3efe7;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  align-items: center;
}

.status-label {
  padding: 6rpx 14rpx;
  background: #f3efe7;
  color: #4b463d;
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

.minutes {
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.4;
}

.task-title {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.minimum-line {
  padding: 18rpx;
  border-radius: 18rpx;
  background: #ececff;
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}

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
</style>
