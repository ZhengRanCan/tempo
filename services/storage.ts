import type { DailyPlan, DailyReview, Goal, UserProfile } from '../models'

const USER_PROFILE_KEY = 'user-profile'
const CURRENT_GOAL_ID_KEY = 'current-goal-id'

function goalKey(goalId: string): string {
  return `goal:${goalId}`
}

function dailyPlansKey(goalId: string): string {
  return `daily-plans:${goalId}`
}

function dailyReviewsKey(goalId: string): string {
  return `daily-reviews:${goalId}`
}

export async function saveGoal(goal: Goal): Promise<void> {
  uni.setStorageSync(goalKey(goal.id), goal)
  uni.setStorageSync(CURRENT_GOAL_ID_KEY, goal.id)
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  return (uni.getStorageSync(goalKey(goalId)) as Goal | '') || null
}

export async function getCurrentGoalId(): Promise<string | null> {
  return (uni.getStorageSync(CURRENT_GOAL_ID_KEY) as string | '') || null
}

export async function getCurrentGoal(): Promise<Goal | null> {
  const goalId = await getCurrentGoalId()

  return goalId ? getGoal(goalId) : null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  uni.setStorageSync(USER_PROFILE_KEY, profile)
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return (uni.getStorageSync(USER_PROFILE_KEY) as UserProfile | '') || null
}

export async function saveDailyPlans(goalId: string, plans: DailyPlan[]): Promise<void> {
  uni.setStorageSync(dailyPlansKey(goalId), plans)
}

export async function getDailyPlans(goalId: string): Promise<DailyPlan[]> {
  return (uni.getStorageSync(dailyPlansKey(goalId)) as DailyPlan[] | '') || []
}

export async function saveDailyReview(review: DailyReview): Promise<void> {
  const reviews = await getDailyReviews(review.goalId)
  const nextReviews = reviews.filter((item) => item.id !== review.id)

  nextReviews.push(review)
  uni.setStorageSync(dailyReviewsKey(review.goalId), nextReviews)
}

export async function getDailyReviews(goalId: string): Promise<DailyReview[]> {
  return (uni.getStorageSync(dailyReviewsKey(goalId)) as DailyReview[] | '') || []
}

export async function deleteGoal(goalId: string): Promise<void> {
  uni.removeStorageSync(goalKey(goalId))
  uni.removeStorageSync(dailyPlansKey(goalId))
  uni.removeStorageSync(dailyReviewsKey(goalId))

  if ((await getCurrentGoalId()) === goalId) {
    uni.removeStorageSync(CURRENT_GOAL_ID_KEY)
  }
}
