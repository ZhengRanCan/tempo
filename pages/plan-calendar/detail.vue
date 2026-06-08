<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import EmptyState from '../../components/EmptyState.vue'
import { formatDate } from '../../services/date'
import {
  buildPlanBundleCalendarView,
  type PlanBundleCalendarView
} from '../../services/plan-view'
import { getCurrentGoal, migrateLegacyDailyPlans } from '../../services/storage'
import {
  buildCalendarWeekDays,
  buildEmptyCalendarDay,
  formatMonthDay,
  getDayTone,
  getTaskMinimumLine,
  getTaskMinutes,
  getTaskPriorityLabel,
  getTaskTitle,
  getWeekdayLabel,
  isHighPriority
} from './calendar-helpers'

interface DetailRouteQuery {
  date?: string
}

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
const selectedDay = computed(
  () =>
    weekDays.value.find((day) => day.date === selectedDate.value) ??
    sourceDays.value.find((day) => day.date === selectedDate.value) ??
    buildEmptyCalendarDay(selectedDate.value, today)
)
const selectedTasks = computed(() => selectedDay.value.tasks)
const planAdvice = computed(() => calendarView.value?.planAdvice ?? [])
const dailyAvailableMinutes = computed(() => plan.value?.dailyAvailableMinutes ?? Number.POSITIVE_INFINITY)
const selectedDayAdvice = computed(() => {
  const day = selectedDay.value

  if (day.taskCount === 0) {
    return '这天可以作为缓冲日，保留给复盘或临时任务。'
  }

  if (getDayTone(day, dailyAvailableMinutes.value) === 'risk') {
    return '这天任务偏重，优先完成重点任务最低线。'
  }

  if (day.tasks.some((task) => isHighPriority(task))) {
    return '先处理重点任务，再推进普通任务。'
  }

  return '按顺序推进，完成最低线就算有效。'
})

onLoad((query?: DetailRouteQuery) => {
  selectedDate.value = typeof query?.date === 'string' ? query.date : today
  updateNavigationTitle()
  void loadDetail()
})

