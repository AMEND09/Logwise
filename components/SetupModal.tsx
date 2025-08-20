import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import showAlert from '../utils/showAlert';
import { UserProfile } from '@/types';
import { calculateMacroGoals } from '@/utils/calculations';
import { CheckCircle, Circle } from 'lucide-react-native';

const DEFAULT_HABITS = [
  { id: 'drink_water_wake_up', name: 'Drink water when I wake up', category: 'hydration' },
  { id: 'eat_slowly', name: 'Eat slowly and mindfully', category: 'mindful_eating' },
  { id: 'no_phone_eating', name: 'No phone/TV while eating', category: 'mindful_eating' },
  { id: 'pause_before_snack', name: 'Pause before snacking', category: 'awareness' },
  { id: 'plan_meals', name: 'Plan tomorrow\'s meals', category: 'preparation' },
  { id: 'movement_break', name: 'Take a movement break', category: 'activity' },
  { id: 'stress_check', name: 'Check stress levels', category: 'emotional_health' },
  { id: 'gratitude_moment', name: 'Notice one thing I\'m grateful for', category: 'mindfulness' },
  { id: 'portion_awareness', name: 'Check portion sizes before eating', category: 'portion_control' },
  { id: 'hunger_check', name: 'Rate hunger before eating', category: 'awareness' },
];

interface SetupModalProps {
  visible: boolean;
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { key: 'light', label: 'Light (1-3 days/week)' },
  { key: 'moderate', label: 'Moderate (3-5 days/week)' },
  { key: 'active', label: 'Active (6-7 days/week)' },
  { key: 'very_active', label: 'Very Active (2x/day)' },
];

export const SetupModal: React.FC<SetupModalProps> = ({ visible, onComplete, initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
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
    eating_triggers: [],
    problem_foods: [],
    preferred_habits: ['drink_water_wake_up', 'eat_slowly', 'no_phone_eating', 'pause_before_snack'],
    motivation_reason: '',
  });

  const [customizeGoals, setCustomizeGoals] = useState(false);

  const handleComplete = () => {
    if (!profile.name.trim()) {
      showAlert('Error', 'Please enter your name');
      return;
    }

    const goals = calculateMacroGoals(profile);
    const finalProfile = {
      ...profile,
      start_weight_kg: initialProfile?.start_weight_kg || profile.weight_kg,
      goals: customizeGoals ? profile.goals : { ...goals, water_ml: profile.goals.water_ml },
    };

    onComplete(finalProfile);
  };

  const updateField = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateGoal = (field: string, value: number) => {
    setProfile(prev => ({
      ...prev,
      goals: { ...prev.goals, [field]: value },
    }));
  };

  const toggleHabit = (habitId: string) => {
    setProfile(prev => {
      const currentHabits = prev.preferred_habits || [];
      const isSelected = currentHabits.includes(habitId);
      
      const updatedHabits = isSelected
        ? currentHabits.filter(id => id !== habitId)
        : [...currentHabits, habitId];
      
      return {
        ...prev,
        preferred_habits: updatedHabits
      };
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialProfile ? 'Edit Profile' : 'Welcome to Nutrition Tracker'}
            </Text>
            <Text style={styles.subtitle}>
              {initialProfile ? 'Update your information' : 'Let\'s set up your profile'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={profile.age.toString()}
                  onChangeText={(text) => updateField('age', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Sex</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[styles.segment, profile.sex === 'male' && styles.segmentActive]}
                    onPress={() => updateField('sex', 'male')}
                  >
                    <Text style={[styles.segmentText, profile.sex === 'male' && styles.segmentTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segment, profile.sex === 'female' && styles.segmentActive]}
                    onPress={() => updateField('sex', 'female')}
                  >
                    <Text style={[styles.segmentText, profile.sex === 'female' && styles.segmentTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.weight_kg.toString()}
                  onChangeText={(text) => updateField('weight_kg', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  placeholder="70"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.height_cm.toString()}
                  onChangeText={(text) => updateField('height_cm', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  placeholder="175"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Goal Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={profile.goal_weight_kg.toString()}
                onChangeText={(text) => updateField('goal_weight_kg', parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="65"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Level</Text>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.activityOption,
                    profile.activity_level === level.key && styles.activityOptionActive
                  ]}
                  onPress={() => updateField('activity_level', level.key)}
                >
                  <Text style={[
                    styles.activityOptionText,
                    profile.activity_level === level.key && styles.activityOptionTextActive
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nutrition Goals</Text>
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => setCustomizeGoals(!customizeGoals)}
              >
                <Text style={styles.customizeButtonText}>
                  {customizeGoals ? 'Use Calculated' : 'Customize'}
                </Text>
              </TouchableOpacity>
            </View>

            {customizeGoals && (
              <View>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Calories</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.goals.calories.toString()}
                      onChangeText={(text) => updateGoal('calories', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Protein (g)</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.goals.protein_g.toString()}
                      onChangeText={(text) => updateGoal('protein_g', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Carbs (g)</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.goals.carbs_g.toString()}
                      onChangeText={(text) => updateGoal('carbs_g', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Fats (g)</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.goals.fats_g.toString()}
                      onChangeText={(text) => updateGoal('fats_g', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Water Goal (ml)</Text>
              <TextInput
                style={styles.input}
                value={profile.goals.water_ml.toString()}
                onChangeText={(text) => updateGoal('water_ml', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="2500"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Habits</Text>
            <Text style={styles.sectionSubtitle}>
              Choose 3-6 habits you'd like to focus on daily. You can change these later.
            </Text>
            
            <View style={styles.habitsGrid}>
              {DEFAULT_HABITS.map((habit) => {
                const isSelected = profile.preferred_habits?.includes(habit.id) || false;
                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitOption,
                      isSelected && styles.habitOptionSelected
                    ]}
                    onPress={() => toggleHabit(habit.id)}
                  >
                    <View style={styles.habitOptionContent}>
                      {isSelected ? (
                        <CheckCircle color="#059669" size={20} />
                      ) : (
                        <Circle color="#9ca3af" size={20} />
                      )}
                      <Text style={[
                        styles.habitOptionText,
                        isSelected && styles.habitOptionTextSelected
                      ]}>
                        {habit.name}
                      </Text>
                    </View>
                    <Text style={styles.habitCategory}>
                      {habit.category.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <Text style={styles.habitCount}>
              {profile.preferred_habits?.length || 0} habits selected
            </Text>
          </View>

          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>
              {initialProfile ? 'Save Changes' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

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
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  section: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  customizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#059669',
    borderRadius: 6,
  },
  customizeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 6,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  segmentActive: {
    backgroundColor: '#059669',
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  activityOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  activityOptionActive: {
    backgroundColor: '#dcfdf7',
    borderColor: '#059669',
  },
  activityOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  activityOptionTextActive: {
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  habitsGrid: {
    gap: 12,
  },
  habitOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  habitOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  habitOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitOptionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  habitOptionTextSelected: {
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  habitCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  habitCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  completeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#059669',
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});