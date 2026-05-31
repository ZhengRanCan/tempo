<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import TaskCard from '../../components/TaskCard.vue'
import type { Goal } from '../../models'
import { formatDate } from '../../services/date'
import { buildPlanBundleCalendarView, type PlanBundleCalendarView } from '../../services/plan-view'
import { getCurrentGoal, migrateLegacyDailyPlans } from '../../services/storage'

const goal = ref<Goal | null>(null)
const calendarView = ref<PlanBundleCalendarView | null>(null)
const isLoading = ref(true)
const today = formatDate(new Date())

const days = computed(() => calendarView.value?.days ?? [])
const stages = computed(() => calendarView.value?.stages ?? [])
const progress = computed(() => calendarView.value?.progress ?? null)
const planStatus = computed(() => calendarView.value?.plan.status ?? 'active')
const hasPlan = computed(() => calendarView.value !== null)
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
      calendarView.value = null
      return
    }

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)
    calendarView.value = bundleResult.data
      ? buildPlanBundleCalendarView(bundleResult.data, {
          today,
          limit: 7
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

</script>

<template>
  <view class="page">
    <AppPageHeader
      title="任务日历"
      hint="先看最近 7 天的可执行安排"
    />

    <EmptyState
      v-if="isLoading"
      title="正在整理计划"
      copy="我在读取已经生成的每日任务。"
    />

    <EmptyState
      v-else-if="!hasPlan"
      title="还没有任务计划"
      copy="先创建一个目标，我会帮你拆成每天能做的小步。"
      action-label="创建目标"
      @action="goCreateGoal"
    />

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

      <view
        v-if="progress"
        class="plan-panel"
      >
        <text class="plan-title">计划状态：{{ planStatus }}</text>
        <text class="plan-copy">
          已完成 {{ progress.completedTaskCount }} / {{ progress.totalTaskCount }} 个任务，进度 {{ progress.progressPercent }}%
        </text>
        <text class="plan-copy">
          剩余预计 {{ progress.remainingEstimatedMinutes }} 分钟
        </text>
      </view>

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

          <view class="task-list">
            <TaskCard
              v-for="task in day.tasks"
              :key="task.id"
              :task="task"
            />
          </view>
        </view>
      </view>

      <view
        v-if="stages.length > 0"
        class="stage-list"
      >
        <text class="section-title">远期阶段</text>
        <view
          v-for="stage in stages"
          :key="stage.id"
          class="stage-card"
        >
          <text class="stage-title">{{ stage.title }}</text>
          <text class="stage-meta">{{ stage.startDate }} - {{ stage.endDate }} · {{ stage.status }}</text>
        </view>
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
.summary-label,
.plan-title,
.plan-copy,
.section-title,
.stage-title,
.stage-meta,
.date,
.day-summary {
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

.plan-panel,
.stage-card {
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.plan-panel {
  margin-bottom: 24rpx;
}

.plan-title,
.section-title,
.stage-title {
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.plan-copy,
.stage-meta {
  margin-top: 8rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 28rpx;
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
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #6b6fd6;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
</style>
