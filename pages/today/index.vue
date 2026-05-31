<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import TaskCard from '../../components/TaskCard.vue'
import TodayFocusCard from '../../components/TodayFocusCard.vue'
import type { Goal } from '../../models'
import { formatDate } from '../../services/date'
import {
  getCurrentGoal,
  getUserProfile,
  migrateLegacyDailyPlans
} from '../../services/storage'
import {
  buildTodaySuggestionFromPlanBundle,
  type TodaySuggestionView
} from '../../services/today-suggestion'

const goal = ref<Goal | null>(null)
const todayView = ref<TodaySuggestionView | null>(null)
const isLoading = ref(true)
const today = formatDate(new Date())

const hasTodayTask = computed(() => todayView.value !== null)
const taskCount = computed(() => todayView.value?.tasks.length ?? 0)
const extraTaskPreview = computed(() =>
  todayView.value?.tasks
    .filter((task) => task.id !== todayView.value?.focusTask.id)
    .map((task) => task.title)
    .slice(0, 2)
    .join(', ')
)
const visibleSuggestionTips = computed(() => todayView.value?.suggestionTips.slice(0, 3) ?? [])
const showAllTasks = ref(false)

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
      showAllTasks.value = false
      return
    }

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)

    todayView.value = bundleResult.data
      ? buildTodaySuggestionFromPlanBundle(bundleResult.data, {
          today,
          userProfile
        })
      : null
    showAllTasks.value = false
  } finally {
    isLoading.value = false
  }
}

function goCreateGoal(): void {
  uni.switchTab({
    url: '/pages/goal-create/index'
  })
}

function goReview(): void {
  uni.navigateTo({
    url: '/pages/review/index'
  })
}

function goManageStatus(): void {
  uni.switchTab({
    url: '/pages/profile/index'
  })
}

function toggleAllTasks(): void {
  showAllTasks.value = !showAllTasks.value
}

function getEnergyLabel(level: TodaySuggestionView['energyLevel']): string {
  const labels: Record<TodaySuggestionView['energyLevel'], string> = {
    low: '低能量',
    normal: '普通',
    high: '高能量'
  }

  return labels[level]
}
</script>

<template>
  <view class="page">
    <AppPageHeader
      title="今日任务"
      hint="先看今天最值得推进的一小步"
    />

    <EmptyState
      v-if="isLoading"
      title="正在整理今日任务"
      copy="我在查看今天适合先做哪一步。"
    />

    <EmptyState
      v-else-if="!hasTodayTask"
      title="今天还没有任务"
      copy="先创建一个目标，我会帮你拆成每天能做的小步。"
      action-label="创建目标"
      @action="goCreateGoal"
    />

    <template v-else-if="todayView">
      <TodayFocusCard
        :daily-keyword="todayView.dailyKeyword"
        :goal-title="goal?.title"
        :recommended-focus-window="todayView.recommendedFocusWindow"
        :task="todayView.focusTask"
      />

      <view
        v-if="taskCount > 1"
        class="today-entry"
      >
        <view class="entry-head">
          <text class="today-entry-title">今日共 {{ taskCount }} 个任务</text>
          <button
            class="text-button"
            @tap="toggleAllTasks"
          >
            {{ showAllTasks ? '收起' : '查看全部' }}
          </button>
        </view>
        <text
          v-if="extraTaskPreview"
          class="today-entry-copy"
        >
          其余任务：{{ extraTaskPreview }}
        </text>
        <view
          v-if="showAllTasks"
          class="task-list"
        >
          <TaskCard
            v-for="task in todayView.tasks"
            :key="task.id"
            :task="task"
          />
        </view>
      </view>

      <view class="status-card">
        <view class="section-head">
          <text class="section-title">今日状态</text>
          <button
            class="text-button"
            @tap="goManageStatus"
          >
            管理
          </button>
        </view>
        <view class="status-grid">
          <view class="status-item">
            <text class="item-label">能量</text>
            <text class="item-value">{{ getEnergyLabel(todayView.energyLevel) }}</text>
          </view>
          <view class="status-item">
            <text class="item-label">可用时间</text>
            <text class="item-value">{{ todayView.availableMinutes }} 分钟</text>
          </view>
          <view class="status-item">
            <text class="item-label">当前状态</text>
            <text class="item-value">{{ todayView.stateLabel }}</text>
          </view>
        </view>
        <text class="helper">{{ todayView.pressureNote }}</text>
      </view>

      <view class="advice-card">
        <view class="section-head">
          <text class="section-title">AI 今日建议</text>
          <text class="keyword-tag">{{ todayView.dailyKeyword }}</text>
        </view>
        <view class="advice-list">
          <text
            v-for="tip in visibleSuggestionTips"
            :key="tip"
            class="advice-tip"
          >
            {{ tip }}
          </text>
        </view>
        <text class="advice-note">关键词和灵感只用于提醒节奏，不作为预测依据。</text>
      </view>

      <view class="review-entry">
        <view>
          <text class="review-title">晚间复盘</text>
          <text class="review-copy">晚上记录完成情况，我会根据结果调整后续安排。</text>
        </view>
        <button
          class="secondary-button"
          @tap="goReview"
        >
          去复盘
        </button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 96rpx 32rpx 48rpx;
  background: #faf8f3;
}

.today-entry,
.status-card,
.advice-card,
.review-entry {
  margin-top: 24rpx;
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.entry-head,
.section-head,
.review-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.today-entry-title,
.today-entry-copy,
.section-title,
.helper,
.item-label,
.item-value,
.advice-tip,
.advice-note,
.review-title,
.review-copy {
  display: block;
}

.today-entry-title {
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.today-entry-copy,
.helper,
.review-copy {
  margin-top: 8rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.section-title {
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 18rpx;
}

.text-button {
  min-width: 112rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border: 0;
  border-radius: 999rpx;
  background: #ececff;
  color: #555ac0;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 56rpx;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 20rpx;
}

.status-item {
  padding: 18rpx 14rpx;
  border-radius: 20rpx;
  background: #f3efe7;
}

.item-label {
  color: #7c7568;
  font-size: 22rpx;
  line-height: 1.4;
}

.item-value {
  margin-top: 6rpx;
  color: #24211c;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.35;
}

.keyword-tag {
  display: inline-block;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #fff2e8;
  color: #d68a5a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 18rpx;
}

.advice-tip {
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}

.advice-note {
  margin-top: 16rpx;
  color: #7c7568;
  font-size: 22rpx;
  line-height: 1.5;
}

.review-title {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.secondary-button {
  flex: 0 0 160rpx;
  height: 72rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #ffffff;
  color: #24211c;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 72rpx;
}
</style>
