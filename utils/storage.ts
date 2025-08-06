import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '@/types';

const DATA_KEY = 'nutrition_tracker_data';

export const saveData = async (data: AppData): Promise<void> => {
  try {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const loadData = async (): Promise<AppData | null> => {
  try {
    const data = await AsyncStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

export const clearData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DATA_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};