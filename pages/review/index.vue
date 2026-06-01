<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import EnergySelector from '../../components/EnergySelector.vue'
import type { EnergyLevel, Goal, PlanBundle, ReviewTaskStatus, Task } from '../../models'
import { planBundleToDailyPlans } from '../../models/plan'
import { buildDailyReview } from '../../models/review'
import { formatDate } from '../../services/date'
import { buildDailyTaskViews } from '../../services/plan-view'
import { replanPlanBundleAfterReview } from '../../services/replanner'
import {
  getCurrentGoal,
  migrateLegacyDailyPlans,
  saveDailyPlans,
  saveDailyReview,
  savePlanBundle
} from '../../services/storage'

const statusOptions: Array<{
  value: ReviewTaskStatus
  label: string
}> = [
  {
    value: 'done',
    label: '已完成'
  },
  {
    value: 'partial',
    label: '部分完成'
  },
  {
    value: 'skipped',
    label: '未完成'
  }
]
const goal = ref<Goal | null>(null)
const activeBundle = ref<PlanBundle | null>(null)
const todayTasks = ref<Task[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const reviewForm = reactive({
  energy: 'normal' as EnergyLevel,
  note: '',
  taskStatusById: {} as Record<string, ReviewTaskStatus>
})
const today = formatDate(new Date())

const tasks = computed<Task[]>(() => todayTasks.value)
const hasTasks = computed(() => tasks.value.length > 0)

onShow(() => {
  void loadReview()
})

async function loadReview(): Promise<void> {
  isLoading.value = true

  try {
    const currentGoal = await getCurrentGoal()
    goal.value = currentGoal

    if (!currentGoal) {
      activeBundle.value = null
      todayTasks.value = []
      resetTaskStatuses([])
      return
    }

    const bundleResult = await migrateLegacyDailyPlans(currentGoal.id)
    activeBundle.value = bundleResult.data
    todayTasks.value = bundleResult.data
      ? (buildDailyTaskViews(bundleResult.data).find((view) => view.date === today)?.tasks ?? [])
      : []
    resetTaskStatuses(todayTasks.value)
  } finally {
    isLoading.value = false
  }
}

function resetTaskStatuses(nextTasks: Task[]): void {
  reviewForm.taskStatusById = nextTasks.reduce<Record<string, ReviewTaskStatus>>(
    (statusMap, task) => ({
      ...statusMap,
      [task.id]: 'skipped'
    }),
    {}
  )
}

function selectTaskStatus(taskId: string, status: ReviewTaskStatus): void {
  reviewForm.taskStatusById[taskId] = status
}


function handleNoteInput(event: Event): void {
  const payload = event as Event & {
    detail?: {
      value?: unknown
    }
    target?: {
      value?: unknown
    }
  }

  reviewForm.note = String(payload.detail?.value ?? payload.target?.value ?? '')
}

async function handleSaveReview(): Promise<void> {
  if (!goal.value) {
    uni.showToast({
      title: '先创建目标，再做复盘',
      icon: 'none'
    })
    return
  }

  isSaving.value = true

  try {
    const review = buildDailyReview({
      date: today,
      goalId: goal.value.id,
      planId: activeBundle.value?.plan.id,
      energy: reviewForm.energy,
      taskStatusById: reviewForm.taskStatusById,
      note: reviewForm.note
    })

    await saveDailyReview(review)

    if (activeBundle.value) {
      const replanned = replanPlanBundleAfterReview({
        bundle: activeBundle.value,
        review
      })

      if (replanned.status === 'ok') {
        await savePlanBundle(replanned.bundle)
        await saveDailyPlans(goal.value.id, planBundleToDailyPlans(replanned.bundle))
      } else {
        uni.showToast({
          title: replanned.reason,
          icon: 'none'
        })
        return
      }
    }

    uni.showToast({
      title: '复盘已保存',
      icon: 'success'
    })
  } catch {
    uni.showToast({
      title: '复盘保存失败，请稍后再试',
      icon: 'none'
    })
  } finally {
    isSaving.value = false
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
      title="晚间复盘"
      hint="记录今天推进到哪里，明天再继续"
    />

    <EmptyState
      v-if="isLoading"
      title="正在读取今日任务"
      copy="我在整理今天可以复盘的任务。"
    />

    <EmptyState
      v-else-if="!goal"
      title="还没有目标"
      copy="先创建一个目标，再记录每天的推进情况。"
      action-label="创建目标"
      @action="goCreateGoal"
    />

    <template v-else>
      <view class="panel">
        <text class="section-title">今日任务完成情况</text>
        <text
          v-if="!hasTasks"
          class="helper"
        >
          今天还没有可复盘的任务，也可以先记录能量状态和备注。
        </text>

        <view
          v-for="task in tasks"
          :key="task.id"
          class="review-task"
        >
          <text class="task-title">{{ task.title }}</text>
          <text class="task-helper">最低完成线：{{ task.minimumLine }}</text>
          <view class="status-options">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              class="status-option"
              :class="[
                `status-${option.value}`,
                { active: reviewForm.taskStatusById[task.id] === option.value }
              ]"
              @tap="selectTaskStatus(task.id, option.value)"
            >
              {{ option.label }}
            </button>
          </view>
        </view>
      </view>

      <view class="panel">
        <text class="section-title">今日能量状态</text>
        <EnergySelector v-model="reviewForm.energy" />
        <text class="helper">
          这里只用于明天安排更贴近你的节奏。
        </text>
      </view>

      <view class="panel">
        <text class="section-title">复盘备注（可选）</text>
        <textarea
          class="textarea"
          maxlength="160"
          placeholder="比如：今天完成了一小段，明天继续补材料"
          :value="reviewForm.note"
          @input="handleNoteInput"
        />
        <text class="helper">
          不写也可以保存。
        </text>
      </view>

      <button
        class="primary-button"
        :disabled="isSaving"
        @tap="handleSaveReview"
      >
        {{ isSaving ? '保存中' : '保存复盘' }}
      </button>
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

.section-title,
.task-title,
.task-helper,
.helper {
  display: block;
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

.section-title {
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.review-task {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #f3efe7;
}

.task-title {
  color: #24211c;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.35;
}

.task-helper,
.helper {
  margin-top: 10rpx;
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.status-options {
  display: grid;
  gap: 12rpx;
  margin-top: 18rpx;
  grid-template-columns: repeat(3, 1fr);
}

.status-option {
  height: 68rpx;
  padding: 0;
  border: 2rpx solid #e5ded2;
  border-radius: 999rpx;
  background: #ffffff;
  color: #4b463d;
  font-size: 24rpx;
  line-height: 68rpx;
}

.status-option.active {
  border-color: #6b6fd6;
  background: #ececff;
  color: #555ac0;
}

.status-done.active {
  border-color: #4f9d69;
  background: #eaf6ee;
  color: #3f7f55;
}

.status-partial.active {
  border-color: #d7a245;
  background: #fff5da;
  color: #8a6727;
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 144rpx;
  margin-top: 18rpx;
  padding: 24rpx 28rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #faf8f3;
  color: #24211c;
  font-size: 30rpx;
  line-height: 1.6;
}

.primary-button {
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 20rpx;
  background: #6b6fd6;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
}

</style>
