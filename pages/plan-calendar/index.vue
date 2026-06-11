<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import type { Goal } from '../../models'
import { formatDate } from '../../services/date'
import {
  buildPlanBundleCalendarView,
  getPlanStatusLabel,
  type PlanBundleCalendarView
} from '../../services/plan-view'
import { getCurrentGoal, migrateLegacyDailyPlans } from '../../services/storage'
import {
  buildCalendarWeekDays,
  formatMonthDay,
  formatShortDate,
  getDayStateLabel,
  getDayTone,
  getTaskMinimumLine,
  getTaskMinutes,
  getTaskPriorityLabel,
  getTaskTitle,
  getWeekdayLabel,
  isHighPriority
} from './calendar-helpers'

const goal = ref<Goal | null>(null)
const calendarView = ref<PlanBundleCalendarView | null>(null)
const isLoading = ref(true)
const today = formatDate(new Date())
const selectedDate = ref(today)

const plan = computed(() => calendarView.value?.plan ?? null)
const sourceDays = computed(() => calendarView.value?.days ?? [])
const weekDays = computed(() =>
  buildCalendarWeekDays(sourceDays.value, {
    today,
    limit: 7
  })
)
const progress = computed(() => calendarView.value?.progress ?? null)
const timePressure = computed(() => calendarView.value?.timePressure ?? null)
const hasPlan = computed(() => calendarView.value !== null)
const selectedDay = computed(
  () => weekDays.value.find((day) => day.date === selectedDate.value) ?? weekDays.value[0] ?? null
)
const selectedTasks = computed(() => selectedDay.value?.tasks ?? [])
const taskPreview = computed(() => selectedTasks.value.slice(0, 1))
const todayDayId = computed(() => getDayId(today))
const progressPercent = computed(() => progress.value?.progressPercent ?? 0)
const progressPercentStyle = computed(() => `${progressPercent.value}%`)
const deadlineLabel = computed(() => plan.value?.deadline ?? goal.value?.deadline ?? '-')
const dailyAvailableMinutes = computed(() => plan.value?.dailyAvailableMinutes ?? Number.POSITIVE_INFINITY)
const planStatusText = computed(() => (plan.value ? getPlanStatusLabel(plan.value.status) : '-'))
const remainingDaysLabel = computed(() => {
  const remainingDays = timePressure.value?.remainingDays

  if (remainingDays === undefined) {
    return '待确认'
  }

  if (remainingDays <= 0) {
    return '已到期'
  }

  return `还剩 ${remainingDays} 天`
})

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
    selectedDate.value = today
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

function openDateDetail(date: string): void {
  selectedDate.value = date
  uni.navigateTo({
    url: `/pages/plan-calendar/detail?date=${encodeURIComponent(date)}`
  })
}

function getDayId(date: string): string {
  return `calendar-day-${date}`
}
</script>

