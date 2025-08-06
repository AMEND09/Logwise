import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppData, UserProfile, DailyLog, FoodEntry, WorkoutEntry } from '@/types';
import { saveData, loadData } from '@/utils/storage';
import { calculateMacroGoals } from '@/utils/calculations';

interface DataContextType {
  data: AppData | null;
  loading: boolean;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  saveProfile: (profile: UserProfile) => Promise<void>;
  getCurrentLog: () => DailyLog;
  addFoodEntry: (mealType: string, entry: FoodEntry) => Promise<void>;
  addWorkoutEntry: (entry: WorkoutEntry) => Promise<void>;
  addCustomFood: (food: FoodEntry) => Promise<void>;
  logWeight: (weight: number) => Promise<void>;
  logWater: (amount: number) => Promise<void>;
  initializeData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const savedData = await loadData();
      if (savedData) {
        setData(savedData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeData = useCallback(async () => {
    const defaultProfile: UserProfile = {
      name: '',
      age: 30,
      sex: 'male',
      weight_kg: 70,
      height_cm: 175,
      start_weight_kg: 70,
      goal_weight_kg: 65,
      activity_level: 'moderate',
      goals: {
        calories: 2000,
        protein_g: 126,
        carbs_g: 250,
        fats_g: 56,
        water_ml: 2500,
      },
    };

    const newData: AppData = {
      profile: defaultProfile,
      custom_foods: [],
      daily_logs: {},
      weight_logs: {},
    };

    setData(newData);
    await saveData(newData);
  }, []);

  const saveProfile = async (profile: UserProfile) => {
    if (!data) return;

    const goals = calculateMacroGoals(profile);
    const updatedProfile = { ...profile, goals: { ...goals, water_ml: profile.goals.water_ml } };
    
    const updatedData = { ...data, profile: updatedProfile };
    setData(updatedData);
    await saveData(updatedData);
  };

  const getCurrentLog = (): DailyLog => {
    if (!data) {
      return {
        meals: Object.fromEntries(MEAL_TYPES.map(meal => [meal, []])),
        workout_entries: [],
        water_ml: 0,
      };
    }

    if (!data.daily_logs[currentDate]) {
      data.daily_logs[currentDate] = {
        meals: Object.fromEntries(MEAL_TYPES.map(meal => [meal, []])),
        workout_entries: [],
        water_ml: 0,
      };
    }

    return data.daily_logs[currentDate];
  };

  const addFoodEntry = async (mealType: string, entry: FoodEntry) => {
    if (!data) return;

    const log = getCurrentLog();
    log.meals[mealType].push(entry);
    
    const updatedData = { ...data };
    updatedData.daily_logs[currentDate] = log;
    setData(updatedData);
    await saveData(updatedData);
  };

  const addWorkoutEntry = async (entry: WorkoutEntry) => {
    if (!data) return;

    const log = getCurrentLog();
    log.workout_entries.push(entry);
    
    const updatedData = { ...data };
    updatedData.daily_logs[currentDate] = log;
    setData(updatedData);
    await saveData(updatedData);
  };

  const addCustomFood = async (food: FoodEntry) => {
    if (!data) return;

    const updatedData = { ...data };
    updatedData.custom_foods.push(food);
    setData(updatedData);
    await saveData(updatedData);
  };

  const logWeight = async (weight: number) => {
    if (!data) return;

    const updatedData = { ...data };
    updatedData.weight_logs[currentDate] = weight;
    updatedData.profile.weight_kg = weight;
    setData(updatedData);
    await saveData(updatedData);
  };

  const logWater = async (amount: number) => {
    if (!data) return;

    const log = getCurrentLog();
    log.water_ml += amount;
    
    const updatedData = { ...data };
    updatedData.daily_logs[currentDate] = log;
    setData(updatedData);
    await saveData(updatedData);
  };

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        currentDate,
        setCurrentDate,
        saveProfile,
        getCurrentLog,
        addFoodEntry,
        addWorkoutEntry,
        addCustomFood,
        logWeight,
        logWater,
        initializeData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};