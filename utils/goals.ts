import { AppData, Goal, GoalRecommendation } from '@/types';
import { summarizeAnalytics } from './analytics';

// Simple evaluator that checks weight goals and nutrition goals
export const evaluateGoals = (data: AppData): GoalRecommendation[] => {
  const goals: Goal[] = (data.profile as any).goals_list || [];
  const recommendations: GoalRecommendation[] = [];

  const analytics = summarizeAnalytics(data.daily_logs, data.weight_logs, 30);

  goals.forEach(goal => {
    if (goal.type === 'weight') {
      // Evaluate weight progress
      const currentWeight = data.profile.weight_kg;
      const target = typeof goal.target === 'number' ? goal.target : (goal.target as any).value;
      let status: GoalRecommendation['status'] = 'on_track';
      let message = '';
      const slope = analytics.weightTrend?.slope ?? 0;
      // If slope negative and target < current, good. If slope positive and target < current, behind.
      if (typeof target === 'number') {
        if (currentWeight === target) {
          status = 'completed';
          message = `You've reached your target weight of ${target} kg.`;
        } else if ((currentWeight > target && slope >= 0) || (currentWeight < target && slope <= 0)) {
          status = 'behind';
          message = 'Your recent weight trend suggests you are not moving towards your goal. Consider small weekly adjustments.';
        } else {
          status = 'on_track';
          message = 'You are progressing towards your goal based on recent trends.';
        }
      }

      recommendations.push({
        goalId: goal.id,
        status,
        message,
        recommendedAdjustment: status === 'behind' ? 'Reduce daily intake by ~200 kcal and re-evaluate in 2 weeks.' : undefined,
      });
    } else if (goal.type === 'nutrition') {
      // Nutrition goal: compare moving average calories
      const caloriesMA = analytics.caloriesMovingAverage.find(m => m.window === 7)?.value ?? 0;
      const targetCalories = (goal.target as any).calories ?? null;
      let status: GoalRecommendation['status'] = 'on_track';
      let message = '';

      if (targetCalories && caloriesMA) {
        if (Math.abs(caloriesMA - targetCalories) / targetCalories > 0.1) {
          status = 'behind';
          message = `Your 7-day average calories (${Math.round(caloriesMA)}) differs from your goal (${targetCalories}).`;
        } else {
          status = 'on_track';
          message = `Your 7-day average calories (${Math.round(caloriesMA)}) is close to your goal.`;
        }
      }

      recommendations.push({
        goalId: goal.id,
        status,
        message,
        recommendedAdjustment: status === 'behind' ? 'Try reducing portion sizes or swapping calorie-dense foods.' : undefined,
      });
    } else if (goal.type === 'habit') {
      // Habit goals: check habit streaks in latest log
      const latestDate = Object.keys(data.daily_logs).sort().slice(-1)[0];
      const latestLog = latestDate ? data.daily_logs[latestDate] : null;
      const habitId = (goal.target as any).habitId;
      const streak = latestLog?.habit_streak?.[habitId] || 0;
      const status: GoalRecommendation['status'] = streak >= ((goal.target as any).minDays || 7) ? 'on_track' : 'behind';
      const message = status === 'on_track' ? `You're maintaining ${habitId} with a ${streak}-day streak.` : `Your ${habitId} streak is ${streak}. Aim for consistency.`;
      recommendations.push({
        goalId: goal.id,
        status,
        message,
      });
    }
  });

  return recommendations;
};
