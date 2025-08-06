import { UserProfile } from '@/types';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const calculateBMR = (profile: UserProfile): number => {
  const { sex, weight_kg, height_cm, age } = profile;
  
  if (sex === 'male') {
    return 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age);
  }
};

export const calculateTDEE = (profile: UserProfile): number => {
  const bmr = calculateBMR(profile);
  return bmr * ACTIVITY_MULTIPLIERS[profile.activity_level];
};

export const calculateMacroGoals = (profile: UserProfile) => {
  const tdee = calculateTDEE(profile);
  const protein_g = profile.weight_kg * 1.8;
  const fat_calories = tdee * 0.25;
  const fat_g = fat_calories / 9;
  const carb_g = (tdee - (protein_g * 4) - fat_calories) / 4;
  
  return {
    calories: Math.round(tdee),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carb_g),
    fats_g: Math.round(fat_g),
  };
};

export const safeFloat = (value: number | string | undefined, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};