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
}

export interface FoodEntry {
  name: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
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
}

export interface AppData {
  profile: UserProfile;
  custom_foods: FoodEntry[];
  daily_logs: { [date: string]: DailyLog };
  weight_logs: { [date: string]: number };
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