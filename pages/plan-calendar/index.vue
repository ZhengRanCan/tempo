<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import TaskCard from '../../components/TaskCard.vue'
import type { Goal } from '../../models'
import { formatDate } from '../../services/date'
import {
  buildPlanBundleCalendarView,
  getPlanStatusLabel,
  getStageStatusLabel,
  type PlanBundleCalendarView
} from '../../services/plan-view'
import { getCurrentGoal, migrateLegacyDailyPlans } from '../../services/storage'

const goal = ref<Goal | null>(null)
const calendarView = ref<PlanBundleCalendarView | null>(null)
const isLoading = ref(true)
const today = formatDate(new Date())
const selectedDate = ref(today)

const plan = computed(() => calendarView.value?.plan ?? null)
const days = computed(() => calendarView.value?.days ?? [])
const stages = computed(() => calendarView.value?.stages ?? [])
const progress = computed(() => calendarView.value?.progress ?? null)
const timePressure = computed(() => calendarView.value?.timePressure ?? null)
const planAdvice = computed(() => calendarView.value?.planAdvice ?? [])
const hasPlan = computed(() => calendarView.value !== null)
const selectedDay = computed(
  () => days.value.find((day) => day.date === selectedDate.value) ?? days.value[0] ?? null
)
const selectedTasks = computed(() => selectedDay.value?.tasks ?? [])
const progressPercentStyle = computed(() => `${progress.value?.progressPercent ?? 0}%`)

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
      selectedDate.value = today
      return
    }

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)
    const nextView = bundleResult.data
      ? buildPlanBundleCalendarView(bundleResult.data, {
          today,
          limit: 7
        })
      : null

    calendarView.value = nextView
    selectedDate.value = nextView?.days.find((day) => day.isToday)?.date ?? nextView?.days[0]?.date ?? today
  } finally {
    isLoading.value = false
  }
}

function goCreateGoal(): void {
  uni.switchTab({
    url: '/pages/goal-create/index'
  })
}

function goAdjustPlan(): void {
  uni.navigateTo({
    url: '/pages/review/index'
  })
}

function selectDate(date: string): void {
  selectedDate.value = date
}

function formatDateLabel(date: string): string {
  return date.slice(5).replace('-', '/')
}
</script>

