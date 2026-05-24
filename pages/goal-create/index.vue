<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { EnergyLevel, UserProfile, WorkStyle } from '../../models'
import { buildGoal, formatGoalDate, validateGoalInput } from '../../models/goal'
import { buildUserProfile } from '../../models/user-profile'
import { buildStarterPlan } from '../../services/planner'
import { saveDailyPlans, saveGoal, saveUserProfile } from '../../services/storage'

type GoalValidationField = 'title' | 'deadline' | 'dailyAvailableMinutes'

const timeOptions = [30, 45, 60, 90]
const workStyleOptions: Array<{
  value: WorkStyle
  label: string
  helper: string
}> = [
  {
    value: 'morning',
    label: '上午',
    helper: '适合先做重点'
  },
  {
    value: 'afternoon',
    label: '下午',
    helper: '适合稳定推进'
  },
  {
    value: 'evening',
    label: '晚上',
    helper: '适合安静收尾'
  },
  {
    value: 'flexible',
    label: '都可以',
    helper: '按当天安排'
  }
]
const energyOptions: Array<{
  value: EnergyLevel
  label: string
}> = [
  {
    value: 'low',
    label: '低能量'
  },
  {
    value: 'normal',
    label: '普通'
  },
  {
    value: 'high',
    label: '高能量'
  }
]
const form = reactive({
  title: '',
  deadline: '',
  dailyAvailableMinutes: '',
  description: ''
})
const profileForm = reactive({
  workStyle: 'flexible' as WorkStyle,
  energyLevel: 'normal' as EnergyLevel,
  mbti: ''
})
const errors = reactive<Partial<Record<GoalValidationField, string>>>({})
const isSaving = ref(false)
const isSavingProfile = ref(false)
const todayDate = formatGoalDate(new Date())

const isFormReady = computed(() =>
  validateGoalInput(form, {
    today: todayDate
  }).length === 0
)

function setFieldError(field: GoalValidationField, message: string): void {
  errors[field] = message
}

function clearErrors(): void {
  errors.title = ''
  errors.deadline = ''
  errors.dailyAvailableMinutes = ''
}

function getEventValue(event: Event): string {
  const payload = event as Event & {
    detail?: {
      value?: unknown
    }
    target?: {
      value?: unknown
    }
  }
  const value = payload.detail?.value ?? payload.target?.value ?? ''

  return String(value)
}

function handleTitleInput(event: Event): void {
  form.title = getEventValue(event)
  errors.title = ''
}

function handleDescriptionInput(event: Event): void {
  form.description = getEventValue(event)
}

function handleMbtiInput(event: Event): void {
  profileForm.mbti = getEventValue(event)
}

function handleDateChange(event: Event): void {
  form.deadline = getEventValue(event)
  errors.deadline = ''
}

function handleTimeInput(event: Event): void {
  form.dailyAvailableMinutes = getEventValue(event)
  errors.dailyAvailableMinutes = ''
}

function selectTimeOption(minutes: number): void {
  form.dailyAvailableMinutes = String(minutes)
  errors.dailyAvailableMinutes = ''
}

function selectWorkStyle(workStyle: WorkStyle): void {
  profileForm.workStyle = workStyle
}

function selectEnergyLevel(energyLevel: EnergyLevel): void {
  profileForm.energyLevel = energyLevel
}

function buildCurrentProfile(): UserProfile {
  return buildUserProfile({
    workStyle: profileForm.workStyle,
    energyLevel: profileForm.energyLevel,
    mbti: profileForm.mbti,
    preferredFocusMinutes: form.dailyAvailableMinutes
  })
}

async function handleSaveProfile(): Promise<void> {
  isSavingProfile.value = true

  try {
    await saveUserProfile(buildCurrentProfile())
    uni.showToast({
      title: '偏好已保存',
      icon: 'success'
    })
  } catch {
    uni.showToast({
      title: '偏好保存失败，请稍后再试',
      icon: 'none'
    })
  } finally {
    isSavingProfile.value = false
  }
}

