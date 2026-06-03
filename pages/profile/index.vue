<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import type { Goal, UserProfile } from '../../models'
import { buildPlanProgress, type PlanProgress } from '../../services/plan-view'
import { getCurrentGoal, getUserProfile, migrateLegacyDailyPlans } from '../../services/storage'

const goal = ref<Goal | null>(null)
const profile = ref<UserProfile | null>(null)
const progress = ref<PlanProgress | null>(null)
const isLoading = ref(true)

const workStyleText = computed(() => {
  const labels: Record<UserProfile['workStyle'], string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
    flexible: '都可以'
  }

  return labels[profile.value?.workStyle ?? 'flexible']
})

const energyText = computed(() => {
  const labels: Record<UserProfile['energyLevel'], string> = {
    low: '低能量',
    normal: '普通状态',
    high: '高能量'
  }

  return labels[profile.value?.energyLevel ?? 'normal']
})

const ritualText = computed(() => {
  const labels: Record<UserProfile['ritualPreference'], string> = {
    simple: '简洁提醒',
    warm: '温和陪伴',
    energetic: '轻快行动'
  }

  return labels[profile.value?.ritualPreference ?? 'simple']
})

const mbtiText = computed(() => profile.value?.mbti || '未填写')
const focusMinutesText = computed(() => `${profile.value?.preferredFocusMinutes ?? 30} 分钟`)
const goalStatusText = computed(() => {
  const labels: Record<Goal['status'], string> = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成',
    archived: '已归档',
    cancelled: '已取消'
  }

  return labels[goal.value?.status ?? 'active']
})

const progressSummary = computed(() => {
  if (!progress.value) {
    return {
      percent: 0,
      completed: 0,
      total: 0,
      remainingMinutes: 0
    }
  }

  return {
    percent: progress.value.progressPercent,
    completed: progress.value.completedTaskCount,
    total: progress.value.totalTaskCount,
    remainingMinutes: progress.value.remainingEstimatedMinutes
  }
})

onShow(() => {
  void loadProfile()
})

