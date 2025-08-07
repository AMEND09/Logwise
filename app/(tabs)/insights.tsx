import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, BarChart3, Target, Brain, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { HabitTracker } from '@/components/HabitTracker';
import { BehavioralInsights } from '@/components/BehavioralInsights';
import { DateNavigation } from '@/components/DateNavigation';
import { SetupModal } from '@/components/SetupModal';
import { DailyLog, FoodEntry } from '@/types';

const { width } = Dimensions.get('window');

type ViewType = 'daily' | 'weekly' | 'monthly';

export default function InsightsScreen() {
  const { data, currentDate, setCurrentDate, saveProfile } = useData();
  const [viewType, setViewType] = useState<ViewType>('daily');
  const [showCustomizeHabits, setShowCustomizeHabits] = useState(false);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const current = new Date(currentDate);
    
    if (viewType === 'daily') {
      if (direction === 'prev') {
        current.setDate(current.getDate() - 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    } else if (viewType === 'weekly') {
      if (direction === 'prev') {
        current.setDate(current.getDate() - 7);
      } else {
        current.setDate(current.getDate() + 7);
      }
    } else if (viewType === 'monthly') {
      if (direction === 'prev') {
        current.setMonth(current.getMonth() - 1);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const getDateRange = () => {
    const current = new Date(currentDate);
    
    if (viewType === 'daily') {
      return current.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(current);
      const dayOfWeek = current.getDay();
      startOfWeek.setDate(current.getDate() - dayOfWeek);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return current.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
  };

  const getProgressStats = () => {
    if (!data?.daily_logs) return null;

    const logs = Object.entries(data.daily_logs);
    const current = new Date(currentDate);
    let relevantLogs: Array<[string, any]> = [];

    if (viewType === 'daily') {
      const log = data.daily_logs[currentDate];
      if (!log) return null;
      
      const completedHabits = Object.values(log.daily_habits || {}).filter(Boolean).length;
      const totalHabits = Object.keys(log.daily_habits || {}).length;
      const habitCompletion = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
      
      const allFoodEntries = Object.values(log.meals).flat();
      const mindfulEntries = allFoodEntries.filter(entry => entry.mindful_rating && entry.mindful_rating >= 4).length;
      const mindfulnessRate = allFoodEntries.length > 0 ? (mindfulEntries / allFoodEntries.length) * 100 : 0;
      
      return {
        habitCompletion,
        mindfulnessRate,
        totalMeals: allFoodEntries.length,
        completedHabits,
        totalHabits
      };
    } else if (viewType === 'weekly') {
      const startOfWeek = new Date(current);
      const dayOfWeek = current.getDay();
      startOfWeek.setDate(current.getDate() - dayOfWeek);
      
      relevantLogs = logs.filter(([date]) => {
        const logDate = new Date(date);
        const diffTime = logDate.getTime() - startOfWeek.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      });
    } else {
      relevantLogs = logs.filter(([date]) => {
        const logDate = new Date(date);
        return logDate.getMonth() === current.getMonth() && 
               logDate.getFullYear() === current.getFullYear();
      });
    }

    if (relevantLogs.length === 0) return null;

    let totalHabitDays = 0;
    let completedHabitDays = 0;
    let totalMeals = 0;
    let mindfulMeals = 0;
    let longestStreak = 0;

    relevantLogs.forEach(([date, log]: [string, DailyLog]) => {
      const habits = log.daily_habits || {};
      const habitsCount = Object.keys(habits).length;
      const completedCount = Object.values(habits).filter(Boolean).length;
      
      if (habitsCount > 0) {
        totalHabitDays++;
        if (completedCount === habitsCount) completedHabitDays++;
      }

      const allFoodEntries = Object.values(log.meals).flat() as FoodEntry[];
      totalMeals += allFoodEntries.length;
      mindfulMeals += allFoodEntries.filter((entry: FoodEntry) => 
        entry.mindful_rating && entry.mindful_rating >= 4
      ).length;

      Object.values(log.habit_streak || {}).forEach((streak) => {
        const streakValue = streak as number;
        if (streakValue > longestStreak) longestStreak = streakValue;
      });
    });

    const habitCompletion = totalHabitDays > 0 ? (completedHabitDays / totalHabitDays) * 100 : 0;
    const mindfulnessRate = totalMeals > 0 ? (mindfulMeals / totalMeals) * 100 : 0;

    return {
      habitCompletion,
      mindfulnessRate,
      totalMeals,
      perfectDays: completedHabitDays,
      totalDays: relevantLogs.length,
      longestStreak
    };
  };

  const stats = getProgressStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights & Progress</Text>
        <Text style={styles.subtitle}>Track your habit-breaking journey</Text>
      </View>

      <View style={styles.viewSelector}>
        {(['daily', 'weekly', 'monthly'] as ViewType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.viewButton,
              viewType === type && styles.viewButtonActive
            ]}
            onPress={() => setViewType(type)}
          >
            <Text style={[
              styles.viewButtonText,
              viewType === type && styles.viewButtonTextActive
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateNavigation}>
        <TouchableOpacity 
          style={styles.dateArrow}
          onPress={() => handleDateChange('prev')}
        >
          <ChevronLeft color="#6b7280" size={24} />
        </TouchableOpacity>
        <Text style={styles.dateText}>{getDateRange()}</Text>
        <TouchableOpacity 
          style={styles.dateArrow}
          onPress={() => handleDateChange('next')}
        >
          <ChevronRight color="#6b7280" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Progress Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Target color="#059669" size={24} />
                <Text style={styles.statValue}>{Math.round(stats.habitCompletion)}%</Text>
                <Text style={styles.statLabel}>Habit Completion</Text>
              </View>
              
              <View style={styles.statCard}>
                <Brain color="#3b82f6" size={24} />
                <Text style={styles.statValue}>{Math.round(stats.mindfulnessRate)}%</Text>
                <Text style={styles.statLabel}>Mindful Eating</Text>
              </View>
              
              {viewType !== 'daily' && (
                <>
                  <View style={styles.statCard}>
                    <Calendar color="#f59e0b" size={24} />
                    <Text style={styles.statValue}>{stats.perfectDays || 0}</Text>
                    <Text style={styles.statLabel}>Perfect Days</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <TrendingUp color="#8b5cf6" size={24} />
                    <Text style={styles.statValue}>{stats.longestStreak || 0}</Text>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {viewType === 'daily' && (
          <>
            <HabitTracker 
              date={currentDate} 
              onCustomizeHabits={() => setShowCustomizeHabits(true)}
            />
            <BehavioralInsights />
          </>
        )}

        {viewType !== 'daily' && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {viewType === 'weekly' ? 'Weekly' : 'Monthly'} Summary
              </Text>
              {stats ? (
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryText}>
                    📊 Total meals logged: {stats.totalMeals}
                  </Text>
                  <Text style={styles.summaryText}>
                    🎯 Perfect habit days: {stats.perfectDays}/{stats.totalDays}
                  </Text>
                  <Text style={styles.summaryText}>
                    🧠 Mindful eating rate: {Math.round(stats.mindfulnessRate)}%
                  </Text>
                  {(stats.longestStreak || 0) > 0 && (
                    <Text style={styles.summaryText}>
                      🔥 Longest habit streak: {stats.longestStreak} days
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  No data available for this {viewType === 'weekly' ? 'week' : 'month'}.
                  Keep logging your habits and meals!
                </Text>
              )}
            </View>
          </View>
        )}

        {viewType === 'daily' && <BehavioralInsights />}
      </ScrollView>
      
      {data?.profile && (
        <SetupModal
          visible={showCustomizeHabits}
          onComplete={async (profile) => {
            await saveProfile(profile);
            setShowCustomizeHabits(false);
          }}
          initialProfile={data.profile}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  viewSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewButtonTextActive: {
    color: '#1a1a1a',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
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
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
