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
const selectedEnergy = ref<TodaySuggestionView['energyLevel']>('normal')
const selectedTimeOption = ref<'15' | '30' | '60' | 'custom'>('30')
const selectedMood = ref<'anxious' | 'normal' | 'sprint'>('normal')
const emptyTitle = computed(() => (goal.value ? '今天暂无任务' : '今天还没有任务'))
const emptyCopy = computed(() =>
  goal.value
    ? '当前目标今天没有安排任务，可以去日历查看后续计划。'
    : '先创建一个目标，我会帮你拆成每天能做的小步。'
)
const emptyActionLabel = computed(() => (goal.value ? '查看日历' : '创建目标'))

const energyOptions: Array<{
  value: TodaySuggestionView['energyLevel'] | 'more'
  label: string
}> = [
  {
    value: 'low',
    label: '低'
  },
  {
    value: 'normal',
    label: '普通'
  },
  {
    value: 'high',
    label: '高'
  },
  {
    value: 'more',
    label: '更多'
  }
]
const timeOptions: Array<{
  value: '15' | '30' | '60' | 'custom'
  label: string
}> = [
  {
    value: '15',
    label: '15 分钟'
  },
  {
    value: '30',
    label: '30 分钟'
  },
  {
    value: '60',
    label: '60 分钟'
  },
  {
    value: 'custom',
    label: '自定义'
  }
]
const moodOptions: Array<{
  value: 'anxious' | 'normal' | 'sprint'
  label: string
}> = [
  {
    value: 'anxious',
    label: '有点焦虑'
  },
  {
    value: 'normal',
    label: '正常'
  },
  {
    value: 'sprint',
    label: '想冲刺'
  }
]

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
      selectedEnergy.value = 'normal'
      selectedTimeOption.value = '30'
      selectedMood.value = 'normal'
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
    selectedEnergy.value = todayView.value?.energyLevel ?? userProfile?.energyLevel ?? 'normal'
    selectedTimeOption.value = getTimeOption(todayView.value?.availableMinutes ?? 30)
    selectedMood.value = todayView.value?.energyLevel === 'low' ? 'anxious' : 'normal'
  } finally {
    isLoading.value = false
  }
}

function goCreateGoal(): void {
  uni.switchTab({
    url: '/pages/goal-create/index'
  })
}

function goPlanCalendar(): void {
  uni.switchTab({
    url: '/pages/plan-calendar/index'
  })
}

function handleEmptyAction(): void {
  if (goal.value) {
    goPlanCalendar()
    return
  }

  goCreateGoal()
}

function goReview(): void {
  uni.navigateTo({
    url: '/pages/review/index'
  })
}

function goManageStatus(): void {
  uni.showToast({
    title: '今日状态管理入口预留',
    icon: 'none'
  })
}

function toggleAllTasks(): void {
  showAllTasks.value = !showAllTasks.value
}

function selectEnergy(value: TodaySuggestionView['energyLevel'] | 'more'): void {
  if (value === 'more') {
    goManageStatus()
    return
  }

  selectedEnergy.value = value
}

function selectTime(value: '15' | '30' | '60' | 'custom'): void {
  selectedTimeOption.value = value

  if (value === 'custom') {
    uni.showToast({
      title: '自定义时间入口预留',
      icon: 'none'
    })
  }
}

function selectMood(value: 'anxious' | 'normal' | 'sprint'): void {
  selectedMood.value = value
}

function startFocus(): void {
  uni.showToast({
    title: '专注流程入口预留',
    icon: 'none'
  })
}

function markFocusDone(): void {
  uni.showToast({
    title: '可在晚间复盘中记录完成',
    icon: 'none'
  })
}

function getTimeOption(minutes: number): '15' | '30' | '60' | 'custom' {
  if (minutes <= 15) {
    return '15'
  }

  if (minutes <= 30) {
    return '30'
  }

  if (minutes <= 60) {
    return '60'
  }

  return 'custom'
}
</script>