async function loadProfile(): Promise<void> {
  isLoading.value = true

  try {
    const [currentGoal, userProfile] = await Promise.all([getCurrentGoal(), getUserProfile()])
    goal.value = currentGoal
    profile.value = userProfile
    if (!currentGoal) {
      progress.value = null
      return
    }

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)
    progress.value = bundleResult.data ? buildPlanProgress(bundleResult.data) : null
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

function manageGoal(): void {
  uni.showToast({
    title: '目标管理入口预留',
    icon: 'none'
  })
}

function openSettingEntry(title: string): void {
  uni.showToast({
    title,
    icon: 'none'
  })
}
</script>

<template>
  <view class="page">
    <AppPageHeader
      title="我的"
      hint="查看目标、偏好和最近推进"
    />

    <EmptyState
      v-if="isLoading"
      title="正在读取本地偏好"
      copy="稍等一下，马上就能看到当前目标和状态。"
    />

    <template v-else>
      <view
        v-if="goal"
        class="panel goal-card"
      >
        <view class="panel-heading">
          <text class="section-title">当前目标</text>
          <text class="status-pill">{{ goalStatusText }}</text>
        </view>
        <text class="main-value">{{ goal.title }}</text>
        <text class="helper">截止日期 {{ goal.deadline }}</text>
        <view class="progress-strip">
          <text class="progress-value">{{ progressSummary.percent }}%</text>
          <text class="helper">
            已完成 {{ progressSummary.completed }} / {{ progressSummary.total }} 个任务，剩余约 {{ progressSummary.remainingMinutes }} 分钟
          </text>
        </view>
        <view class="action-row">
          <button
            class="primary-button"
            @tap="goPlanCalendar"
          >
            查看计划
          </button>
          <button
            class="secondary-button"
            @tap="manageGoal"
          >
            管理目标
          </button>
        </view>
      </view>

      <view
        v-else
        class="profile-empty"
      >
        <EmptyState
          title="还没有目标"
          copy="先创建一个目标，再生成每天可以执行的计划。"
          action-label="创建目标"
          @action="goCreateGoal"
        />
      </view>

      <view class="panel schedule-card">
        <text class="section-title">默认安排偏好</text>
        <view class="profile-grid">
          <view class="profile-item">
            <text class="item-label">每日专注</text>
            <text class="item-value">{{ focusMinutesText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">偏好时段</text>
            <text class="item-value">{{ workStyleText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">当前能量</text>
            <text class="item-value">{{ energyText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">计划强度</text>
            <text class="item-value">温和推进</text>
          </view>
        </view>
      </view>

      <view class="panel expression-card">
        <text class="section-title">AI 表达与仪式感</text>
        <view class="profile-grid">
          <view class="profile-item">
            <text class="item-label">MBTI</text>
            <text class="item-value">{{ mbtiText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">仪式感</text>
            <text class="item-value">{{ ritualText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">每日关键词</text>
            <text class="item-value">短句提醒</text>
          </view>
          <view class="profile-item">
            <text class="item-label">使用边界</text>
            <text class="item-value">仅影响表达</text>
          </view>
        </view>
        <text class="helper">
          MBTI、仪式感和每日关键词不作为任务安排硬参数。
        </text>
      </view>

      <view class="panel recent-card">
        <text class="section-title">最近推进</text>
        <view
          v-if="goal"
          class="recent-row"
        >
          <text class="recent-value">{{ progressSummary.completed }}</text>
          <text class="helper">
            已完成任务，当前整体进度 {{ progressSummary.percent }}%
          </text>
        </view>
        <text
          v-else
          class="helper"
        >
          创建目标后，这里会展示最近推进情况。
        </text>
      </view>

      <view class="panel settings-card">
        <text class="section-title">设置入口</text>
        <view class="settings-list">
          <button
            class="setting-item"
            @tap="openSettingEntry('偏好设置入口预留')"
          >
            偏好设置
          </button>
          <button
            class="setting-item"
            @tap="openSettingEntry('复盘记录入口预留')"
          >
            复盘记录
          </button>
          <button
            class="setting-item"
            @tap="openSettingEntry('关于与反馈入口预留')"
          >
            关于与反馈
          </button>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
@use "../../styles/ui" as ui;

.page {
  @include ui.page-shell;
}

.panel {
  @include ui.card;
}

.panel + .panel,
.panel + .profile-empty,
.profile-empty + .panel {
  margin-top: 24rpx;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title,
.main-value,
.helper,
.item-label,
.item-value,
.recent-value {
  display: block;
}

.section-title {
  @include ui.section-title;
}

.status-pill {
  @include ui.status-tag(ui.$accent-soft, ui.$accent-pressed);

  font-size: 22rpx;
}

.main-value {
  margin-top: 18rpx;
  color: ui.$ink;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1.35;
}

.helper {
  margin-top: 12rpx;
  @include ui.helper-text(26rpx);
}

.progress-strip {
  @include ui.soft-block(22rpx, 20rpx);

  margin-top: 20rpx;
  background: ui.$accent-soft;
}

.progress-value,
.recent-value {
  color: ui.$accent-pressed;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.3;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 24rpx;
}

.primary-button,
.secondary-button,
.setting-item {
  font-size: 30rpx;
}

.primary-button {
  @include ui.primary-button(84rpx);
}

.secondary-button,
.setting-item {
  @include ui.secondary-button(84rpx);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
}

.profile-item {
  min-height: 112rpx;
  @include ui.soft-block(22rpx, 20rpx);
}

.item-label {
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.4;
}

.item-value {
  margin-top: 6rpx;
  color: ui.$ink;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.35;
}

.recent-row {
  margin-top: 20rpx;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 20rpx;
}

.setting-item {
  text-align: left;
  padding: 0 24rpx;
}
</style>
