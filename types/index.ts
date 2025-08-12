export interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  weight_kg: number;
  height_cm: number;
  start_weight_kg: number;
  goal_weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    water_ml: number;
  };
  eating_triggers: string[];
  problem_foods: string[];
  preferred_habits: string[];
  motivation_reason: string;
  meal_times?: {
    breakfast: string; // HH:MM format
    lunch: string;
    dinner: string;
    snack?: string;
  };
  notifications_enabled?: boolean;
}

export interface FoodEntry {
  name: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  // Behavioral tracking for habit-breaking
  hunger_level?: 1 | 2 | 3 | 4 | 5; // 1 = not hungry, 5 = very hungry
  mood_before?: 'stressed' | 'happy' | 'sad' | 'bored' | 'anxious' | 'neutral';
  eating_trigger?: 'hunger' | 'emotion' | 'social' | 'habit' | 'craving';
  mindful_rating?: 1 | 2 | 3 | 4 | 5; // How mindfully they ate
  satisfaction_level?: 1 | 2 | 3 | 4 | 5; // How satisfied they felt after
}

export interface WorkoutEntry {
  name: string;
  duration_min: number;
  calories_burned: number;
}

export interface DailyLog {
  meals: {
    [key: string]: FoodEntry[];
  };
  workout_entries: WorkoutEntry[];
  water_ml: number;
  
  daily_habits: {
    [habit: string]: boolean; 
  };
  mood_checkins: {
    morning?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
    evening?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
  };
  reflection: {
    wins?: string; 
    challenges?: string; 
    tomorrow_focus?: string; 
  };
  habit_streak: {
    [habit: string]: number; 
  };
}

export interface AppData {
  profile: UserProfile;
  custom_foods: FoodEntry[];
  daily_logs: { [date: string]: DailyLog };
  weight_logs: { [date: string]: number };
  progress_photos: ProgressPhoto[];
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  nutriments: {
    'energy-kcal_100g'?: number | string;
    proteins_100g?: number | string;
    carbohydrates_100g?: number | string;
    fat_100g?: number | string;
  };
}

export interface USDAFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
  dataType: string;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  source: 'usda' | 'openfoodfacts';
  sourceId: string | number;
}

// Habit-breaking and behavioral coaching interfaces
export interface HabitCoachingTip {
  id: string;
  title: string;
  description: string;
  category: 'mindful_eating' | 'emotional_eating' | 'portion_control' | 'meal_timing' | 'stress_management';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface BehavioralInsight {
  type: 'pattern' | 'achievement' | 'suggestion' | 'warning';
  title: string;
  message: string;
  actionable_tip?: string;
  related_data?: any;
}

export interface MindfulEatingPrompt {
  pre_meal: string[];
  during_meal: string[];
  post_meal: string[];
}

export interface TriggerAnalysis {
  trigger: string;
  frequency: number;
  associated_foods: string[];
  suggested_alternatives: string[];
}

export interface ProgressPhoto {
  id: string;
  imageUri: string;
  date: string;
  note?: string;
}