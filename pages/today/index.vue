<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import type { Goal, TodayView } from '../../models'
import { buildTodayView, getTaskStatusLabel } from '../../models/plan'
import { formatDate } from '../../services/date'
import { getCurrentGoal, getDailyPlans, getUserProfile } from '../../services/storage'

const goal = ref<Goal | null>(null)
const todayView = ref<TodayView | null>(null)
const isLoading = ref(true)
const today = formatDate(new Date())

const hasTodayTask = computed(() => todayView.value !== null)

onShow(() => {
  void loadToday()
})

async function loadToday(): Promise<void> {
  isLoading.value = true

  try {
    const currentGoal = await getCurrentGoal()
    const userProfile = await getUserProfile()
    goal.value = currentGoal

    if (!currentGoal) {
      todayView.value = null
      return
    }

    const plans = await getDailyPlans(currentGoal.id)
    todayView.value = buildTodayView(plans, {
      today,
      userProfile
    })
  } finally {
    isLoading.value = false
  }
}

function goCreateGoal(): void {
  uni.switchTab({
    url: '/pages/goal-create/index'
  })
}

function goCalendar(): void {
  uni.switchTab({
    url: '/pages/plan-calendar/index'
  })
}

function goReview(): void {
  uni.navigateTo({
    url: '/pages/review/index'
  })
}

function getStatusText(status: TodayView['tasks'][number]['status']): string {
  return getTaskStatusLabel(status)
}
</script>

<template>
  <view class="page">
    <AppPageHeader
      eyebrow="今日任务"
      :title="goal?.title || '今天先选一个目标'"
      hint="只看今天最值得推进的一小步。"
    />

    <view
      v-if="isLoading"
      class="empty-state"
    >
      <text class="empty-title">正在整理今日任务</text>
      <text class="empty-copy">我在查看今天适合先做哪一步。</text>
    </view>

    <view
      v-else-if="!hasTodayTask"
      class="empty-state"
    >
      <text class="empty-title">今天还没有任务</text>
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

    <template v-else-if="todayView">
      <view class="energy-row">
        <text
          class="energy-pill"
          :class="`energy-${todayView.energyLevel}`"
        >
          {{ todayView.energyLevel === 'low' ? '低能量' : todayView.energyLevel === 'high' ? '高能量' : '普通状态' }}
        </text>
        <text class="energy-note">{{ todayView.pressureNote }}</text>
      </view>

      <view class="focus-card">
        <text class="keyword">今日关键词：{{ todayView.dailyKeyword }}</text>
        <text class="focus-label">今天最重要的一件事</text>
        <text class="focus-title">{{ todayView.focusTask.title }}</text>

        <view class="minimum-box">
          <text class="minimum-label">最低完成线</text>
          <text class="minimum-text">{{ todayView.focusTask.minimumLine }}</text>
        </view>

        <view class="focus-meta">
          <text>推荐时段：{{ todayView.recommendedFocusWindow }}</text>
          <text>预计 {{ todayView.focusTask.estimatedMinutes }} 分钟</text>
        </view>

        <text
          v-if="todayView.focusTask.caution"
          class="caution"
        >
          {{ todayView.focusTask.caution }}
        </text>
      </view>

      <view class="task-section">
        <text class="section-title">今日任务</text>
        <view
          v-for="task in todayView.tasks"
          :key="task.id"
          class="task-card"
          :class="{ priority: task.priority === 'high' }"
        >
          <view class="task-meta">
            <text class="status-label">{{ getStatusText(task.status) }}</text>
            <text class="minutes">预计 {{ task.estimatedMinutes }} 分钟</text>
          </view>
          <text class="task-title">{{ task.title }}</text>
          <text class="minimum-line">最低完成线：{{ task.minimumLine }}</text>
        </view>
      </view>

      <button
        class="secondary-button"
        @tap="goCalendar"
      >
        查看全部计划
      </button>

      <button
        class="secondary-button"
        @tap="goReview"
      >
        晚间复盘
      </button>
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
  margin-bottom: 28rpx;
}

.eyebrow,
.keyword,
.energy-pill,
.status-label {
  display: inline-block;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.eyebrow,
.keyword {
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

.energy-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #f3efe7;
}

.energy-pill {
  width: fit-content;
  padding: 8rpx 18rpx;
  background: #ececff;
  color: #555ac0;
}

.energy-low {
  background: #fff2e8;
  color: #8a5a35;
}

.energy-note {
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}

.focus-card,
.task-card,
.empty-state {
  border: 2rpx solid #e5ded2;
  background: #ffffff;
}

.focus-card {
  padding: 40rpx 32rpx;
  border-radius: 36rpx;
}

.focus-label,
.focus-title,
.minimum-label,
.minimum-text,
.caution,
.section-title,
.empty-title,
.empty-copy {
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

.task-section {
  margin-top: 32rpx;
}

.section-title {
  margin-bottom: 16rpx;
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.task-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 24rpx;
}

.task-card + .task-card {
  margin-top: 16rpx;
}

.task-card.priority {
  border-left: 6rpx solid #6b6fd6;
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
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}

.primary-button,
.secondary-button {
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 88rpx;
}

.primary-button {
  background: #6b6fd6;
  color: #ffffff;
}

.secondary-button {
  border: 2rpx solid #e5ded2;
  background: #ffffff;
  color: #24211c;
}

.empty-state {
  padding: 40rpx 32rpx;
  border-radius: 28rpx;
}

.empty-title {
  color: #24211c;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.35;
}

.empty-copy {
  margin-top: 16rpx;
  color: #4b463d;
  font-size: 28rpx;
  line-height: 1.55;
}
</style>
