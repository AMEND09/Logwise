import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Dumbbell, Clock, Flame } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { WorkoutEntry } from '@/types';

export default function Workout() {
  const { getCurrentLog, addWorkoutEntry } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const log = getCurrentLog();
  const workoutEntries = log.workout_entries || [];
  const totalCalories = workoutEntries.reduce((sum, entry) => sum + entry.calories_burned, 0);
  const totalDuration = workoutEntries.reduce((sum, entry) => sum + entry.duration_min, 0);

  const handleAddWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const durationNum = parseInt(duration);
    const caloriesNum = parseFloat(caloriesBurned);

    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      Alert.alert('Error', 'Please enter valid calories burned');
      return;
    }

    const entry: WorkoutEntry = {
      name: workoutName,
      duration_min: durationNum,
      calories_burned: caloriesNum,
    };

    await addWorkoutEntry(entry);
    setWorkoutName('');
    setDuration('');
    setCaloriesBurned('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Log</Text>
          <Text style={styles.subtitle}>Track your fitness activities</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Dumbbell color="#059669" size={24} />
                <Text style={styles.summaryValue}>{workoutEntries.length}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Clock color="#3b82f6" size={24} />
                <Text style={styles.summaryValue}>{totalDuration}</Text>
                <Text style={styles.summaryLabel}>Minutes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Flame color="#f59e0b" size={24} />
                <Text style={styles.summaryValue}>{Math.round(totalCalories)}</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
              </View>
            </View>
          </View>

          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>Today's Workouts</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus color="#ffffff" size={20} />
              </TouchableOpacity>
            </View>

            {workoutEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Dumbbell color="#d1d5db" size={48} />
                <Text style={styles.emptyText}>No workouts logged today</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first workout</Text>
              </View>
            ) : (
              workoutEntries.map((entry, index) => (
                <View key={index} style={styles.workoutItem}>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{entry.name}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.statItem}>
                        <Clock color="#6b7280" size={16} />
                        <Text style={styles.statText}>{entry.duration_min} min</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Flame color="#6b7280" size={16} />
                        <Text style={styles.statText}>{Math.round(entry.calories_burned)} cal</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Workout</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name</Text>
              <TextInput
                style={styles.input}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="e.g., Running, Weight Training, Yoga"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calories Burned</Text>
              <TextInput
                style={styles.input}
                value={caloriesBurned}
                onChangeText={setCaloriesBurned}
                placeholder="300"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.addWorkoutButton} onPress={handleAddWorkout}>
              <Text style={styles.addWorkoutButtonText}>Add Workout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  title: {
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 4,
  },
  workoutItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#059669',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  addWorkoutButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addWorkoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});