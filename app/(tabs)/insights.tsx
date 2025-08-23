import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, Target, Brain, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { HabitTracker } from '@/components/HabitTracker';
import { DateNavigation } from '@/components/DateNavigation';
import { SetupModal } from '@/components/SetupModal';
import { DailyLog, FoodEntry } from '@/types';
import { analyzeBehavioralPatterns, getPersonalizedTip } from '@/utils/behavioralCoaching';
import { LineChart } from 'react-native-chart-kit';
import { toLocalISODate, parseLocalDate } from '@/utils/dates';

const { width } = Dimensions.get('window');

type ViewType = 'daily' | 'weekly' | 'monthly';

export default function InsightsScreen() {
  const { data, currentDate, setCurrentDate, saveProfile, analytics, goalRecommendations, coachAdvice, completeCoachAction } = useData();
  const [viewType, setViewType] = useState<ViewType>('daily');
  const [showCustomizeHabits, setShowCustomizeHabits] = useState(false);
  const [legacyTip, setLegacyTip] = useState<string | null>(null); // fallback until enough data
  const [showCoachModal, setShowCoachModal] = useState(false);

  const handleDateChange = (direction: 'prev' | 'next') => {
  const current = parseLocalDate(currentDate);
    
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
    
  setCurrentDate(toLocalISODate(current));
  };

  const getDateRange = () => {
  const current = parseLocalDate(currentDate);
    
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
  const current = parseLocalDate(currentDate);
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
        const logDate = parseLocalDate(date);
        const diffTime = logDate.getTime() - startOfWeek.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      });
    } else {
      relevantLogs = logs.filter(([date]) => {
        const logDate = parseLocalDate(date);
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

  // derive coaching tip from behavioral analysis
  useEffect(() => {
    // Keep legacy analysis as an additional tip if coachAdvice not yet rich
    if (!data?.daily_logs || coachAdvice) return;
    try {
      const insights = analyzeBehavioralPatterns(data.daily_logs, 14);
      const tip = getPersonalizedTip(insights);
      setLegacyTip(tip ? `${tip.title}: ${tip.description}` : null);
    } catch (e) { /* ignore */ }
  }, [data, coachAdvice]);

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

            {/* Dynamic coaching card (improved) */}
            <View style={styles.coachingCard}>
              <Text style={styles.coachingTitle}>Your Coach</Text>
              {coachAdvice ? (
                <>
                  <Text style={styles.coachingText}>{coachAdvice.message}</Text>
                  <Text style={[styles.coachingText, { fontStyle: 'italic', opacity: 0.85 }]}>Focus: {coachAdvice.focusArea} • {coachAdvice.rationale}</Text>
                  {coachAdvice.actions && coachAdvice.actions.length > 0 && (
                    <View style={styles.suggestionsList}>
                      {coachAdvice.actions.map(action => {
                        const done = !!data?.daily_logs?.[currentDate]?.coach_actions?.[action.id]?.done;
                        return (
                          <TouchableOpacity
                            key={action.id}
                            style={[styles.coachActionButton, done && styles.coachActionDone]}
                            onPress={async () => {
                              const nowDone = await completeCoachAction(action.id);
                              if (nowDone) {
                                Alert.alert('Great!', `Marked: ${action.label}`);
                              } else {
                                Alert.alert('Undone', `Unmarked: ${action.label}`);
                              }
                            }}
                          >
                            <Text style={styles.coachActionText}>{done ? '✔ ' : ''}{action.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.coachingText}>{legacyTip || 'Keep logging meals & habits to unlock personalized coaching.'}</Text>
              )}
              <TouchableOpacity style={styles.coachingButton} onPress={() => setShowCoachModal(true)}>
                <Text style={styles.coachingButtonText}>Coach Details</Text>
              </TouchableOpacity>
              {/* Coach details modal */}
              <Modal
                visible={showCoachModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCoachModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                      <Text style={styles.modalTitle}>Coach Details</Text>
                      {coachAdvice ? (
                        <>
                          <Text style={[styles.coachingText, { marginBottom: 8 }]}>{coachAdvice.message}</Text>
                          <Text style={[styles.coachingText, { fontStyle: 'italic', opacity: 0.9, marginBottom: 12 }]}>{coachAdvice.rationale}</Text>
                          {coachAdvice.personaTags && coachAdvice.personaTags.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={{ fontWeight: '700', marginBottom: 6 }}>Persona</Text>
                              <Text style={{ color: '#374151' }}>{coachAdvice.personaTags.join(', ')}</Text>
                            </View>
                          )}

                          {coachAdvice.actions && coachAdvice.actions.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Suggested Actions</Text>
                              {coachAdvice.actions.map(action => {
                                const done = data?.daily_logs?.[currentDate]?.coach_actions?.[action.id]?.done;
                                return (
                                  <View key={action.id} style={styles.modalActionRow}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={{ fontWeight: '600' }}>{action.label}{done ? ' ✔' : ''}</Text>
                                      <Text style={{ color: '#6b7280', marginTop: 4 }}>{action.description}</Text>
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                      <TouchableOpacity
                                        style={[styles.coachActionButton, done && styles.coachActionDone]}
                                        onPress={async () => {
                                          const nowDone = await completeCoachAction(action.id);
                                          if (nowDone) {
                                            Alert.alert('Done', `Marked '${action.label}' done for today.`);
                                          } else {
                                            Alert.alert('Undone', `Unmarked '${action.label}'.`);
                                          }
                                        }}
                                      >
                                        <Text style={styles.coachActionText}>{done ? 'Done' : 'Mark'}</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </>
                      ) : (
                        <Text style={styles.coachingText}>{legacyTip || 'No coach data yet. Keep logging to unlock personalized guidance.'}</Text>
                      )}
                    </ScrollView>

                    <View style={{ padding: 12, borderTopWidth: 1, borderColor: '#eee' }}>
                      <Pressable style={styles.modalCloseButton} onPress={() => setShowCoachModal(false)}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>

            
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

            {/* Goal recommendations */}
            {goalRecommendations && goalRecommendations.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.summaryTitle, { marginBottom: 12 }]}>Goal Recommendations</Text>
                {goalRecommendations.map((rec) => (
                  <View key={rec.goalId} style={styles.goalCard}>
                    <Text style={styles.goalMessage}>{rec.message}</Text>
                    <View style={styles.goalMetaRow}>
                      <Text style={styles.goalStatus}>{rec.status.replace('_', ' ').toUpperCase()}</Text>
                      {rec.recommendedAdjustment && (
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => Alert.alert('Suggestion', rec.recommendedAdjustment)}
                        >
                          <Text style={styles.applyButtonText}>Apply Suggestion</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        
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
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  coachingCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  coachingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
  },
  coachingText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
  },
  coachingButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#92400e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  coachingButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  suggestionsList: {
    marginTop: 8,
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  coachActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  coachActionButton: {
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  coachActionDone: {
    backgroundColor: '#bbf7d0',
  },
  coachActionText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e6e9ef',
  },
  goalMessage: {
    color: '#374151',
    marginBottom: 8,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalStatus: {
    color: '#6b7280',
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCloseButton: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
