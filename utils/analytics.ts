import { DailyLog, ForecastPoint, AnalyticsSummary } from '@/types';
import { toLocalISODate } from './dates';

export const movingAverage = (values: number[], window: number): number => {
  if (!values || values.length === 0) return 0;
  const recent = values.slice(-window);
  const sum = recent.reduce((a, b) => a + b, 0);
  return sum / recent.length;
};

// Simple linear regression (least squares) on points [{x, y}] where x is numeric index
export const linearRegression = (points: { x: number; y: number }[]) => {
  if (!points || points.length === 0) return { slope: 0, intercept: 0 };
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = (n * sumXX - sumX * sumX) || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

export const forecastValues = (startDateISO: string, slope: number, intercept: number, days: number): ForecastPoint[] => {
  const result: ForecastPoint[] = [];
  const startDate = new Date(startDateISO);
  for (let i = 1; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const x = i + 0; // relative index
    const value = slope * x + intercept;
  result.push({ date: toLocalISODate(date), value });
  }
  return result;
};

// Summarize analytics given daily logs and weight logs
export const summarizeAnalytics = (
  daily_logs: { [date: string]: DailyLog },
  weight_logs: { [date: string]: number },
  lookbackDays = 30
): AnalyticsSummary => {
  const dates = Object.keys(daily_logs).sort();
  const recentDates = dates.slice(-lookbackDays);
  const caloriesSeries: number[] = [];
  const mindfulnessSeries: number[] = [];

  recentDates.forEach(date => {
    const log = daily_logs[date];
    const totalCalories = Object.values(log.meals).flat().reduce((s, e) => s + (e.calories || 0), 0);
    caloriesSeries.push(totalCalories);
    const mindfulnessRatings = Object.values(log.meals).flat().map(e => e.mindful_rating || 0).filter(v => v > 0);
  const avgMind = mindfulnessRatings.length ? (mindfulnessRatings as number[]).reduce((a, b) => a + b, 0) / mindfulnessRatings.length : 0;
    mindfulnessSeries.push(avgMind);
  });

  const weightDates = Object.keys(weight_logs).sort();
  const weightPoints = weightDates.map((d, idx) => ({ x: idx, y: weight_logs[d] }));
  const weightTrend = weightPoints.length >= 2 ? linearRegression(weightPoints) : null;
  const fallbackStart = weightDates[weightDates.length - 1] || toLocalISODate();
  const weightForecast = weightTrend ? forecastValues(fallbackStart, weightTrend.slope, weightTrend.intercept, 14) : [];

  const summary: AnalyticsSummary = {
    caloriesMovingAverage: [
      { window: 7, value: movingAverage(caloriesSeries, Math.min(7, caloriesSeries.length)) },
      { window: 14, value: movingAverage(caloriesSeries, Math.min(14, caloriesSeries.length)) },
      { window: 30, value: movingAverage(caloriesSeries, Math.min(30, caloriesSeries.length)) },
    ],
    mindfulnessMovingAverage: [
      { window: 7, value: movingAverage(mindfulnessSeries, Math.min(7, mindfulnessSeries.length)) },
      { window: 14, value: movingAverage(mindfulnessSeries, Math.min(14, mindfulnessSeries.length)) },
    ],
    weightTrend,
    weightForecast,
    lastUpdated: new Date().toISOString(),
  };

  return summary;
};
