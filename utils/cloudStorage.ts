import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { AppData, UserProfile, DailyLog, FoodEntry, ProgressPhoto } from '../types';

const DATA_KEY = 'nutrition_tracker_data';

export const saveDataLocally = async (data: AppData): Promise<void> => {
  try {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data locally:', error);
  }
};

export const loadDataLocally = async (): Promise<AppData | null> => {
  try {
    const data = await AsyncStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data locally:', error);
    return null;
  }
};

export const clearDataLocally = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DATA_KEY);
  } catch (error) {
    console.error('Error clearing data locally:', error);
  }
};

export const saveProfileToSupabase = async (profile: UserProfile, userId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: profile.name,
        age: profile.age,
        sex: profile.sex,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        start_weight_kg: profile.start_weight_kg,
        goal_weight_kg: profile.goal_weight_kg,
        activity_level: profile.activity_level,
        goals: profile.goals,
        eating_triggers: profile.eating_triggers,
        problem_foods: profile.problem_foods,
        preferred_habits: profile.preferred_habits,
        motivation_reason: profile.motivation_reason,
        meal_times: profile.meal_times || {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '18:30',
        },
        notifications_enabled: profile.notifications_enabled || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving profile to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving profile to Supabase:', error);
    throw error;
  }
};

export const loadProfileFromSupabase = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    console.log('Loading profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No profile found for user:', userId);
        return null;
      }
      console.error('Error loading profile from Supabase:', error);
      return null;
    }

    if (!data) {
      console.log('No profile data returned for user:', userId);
      return null;
    }

    console.log('Profile loaded successfully for user:', userId, 'name:', data.name);
    return {
      name: data.name,
      age: data.age,
      sex: data.sex,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      start_weight_kg: data.start_weight_kg,
      goal_weight_kg: data.goal_weight_kg,
      activity_level: data.activity_level,
      goals: data.goals,
      eating_triggers: data.eating_triggers || [],
      problem_foods: data.problem_foods || [],
      preferred_habits: data.preferred_habits || [],
      motivation_reason: data.motivation_reason || '',
      meal_times: data.meal_times,
      notifications_enabled: data.notifications_enabled,
    };
  } catch (error) {
    console.error('Error loading profile from Supabase:', error);
    return null;
  }
};

export const saveDailyLogToSupabase = async (
  log: DailyLog,
  date: string,
  userId: string
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date,
        meals: log.meals,
        workout_entries: log.workout_entries,
        water_ml: log.water_ml,
        daily_habits: log.daily_habits,
        mood_checkins: log.mood_checkins,
        reflection: log.reflection,
        habit_streak: log.habit_streak,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error saving daily log to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving daily log to Supabase:', error);
    throw error;
  }
};

export const loadDailyLogsFromSupabase = async (userId: string): Promise<{ [date: string]: DailyLog }> => {
  if (!isSupabaseConfigured()) return {};

  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading daily logs from Supabase:', error);
      return {};
    }

    const logs: { [date: string]: DailyLog } = {};
    data.forEach((row) => {
      logs[row.date] = {
        meals: row.meals || {},
        workout_entries: row.workout_entries || [],
        water_ml: row.water_ml || 0,
        daily_habits: row.daily_habits || {},
        mood_checkins: row.mood_checkins || {},
        reflection: row.reflection || {},
        habit_streak: row.habit_streak || {},
      };
    });

    return logs;
  } catch (error) {
    console.error('Error loading daily logs from Supabase:', error);
    return {};
  }
};

export const saveCustomFoodToSupabase = async (food: FoodEntry, userId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabase
      .from('custom_foods')
      .insert({
        user_id: userId,
        name: food.name,
        grams: food.grams,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fats_g: food.fats_g,
      });

    if (error) {
      console.error('Error saving custom food to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving custom food to Supabase:', error);
    throw error;
  }
};

export const loadCustomFoodsFromSupabase = async (userId: string): Promise<FoodEntry[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading custom foods from Supabase:', error);
      return [];
    }

    return data.map((row) => ({
      name: row.name,
      grams: row.grams,
      calories: row.calories,
      protein_g: row.protein_g,
      carbs_g: row.carbs_g,
      fats_g: row.fats_g,
    }));
  } catch (error) {
    console.error('Error loading custom foods from Supabase:', error);
    return [];
  }
};

