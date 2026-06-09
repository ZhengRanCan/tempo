<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppPageHeader from '../../components/AppPageHeader.vue'
import EnergySelector from '../../components/EnergySelector.vue'
import type { EnergyLevel, UserProfile, WorkStyle } from '../../models'
import { buildGoal, formatGoalDate, validateGoalInput } from '../../models/goal'
import { buildUserProfile, type RitualPreference } from '../../models/user-profile'
import { buildLegacyDailyPlansFromBundle, buildStarterPlanBundle } from '../../services/planner'
import { saveDailyPlans, saveGoal, savePlanBundle, saveUserProfile } from '../../services/storage'

type GoalValidationField = 'title' | 'deadline' | 'dailyAvailableMinutes'

const timeOptions = [15, 30, 45, 60]
const workStyleOptions: Array<{
  value: WorkStyle
  label: string
  helper: string
}> = [
  {
    value: 'morning',
    label: '上午',
    helper: '先处理重点任务'
  },
  {
    value: 'afternoon',
    label: '下午',
    helper: '稳定推进和整理'
  },
  {
    value: 'evening',
    label: '晚上',
    helper: '适合收尾和复盘'
  },
  {
    value: 'flexible',
    label: '都可以',
    helper: '按当天状态安排'
  }
]
const ritualOptions: Array<{
  value: RitualPreference
  label: string
  helper: string
}> = [
  {
    value: 'simple',
    label: '简洁',
    helper: '直接给出下一步'
  },
  {
    value: 'warm',
    label: '温和',
    helper: '提醒更像陪伴'
  },
  {
    value: 'energetic',
    label: '轻快',
    helper: '文案更有行动感'
  }
]
const form = reactive({
  title: '',
  deadline: '',
  dailyAvailableMinutes: '30',
  description: ''
})
const profileForm = reactive({
  workStyle: 'flexible' as WorkStyle,
  energyLevel: 'normal' as EnergyLevel,
  mbti: '',
  ritualPreference: 'simple' as RitualPreference
})
const errors = reactive<Partial<Record<GoalValidationField, string>>>({})
const isSaving = ref(false)
const isPreferenceOpen = ref(true)
const customMinutes = ref('')
const todayDate = formatGoalDate(new Date())
const titleCount = computed(() => form.title.length)
const descriptionCount = computed(() => form.description.length)

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
  customMinutes.value = getEventValue(event)
  form.dailyAvailableMinutes = customMinutes.value
  errors.dailyAvailableMinutes = ''
}

function selectTimeOption(minutes: number): void {
  customMinutes.value = ''
  form.dailyAvailableMinutes = String(minutes)
  errors.dailyAvailableMinutes = ''
}

function selectWorkStyle(workStyle: WorkStyle): void {
  profileForm.workStyle = workStyle
}

function selectRitualPreference(ritualPreference: RitualPreference): void {
  profileForm.ritualPreference = ritualPreference
}

function togglePreferencePanel(): void {
  isPreferenceOpen.value = !isPreferenceOpen.value
}

