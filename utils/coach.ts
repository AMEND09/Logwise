import { AppData, DailyLog, CoachAnalysis, CoachAdvice, CoachAction, FoodEntry } from '@/types';
import { toLocalISODate } from './dates';

const DEFAULT_LOOKBACK = 14;

const mean = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
const stdDev = (arr: number[]) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map(v => (v-m)**2)));
};

export function analyzeForCoach(data: AppData, lookbackDays = DEFAULT_LOOKBACK): CoachAnalysis {
  const dates = Object.keys(data.daily_logs).sort().slice(-lookbackDays);
  const logs = dates.map(d => data.daily_logs[d]).filter(Boolean);
  if (!logs.length) {
    return {
      lookbackDays,
      loggingConsistency: 0,
      avgMindfulness: 0,
      calorieStdDev: 0,
      eveningSnackPercent: 0,
      emotionTriggerPercent: 0,
      hungerMismatchPercent: 0,
      hydrationRatio: 0,
      proteinRatio: 0,
      personaTags: [],
    };
  }

  const profile = data.profile;
  let daysWithMeals = 0;
  const dailyCalories: number[] = [];
  let eveningSnackDays = 0;
  let emotionMeals = 0; let totalMeals = 0;
  let hungerMismatchMeals = 0;
  let mindfulnessRatings: number[] = [];
  let waterTotals: number[] = [];
  let proteinTotals: number[] = [];

  dates.forEach((date, idx) => {
    const log = data.daily_logs[date];
    const mealsArrays = Object.values(log.meals || {});
    if (mealsArrays.some(m => m.length)) daysWithMeals++;
    const flatMeals = mealsArrays.flat();
    const calories = flatMeals.reduce((s,e)=>s + (e.calories||0),0);
    dailyCalories.push(calories);
    const evening = flatMeals.filter(e => {
      // heuristic: treat entries with 'Dinner' or after 7pm if we had timestamps (not present) so fallback to meal name
      return /snack/i.test(e.name) || /dessert/i.test(e.name); 
    });
    if (evening.some(e => (e.calories||0) > 120)) eveningSnackDays++;
    flatMeals.forEach(e => {
      totalMeals++;
      if (e.eating_trigger === 'emotion') emotionMeals++;
      if ((e.hunger_level && e.hunger_level <=2) && (e.calories||0) > 300) hungerMismatchMeals++;
      if (e.mindful_rating) mindfulnessRatings.push(e.mindful_rating);
    });
    waterTotals.push(log.water_ml || 0);
    const dayProtein = flatMeals.reduce((s,e)=>s + (e.protein_g||0),0);
    proteinTotals.push(dayProtein);
  });

  const loggingConsistency = daysWithMeals / lookbackDays;
  const avgMindfulness = mindfulnessRatings.length ? mean(mindfulnessRatings) : 0;
  const calorieStdDev = stdDev(dailyCalories);
  const eveningSnackPercent = daysWithMeals ? eveningSnackDays / daysWithMeals : 0;
  const emotionTriggerPercent = totalMeals ? emotionMeals / totalMeals : 0;
  const hungerMismatchPercent = totalMeals ? hungerMismatchMeals / totalMeals : 0;
  const hydrationRatio = mean(waterTotals) / (profile.goals.water_ml || 1);
  const proteinRatio = mean(proteinTotals) / (profile.goals.protein_g || 1);

  const personaTags: string[] = [];
  if (emotionTriggerPercent > 0.25) personaTags.push('emotional_eater');
  if (eveningSnackPercent > 0.35) personaTags.push('evening_snacker');
  if (hungerMismatchPercent > 0.15) personaTags.push('habitual_grazer');
  if (avgMindfulness < 2.5) personaTags.push('low_mindfulness');
  if (proteinRatio < 0.8) personaTags.push('low_protein_intake');
  if (hydrationRatio < 0.7) personaTags.push('low_hydration');

  return {
    lookbackDays,
    loggingConsistency,
    avgMindfulness,
    calorieStdDev,
    eveningSnackPercent,
    emotionTriggerPercent,
    hungerMismatchPercent,
    hydrationRatio,
    proteinRatio,
    personaTags,
  };
}