export const saveWeightLogToSupabase = async (
  weight: number,
  date: string,
  userId: string
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabase
      .from('weight_logs')
      .upsert({
        user_id: userId,
        date,
        weight_kg: weight,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error saving weight log to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving weight log to Supabase:', error);
    throw error;
  }
};

export const loadWeightLogsFromSupabase = async (userId: string): Promise<{ [date: string]: number }> => {
  if (!isSupabaseConfigured()) return {};

  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading weight logs from Supabase:', error);
      return {};
    }

    const logs: { [date: string]: number } = {};
    data.forEach((row) => {
      logs[row.date] = row.weight_kg;
    });

    return logs;
  } catch (error) {
    console.error('Error loading weight logs from Supabase:', error);
    return {};
  }
};

export const saveProgressPhotoToSupabase = async (
  photo: ProgressPhoto,
  userId: string
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        date: photo.date,
        image_url: photo.imageUri,
        notes: photo.note,
      });

    if (error) {
      console.error('Error saving progress photo to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving progress photo to Supabase:', error);
    throw error;
  }
};

export const loadProgressPhotosFromSupabase = async (userId: string): Promise<ProgressPhoto[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading progress photos from Supabase:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      imageUri: row.image_url,
      date: row.date,
      note: row.notes || undefined,
    }));
  } catch (error) {
    console.error('Error loading progress photos from Supabase:', error);
    return [];
  }
};

export const saveData = async (data: AppData, userId?: string): Promise<void> => {
  // Always save locally first
  await saveDataLocally(data);

  if (userId && isSupabaseConfigured()) {
    try {
      // Save profile
      await saveProfileToSupabase(data.profile, userId);
      
      // Save daily logs one by one to avoid race conditions
      for (const [date, log] of Object.entries(data.daily_logs)) {
        try {
          await saveDailyLogToSupabase(log, date, userId);
        } catch (error: any) {
          // Log but don't throw on individual daily log errors
          if (error?.code !== '23505') { // Not a duplicate key error
            console.warn(`Failed to save daily log for ${date}:`, error);
          }
        }
      }

      // Save weight logs one by one
      for (const [date, weight] of Object.entries(data.weight_logs)) {
        try {
          await saveWeightLogToSupabase(weight, date, userId);
        } catch (error: any) {
          // Log but don't throw on individual weight log errors
          if (error?.code !== '23505') { // Not a duplicate key error
            console.warn(`Failed to save weight log for ${date}:`, error);
          }
        }
      }

    } catch (error) {
      console.error('Error saving to Supabase, data saved locally only:', error);
    }
  }
};

export const loadData = async (userId?: string): Promise<AppData | null> => {
  if (userId && isSupabaseConfigured()) {
    try {
      const [profile, dailyLogs, customFoods, weightLogs, progressPhotos] = await Promise.all([
        loadProfileFromSupabase(userId),
        loadDailyLogsFromSupabase(userId),
        loadCustomFoodsFromSupabase(userId),
        loadWeightLogsFromSupabase(userId),
        loadProgressPhotosFromSupabase(userId),
      ]);

      if (profile && profile.name) {
        // User has a valid profile in Supabase
        return {
          profile,
          daily_logs: dailyLogs,
          custom_foods: customFoods,
          weight_logs: weightLogs,
          progress_photos: progressPhotos,
        };
      } else {
        // User exists but no profile yet - they need to set up their profile
        console.log('User authenticated but no profile found in Supabase');
        return null;
      }
    } catch (error) {
      console.error('Error loading from Supabase, falling back to local storage:', error);
    }
  }

  // Fallback to local storage (guest mode or Supabase error)
  return await loadDataLocally();
};

export const clearData = async (userId?: string): Promise<void> => {
  await clearDataLocally();
  
};

// Individual save functions for more efficient updates
export const saveSingleDailyLog = async (
  log: DailyLog,
  date: string,
  userId?: string
): Promise<void> => {
  if (userId && isSupabaseConfigured()) {
    try {
      await saveDailyLogToSupabase(log, date, userId);
    } catch (error: any) {
      if (error?.code !== '23505') { // Not a duplicate key error
        console.warn(`Failed to save daily log for ${date}:`, error);
      }
    }
  }
};

export const saveSingleWeightLog = async (
  weight: number,
  date: string,
  userId?: string
): Promise<void> => {
  if (userId && isSupabaseConfigured()) {
    try {
      await saveWeightLogToSupabase(weight, date, userId);
    } catch (error: any) {
      if (error?.code !== '23505') { // Not a duplicate key error
        console.warn(`Failed to save weight log for ${date}:`, error);
      }
    }
  }
};
