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
    normal: '普通',
    high: '高能量'
  }

  return labels[profile.value?.energyLevel ?? 'normal']
})

const ritualText = computed(() => {
  const labels: Record<UserProfile['ritualPreference'], string> = {
    simple: '简洁提醒',
    warm: '温和鼓励',
    energetic: '轻快行动'
  }

  return labels[profile.value?.ritualPreference ?? 'simple']
})

const mbtiText = computed(() => profile.value?.mbti || '未填写')
const focusMinutes = computed(() => profile.value?.preferredFocusMinutes ?? 30)
const focusMinutesText = computed(() => `${focusMinutes.value} 分钟`)
const planIntensityText = computed(() => '均衡')

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

const remainingDaysText = computed(() => {
  if (!goal.value) {
    return '未设置'
  }

  const today = formatDate(new Date())
  const remainingDays = getInclusiveRemainingDays(today, goal.value.deadline)

  if (remainingDays <= 0) {
    return '今天到期'
  }

  return `还剩 ${remainingDays} 天`
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

const progressBarStyle = computed(() => ({
  width: `${Math.max(progressSummary.value.percent, 4)}%`
}))

const focusTimeText = computed(() => {
  if (!goal.value || progressSummary.value.completed === 0) {
    return '0 分钟'
  }

  return `${progressSummary.value.completed * focusMinutes.value} 分钟`
})

const streakDaysText = computed(() => {
  if (!goal.value || progressSummary.value.completed === 0) {
    return '0 天'
  }

  return '1 天'
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

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getInclusiveRemainingDays(today: string, deadline: string): number {
  const todayTime = Date.parse(`${today}T00:00:00.000Z`)
  const deadlineTime = Date.parse(`${deadline}T00:00:00.000Z`)

  if (!Number.isFinite(deadlineTime) || deadlineTime <= todayTime) {
    return 0
  }

  return Math.floor((deadlineTime - todayTime) / 86400000) + 1
}
</script>

<template>
  <view class="page">
    <AppPageHeader title="我的" />

    <EmptyState
      v-if="isLoading"
      title="正在读取本地偏好"
      copy="稍等一下，马上就能看到当前目标和状态。"
    />

    <template v-else>
      <view class="greeting-strip">
        <view class="avatar-mark">
          <text class="avatar-text">我</text>
        </view>
        <view class="greeting-copy">
          <view class="greeting-title-row">
            <text class="greeting-title">嗨，今天也要好好推进目标哦</text>
            <image
              class="inline-icon grass-icon"
              src="/static/icons/page/profile/grass.png"
              mode="aspectFit"
            />
          </view>
          <text class="greeting-subtitle">小目标的积累，会带来大改变。</text>
        </view>
        <text class="chevron">›</text>
      </view>

      <view
        v-if="goal"
        class="profile-card goal-card"
      >
        <view class="goal-content">
          <view class="card-title-row">
            <view class="title-main">
              <image
                class="section-icon"
                src="/static/icons/page/profile/goal.png"
                mode="aspectFit"
              />
              <text class="section-title">当前目标</text>
            </view>
            <text class="status-pill">{{ goalStatusText }}</text>
          </view>

          <view class="goal-main-row">
            <view class="goal-copy">
              <text class="goal-title">{{ goal.title }}</text>
              <view class="deadline-row">
                <image
                  class="meta-icon"
                  src="/static/icons/page/profile/calendar.png"
                  mode="aspectFit"
                />
                <text class="deadline-text">截止日期 {{ goal.deadline }}</text>
                <text class="deadline-separator">|</text>
                <text class="remaining-text">{{ remainingDaysText }}</text>
              </view>
            </view>
            <image
              class="goal-hero-icon"
              src="/static/icons/page/profile/goal-hero.png"
              mode="aspectFit"
            />
          </view>

          <view class="progress-row">
            <text class="progress-label">
              整体进度 {{ progressSummary.completed }} / {{ progressSummary.total }} 个任务
            </text>
            <text class="progress-percent">{{ progressSummary.percent }}%</text>
          </view>
          <view class="progress-track">
            <view
              class="progress-fill"
              :style="progressBarStyle"
            />
          </view>

          <view class="action-row">
            <button
              class="secondary-button"
              @tap="goPlanCalendar"
            >
              查看计划
            </button>
            <button
              class="primary-button"
              @tap="manageGoal"
            >
              管理目标
            </button>
          </view>
        </view>
      </view>

      <view
        v-else
        class="profile-card no-goal-card"
      >
        <view class="card-title-row">
          <view class="title-main">
            <image
              class="section-icon"
              src="/static/icons/page/profile/goal.png"
              mode="aspectFit"
            />
            <text class="section-title">当前目标</text>
          </view>
          <text class="status-pill muted">未开始</text>
        </view>
        <text class="goal-title">先创建一个目标</text>
        <text class="card-helper">我会帮你把目标拆成每天能执行的小任务。</text>
        <button
          class="primary-button full-button"
          @tap="goCreateGoal"
        >
          创建目标
        </button>
      </view>

      <view class="profile-card schedule-card">
        <view class="card-title-row">
          <view class="title-main">
            <image
              class="section-icon"
              src="/static/icons/page/profile/suggestion.png"
              mode="aspectFit"
            />
            <text class="section-title">默认安排偏好</text>
          </view>
          <button
            class="edit-button"
            @tap="openSettingEntry('默认安排偏好编辑入口预留')"
          >
            编辑
          </button>
        </view>

        <view class="preference-grid">
          <view class="preference-tile">
            <image
              class="tile-icon"
              src="/static/icons/page/profile/clock.png"
              mode="aspectFit"
            />
            <text class="tile-label">每天可用时间</text>
            <text class="tile-value">{{ focusMinutesText }}</text>
          </view>
          <view class="preference-tile">
            <image
              class="tile-icon"
              src="/static/icons/page/profile/sun.png"
              mode="aspectFit"
            />
            <text class="tile-label">偏好时段</text>
            <text class="tile-value">{{ workStyleText }}</text>
          </view>
          <view class="preference-tile">
            <image
              class="tile-icon"
              src="/static/icons/page/profile/bar-chart.png"
              mode="aspectFit"
            />
            <text class="tile-label">计划强度</text>
            <text class="tile-value">{{ planIntensityText }}</text>
          </view>
          <view class="preference-tile">
            <image
              class="tile-icon"
              src="/static/icons/page/profile/smile.png"
              mode="aspectFit"
            />
            <text class="tile-label">当前能量状态</text>
            <text class="tile-value">{{ energyText }}</text>
          </view>
        </view>
        <text class="card-helper">系统将根据以上偏好为你安排每日任务。</text>
      </view>

      <view class="profile-card expression-card">
        <view class="card-title-row">
          <view class="title-main">
            <image
              class="section-icon"
              src="/static/icons/page/profile/sparkle.png"
              mode="aspectFit"
            />
            <text class="section-title">AI 表达与仪式感偏好</text>
          </view>
          <button
            class="edit-button"
            @tap="openSettingEntry('AI 表达偏好编辑入口预留')"
          >
            编辑
          </button>
        </view>

        <view class="expression-list">
          <view class="expression-row">
            <image
              class="row-icon"
              src="/static/icons/page/profile/chat.png"
              mode="aspectFit"
            />
            <text class="row-label">建议风格</text>
            <text class="row-value">{{ ritualText }}</text>
            <text class="chevron small">›</text>
          </view>
          <view class="expression-row">
            <image
              class="row-icon"
              src="/static/icons/page/profile/star.png"
              mode="aspectFit"
            />
            <text class="row-label">每日关键词</text>
            <text class="row-value">已开启</text>
            <text class="chevron small">›</text>
          </view>
          <view class="expression-row">
            <image
              class="row-icon"
              src="/static/icons/page/profile/tarot.png"
              mode="aspectFit"
            />
            <text class="row-label">塔罗灵感</text>
            <text class="row-value">已开启</text>
            <text class="chevron small">›</text>
          </view>
          <view class="expression-row">
            <image
              class="row-icon"
              src="/static/icons/page/profile/mbti.png"
              mode="aspectFit"
            />
            <text class="row-label">MBTI</text>
            <text class="row-value">{{ mbtiText }}</text>
            <text class="chevron small">›</text>
          </view>
        </view>
        <text class="card-helper">以上内容仅用于表达风格和仪式感，不作为科学预测依据。</text>
      </view>

      <view class="profile-card recent-card">
        <view class="card-title-row compact">
          <view class="title-main">
            <image
              class="section-icon"
              src="/static/icons/page/profile/progress-chart.png"
              mode="aspectFit"
            />
            <text class="section-title">最近推进</text>
          </view>
          <text class="chevron">›</text>
        </view>
        <view class="recent-stats">
          <view class="recent-stat">
            <view class="stat-marker done" />
            <view class="stat-copy">
              <text class="stat-label">本周完成任务</text>
              <text class="stat-value">{{ progressSummary.completed }} 个</text>
            </view>
          </view>
          <view class="stat-divider" />
          <view class="recent-stat">
            <view class="stat-marker focus" />
            <view class="stat-copy">
              <text class="stat-label">累计专注时间</text>
              <text class="stat-value">{{ focusTimeText }}</text>
            </view>
          </view>
          <view class="stat-divider" />
          <view class="recent-stat">
            <view class="stat-marker streak" />
            <view class="stat-copy">
              <text class="stat-label">连续推进天数</text>
              <text class="stat-value">{{ streakDaysText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="profile-card settings-card">
        <view class="settings-list">
          <button
            class="setting-item"
            @tap="manageGoal"
          >
            <image
              class="setting-icon"
              src="/static/icons/page/profile/folder.png"
              mode="aspectFit"
            />
            <text class="setting-label">目标管理</text>
            <text class="chevron small">›</text>
          </button>
          <button
            class="setting-item"
            @tap="openSettingEntry('复盘记录入口预留')"
          >
            <image
              class="setting-icon"
              src="/static/icons/page/profile/document.png"
              mode="aspectFit"
            />
            <text class="setting-label">复盘记录</text>
            <text class="chevron small">›</text>
          </button>
          <button
            class="setting-item"
            @tap="openSettingEntry('偏好设置入口预留')"
          >
            <image
              class="setting-icon"
              src="/static/icons/page/profile/setting.png"
              mode="aspectFit"
            />
            <text class="setting-label">偏好设置</text>
            <text class="chevron small">›</text>
          </button>
          <button
            class="setting-item"
            @tap="openSettingEntry('关于与反馈入口预留')"
          >
            <image
              class="setting-icon"
              src="/static/icons/page/profile/suggestion.png"
              mode="aspectFit"
            />
            <text class="setting-label">关于与反馈</text>
            <text class="chevron small">›</text>
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

.greeting-strip {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 12rpx 0 24rpx;
}

.avatar-mark {
  display: flex;
  flex: 0 0 auto;
  width: 84rpx;
  height: 84rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, ui.$warm-soft, ui.$surface-muted);
}

.avatar-text {
  color: ui.$warm;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1;
}

.greeting-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.greeting-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.greeting-title {
  overflow: hidden;
  min-width: 0;
  color: ui.$ink;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.greeting-subtitle,
.card-helper {
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.45;
}

.greeting-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-icon {
  flex: 0 0 auto;
  width: 30rpx;
  height: 30rpx;
}

.profile-card {
  @include ui.card(26rpx, 24rpx);
}

.profile-card + .profile-card {
  margin-top: 22rpx;
}

.goal-card {
  border-color: rgba(107, 111, 214, 0.34);
  box-shadow: 0 10rpx 28rpx rgba(85, 90, 192, 0.08);
}

.goal-content {
  min-width: 0;
}

.card-title-row,
.title-main,
.deadline-row,
.progress-row,
.expression-row,
.setting-item,
.recent-stats,
.recent-stat {
  display: flex;
  align-items: center;
  min-width: 0;
}

.card-title-row {
  justify-content: space-between;
  gap: 16rpx;
}

.card-title-row.compact {
  margin-bottom: 22rpx;
}

.title-main {
  flex: 1;
  gap: 12rpx;
}

.section-icon {
  flex: 0 0 auto;
  width: 34rpx;
  height: 34rpx;
}

.section-title {
  @include ui.section-title;

  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  @include ui.status-tag(ui.$accent-soft, ui.$accent-pressed);

  border: 2rpx solid rgba(107, 111, 214, 0.24);
  font-size: 22rpx;
}

.status-pill.muted {
  background: ui.$surface-soft;
  color: ui.$muted;
}

.goal-main-row {
  display: flex;
  gap: 18rpx;
  margin-top: 22rpx;
}

.goal-copy {
  min-width: 0;
  flex: 1;
}

.goal-title {
  display: block;
  overflow: hidden;
  color: ui.$ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-hero-icon {
  flex: 0 0 auto;
  width: 118rpx;
  height: 118rpx;
  opacity: 0.82;
}

.deadline-row {
  gap: 10rpx;
  margin-top: 18rpx;
}

.meta-icon {
  flex: 0 0 auto;
  width: 28rpx;
  height: 28rpx;
}

.deadline-text,
.deadline-separator,
.remaining-text,
.progress-label,
.progress-percent,
.row-label,
.row-value,
.setting-label,
.stat-label,
.stat-value {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deadline-text,
.deadline-separator,
.progress-label,
.row-value,
.stat-label {
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.4;
}

.remaining-text {
  flex: 0 0 auto;
  color: #e86f2f;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.progress-row {
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 24rpx;
}

.progress-label {
  flex: 1;
}

.progress-percent {
  flex: 0 0 auto;
  color: ui.$neutral;
  font-size: 24rpx;
  line-height: 1.4;
}

.progress-track {
  overflow: hidden;
  height: 12rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: ui.$surface-muted;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: ui.$accent;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 26rpx;
}

.primary-button,
.secondary-button,
.edit-button,
.setting-item {
  font-size: 28rpx;
}

.primary-button {
  @include ui.primary-button(82rpx);

  background: linear-gradient(135deg, ui.$accent, ui.$accent-pressed);
}

.secondary-button {
  @include ui.secondary-button(82rpx);

  color: ui.$accent-pressed;
}

.full-button {
  width: 100%;
  margin-top: 22rpx;
}

.no-goal-card .card-helper {
  display: block;
  margin-top: 12rpx;
}

.edit-button {
  @include ui.text-button;

  flex: 0 0 auto;
  color: ui.$muted;
}

.preference-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
  margin-top: 24rpx;
}

.preference-tile {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  min-height: 136rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14rpx 8rpx;
  border-radius: 20rpx;
  background: ui.$surface-soft;
}

.tile-icon {
  width: 42rpx;
  height: 42rpx;
}

.tile-label,
.tile-value {
  display: block;
  overflow: hidden;
  width: 100%;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-label {
  margin-top: 10rpx;
  color: ui.$muted;
  font-size: 21rpx;
  line-height: 1.25;
}

.tile-value {
  margin-top: 6rpx;
  color: ui.$ink;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.25;
}

.schedule-card .card-helper,
.expression-card .card-helper {
  display: block;
  margin-top: 18rpx;
}

.expression-list {
  margin-top: 20rpx;
}

.expression-row {
  min-height: 68rpx;
  gap: 14rpx;
}

.expression-row + .expression-row {
  border-top: 2rpx solid rgba(229, 222, 210, 0.7);
}

.row-icon,
.setting-icon {
  flex: 0 0 auto;
  width: 36rpx;
  height: 36rpx;
}

.row-label {
  flex: 1;
  color: ui.$ink;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.4;
}

.row-value {
  flex: 0 1 auto;
}

.chevron {
  flex: 0 0 auto;
  color: ui.$neutral;
  font-size: 42rpx;
  line-height: 1;
}

.chevron.small {
  font-size: 34rpx;
}

.recent-stats {
  justify-content: space-between;
}

.recent-stat {
  flex: 1;
  gap: 12rpx;
}

.stat-marker {
  flex: 0 0 auto;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

.stat-marker.done {
  background: radial-gradient(circle at 50% 50%, ui.$success 0 44%, ui.$success-soft 45%);
}

.stat-marker.focus {
  background: radial-gradient(circle at 50% 50%, ui.$accent 0 42%, ui.$accent-soft 43%);
}

.stat-marker.streak {
  background: radial-gradient(circle at 50% 50%, #f47a3d 0 42%, ui.$warm-soft 43%);
}

.stat-copy {
  min-width: 0;
  flex: 1;
}

.stat-label,
.stat-value {
  display: block;
}

.stat-value {
  margin-top: 4rpx;
  color: ui.$ink;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.25;
}

.stat-divider {
  width: 2rpx;
  height: 54rpx;
  margin: 0 18rpx;
  background: ui.$border;
}

.settings-card {
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  @include ui.button-reset;

  display: flex;
  height: 82rpx;
  align-items: center;
  gap: 18rpx;
  background: transparent;
  color: ui.$ink;
  line-height: 82rpx;
  text-align: left;
}

.setting-item + .setting-item {
  border-top: 2rpx solid rgba(229, 222, 210, 0.7);
}

.setting-label {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
}
</style>
