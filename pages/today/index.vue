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

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)

    todayView.value = bundleResult.data
      ? buildTodaySuggestionFromPlanBundle(bundleResult.data, {
          today,
          userProfile
        })
      : null
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
      <view class="energy-row">
        <text
          class="energy-pill"
          :class="`energy-${todayView.energyLevel}`"
        >
          {{ todayView.energyLevel === 'low' ? '低能量' : todayView.energyLevel === 'high' ? '高能量' : '普通状态' }}
        </text>
        <text class="energy-note">{{ todayView.pressureNote }}</text>
      </view>

      <TodayFocusCard
        :daily-keyword="todayView.dailyKeyword"
        :recommended-focus-window="todayView.recommendedFocusWindow"
        :task="todayView.focusTask"
      />

      <view
        v-if="taskCount > 1"
        class="today-entry"
      >
        <text class="today-entry-title">今日共 {{ taskCount }} 个任务 · 查看全部</text>
        <text
          v-if="extraTaskPreview"
          class="today-entry-copy"
        >
          其余任务：{{ extraTaskPreview }}
        </text>
      </view>

      <view class="task-section">
        <text class="section-title">今日任务</text>
        <view class="task-list">
          <TaskCard
            v-for="task in todayView.tasks"
            :key="task.id"
            :task="task"
          />
        </view>
      </view>

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
  padding: 96rpx 32rpx 48rpx;
  background: #faf8f3;
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
  display: inline-block;
  width: fit-content;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #ececff;
  color: #555ac0;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
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

.task-section {
  margin-top: 32rpx;
}

.today-entry {
  margin-top: 24rpx;
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.today-entry-title,
.today-entry-copy,
.section-title {
  display: block;
}

.today-entry-title {
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.today-entry-copy {
  margin-top: 8rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.section-title {
  margin-bottom: 16rpx;
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.secondary-button {
  height: 88rpx;
  margin-top: 32rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #ffffff;
  color: #24211c;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 88rpx;
}
</style>
