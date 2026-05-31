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
      <view class="panel">
        <text class="section-title">当前目标</text>
        <text class="main-value">{{ goal?.title || '还没有目标' }}</text>
        <text class="helper">
          {{ goal ? `截止日期 ${goal.deadline}` : '先创建一个目标，再生成每日任务计划。' }}
        </text>
        <view
          v-if="progress"
          class="progress-box"
        >
          <text class="progress-value">{{ progress.progressPercent }}%</text>
          <text class="helper">
            已完成 {{ progress.completedTaskCount }} / {{ progress.totalTaskCount }} 个任务，剩余 {{ progress.remainingEstimatedMinutes }} 分钟
          </text>
        </view>
        <button
          class="primary-button"
          @tap="goCreateGoal"
        >
          {{ goal ? '创建新目标' : '创建目标' }}
        </button>
      </view>

      <view class="panel">
        <text class="section-title">任务偏好</text>
        <view class="profile-grid">
          <view class="profile-item">
            <text class="item-label">能量状态</text>
            <text class="item-value">{{ energyText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">偏好时段</text>
            <text class="item-value">{{ workStyleText }}</text>
          </view>
          <view class="profile-item">
            <text class="item-label">专注时长</text>
            <text class="item-value">{{ profile?.preferredFocusMinutes ?? 30 }} 分钟</text>
          </view>
          <view class="profile-item">
            <text class="item-label">MBTI</text>
            <text class="item-value">{{ profile?.mbti || '未填写' }}</text>
          </view>
        </view>
        <text class="helper">
          偏好只用于调整表达和轻量排序，不用于诊断或预测。
        </text>
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

.panel {
  padding: 32rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 28rpx;
  background: #ffffff;
}

.panel + .panel {
  margin-top: 24rpx;
}

.section-title,
.main-value,
.helper,
.item-label,
.item-value {
  display: block;
}

.section-title {
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.main-value {
  margin-top: 18rpx;
  color: #24211c;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.35;
}

.helper {
  margin-top: 12rpx;
  color: #7c7568;
  font-size: 26rpx;
  line-height: 1.5;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
}

.progress-box {
  margin-top: 18rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  background: #ececff;
}

.progress-value {
  display: block;
  color: #555ac0;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.3;
}

.profile-item {
  padding: 22rpx;
  border-radius: 20rpx;
  background: #f3efe7;
}

.item-label {
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.4;
}

.item-value {
  margin-top: 6rpx;
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.35;
}

.primary-button {
  height: 84rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 84rpx;
}

.primary-button {
  margin-top: 24rpx;
  background: #6b6fd6;
  color: #ffffff;
}

</style>
