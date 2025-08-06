import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, CreditCard as Edit, Scale, Target, Plus, TrendingUp, Settings } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { SetupModal } from '@/components/SetupModal';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FoodEntry } from '@/types';

const screenWidth = Dimensions.get('window').width;

export default function Profile() {
  const { data, saveProfile, logWeight, addCustomFood } = useData();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
  });

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { profile } = data;
  const weightLogs = data.weight_logs || {};
  const customFoods = data.custom_foods || [];

  const handleWeightLog = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    await logWeight(weight);
    setWeightInput('');
    setShowWeightModal(false);
  };

  const handleAddCustomFood = async () => {
    if (!customFood.name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const calories = parseFloat(customFood.calories);
    const protein = parseFloat(customFood.protein_g);
    const carbs = parseFloat(customFood.carbs_g);
    const fats = parseFloat(customFood.fats_g);

    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fats)) {
      Alert.alert('Error', 'Please enter valid nutritional values');
      return;
    }

    const foodEntry: FoodEntry = {
      name: customFood.name,
      grams: 100, // Default serving size
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fats_g: fats,
    };

    await addCustomFood(foodEntry);
    setCustomFood({
      name: '',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fats_g: '',
    });
    setShowCustomFoodModal(false);
  };

  const renderWeightChart = () => {
    const sortedLogs = Object.entries(weightLogs).sort(([a], [b]) => a.localeCompare(b));
    
    if (sortedLogs.length < 2) {
      return (
        <View style={styles.chartPlaceholder}>
          <TrendingUp color="#d1d5db" size={48} />
          <Text style={styles.placeholderText}>Log weight on multiple days to see your progress</Text>
        </View>
      );
    }

    const data = {
      labels: sortedLogs.slice(-7).map(([date]) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          data: sortedLogs.slice(-7).map(([, weight]) => weight),
          color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={220}
        yAxisLabel=""
        yAxisSuffix="kg"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#059669',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
  };

  const currentWeight = profile.weight_kg;
  const startWeight = profile.start_weight_kg;
  const goalWeight = profile.goal_weight_kg;
  const weightLoss = startWeight - currentWeight;
  const goalProgress = Math.abs((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User color="#059669" size={32} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.details}>
                {profile.age} years old • {profile.sex} • {profile.height_cm}cm
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Edit color="#059669" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Scale color="#059669" size={24} />
              <Text style={styles.statValue}>{currentWeight.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Current Weight</Text>
            </View>
            <View style={styles.statCard}>
              <Target color="#3b82f6" size={24} />
              <Text style={styles.statValue}>{goalWeight.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Goal Weight</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp color="#f59e0b" size={24} />
              <Text style={styles.statValue}>{weightLoss.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Weight Loss</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weight Progress</Text>
              <TouchableOpacity
                style={styles.logWeightButton}
                onPress={() => {
                  setWeightInput(currentWeight.toString());
                  setShowWeightModal(true);
                }}
              >
                <Plus color="#ffffff" size={16} />
                <Text style={styles.logWeightText}>Log Weight</Text>
              </TouchableOpacity>
            </View>
            {renderWeightChart()}
          </View>

          <View style={styles.goalsCard}>
            <Text style={styles.cardTitle}>Daily Goals</Text>
            <View style={styles.goalsList}>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Calories</Text>
                <Text style={styles.goalValue}>{profile.goals.calories} kcal</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Protein</Text>
                <Text style={styles.goalValue}>{profile.goals.protein_g}g</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Carbs</Text>
                <Text style={styles.goalValue}>{profile.goals.carbs_g}g</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Fats</Text>
                <Text style={styles.goalValue}>{profile.goals.fats_g}g</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Water</Text>
                <Text style={styles.goalValue}>{profile.goals.water_ml}ml</Text>
              </View>
            </View>
          </View>

          <View style={styles.customFoodCard}>
            <View style={styles.customFoodHeader}>
              <Text style={styles.cardTitle}>Custom Foods</Text>
              <TouchableOpacity
                style={styles.addCustomFoodButton}
                onPress={() => setShowCustomFoodModal(true)}
              >
                <Plus color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
            
            {customFoods.length === 0 ? (
              <Text style={styles.emptyText}>No custom foods added yet</Text>
            ) : (
              customFoods.map((food, index) => (
                <View key={index} style={styles.customFoodItem}>
                  <Text style={styles.customFoodName}>{food.name}</Text>
                  <Text style={styles.customFoodCalories}>
                    {Math.round(food.calories)} cal per 100g
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <SetupModal
        visible={showEditModal}
        onComplete={async (profile) => {
          await saveProfile(profile);
          setShowEditModal(false);
        }}
        initialProfile={profile}
      />

      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.weightModalContainer}>
            <Text style={styles.weightModalTitle}>Log Weight</Text>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="Enter weight in kg"
              keyboardType="numeric"
            />
            <View style={styles.weightModalButtons}>
              <TouchableOpacity
                style={[styles.weightModalButton, styles.cancelButton]}
                onPress={() => setShowWeightModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.weightModalButton, styles.saveButton]}
                onPress={handleWeightLog}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCustomFoodModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.customFoodModalContainer}>
          <View style={styles.customFoodModalHeader}>
            <Text style={styles.customFoodModalTitle}>Add Custom Food</Text>
            <TouchableOpacity onPress={() => setShowCustomFoodModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.customFoodForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.formInput}
                value={customFood.name}
                onChangeText={(text) => setCustomFood({ ...customFood, name: text })}
                placeholder="e.g., Homemade Protein Shake"
              />
            </View>

            <Text style={styles.sectionTitle}>Nutritional Information (per 100g)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories</Text>
              <TextInput
                style={styles.formInput}
                value={customFood.calories}
                onChangeText={(text) => setCustomFood({ ...customFood, calories: text })}
                placeholder="200"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Protein (g)</Text>
              <TextInput
                style={styles.formInput}
                value={customFood.protein_g}
                onChangeText={(text) => setCustomFood({ ...customFood, protein_g: text })}
                placeholder="20"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.formInput}
                value={customFood.carbs_g}
                onChangeText={(text) => setCustomFood({ ...customFood, carbs_g: text })}
                placeholder="15"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fats (g)</Text>
              <TextInput
                style={styles.formInput}
                value={customFood.fats_g}
                onChangeText={(text) => setCustomFood({ ...customFood, fats_g: text })}
                placeholder="5"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.addFoodButton} onPress={handleAddCustomFood}>
              <Text style={styles.addFoodButtonText}>Add Food</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfdf7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  logWeightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  logWeightText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  goalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  goalValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  customFoodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCustomFoodButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 6,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
  },
  customFoodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  customFoodName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  customFoodCalories: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  weightModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  weightModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  weightModalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  customFoodModalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  customFoodModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  customFoodModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  customFoodForm: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  addFoodButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addFoodButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});