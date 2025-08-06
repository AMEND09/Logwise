import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Target, Flame, TrendingUp, Settings } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';

interface HabitTrackerProps {
  date: string;
  onCustomizeHabits?: () => void;
}

const DEFAULT_HABITS = [
  { id: 'drink_water_wake_up', name: 'Drink water when I wake up', category: 'hydration' },
  { id: 'eat_slowly', name: 'Eat slowly and mindfully', category: 'mindful_eating' },
  { id: 'no_phone_eating', name: 'No phone/TV while eating', category: 'mindful_eating' },
  { id: 'pause_before_snack', name: 'Pause before snacking', category: 'awareness' },
  { id: 'plan_meals', name: 'Plan tomorrow\'s meals', category: 'preparation' },
  { id: 'movement_break', name: 'Take a movement break', category: 'activity' },
  { id: 'stress_check', name: 'Check stress levels', category: 'emotional_health' },
  { id: 'gratitude_moment', name: 'Notice one thing I\'m grateful for', category: 'mindfulness' },
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({ date, onCustomizeHabits }) => {
  const { data, getCurrentLog, toggleHabit } = useData();
  const log = getCurrentLog();
  
  const [selectedHabits, setSelectedHabits] = useState(
    data?.profile?.preferred_habits || DEFAULT_HABITS.slice(0, 4).map(h => h.id)
  );

  const handleToggleHabit = async (habitId: string) => {
    await toggleHabit(habitId);
  };

  const getHabitStreak = (habitId: string): number => {
    return log.habit_streak?.[habitId] || 0;
  };

  const getCompletionPercentage = (): number => {
    const completedCount = Object.values(log.daily_habits || {}).filter(Boolean).length;
    return selectedHabits.length > 0 ? (completedCount / selectedHabits.length) * 100 : 0;
  };

  const getLongestStreak = (): number => {
    const streaks = Object.values(log.habit_streak || {});
    return streaks.length > 0 ? Math.max(...streaks) : 0;
  };

  const renderHabitItem = (habitId: string) => {
    const habit = DEFAULT_HABITS.find(h => h.id === habitId);
    if (!habit) return null;

    const isCompleted = log.daily_habits?.[habitId] || false;
    const streak = getHabitStreak(habitId);

    return (
      <TouchableOpacity
        key={habitId}
        style={[styles.habitItem, isCompleted && styles.habitItemCompleted]}
        onPress={() => handleToggleHabit(habitId)}
        activeOpacity={0.7}
      >
        <View style={styles.habitLeft}>
          {isCompleted ? (
            <CheckCircle color="#059669" size={24} />
          ) : (
            <Circle color="#9ca3af" size={24} />
          )}
          <View style={styles.habitText}>
            <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
              {habit.name}
            </Text>
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <Flame color="#f59e0b" size={14} />
                <Text style={styles.streakText}>{streak} day streak</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.habitCategory}>
          <Text style={styles.categoryText}>{habit.category.replace('_', ' ')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const completionPercentage = getCompletionPercentage();
  const completedCount = Object.values(log.daily_habits || {}).filter(Boolean).length;
  const longestStreak = getLongestStreak();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Target color="#2563eb" size={24} />
          <Text style={styles.title}>Daily Habits</Text>
          <View style={styles.headerRight}>
            {longestStreak > 0 && (
              <View style={styles.streakBadge}>
                <Flame color="#f59e0b" size={16} />
                <Text style={styles.streakBadgeText}>{longestStreak}</Text>
              </View>
            )}
            {onCustomizeHabits && (
              <TouchableOpacity 
                style={styles.customizeButton} 
                onPress={onCustomizeHabits}
              >
                <Settings color="#6b7280" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedCount}/{selectedHabits.length} completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
        {selectedHabits.map(habitId => renderHabitItem(habitId))}
        
        {completionPercentage === 100 && (
          <View style={styles.celebrationContainer}>
            <TrendingUp color="#059669" size={32} />
            <Text style={styles.celebrationTitle}>Fantastic!</Text>
            <Text style={styles.celebrationText}>
              You've completed all your habits for today. You're building great momentum!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakBadgeText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  customizeButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginLeft: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  habitsList: {
    maxHeight: 300,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  habitItemCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitText: {
    marginLeft: 12,
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  habitNameCompleted: {
    color: '#059669',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  habitCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
  },
  categoryText: {
    fontSize: 12,
    color: '#3730a3',
    fontWeight: '500',
  },
  celebrationContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginTop: 12,
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 8,
    marginBottom: 4,
  },
  celebrationText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
});