<template>
  <view class="page">
    <AppPageHeader
      title="今日任务"
    />

    <EmptyState
      v-if="isLoading"
      title="正在整理今日任务"
      copy="我在查看今天适合先做哪一步。"
    />

    <EmptyState
      v-else-if="!hasTodayTask"
      :title="emptyTitle"
      :copy="emptyCopy"
      :action-label="emptyActionLabel"
      @action="handleEmptyAction"
    />

    <template v-else-if="todayView">
      <TodayFocusCard
        :extra-task-preview="extraTaskPreview"
        :goal-title="goal?.title"
        :recommended-focus-window="todayView.recommendedFocusWindow"
        :show-all-tasks="showAllTasks"
        :task="todayView.focusTask"
        :task-count="taskCount"
        @done="markFocusDone"
        @start="startFocus"
        @toggle-all="toggleAllTasks"
      />

      <view
        v-if="showAllTasks"
        class="all-task-panel"
      >
        <view class="section-head">
          <view class="module-title">
            <image
              class="section-icon"
              src="/static/icons/page/today/list.png"
              mode="aspectFit"
            />
            <text class="section-title">今日全部任务</text>
          </view>
          <text class="focus-list-tag">重点已置顶</text>
        </view>
        <view class="task-list">
          <TaskCard
            v-for="task in todayView.tasks"
            :key="task.id"
            :task="task"
          >
            <template
              v-if="task.id === todayView.focusTask.id"
              #action
            >
              <text class="focus-inline-tag">今日重点</text>
            </template>
          </TaskCard>
        </view>
      </view>

      <view class="status-card">
        <view class="section-head">
          <view class="module-title">
            <image
              class="section-icon"
              src="/static/icons/page/today/status-wave.png"
              mode="aspectFit"
            />
            <text class="section-title">调整今日状态</text>
          </view>
          <button
            class="text-button"
            @tap="goManageStatus"
          >
            管理 ›
          </button>
        </view>
        <view class="status-rows">
          <view class="status-row">
            <text class="item-label">当前能量</text>
            <view class="segmented-options energy-options">
              <button
                v-for="option in energyOptions"
                :key="option.value"
                class="option-chip"
                :class="{ active: selectedEnergy === option.value }"
                @tap="selectEnergy(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>
          <view class="status-row">
            <text class="item-label">可用时间</text>
            <view class="segmented-options">
              <button
                v-for="option in timeOptions"
                :key="option.value"
                class="option-chip"
                :class="{ active: selectedTimeOption === option.value }"
                @tap="selectTime(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>
          <view class="status-row">
            <text class="item-label">当前状态</text>
            <view class="segmented-options mood-options">
              <button
                v-for="option in moodOptions"
                :key="option.value"
                class="option-chip"
                :class="{ active: selectedMood === option.value }"
                @tap="selectMood(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>
        </view>
        <text class="helper">{{ todayView.pressureNote }}</text>
      </view>

      <view class="advice-card">
        <view class="section-head">
          <view class="module-title">
            <image
              class="section-icon"
              src="/static/icons/page/today/sparkle.png"
              mode="aspectFit"
            />
            <text class="section-title">AI 今日建议</text>
          </view>
          <view class="keyword-tag">
            <image
              class="keyword-icon"
              src="/static/icons/page/today/sparkle.png"
              mode="aspectFit"
            />
            <text>今日关键词：{{ todayView.dailyKeyword }}</text>
          </view>
        </view>
        <view class="advice-list">
          <view
            v-for="tip in visibleSuggestionTips"
            :key="tip"
            class="advice-tip"
          >
            <text class="advice-dot">•</text>
            <text class="advice-text">{{ tip }}</text>
          </view>
        </view>
        <text class="advice-note">关键词和灵感只用于提醒节奏，不作为预测依据。</text>
      </view>

      <view class="review-entry">
        <view class="review-content">
          <view class="module-title">
            <image
              class="section-icon"
              src="/static/icons/page/today/moon.png"
              mode="aspectFit"
            />
            <text class="review-title">晚间复盘</text>
          </view>
          <text class="review-copy">晚上记录完成情况，我会自动帮你重排明天。</text>
        </view>
        <button
          class="review-button"
          @tap="goReview"
        >
          去复盘
        </button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
@use "../../styles/ui" as ui;

.page {
  @include ui.page-shell;

  padding-top: 28rpx;
}

.all-task-panel,
.status-card,
.advice-card,
.review-entry {
  @include ui.card(24rpx, 24rpx);

  margin-top: 20rpx;
}

.section-head,
.review-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title,
.helper,
.item-label,
.advice-note,
.review-title,
.review-copy {
  display: block;
}

.helper,
.review-copy {
  margin-top: 8rpx;
  @include ui.helper-text;
}

.section-title {
  @include ui.section-title;
}

.module-title {
  display: inline-flex;
  gap: 12rpx;
  align-items: center;
  min-width: 0;
}

.section-icon {
  display: block;
  flex: 0 0 auto;
  width: 36rpx;
  height: 36rpx;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 18rpx;
}

.focus-list-tag,
.focus-inline-tag {
  @include ui.status-tag(ui.$accent-soft, ui.$accent-pressed);
}

.focus-inline-tag {
  align-self: flex-start;
}

.text-button {
  @include ui.text-button;
}

.status-rows {
  margin-top: 16rpx;
}

.status-row {
  display: grid;
  grid-template-columns: 148rpx minmax(0, 1fr);
  gap: 16rpx;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 2rpx solid ui.$surface-soft;
}

.status-row:last-child {
  border-bottom: 0;
}

.item-label {
  color: ui.$muted;
  font-size: 25rpx;
  line-height: 1.4;
}

.segmented-options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
}

.mood-options {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.option-chip {
  @include ui.option-chip;

  min-height: 58rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  font-size: 25rpx;
  line-height: 58rpx;
}

.option-chip.active {
  border-color: ui.$accent;
  background: ui.$accent-soft;
  color: ui.$accent-pressed;
  font-weight: 600;
}

.keyword-tag {
  @include ui.status-tag(ui.$warm-soft, ui.$warm);

  display: inline-flex;
  gap: 8rpx;
  align-items: center;
  max-width: 52%;
}

.keyword-icon {
  display: block;
  flex: 0 0 auto;
  width: 28rpx;
  height: 28rpx;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 16rpx;
}

.advice-tip {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  color: ui.$body;
  font-size: 26rpx;
  line-height: 1.45;
}

.advice-dot {
  flex: 0 0 auto;
  color: ui.$accent;
  font-size: 30rpx;
  line-height: 1.25;
}

.advice-text {
  flex: 1 1 auto;
  min-width: 0;
}

.advice-note {
  margin-top: 14rpx;
  color: ui.$muted;
  font-size: 22rpx;
  line-height: 1.5;
}

.review-content {
  flex: 1 1 auto;
  min-width: 0;
}

.review-title {
  @include ui.section-title;
}

.review-button {
  @include ui.primary-button(72rpx);

  flex: 0 0 152rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
}
</style>