<template>
  <view class="page">
    <AppPageHeader title="任务日历" />

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
          <view class="icon-kicker">
            <image
              class="section-icon"
              src="/static/icons/page/calendar/target.png"
              mode="aspectFit"
            />
            <text class="card-kicker">当前目标</text>
          </view>
          <button
            class="switch-button"
            @tap="goAdjustPlan"
          >
            切换目标
          </button>
        </view>

        <text class="goal-title">{{ goal?.title ?? '当前目标' }}</text>

        <view class="deadline-row">
          <image
            class="meta-icon"
            src="/static/icons/page/calendar/calendar.png"
            mode="aspectFit"
          />
          <text class="deadline-text">截止 {{ deadlineLabel }}</text>
          <text class="deadline-count">{{ remainingDaysLabel }}</text>
        </view>

        <view class="goal-metrics">
          <view class="metric-item">
            <text class="metric-label">任务 {{ progress?.totalTaskCount ?? 0 }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">还需 {{ progress?.remainingEstimatedMinutes ?? 0 }} 分</text>
          </view>
          <view class="metric-item">
            <text
              class="metric-label status-value"
              :class="timePressure ? `pressure-${timePressure.level}` : ''"
            >
              状态 {{ planStatusText }}
            </text>
          </view>
        </view>
      </view>

      <view
        v-if="progress && timePressure"
        class="progress-card"
      >
        <view class="section-head">
          <view class="section-copy-wrap">
            <text class="section-title">整体进度</text>
            <text class="section-copy">目标维度</text>
          </view>
          <view class="advice-link">
            <image
              class="meta-icon"
              src="/static/icons/page/calendar/sparkle.png"
              mode="aspectFit"
            />
            <text>AI 建议</text>
          </view>
        </view>

        <view class="progress-main">
          <view class="progress-track">
            <view
              class="progress-bar"
              :style="{ width: progressPercentStyle }"
            />
          </view>
          <text class="progress-number">{{ progressPercent }}%</text>
        </view>

        <view class="progress-metrics">
          <view class="progress-metric">
            <text class="progress-value">{{ progress.completedTaskCount }}/{{ progress.totalTaskCount }}</text>
            <text class="progress-label">完成任务</text>
          </view>
          <view class="progress-metric">
            <text class="progress-value">{{ progress.remainingEstimatedMinutes }}分</text>
            <text class="progress-label">还需时间</text>
          </view>
          <view class="progress-metric">
            <text class="progress-value">{{ timePressure.remainingDays }}天</text>
            <text class="progress-label">剩余天数</text>
          </view>
          <view class="progress-metric">
            <text class="progress-value">{{ timePressure.requiredDailyMinutes }}分</text>
            <text class="progress-label">每日约需</text>
          </view>
        </view>
      </view>

      <view class="week-board">
        <view class="section-head">
          <view class="icon-title">
            <image
              class="section-icon"
              src="/static/icons/page/calendar/week.png"
              mode="aspectFit"
            />
            <text class="section-title">未来 7 天计划概览</text>
          </view>
          <text class="week-mode">周视图</text>
        </view>

        <scroll-view
          class="day-strip"
          scroll-x
          :scroll-into-view="todayDayId"
          :show-scrollbar="false"
        >
          <view class="day-strip-inner">
            <button
              v-for="day in weekDays"
              :id="getDayId(day.date)"
              :key="day.date"
              class="day-chip"
              :class="[
                `day-${getDayTone(day, dailyAvailableMinutes)}`,
                { selected: day.date === selectedDate, today: day.isToday }
              ]"
              @tap="openDateDetail(day.date)"
            >
              <text class="weekday-label">{{ getWeekdayLabel(day.date).replace('星期', '') }}</text>
              <text class="date-label">{{ formatShortDate(day.date) }}</text>
              <text
                class="day-state"
                :class="{ 'today-pill': day.isToday }"
              >
                {{ day.isToday ? '今天' : getDayStateLabel(day, dailyAvailableMinutes) }}
              </text>
              <text class="day-task-count">{{ day.taskCount > 0 ? day.taskCount : '-' }}</text>
              <text class="day-minutes">{{ day.taskCount > 0 ? `${day.totalMinutes}分钟` : '休息日' }}</text>
            </button>
          </view>
        </scroll-view>

        <view class="legend-row">
          <text class="legend-item legend-task">有任务</text>
          <text class="legend-item legend-done">已完成</text>
          <text class="legend-item legend-buffer">缓冲日</text>
          <text class="legend-item legend-empty">无任务</text>
          <text class="legend-item legend-risk">风险</text>
        </view>
      </view>

      <view
        v-if="selectedDay"
        class="selected-day-card"
      >
        <view class="section-head">
          <view class="section-copy-wrap">
            <text class="selected-title">{{ formatMonthDay(selectedDay.date) }} {{ selectedDay.isToday ? '今天' : getWeekdayLabel(selectedDay.date) }}</text>
            <text class="section-copy">预计 {{ selectedDay.totalMinutes }} 分钟 · {{ selectedDay.taskCount }} 个任务</text>
          </view>
          <button
            class="text-button"
            @tap="openDateDetail(selectedDay.date)"
          >
            查看全天
          </button>
        </view>

        <view
          v-if="taskPreview.length > 0"
          class="compact-task-list"
        >
          <view
            v-for="task in taskPreview"
            :key="task.id"
            class="compact-task"
          >
            <view class="task-check" />
            <view class="compact-task-main">
              <view class="task-line">
                <text class="compact-title">{{ getTaskTitle(task) }}</text>
                <text
                  v-if="isHighPriority(task)"
                  class="priority-chip"
                >
                  重点
                </text>
              </view>
              <text class="minimum-line">最低完成线：{{ getTaskMinimumLine(task) }}</text>
              <view class="task-meta-row">
                <text class="meta-dot" />
                <text>{{ getTaskMinutes(task) }}分钟</text>
                <text class="meta-separator">·</text>
                <text>{{ getTaskPriorityLabel(task) }}</text>
              </view>
            </view>
          </view>
        </view>
        <text
          v-else
          class="empty-day"
        >
          这天暂时没有任务，可以作为缓冲日。
        </text>
      </view>

      <button
        class="adjust-card"
        @tap="goAdjustPlan"
      >
        <view class="adjust-icon-wrap">
          <image
            class="section-icon"
            src="/static/icons/page/calendar/adjust.png"
            mode="aspectFit"
          />
        </view>
        <view class="adjust-copy">
          <text class="adjust-title">调整计划</text>
          <text class="adjust-subtitle">修改可用时间、截止日期或重新生成计划</text>
        </view>
        <text class="chevron">›</text>
      </button>
    </template>
  </view>
