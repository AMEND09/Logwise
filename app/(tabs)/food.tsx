import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Utensils, Coffee, Sun, Moon } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { searchFoods } from '@/utils/api';
import { safeFloat } from '@/utils/calculations';
import { FoodEntry, OpenFoodFactsProduct } from '@/types';
import { FoodDetailModal } from '@/components/FoodDetailModal';

const MEAL_TYPES = [
  { key: 'Breakfast', label: 'Breakfast', icon: Coffee, color: '#f59e0b' },
  { key: 'Lunch', label: 'Lunch', icon: Sun, color: '#059669' },
  { key: 'Dinner', label: 'Dinner', icon: Moon, color: '#3b82f6' },
  { key: 'Snacks', label: 'Snacks', icon: Utensils, color: '#8b5cf6' },
];

export default function Food() {
  const { getCurrentLog, addFoodEntry, data } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [logType, setLogType] = useState<'search' | 'custom'>('search');
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [selectedFood, setSelectedFood] = useState<OpenFoodFactsProduct | FoodEntry | null>(null);
  const [isSelectedFoodCustom, setIsSelectedFoodCustom] = useState(false);

  const log = getCurrentLog();
  const customFoods = data?.custom_foods || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = (food: OpenFoodFactsProduct | FoodEntry, isCustom = false) => {
    setSelectedFood(food);
    setIsSelectedFoodCustom(isCustom);
    setShowFoodDetail(true);
  };

  const handleAddFood = async (foodEntry: FoodEntry) => {
    await addFoodEntry(selectedMeal, foodEntry);
    setShowFoodDetail(false);
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
  };

  const renderMealSection = (mealType: string) => {
    const mealConfig = MEAL_TYPES.find(m => m.key === mealType);
    if (!mealConfig) return null;

    const { icon: Icon, color } = mealConfig;
    const mealEntries = log.meals[mealType] || [];
    const totalCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

    return (
      <View key={mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <Icon color={color} size={20} />
            <Text style={styles.mealTitle}>{mealType}</Text>
            <Text style={styles.mealCalories}>
              {Math.round(totalCalories)} cal
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: color }]}
            onPress={() => {
              setSelectedMeal(mealType);
              setShowAddModal(true);
            }}
          >
            <Plus color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>

        {mealEntries.length === 0 ? (
          <Text style={styles.emptyText}>No food logged for this meal</Text>
        ) : (
          mealEntries.map((entry, index) => (
            <View key={index} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{entry.name}</Text>
                <Text style={styles.foodDetails}>
                  {Math.round(entry.grams)}g • {Math.round(entry.calories)} cal
                </Text>
              </View>
              <View style={styles.macros}>
                <Text style={styles.macroText}>P: {Math.round(entry.protein_g)}g</Text>
                <Text style={styles.macroText}>C: {Math.round(entry.carbs_g)}g</Text>
                <Text style={styles.macroText}>F: {Math.round(entry.fats_g)}g</Text>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Log</Text>
          <Text style={styles.subtitle}>Track your meals and nutrition</Text>
        </View>

        <View style={styles.content}>
          {MEAL_TYPES.map(meal => renderMealSection(meal.key))}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Food to {selectedMeal}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logTypeSelector}>
            <TouchableOpacity
              style={[styles.logTypeButton, logType === 'search' && styles.logTypeButtonActive]}
              onPress={() => setLogType('search')}
            >
              <Text style={[styles.logTypeText, logType === 'search' && styles.logTypeTextActive]}>
                Search Foods
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logTypeButton, logType === 'custom' && styles.logTypeButtonActive]}
              onPress={() => setLogType('custom')}
            >
              <Text style={[styles.logTypeText, logType === 'custom' && styles.logTypeTextActive]}>
                Custom Foods
              </Text>
            </TouchableOpacity>
          </View>

          {logType === 'search' ? (
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for foods..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                  <Search color="#ffffff" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.resultsContainer}>
                {searching && (
                  <Text style={styles.searchingText}>Searching...</Text>
                )}
                {searchResults.map((product, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleSelectFood(product)}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {product.product_name || product.product_name_en}
                      </Text>
                      <Text style={styles.resultBrand}>{product.brands || 'Unknown brand'}</Text>
                    </View>
                    <Text style={styles.resultCalories}>
                      {Math.round(safeFloat(product.nutriments['energy-kcal_100g']))} cal/100g
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <ScrollView style={styles.customFoodsContainer}>
              {customFoods.length === 0 ? (
                <Text style={styles.emptyCustomText}>
                  No custom foods added yet. Add some from the Profile tab!
                </Text>
              ) : (
                customFoods.map((food, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.customFoodItem}
                    onPress={() => handleSelectFood(food, true)}
                  >
                    <View style={styles.customFoodInfo}>
                      <Text style={styles.customFoodName}>{food.name}</Text>
                      <Text style={styles.customFoodCalories}>
                        {Math.round(food.calories)} cal per 100g
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <FoodDetailModal
        visible={showFoodDetail}
        onClose={() => {
          setShowFoodDetail(false);
          setSelectedFood(null);
        }}
        onAdd={handleAddFood}
        food={selectedFood}
        isCustomFood={isSelectedFoodCustom}
      />
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
  mealSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  mealCalories: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginLeft: 'auto',
    marginRight: 12,
  },
  addButton: {
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
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  foodDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  macros: {
    flexDirection: 'row',
    gap: 8,
  },
  macroText: {
    fontSize: 10,
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
  logTypeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  logTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  logTypeButtonActive: {
    backgroundColor: '#059669',
  },
  logTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  logTypeTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  searchButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  searchingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  resultBrand: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  resultCalories: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  customFoodsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyCustomText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  customFoodItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  customFoodInfo: {
    flex: 1,
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
});