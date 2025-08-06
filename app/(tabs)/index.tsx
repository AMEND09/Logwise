import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Flame, Beef, Wheat, Droplets, Dumbbell, ChartBar as BarChart3 } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { SetupModal } from '@/components/SetupModal';
import { MacroCard } from '@/components/MacroCard';
import { DateNavigation } from '@/components/DateNavigation';
import { ProgressBar } from '@/components/ProgressBar';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { WaterDetailModal } from '@/components/WaterDetailModal';
import { WeightDetailModal } from '@/components/WeightDetailModal';
import { router } from 'expo-router';

export default function Dashboard() {
  const { data, loading, currentDate, setCurrentDate, getCurrentLog, logWater, saveProfile, initializeData } = useData();
  const [showSetup, setShowSetup] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  useEffect(() => {
    if (!loading && !data) {
      setShowSetup(true);
    }
  }, [loading, data]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const current = new Date(currentDate);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const handleAddWater = async (amount: number) => {
    await logWater(amount);
    setShowWaterModal(false);
  };

  const handleAddWeight = async (weight: number) => {
    await logWeight(weight);
    setShowWeightModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SetupModal
        visible={showSetup}
        onComplete={async (profile) => {
          await initializeData();
          await saveProfile(profile);
          setShowSetup(false);
        }}
      />
    );
  }

  const log = getCurrentLog();
  const { profile } = data;
  const goals = profile.goals;

  // Calculate totals
  const allFoodEntries = Object.values(log.meals).flat();
  const totals = {
    calories: allFoodEntries.reduce((sum, entry) => sum + entry.calories, 0),
    protein: allFoodEntries.reduce((sum, entry) => sum + entry.protein_g, 0),
    carbs: allFoodEntries.reduce((sum, entry) => sum + entry.carbs_g, 0),
    fats: allFoodEntries.reduce((sum, entry) => sum + entry.fats_g, 0),
    water: log.water_ml,
  };

  const totalWorkoutCalories = log.workout_entries.reduce((sum, entry) => sum + entry.calories_burned, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {profile.name}!</Text>
          <Text style={styles.subtitle}>Keep up the great work</Text>
        </View>

        <View style={styles.content}>
          <DateNavigation
            currentDate={currentDate}
            onPrevious={() => handleDateChange('prev')}
            onNext={() => handleDateChange('next')}
          />

          <View style={styles.macrosContainer}>
            <View style={styles.macrosRow}>
              <MacroCard
                name="Calories"
                current={totals.calories}
                goal={goals.calories}
                unit="kcal"
                color="#f59e0b"
                icon={<Flame color="#f59e0b" size={16} />}
              />
              <MacroCard
                name="Protein"
                current={totals.protein}
                goal={goals.protein_g}
                unit="g"
                color="#059669"
                icon={<Beef color="#059669" size={16} />}
              />
            </View>
            <View style={styles.macrosRow}>
              <MacroCard
                name="Carbs"
                current={totals.carbs}
                goal={goals.carbs_g}
                unit="g"
                color="#3b82f6"
                icon={<Wheat color="#3b82f6" size={16} />}
              />
              <MacroCard
                name="Fats"
                current={totals.fats}
                goal={goals.fats_g}
                unit="g"
                color="#8b5cf6"
                icon={<Droplets color="#8b5cf6" size={16} />}
              />
            </View>
          </View>

          <View style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <View style={styles.waterTitleRow}>
                <Droplets color="#06b6d4" size={20} />
                <Text style={styles.waterTitle}>Water Intake</Text>
              </View>
              <TouchableOpacity style={styles.addWaterButton} onPress={() => setShowWaterModal(true)}>
                <Plus color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
            <View style={styles.waterProgress}>
              <Text style={styles.waterAmount}>{totals.water} / {goals.water_ml} ml</Text>
              <ProgressBar 
                progress={totals.water / goals.water_ml} 
                color="#06b6d4" 
                height={8} 
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Meals logged</Text>
                <Text style={styles.summaryValue}>{allFoodEntries.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Workouts</Text>
                <Text style={styles.summaryValue}>{log.workout_entries.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Calories burned</Text>
                <Text style={styles.summaryValue}>{Math.round(totalWorkoutCalories)}</Text>
              </View>
            </View>
          </View>

          {log.workout_entries.length > 0 && (
            <View style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Dumbbell color="#f59e0b" size={20} />
                <Text style={styles.workoutTitle}>Today's Workouts</Text>
              </View>
              {log.workout_entries.map((workout, index) => (
                <View key={index} style={styles.workoutItem}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {workout.duration_min} min • {Math.round(workout.calories_burned)} cal
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <WaterDetailModal
        visible={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        onAdd={handleAddWater}
      />

      <WeightDetailModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onAdd={handleAddWeight}
        currentWeight={data?.profile.weight_kg}
        goalWeight={data?.profile.goal_weight_kg}
        startWeight={data?.profile.start_weight_kg}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  macrosContainer: {
    gap: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  waterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  addWaterButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 16,
    padding: 6,
  },
  waterProgress: {
    gap: 8,
  },
  waterAmount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  workoutItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workoutName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  workoutDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
});