<template>
  <view class="page">
    <AppPageHeader
      title="任务日历"
      hint="查看目标计划、近 7 天安排和远期阶段"
    />

    <EmptyState
      v-if="isLoading"
      title="正在整理计划"
      copy="我在读取已经生成的目标计划。"
    />

    <EmptyState
      v-else-if="!hasPlan"
      title="还没有任务计划"
      copy="先创建一个目标，我会帮你拆成每天能做的小步。"
      action-label="创建目标"
      @action="goCreateGoal"
    />

    <template v-else>
      <view class="goal-plan-card">
        <view class="card-head">
          <view>
            <text class="card-kicker">当前目标计划</text>
            <text class="goal-title">{{ goal?.title ?? '当前目标' }}</text>
          </view>
          <button
            class="text-button"
            @tap="goAdjustPlan"
          >
            调整计划
          </button>
        </view>

        <view class="metric-grid">
          <view class="metric-item">
            <text class="metric-label">截止日期</text>
            <text class="metric-value">{{ plan?.deadline }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">计划状态</text>
            <text class="metric-value">{{ plan ? getPlanStatusLabel(plan.status) : '-' }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">每日可用</text>
            <text class="metric-value">{{ plan?.dailyAvailableMinutes ?? 0 }} 分钟</text>
          </view>
        </view>
      </view>

      <view
        v-if="progress && timePressure"
        class="progress-card"
      >
        <view class="section-head">
          <text class="section-title">整体进度</text>
          <text
            class="pressure-tag"
            :class="`pressure-${timePressure.level}`"
          >
            {{ timePressure.label }}
          </text>
        </view>
        <view class="progress-track">
          <view
            class="progress-bar"
            :style="{ width: progressPercentStyle }"
          />
        </view>
        <view class="progress-grid">
          <text>已完成 {{ progress.completedTaskCount }} / {{ progress.totalTaskCount }} 个任务</text>
          <text>剩余约 {{ progress.remainingEstimatedMinutes }} 分钟</text>
          <text>剩余 {{ timePressure.remainingDays }} 天，每日约 {{ timePressure.requiredDailyMinutes }} 分钟</text>
        </view>
        <text class="helper">{{ timePressure.helper }}</text>
      </view>

      <view class="week-board">
        <view class="section-head">
          <text class="section-title">未来 7 天</text>
          <text class="section-copy">选择日期查看当天任务</text>
        </view>

        <view class="day-strip">
          <button
            v-for="day in days"
            :key="day.date"
            class="day-chip"
            :class="{ selected: day.date === selectedDate, today: day.isToday }"
            @tap="selectDate(day.date)"
          >
            <text class="date-label">{{ formatDateLabel(day.date) }}</text>
            <text class="day-count">{{ day.taskCount }} 个 · {{ day.totalMinutes }} 分钟</text>
            <text class="day-status">{{ day.statusSummary }}</text>
          </button>
        </view>
      </view>

      <view
        v-if="selectedDay"
        class="selected-day-card"
      >
        <view class="section-head">
          <view>
            <text class="section-title">{{ selectedDay.date }}</text>
            <text class="section-copy">{{ selectedDay.statusSummary }}</text>
          </view>
          <text
            v-if="selectedDay.isToday"
            class="today-tag"
          >
            今天
          </text>
        </view>

        <view
          v-if="selectedTasks.length > 0"
          class="task-list"
        >
          <TaskCard
            v-for="task in selectedTasks"
            :key="task.id"
            :task="task"
          />
        </view>
        <text
          v-else
          class="empty-day"
        >
          这天暂时没有任务，可以作为缓冲日。
        </text>
      </view>

      <view
        v-if="stages.length > 0"
        class="stage-panel"
      >
        <view class="section-head">
          <text class="section-title">远期阶段</text>
          <text class="section-copy">只看阶段，不展开大量远期任务</text>
        </view>
        <view
          v-for="stage in stages"
          :key="stage.id"
          class="stage-row"
        >
          <view>
            <text class="stage-title">{{ stage.title }}</text>
            <text class="stage-meta">{{ stage.startDate }} - {{ stage.endDate }}</text>
          </view>
          <text class="stage-tag">{{ getStageStatusLabel(stage.status) }}</text>
        </view>
      </view>

      <view
        v-if="planAdvice.length > 0"
        class="advice-card"
      >
        <view class="section-head">
          <text class="section-title">AI 计划建议</text>
          <text class="section-copy">短句提醒</text>
        </view>
        <view class="advice-list">
          <text
            v-for="tip in planAdvice"
            :key="tip"
            class="advice-tip"
          >
            {{ tip }}
          </text>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32rpx 32rpx 48rpx;
  background: #faf8f3;
}

.goal-plan-card,
.progress-card,
.week-board,
.selected-day-card,
.stage-panel,
.advice-card {
  margin-top: 24rpx;
  padding: 24rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 24rpx;
  background: #ffffff;
}

.goal-plan-card {
  margin-top: 0;
}

.card-head,
.section-head,
.stage-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.card-kicker,
.goal-title,
.metric-label,
.metric-value,
.section-title,
.section-copy,
.helper,
.date-label,
.day-count,
.day-status,
.empty-day,
.stage-title,
.stage-meta,
.advice-tip {
  display: block;
}

.card-kicker,
.metric-label,
.section-copy,
.helper,
.day-count,
.day-status,
.empty-day,
.stage-meta {
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.goal-title {
  margin-top: 8rpx;
  color: #24211c;
  font-size: 40rpx;
  font-weight: 600;
  line-height: 1.35;
}

.text-button {
  min-width: 132rpx;
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

.metric-grid,
.progress-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 22rpx;
}

.metric-item {
  min-width: 0;
  padding: 18rpx 14rpx;
  border-radius: 18rpx;
  background: #f3efe7;
}

.metric-value {
  margin-top: 6rpx;
  color: #24211c;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.35;
}

.section-title {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.pressure-tag,
.today-tag,
.stage-tag {
  display: inline-block;
  flex: 0 0 auto;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f3efe7;
  color: #7c7568;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.pressure-steady,
.pressure-done {
  background: #eaf6ee;
  color: #4f9d69;
}

.pressure-tight,
.pressure-overdue {
  background: #fff5da;
  color: #9a6b1e;
}

.progress-track {
  height: 16rpx;
  margin-top: 22rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #f3efe7;
}

.progress-bar {
  height: 100%;
  border-radius: 999rpx;
  background: #6b6fd6;
}

.progress-grid {
  color: #4b463d;
  font-size: 24rpx;
  line-height: 1.5;
}

.helper {
  margin-top: 16rpx;
}

.day-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 20rpx;
}

.day-chip {
  min-height: 156rpx;
  margin: 0;
  padding: 18rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #ffffff;
  text-align: left;
  line-height: 1.4;
}

.day-chip.selected {
  border-color: #6b6fd6;
  background: #ececff;
}

.day-chip.today .date-label {
  color: #555ac0;
}

.date-label {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.day-count,
.day-status {
  margin-top: 6rpx;
}

.today-tag {
  background: #ececff;
  color: #555ac0;
}

.task-list,
.advice-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.stage-panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.stage-row {
  padding-top: 18rpx;
  border-top: 2rpx solid #f3efe7;
}

.stage-title {
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.stage-meta {
  margin-top: 6rpx;
}

.stage-tag {
  background: #fff2e8;
  color: #d68a5a;
}

.advice-tip {
  color: #4b463d;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
