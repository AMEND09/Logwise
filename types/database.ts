export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
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
          meal_times: {
            breakfast: string;
            lunch: string;
            dinner: string;
            snack?: string;
          };
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
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
          eating_triggers?: string[];
          problem_foods?: string[];
          preferred_habits?: string[];
          motivation_reason?: string;
          meal_times?: {
            breakfast: string;
            lunch: string;
            dinner: string;
            snack?: string;
          };
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age?: number;
          sex?: 'male' | 'female';
          weight_kg?: number;
          height_cm?: number;
          start_weight_kg?: number;
          goal_weight_kg?: number;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          goals?: {
            calories: number;
            protein_g: number;
            carbs_g: number;
            fats_g: number;
            water_ml: number;
          };
          eating_triggers?: string[];
          problem_foods?: string[];
          preferred_habits?: string[];
          motivation_reason?: string;
          meal_times?: {
            breakfast: string;
            lunch: string;
            dinner: string;
            snack?: string;
          };
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meals: {
            [key: string]: any[];
          };
          workout_entries: any[];
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          meals?: {
            [key: string]: any[];
          };
          workout_entries?: any[];
          water_ml?: number;
          daily_habits?: {
            [habit: string]: boolean;
          };
          mood_checkins?: {
            morning?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
            evening?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
          };
          reflection?: {
            wins?: string;
            challenges?: string;
            tomorrow_focus?: string;
          };
          habit_streak?: {
            [habit: string]: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          meals?: {
            [key: string]: any[];
          };
          workout_entries?: any[];
          water_ml?: number;
          daily_habits?: {
            [habit: string]: boolean;
          };
          mood_checkins?: {
            morning?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
            evening?: 'great' | 'good' | 'okay' | 'stressed' | 'low';
          };
          reflection?: {
            wins?: string;
            challenges?: string;
            tomorrow_focus?: string;
          };
          habit_streak?: {
            [habit: string]: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_foods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          grams: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          grams: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          grams?: number;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fats_g?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          weight_kg: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          weight_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          image_url: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          image_url: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          image_url?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