function buildCurrentProfile(): UserProfile {
  return buildUserProfile({
    workStyle: profileForm.workStyle,
    energyLevel: profileForm.energyLevel,
    mbti: profileForm.mbti,
    ritualPreference: profileForm.ritualPreference,
    preferredFocusMinutes: form.dailyAvailableMinutes
  })
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
    const planResult = buildStarterPlanBundle({
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
    await savePlanBundle(planResult.bundle)
    await saveDailyPlans(result.goal.id, buildLegacyDailyPlansFromBundle(planResult.bundle, profile))
    uni.showToast({
      title: '计划已生成',
      icon: 'success'
    })
    uni.switchTab({
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
    <AppPageHeader
      title="创建目标"
    />

    <view class="create-hero">
      <view class="hero-mark" />
      <view class="hero-copy">
        <text class="hero-title">先设定一个目标</text>
        <text class="hero-subtitle">我会帮你拆解计划，每天专注推进</text>
      </view>
    </view>

    <view class="step-list">
      <view class="step-card core-step">
        <view class="step-heading">
          <text class="step-index">1</text>
          <text class="step-title">你想完成什么？</text>
        </view>
        <view class="input-shell title-input-shell">
          <input
            class="input"
            maxlength="50"
            placeholder="例如：完成开题报告初稿"
            :value="form.title"
            @input="handleTitleInput"
          >
          <text class="counter">{{ titleCount }} / 50</text>
        </view>
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
          写下一个清晰的目标，越具体越好。
        </text>
      </view>

      <view class="step-card core-step">
        <view class="step-heading">
          <text class="step-index">2</text>
          <text class="step-title">什么时候完成？</text>
        </view>
        <picker
          mode="date"
          :start="todayDate"
          :value="form.deadline"
          @change="handleDateChange"
        >
          <view
            class="picker-value input-shell"
            :class="{ empty: !form.deadline }"
          >
            <view class="field-mark field-mark-calendar" />
            <text class="picker-text">{{ form.deadline || '选择截止日期' }}</text>
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
          建议设置一个有挑战但可实现的时间。
        </text>
      </view>

      <view class="step-card core-step">
        <view class="step-heading">
          <text class="step-index">3</text>
          <view class="heading-mark heading-mark-clock" />
          <text class="step-title">每天大概能投入多久？</text>
        </view>
        <text class="helper">按每天可用时间生成更合理的计划。</text>
        <view class="time-options">
          <button
            v-for="minutes in timeOptions"
            :key="minutes"
            class="time-option"
            :class="{ active: customMinutes === '' && form.dailyAvailableMinutes === String(minutes) }"
            @tap="selectTimeOption(minutes)"
          >
            {{ minutes }} 分钟
          </button>
        </view>
        <view class="custom-time input-shell">
          <view class="field-mark field-mark-edit" />
          <input
            class="input custom-time-input"
            type="number"
            placeholder="自定义分钟数"
            :value="customMinutes"
            @input="handleTimeInput"
          >
        </view>
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

      <view class="step-card optional-step">
        <view class="optional-heading">
          <view class="section-mark section-mark-note" />
          <text class="step-title">补充说明</text>
          <text class="optional-label">可选</text>
        </view>
        <text class="helper">可写下背景、范围、最想先完成的部分等。</text>
        <view class="textarea-shell input-shell">
          <textarea
            class="textarea"
            maxlength="200"
            placeholder="比如：需要完成背景、意义、方法、参考文献等，希望重点先完成文献整理部分"
            :value="form.description"
            @input="handleDescriptionInput"
          />
          <text class="counter">{{ descriptionCount }} / 200</text>
        </view>
      </view>

      <view class="step-card preference-step">
        <view class="preference-title-row">
          <view class="preference-title-main">
            <view class="section-mark section-mark-preference" />
            <text class="step-title accent-title">个性化安排偏好</text>
          </view>
          <button
            class="preference-toggle"
            @tap="togglePreferencePanel"
          >
            {{ isPreferenceOpen ? '收起 ^' : '展开 v' }}
          </button>
        </view>
        <text class="section-helper">
          仅作为风格参考，不影响任务安排的科学性。
        </text>

        <view
          v-if="isPreferenceOpen"
          class="preference-content"
        >
          <view class="field">
            <text class="label">偏好工作时段</text>
            <view class="work-style-options">
              <button
                v-for="option in workStyleOptions"
                :key="option.value"
                class="option-button"
                :class="{ active: profileForm.workStyle === option.value }"
                @tap="selectWorkStyle(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>

          <view class="field">
            <text class="label">当前能量状态</text>
            <EnergySelector v-model="profileForm.energyLevel" />
          </view>

          <view class="field">
            <text class="label">仪式感表达</text>
            <view class="ritual-options">
              <button
                v-for="option in ritualOptions"
                :key="option.value"
                class="option-button"
                :class="{ active: profileForm.ritualPreference === option.value }"
                @tap="selectRitualPreference(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
            <text class="helper">
              塔罗、MBTI、每日关键词只影响提醒文案，不作为任务安排依据。
            </text>
          </view>

          <view class="field">
            <text class="label">MBTI（可选）</text>
            <view class="input-shell">
              <input
                class="input"
                maxlength="4"
                placeholder="例如：INFP，不填也可以"
                :value="profileForm.mbti"
                @input="handleMbtiInput"
              >
            </view>
            <text class="helper">
              只作为表达偏好，不用于心理判断。
            </text>
          </view>
        </view>
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

    <view class="safe-note">
      <view class="safe-mark" />
      <text>生成后可随时调整</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use "../../styles/ui" as ui;

.page {
  @include ui.page-shell;
}

.create-hero {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin: 18rpx 6rpx 30rpx;
}

.hero-mark {
  position: relative;
  flex: 0 0 auto;
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: ui.$accent-soft;
  box-shadow: 0 12rpx 24rpx rgba(107, 111, 214, 0.14);
}

.hero-mark::before {
  position: absolute;
  top: 24rpx;
  left: 36rpx;
  width: 26rpx;
  height: 26rpx;
  border-radius: 8rpx;
  background: ui.$accent;
  content: "";
  transform: rotate(45deg);
}

.hero-mark::after {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: ui.$accent-pressed;
  box-shadow: -34rpx 8rpx 0 rgba(107, 111, 214, 0.32);
  content: "";
}

.hero-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.hero-title {
  overflow: hidden;
  color: ui.$ink;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-subtitle {
  overflow: hidden;
  color: ui.$muted;
  font-size: 26rpx;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-card {
  @include ui.card(28rpx, 24rpx);

  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.core-step {
  gap: 20rpx;
}

.preference-step {
  gap: 20rpx;
}

.step-heading {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.step-index {
  width: 36rpx;
  height: 36rpx;
  border-radius: 10rpx;
  background: ui.$accent;
  color: ui.$surface;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 36rpx;
  text-align: center;
}

.step-title {
  @include ui.section-title;

  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label {
  overflow: hidden;
  color: ui.$ink;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input,
.textarea {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: ui.$ink;
  font-size: 28rpx;
}

.input-shell {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 100%;
  border: 2rpx solid ui.$border;
  border-radius: 20rpx;
  background: ui.$surface;
}

.title-input-shell,
.picker-value,
.custom-time {
  min-height: 88rpx;
  padding: 0 22rpx;
}

.input {
  height: 84rpx;
  line-height: 84rpx;
}

.custom-time-input {
  text-align: center;
}

.picker-text {
  overflow: hidden;
  flex: 1;
  color: ui.$ink;
  font-size: 28rpx;
  line-height: 88rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-mark {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 auto;
  width: 32rpx;
  height: 32rpx;
}

.heading-mark,
.section-mark {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 auto;
  width: 34rpx;
  height: 34rpx;
}

.field-mark-calendar {
  border: 2rpx solid ui.$neutral;
  border-radius: 8rpx;
}

.field-mark-calendar::before {
  position: absolute;
  top: 8rpx;
  left: 5rpx;
  width: 18rpx;
  height: 2rpx;
  border-radius: 999rpx;
  background: ui.$neutral;
  content: "";
}

.field-mark-calendar::after {
  position: absolute;
  top: -5rpx;
  left: 7rpx;
  width: 14rpx;
  height: 8rpx;
  border-right: 2rpx solid ui.$neutral;
  border-left: 2rpx solid ui.$neutral;
  content: "";
}

.heading-mark-clock {
  border: 2rpx solid ui.$accent-pressed;
  border-radius: 50%;
}

.heading-mark-clock::before,
.heading-mark-clock::after {
  position: absolute;
  border-radius: 999rpx;
  background: ui.$accent-pressed;
  content: "";
}

.heading-mark-clock::before {
  top: 7rpx;
  left: 15rpx;
  width: 2rpx;
  height: 10rpx;
}

.heading-mark-clock::after {
  top: 16rpx;
  left: 15rpx;
  width: 8rpx;
  height: 2rpx;
}

.field-mark-edit::before {
  position: absolute;
  top: 8rpx;
  left: 6rpx;
  width: 22rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: ui.$neutral;
  content: "";
  transform: rotate(-35deg);
}

.field-mark-edit::after {
  position: absolute;
  right: 3rpx;
  bottom: 5rpx;
  width: 22rpx;
  height: 2rpx;
  border-radius: 999rpx;
  background: ui.$border;
  content: "";
}

.section-mark-note {
  border: 2rpx solid ui.$neutral;
  border-radius: 8rpx;
}

.section-mark-note::before {
  position: absolute;
  top: 9rpx;
  left: 7rpx;
  width: 16rpx;
  height: 2rpx;
  border-radius: 999rpx;
  background: ui.$neutral;
  box-shadow: 0 8rpx 0 ui.$neutral;
  content: "";
}

.section-mark-preference {
  border-radius: 10rpx;
  background: ui.$accent-soft;
}

.section-mark-preference::before {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: ui.$accent;
  box-shadow: 12rpx 0 0 ui.$accent, 0 12rpx 0 ui.$accent, 12rpx 12rpx 0 ui.$accent;
  content: "";
}

.textarea-shell {
  position: relative;
  min-height: 170rpx;
  align-items: flex-start;
  padding: 22rpx 22rpx 44rpx;
}

.textarea {
  width: 100%;
  min-height: 136rpx;
  line-height: 1.55;
}

.picker-value.empty {
  .picker-text {
    color: ui.$muted;
  }
}

.counter {
  flex: 0 0 auto;
  color: ui.$neutral;
  font-size: 22rpx;
  line-height: 1.2;
}

.textarea-shell .counter {
  position: absolute;
  right: 22rpx;
  bottom: 18rpx;
}

.helper,
.error,
.section-helper {
  font-size: 24rpx;
  line-height: 1.5;
}

.helper,
.section-helper {
  color: ui.$muted;
}

.error {
  color: #8a6727;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.time-option {
  @include ui.option-chip;

  height: 76rpx;
  padding: 0;
  border-radius: 18rpx;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 72rpx;
}

.time-option.active {
  border-color: ui.$accent;
  background: ui.$accent-soft;
  color: ui.$accent-pressed;
  box-shadow: 0 8rpx 18rpx rgba(107, 111, 214, 0.14);
}

.optional-step {
  gap: 16rpx;
}

.optional-heading,
.preference-title-row,
.preference-title-main {
  display: flex;
  align-items: center;
  min-width: 0;
}

.optional-heading {
  gap: 12rpx;
}

.optional-label {
  flex: 0 0 auto;
  color: ui.$muted;
  font-size: 24rpx;
  line-height: 1.3;
}

.preference-title-row {
  justify-content: space-between;
  gap: 16rpx;
}

.preference-title-main {
  flex: 1;
  gap: 12rpx;
}

.accent-title {
  color: ui.$accent-pressed;
}

.preference-toggle {
  @include ui.button-reset;

  flex: 0 0 auto;
  height: 52rpx;
  padding: 0 4rpx;
  background: transparent;
  color: ui.$accent-pressed;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 52rpx;
}

.preference-content {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.work-style-options,
.ritual-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.ritual-options {
  grid-template-columns: repeat(3, 1fr);
}

.option-button {
  @include ui.option-chip;

  height: 68rpx;
  padding: 0 12rpx;
  border-radius: 16rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 64rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-button.active {
  border-color: ui.$accent;
  background: ui.$accent-soft;
  color: ui.$accent-pressed;
  font-weight: 600;
}

.primary-button {
  @include ui.primary-button;

  margin-top: 30rpx;
  background: linear-gradient(135deg, ui.$accent, ui.$accent-pressed);
  font-size: 32rpx;
  box-shadow: 0 14rpx 26rpx rgba(85, 90, 192, 0.24);
}

.primary-button.disabled {
  background: ui.$surface-muted;
  color: ui.$muted;
  box-shadow: none;
}

.safe-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 20rpx;
  color: ui.$neutral;
  font-size: 24rpx;
  line-height: 1.4;
}

.safe-mark {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 auto;
  width: 26rpx;
  height: 22rpx;
  margin-top: 4rpx;
  border: 2rpx solid ui.$neutral;
  border-radius: 6rpx;
}

.safe-mark::before {
  position: absolute;
  top: -13rpx;
  left: 5rpx;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid ui.$neutral;
  border-bottom: 0;
  border-radius: 10rpx 10rpx 0 0;
  content: "";
}

.safe-mark::after {
  position: absolute;
  top: 7rpx;
  left: 10rpx;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: ui.$neutral;
  content: "";
}
</style>