const ACTION_LIBRARY: CoachAction[] = [
  { id: 'mindful_breath', label: 'Pre-meal 3-breath pause', description: 'Pause for three slow breaths before eating to raise mindfulness.', focusArea: 'mindfulness', impact: 'medium', recommended_for: ['low_mindfulness','emotional_eater'] },
  { id: 'hydrate_morning', label: 'Morning hydration', description: 'Drink 500ml water within 30 minutes of waking.', focusArea: 'hydration', impact: 'low', recommended_for: ['low_hydration'] },
  { id: 'protein_breakfast', label: 'Protein breakfast', description: 'Include ≥25g protein at breakfast to improve satiety.', focusArea: 'protein', impact: 'high', recommended_for: ['low_protein_intake','evening_snacker'] },
  { id: 'evening_swap', label: 'Evening swap', description: 'Swap evening high-calorie snack for herbal tea or fruit 3 nights this week.', focusArea: 'evening', impact: 'medium', recommended_for: ['evening_snacker'] },
  { id: 'emotion_journal', label: 'Emotion journal', description: 'Write 1–2 lines describing feelings before emotional snack.', focusArea: 'emotions', impact: 'medium', recommended_for: ['emotional_eater'] },
];

export function generateCoachAdvice(data: AppData, lookbackDays = DEFAULT_LOOKBACK): CoachAdvice {
  const analysis = analyzeForCoach(data, lookbackDays);
  const now = toLocalISODate();
  const actions = ACTION_LIBRARY.filter(a => a.recommended_for.some(tag => analysis.personaTags.includes(tag)))
    .slice(0,3);

  let focusArea = 'consistency';
  let message = '';
  const tags = analysis.personaTags;
  if (tags.includes('emotional_eater')) {
    focusArea = 'emotional regulation';
    message = 'You have a pattern of eating driven by emotions. Building a brief pre-meal awareness habit can reduce impulsive choices.';
  } else if (tags.includes('evening_snacker')) {
    focusArea = 'evening routine';
    message = 'Evenings appear to contribute a sizeable calorie share. Adjusting your late routine and boosting morning protein can help.';
  } else if (tags.includes('low_hydration')) {
    focusArea = 'hydration';
    message = 'Hydration is below target. Improving water intake can aid appetite regulation and energy.';
  } else if (tags.includes('low_mindfulness')) {
    focusArea = 'mindful eating';
    message = 'Mindfulness scores are low. Small pauses and sensory check-ins can enhance satiety awareness.';
  } else if (tags.includes('low_protein_intake')) {
    focusArea = 'protein distribution';
    message = 'Protein intake lags behind your goal. Earlier-day protein can reduce late snacking.';
  } else {
    message = 'You are building a solid foundation. Let’s refine one small area this week to keep momentum.';
  }

  const rationaleParts: string[] = [];
  rationaleParts.push(`Logging consistency ${(analysis.loggingConsistency*100).toFixed(0)}%`);
  rationaleParts.push(`Avg mindfulness ${analysis.avgMindfulness.toFixed(1)}/5`);
  if (analysis.emotionTriggerPercent > 0.15) rationaleParts.push(`Emotion-driven meals ${(analysis.emotionTriggerPercent*100).toFixed(0)}%`);
  if (analysis.eveningSnackPercent > 0.25) rationaleParts.push(`Evening snack days ${(analysis.eveningSnackPercent*100).toFixed(0)}%`);
  if (analysis.hydrationRatio < 0.9) rationaleParts.push(`Hydration ${(analysis.hydrationRatio*100).toFixed(0)}% of goal`);
  if (analysis.proteinRatio < 0.9) rationaleParts.push(`Protein ${(analysis.proteinRatio*100).toFixed(0)}% of goal`);

  return {
    focusArea,
    message,
    rationale: rationaleParts.join(' • '),
    personaTags: analysis.personaTags,
    actions,
    generatedAt: now,
  };
}