</template>

<style scoped lang="scss">
@use "../../styles/ui" as ui;

.page {
  @include ui.page-shell;
}

.switch-button,
.text-button,
.adjust-card {
  @include ui.button-reset;
}

.goal-plan-card,
.progress-card,
.week-board,
.selected-day-card {
  @include ui.card;

  margin-top: 22rpx;
}

.goal-plan-card {
  margin-top: 0;
}

.card-head,
.section-head,
.deadline-row,
.icon-kicker,
.icon-title,
.advice-link,
.task-line,
.task-meta-row,
.adjust-card {
  display: flex;
  align-items: center;
}

.card-head,
.section-head {
  justify-content: space-between;
  gap: 16rpx;
}

.section-copy-wrap,
.compact-task-main,
.adjust-copy {
  min-width: 0;
}

.truncate,
.card-kicker,
.goal-title,
.deadline-text,
.deadline-count,
.metric-label,
.section-title,
.section-copy,
.progress-value,
.progress-label,
.legend-item,
.selected-title,
.compact-title,
.minimum-line,
.empty-day,
.adjust-title,
.adjust-subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-kicker,
.icon-title,
.advice-link,
.deadline-row,
.task-meta-row {
  gap: 8rpx;
}

.section-icon {
  display: block;
  width: 36rpx;
  height: 36rpx;
}

.meta-icon {
  display: block;
  width: 28rpx;
  height: 28rpx;
}

.card-kicker,
.section-copy,
.deadline-text,
.metric-label,
.progress-label,
.minimum-line,
.empty-day,
.adjust-subtitle {
  @include ui.helper-text;
}

.card-kicker,
.advice-link,
.week-mode {
  color: ui.$accent-pressed;
  font-weight: 600;
}

.switch-button {
  height: 60rpx;
  padding: 0 20rpx;
  border: 2rpx solid ui.$border;
  border-radius: 999rpx;
  background: ui.$surface;
  color: ui.$body;
  font-size: 24rpx;
  line-height: 56rpx;
}

.goal-title {
  margin-top: 18rpx;
  color: ui.$ink;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.25;
}

.deadline-row {
  margin-top: 18rpx;
}

.deadline-text {
  max-width: 300rpx;
}

.deadline-count {
  max-width: 180rpx;
  color: #ff5d42;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
}

.goal-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid ui.$surface-soft;
}

.metric-item {
  min-width: 0;
  padding: 0 14rpx;
  border-right: 2rpx solid ui.$surface-soft;
}

.metric-item:first-child {
  padding-left: 0;
}

.metric-item:last-child {
  padding-right: 0;
  border-right: 0;
}

.status-value {
  color: ui.$success;
  font-weight: 700;
}

.pressure-tight,
.pressure-overdue {
  color: #9a6b1e;
}

.section-title {
  @include ui.section-title(32rpx);
}

.advice-link,
.week-mode {
  flex: 0 0 auto;
  font-size: 24rpx;
  line-height: 1.4;
}

.progress-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18rpx;
  align-items: center;
  margin-top: 24rpx;
}

.progress-track {
  height: 20rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: ui.$surface-soft;
}

.progress-bar {
  height: 100%;
  border-radius: 999rpx;
  background: ui.$accent;
}

.progress-number {
  color: ui.$ink;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1;
}

.progress-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  margin-top: 24rpx;
}

.progress-metric {
  min-width: 0;
  padding: 0 10rpx;
  border-right: 2rpx solid ui.$surface-soft;
}

.progress-metric:first-child {
  padding-left: 0;
}

.progress-metric:last-child {
  padding-right: 0;
  border-right: 0;
}

.progress-value {
  color: ui.$ink;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.35;
}

.progress-label {
  margin-top: 4rpx;
}