async function handleSubmit(): Promise<void> {
  clearErrors()

  const result = buildGoal(form, {
    today: todayDate
  })

  if (!result.ok) {
    for (const error of result.errors) {
      setFieldError(error.field, error.message)
    }

    uni.showToast({
      title: result.errors[0]?.message ?? '请先补全目标信息',
      icon: 'none'
    })
    return
  }

  isSaving.value = true

  try {
    const profile = buildCurrentProfile()
    const planResult = buildStarterPlan({
      goal: result.goal,
      startDate: todayDate,
      userProfile: profile
    })

    if (planResult.status === 'infeasible') {
      uni.showToast({
        title: planResult.reason,
        icon: 'none'
      })
      return
    }

    await saveGoal(result.goal)
    await saveUserProfile(profile)
    await saveDailyPlans(result.goal.id, planResult.plans)
    uni.showToast({
      title: '计划已生成',
      icon: 'success'
    })
    uni.navigateTo({
      url: '/pages/plan-calendar/index'
    })
  } catch {
    uni.showToast({
      title: '保存失败，请稍后再试',
      icon: 'none'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="eyebrow">Tempo</text>
      <text class="title">创建目标</text>
      <text class="hint">
        先写下一个想推进的目标，再选一个从今天开始还来得及完成的截止日期。
      </text>
    </view>

    <view class="form">
      <view class="field">
        <text class="label">目标名称</text>
        <input
          class="input"
          maxlength="40"
          placeholder="例如：完成开题报告初稿"
          :value="form.title"
          @input="handleTitleInput"
        >
        <text
          v-if="errors.title"
          class="error"
        >
          {{ errors.title }}
        </text>
        <text
          v-else
          class="helper"
        >
          写成一个能开始行动的目标。
        </text>
      </view>

      <view class="field">
        <text class="label">截止日期</text>
        <picker
          mode="date"
          :start="todayDate"
          :value="form.deadline"
          @change="handleDateChange"
        >
          <view
            class="picker-value"
            :class="{ empty: !form.deadline }"
          >
            {{ form.deadline || '请选择日期' }}
          </view>
        </picker>
        <text
          v-if="errors.deadline"
          class="error"
        >
          {{ errors.deadline }}
        </text>
        <text
          v-else
          class="helper"
        >
          不能早于今天，DDL 当天也可以安排任务。
        </text>
      </view>

      <view class="field">
        <text class="label">每天可用时间</text>
        <view class="time-options">
          <button
            v-for="minutes in timeOptions"
            :key="minutes"
            class="time-option"
            :class="{ active: form.dailyAvailableMinutes === String(minutes) }"
            @tap="selectTimeOption(minutes)"
          >
            {{ minutes }} 分钟
          </button>
        </view>
        <input
          class="input"
          type="number"
          placeholder="也可以自己填写分钟数"
          :value="form.dailyAvailableMinutes"
          @input="handleTimeInput"
        >
        <text
          v-if="errors.dailyAvailableMinutes"
          class="error"
        >
          {{ errors.dailyAvailableMinutes }}
        </text>
        <text
          v-else
          class="helper"
        >
          先选一个真实能做到的时间。
        </text>
      </view>

      <view class="preference-panel">
        <view class="section-heading">
          <text class="section-title">状态与偏好</text>
          <text class="section-helper">
            可选，只用来调整任务表达和轻量排序。
          </text>
        </view>

        <view class="field">
          <text class="label">偏好工作时段</text>
          <view class="work-style-options">
            <button
              v-for="option in workStyleOptions"
              :key="option.value"
              class="work-style-option"
              :class="{ active: profileForm.workStyle === option.value }"
              @tap="selectWorkStyle(option.value)"
            >
              <text class="option-title">{{ option.label }}</text>
              <text class="option-helper">{{ option.helper }}</text>
            </button>
          </view>
          <text class="helper">
            后续会优先把重点任务放到你更顺手的时段。
          </text>
        </view>

        <view class="field">
          <text class="label">当前能量状态</text>
          <view class="energy-options">
            <button
              v-for="option in energyOptions"
              :key="option.value"
              class="energy-option"
              :class="{ active: profileForm.energyLevel === option.value }"
              @tap="selectEnergyLevel(option.value)"
            >
              {{ option.label }}
            </button>
          </view>
          <text class="helper">
            低能量时优先保留最低完成线，不增加压力。
          </text>
        </view>

        <view class="field">
          <text class="label">MBTI（可选）</text>
          <input
            class="input"
            maxlength="4"
            placeholder="例如：INFP，不填也可以"
            :value="profileForm.mbti"
            @input="handleMbtiInput"
          >
          <text class="helper">
            只作为轻量表达偏好，不作为测评或判断依据。
          </text>
        </view>

        <button
          class="secondary-button"
          :disabled="isSavingProfile"
          @tap="handleSaveProfile"
        >
          {{ isSavingProfile ? '保存中' : '保存偏好' }}
        </button>
      </view>

      <view class="field">
        <text class="label">目标说明</text>
        <textarea
          class="textarea"
          maxlength="160"
          placeholder="可选：补充背景、范围或你最想先完成的部分"
          :value="form.description"
          @input="handleDescriptionInput"
        />
        <text class="helper">
          可选，不写也能创建目标。
        </text>
      </view>
    </view>

    <button
      class="primary-button"
      :class="{ disabled: !isFormReady || isSaving }"
      :disabled="!isFormReady || isSaving"
      @tap="handleSubmit"
    >
      {{ isSaving ? '生成中' : '生成计划' }}
    </button>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 112rpx 40rpx 48rpx;
  background: #faf8f3;
}

.header {
  margin-bottom: 32rpx;
}

.eyebrow {
  display: block;
  width: fit-content;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #fff2e8;
  color: #d68a5a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.4;
}

.title {
  display: block;
  margin-top: 28rpx;
  color: #24211c;
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.3;
}

.hint {
  display: block;
  margin-top: 16rpx;
  color: #4b463d;
  font-size: 30rpx;
  line-height: 1.55;
}

.form {
  padding: 32rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 32rpx;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.label {
  color: #24211c;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.input,
.picker-value,
.textarea {
  box-sizing: border-box;
  width: 100%;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #faf8f3;
  color: #24211c;
  font-size: 30rpx;
}

.input,
.picker-value {
  min-height: 88rpx;
  padding: 0 28rpx;
  line-height: 88rpx;
}

.textarea {
  min-height: 144rpx;
  padding: 24rpx 28rpx;
  line-height: 1.6;
}

.picker-value.empty {
  color: #7c7568;
}

.helper,
.error {
  font-size: 24rpx;
  line-height: 1.5;
}

.helper {
  color: #7c7568;
}

.error {
  color: #c75c54;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.time-option {
  height: 72rpx;
  padding: 0;
  border: 2rpx solid #e5ded2;
  border-radius: 999rpx;
  background: #f3efe7;
  color: #4b463d;
  font-size: 24rpx;
  line-height: 72rpx;
}

.time-option.active {
  border-color: #6b6fd6;
  background: #ececff;
  color: #555ac0;
}

.preference-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #f3efe7;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.section-title {
  color: #24211c;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
}

.section-helper {
  color: #7c7568;
  font-size: 24rpx;
  line-height: 1.5;
}

.work-style-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.work-style-option {
  min-height: 112rpx;
  padding: 18rpx 16rpx;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #ffffff;
  color: #4b463d;
  text-align: left;
  line-height: 1.4;
}

.work-style-option.active {
  border-color: #6b6fd6;
  background: #ececff;
  color: #555ac0;
}

.option-title,
.option-helper {
  display: block;
}

.option-title {
  font-size: 28rpx;
  font-weight: 600;
}

.option-helper {
  margin-top: 6rpx;
  color: #7c7568;
  font-size: 22rpx;
}

.work-style-option.active .option-helper {
  color: #555ac0;
}

.energy-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #ece6da;
}

.energy-option {
  height: 64rpx;
  padding: 0;
  border: 0;
  border-radius: 999rpx;
  background: transparent;
  color: #4b463d;
  font-size: 24rpx;
  line-height: 64rpx;
}

.energy-option.active {
  background: #ececff;
  color: #555ac0;
}

.secondary-button {
  height: 80rpx;
  padding: 0;
  border: 2rpx solid #e5ded2;
  border-radius: 20rpx;
  background: #ffffff;
  color: #24211c;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 80rpx;
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

.primary-button.disabled {
  background: #ece6da;
  color: #7c7568;
}
</style>