async function loadDetail(): Promise<void> {
  isLoading.value = true

  try {
    const currentGoal = await getCurrentGoal()

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

function goAdjustPlan(): void {
  uni.navigateTo({
    url: '/pages/review/index'
  })
}

function updateNavigationTitle(): void {
  uni.setNavigationBarTitle({
    title: `${selectedDate.value} ${getWeekdayLabel(selectedDate.value)}`
  })
}
</script>

<template>
  <view class="page">
    <EmptyState
      v-if="isLoading"
      title="正在整理这天的任务"
      copy="我在读取已经生成的目标计划。"
    />

    <EmptyState
      v-else-if="!calendarView"
      title="还没有任务计划"
      copy="返回日历概览后，可以先创建一个目标计划。"
    />

    <template v-else>
      <view class="date-detail-card">
        <view class="detail-date-head">
          <view class="date-main">
            <text class="detail-date">{{ formatMonthDay(selectedDay.date) }}</text>
            <text class="detail-weekday">{{ getWeekdayLabel(selectedDay.date) }}</text>
          </view>
          <view class="detail-summary">
            <image
              class="meta-icon"
              src="/static/icons/page/calendar/clock.png"
              mode="aspectFit"
            />
            <text>预计 {{ selectedDay.totalMinutes }} 分钟</text>
            <text class="divider">|</text>
            <text>{{ selectedDay.taskCount }} 个任务</text>
          </view>
        </view>

        <view class="date-advice">
          <text class="date-advice-text">{{ selectedDayAdvice }}</text>
          <image
            class="section-icon"
            src="/static/icons/page/calendar/sparkle.png"
            mode="aspectFit"
          />
        </view>
      </view>

      <view class="task-list-panel">
        <view class="section-head">
          <text class="section-title">任务列表</text>
          <button class="text-button">
            <image
              class="button-icon"
              src="/static/icons/page/calendar/priority.png"
              mode="aspectFit"
            />
            <text>按优先级</text>
          </button>
        </view>

        <view
          v-if="selectedTasks.length > 0"
          class="task-list"
        >
          <view
            v-for="task in selectedTasks"
            :key="task.id"
            class="detail-task"
            :class="{ priority: isHighPriority(task) }"
          >
            <view class="task-check" />
            <view class="detail-task-main">
              <view class="task-line">
                <text class="task-title">{{ getTaskTitle(task) }}</text>
                <text class="priority-chip">{{ isHighPriority(task) ? '重点' : '普通' }}</text>
              </view>
              <text class="minimum-line">最低完成线：{{ getTaskMinimumLine(task) }}</text>
              <view class="task-meta-row">
                <text class="meta-dot" />
                <text>{{ getTaskMinutes(task) }}分钟</text>
                <text class="meta-separator">·</text>
                <text>{{ getTaskPriorityLabel(task) }}</text>
              </view>
              <view class="task-actions">
                <button class="focus-button">开始专注</button>
                <button class="adjust-button">调整日期</button>
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

        <button class="temporary-task-entry">
          + 添加临时任务
        </button>
      </view>

      <view
        v-if="planAdvice.length > 0"
        class="advice-card"
      >
        <view class="section-head">
          <view class="icon-title">
            <image
              class="section-icon"
              src="/static/icons/page/calendar/sparkle.png"
              mode="aspectFit"
            />
            <text class="section-title">AI 计划建议</text>
          </view>
          <text class="section-copy">查看详情</text>
        </view>
        <view class="advice-list">
          <text
            v-for="(tip, index) in planAdvice"
            :key="tip"
            class="advice-tip"
          >
            {{ index + 1 }}. {{ tip }}
          </text>
        </view>
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
          <text class="adjust-subtitle">重新分配时间或重新生成计划</text>
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

.text-button,
.focus-button,
.adjust-button,
.temporary-task-entry,
.adjust-card {
  @include ui.button-reset;
}

.date-detail-card,
.task-list-panel,
.advice-card {
  @include ui.card;

  margin-top: 24rpx;
}

.date-detail-card {
  margin-top: 0;
}

.detail-date-head,
.detail-summary,
.section-head,
.icon-title,
.task-line,
.task-meta-row,
.task-actions,
.adjust-card {
  display: flex;
  align-items: center;
}

.detail-date-head,
.section-head,
.task-line {
  justify-content: space-between;
  gap: 16rpx;
}

.date-main,
.detail-task-main,
.adjust-copy {
  min-width: 0;
}

.detail-date,
.detail-weekday,
.detail-summary,
.date-advice-text,
.section-title,
.section-copy,
.task-title,
.priority-chip,
.minimum-line,
.task-meta-row,
.empty-day,
.advice-tip,
.adjust-title,
.adjust-subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.detail-date {
  color: ui.$ink;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.2;
}

.detail-weekday,
.detail-summary,
.section-copy,
.minimum-line,
.task-meta-row,
.empty-day,
.advice-tip,
.adjust-subtitle {
  @include ui.helper-text;
}

.detail-weekday {
  margin-top: 10rpx;
}

.detail-summary {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8rpx;
  max-width: 360rpx;
}

.divider {
  color: ui.$border;
}

.date-advice {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18rpx;
  align-items: center;
  margin-top: 28rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: ui.$accent-soft;
}

.date-advice-text {
  color: #35305f;
  font-size: 28rpx;
  line-height: 1.5;
}

.section-title {
  @include ui.section-title(32rpx);
}

.icon-title {
  min-width: 0;
  gap: 8rpx;
}

.text-button {
  @include ui.text-button;

  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  justify-content: center;
  gap: 6rpx;
}

.button-icon {
  display: block;
  width: 24rpx;
  height: 24rpx;
}

.task-list,
.advice-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.detail-task {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18rpx;
  padding: 24rpx;
  border: 2rpx solid ui.$border;
  border-radius: 22rpx;
  background: ui.$surface;
}

.detail-task.priority {
  border-left: 6rpx solid ui.$accent;
}

.task-check {
  width: 34rpx;
  height: 34rpx;
  margin-top: 4rpx;
  border: 3rpx solid #d8d1c7;
  border-radius: 50%;
}

.task-title {
  min-width: 0;
  color: ui.$ink;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.35;
}

.priority-chip {
  @include ui.status-tag(ui.$accent-soft, ui.$accent-pressed);
}

.minimum-line,
.task-meta-row,
.task-actions {
  margin-top: 12rpx;
}

.task-meta-row {
  flex-wrap: nowrap;
  gap: 8rpx;
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

.task-actions {
  gap: 18rpx;
}

.focus-button {
  @include ui.primary-button(76rpx);

  flex: 1;
  font-size: 26rpx;
}

.adjust-button {
  @include ui.secondary-button(76rpx);

  flex: 1;
  font-size: 26rpx;
}

.empty-day {
  margin-top: 22rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: ui.$surface-soft;
}

.temporary-task-entry {
  width: 100%;
  height: 92rpx;
  margin-top: 22rpx;
  border: 2rpx dashed #d8d1c7;
  border-radius: 22rpx;
  background: ui.$surface;
  color: ui.$accent-pressed;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 88rpx;
}

.advice-tip {
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.5;
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