.day-strip {
  margin-top: 22rpx;
  width: 100%;
  white-space: nowrap;
}

.day-strip-inner {
  display: inline-flex;
  gap: 12rpx;
  padding-bottom: 4rpx;
}

.day-chip {
  flex: 0 0 132rpx;
  min-height: 206rpx;
  padding: 14rpx 12rpx;
  border: 2rpx solid ui.$border;
  border-radius: 18rpx;
  background: ui.$surface;
  color: ui.$body;
  text-align: center;
  line-height: 1.25;
}

.day-chip.selected,
.day-chip.today {
  border-color: ui.$accent;
}

.weekday-label {
  display: block;
  overflow: visible;
  font-size: 22rpx;
  white-space: nowrap;
}

.date-label {
  display: block;
  overflow: visible;
  margin-top: 8rpx;
  color: ui.$ink;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.day-state {
  display: block;
  overflow: visible;
  margin: 10rpx auto 0;
  font-size: 20rpx;
  white-space: nowrap;
}

.today-pill {
  border-radius: 999rpx;
  background: ui.$accent;
  color: ui.$surface;
  font-weight: 600;
  line-height: 32rpx;
}

.day-task-count {
  display: block;
  width: 34rpx;
  height: 34rpx;
  margin: 12rpx auto 0;
  border-radius: 50%;
  background: ui.$accent;
  color: ui.$surface;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 34rpx;
}

.day-minutes {
  display: block;
  overflow: visible;
  margin-top: 10rpx;
  font-size: 22rpx;
  white-space: nowrap;
}

.day-done .day-task-count {
  background: ui.$success;
}

.day-buffer .day-task-count {
  background: #cbc5bc;
}

.day-risk {
  border-color: #f07155;
}

.day-risk .day-task-count {
  background: #f07155;
}

.day-progress .day-task-count {
  background: ui.$warning;
}

.legend-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 16rpx;
  margin-top: 20rpx;
  overflow: hidden;
}

.legend-item {
  position: relative;
  flex: 0 0 auto;
  padding-left: 18rpx;
  color: ui.$body;
  font-size: 22rpx;
  line-height: 1.4;
}

.legend-item::before {
  position: absolute;
  top: 8rpx;
  left: 0;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: ui.$accent;
  content: "";
}

.legend-done::before {
  background: ui.$success;
}

.legend-buffer::before {
  background: ui.$warning;
}

.legend-empty::before {
  background: #cbc5bc;
}

.legend-risk::before {
  background: #f07155;
}

.selected-title {
  color: ui.$ink;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
}

.text-button {
  @include ui.text-button;

  flex: 0 0 auto;
}

.compact-task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.compact-task {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16rpx;
  padding: 20rpx;
  border: 2rpx solid ui.$border;
  border-radius: 20rpx;
  background: ui.$surface;
}

.task-check {
  width: 32rpx;
  height: 32rpx;
  margin-top: 4rpx;
  border: 3rpx solid #d8d1c7;
  border-radius: 50%;
}

.task-line {
  justify-content: space-between;
  gap: 12rpx;
}

.compact-title {
  min-width: 0;
  color: ui.$ink;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.35;
}

.priority-chip {
  @include ui.status-tag(ui.$accent-soft, ui.$accent-pressed);
}

.minimum-line,
.task-meta-row {
  margin-top: 10rpx;
}

.task-meta-row {
  flex-wrap: nowrap;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.4;
}

.meta-dot {
  display: block;
  width: 10rpx;
  height: 10rpx;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ui.$accent;
}

.meta-separator {
  color: ui.$border;
}

.empty-day {
  margin-top: 20rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  background: ui.$surface-soft;
}

.adjust-card {
  width: 100%;
  margin-top: 24rpx;
  padding: 22rpx;
  border: 2rpx solid ui.$border;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #ffffff 0%, #f5efe3 100%);
  color: ui.$ink;
  text-align: left;
}

.adjust-icon-wrap {
  display: flex;
  width: 58rpx;
  height: 58rpx;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 18rpx;
  background: ui.$surface;
}

.adjust-copy {
  flex: 1;
  margin-left: 18rpx;
}

.adjust-title {
  color: ui.$ink;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.35;
}

.adjust-subtitle {
  margin-top: 4rpx;
}

.chevron {
  flex: 0 0 auto;
  color: ui.$muted;
  font-size: 42rpx;
  line-height: 1;
}
</style>
