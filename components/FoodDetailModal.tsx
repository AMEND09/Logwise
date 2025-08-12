import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Minus, Clock, Flame, Utensils } from 'lucide-react-native';
import { FoodEntry, OpenFoodFactsProduct, FoodSearchResult } from '@/types';
import { safeFloat } from '@/utils/calculations';

interface FoodDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: FoodEntry) => void;
  food: OpenFoodFactsProduct | FoodEntry | FoodSearchResult | null;
  isCustomFood?: boolean;
}

const UNIT_CONVERSIONS = {
  grams: { multiplier: 1, label: 'g' },
  ounces: { multiplier: 28.35, label: 'oz' },
  cups: { multiplier: 240, label: 'cup' }, 
  tablespoons: { multiplier: 15, label: 'tbsp' },
  teaspoons: { multiplier: 5, label: 'tsp' },
};

type UnitType = keyof typeof UNIT_CONVERSIONS;

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  visible,
  onClose,
  onAdd,
  food,
  isCustomFood = false,
}) => {
  const [amount, setAmount] = useState('100');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('grams');

  useEffect(() => {
    if (visible) {
      setAmount('100');
      setSelectedUnit('grams');
    }
  }, [visible]);

  if (!food) return null;

  const getFoodName = () => {
    if (isCustomFood) {
      return (food as FoodEntry).name;
    }
    // Check if it's a FoodSearchResult
    if ('source' in food) {
      return (food as FoodSearchResult).name;
    }
    // Otherwise it's OpenFoodFactsProduct
    const product = food as OpenFoodFactsProduct;
    return product.product_name || product.product_name_en || 'Unknown Food';
  };

  const getBrand = () => {
    if (isCustomFood) return null;
    // Check if it's a FoodSearchResult
    if ('source' in food) {
      const searchResult = food as FoodSearchResult;
      return `${searchResult.brand || 'Unknown brand'} • ${searchResult.source.toUpperCase()}`;
    }
    // Otherwise it's OpenFoodFactsProduct
    return (food as OpenFoodFactsProduct).brands || 'Unknown brand';
  };

  const getGramsFromAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount * UNIT_CONVERSIONS[selectedUnit].multiplier;
  };

  const calculateNutrition = () => {
    const grams = getGramsFromAmount();
    const scale = grams / 100; 

    if (isCustomFood) {
      const customFood = food as FoodEntry;
      const customScale = grams / 100; 
      return {
        calories: customFood.calories * customScale,
        protein: customFood.protein_g * customScale,
        carbs: customFood.carbs_g * customScale,
        fats: customFood.fats_g * customScale,
      };
    }

    // Check if it's a FoodSearchResult
    if ('source' in food) {
      const searchResult = food as FoodSearchResult;
      return {
        calories: searchResult.calories * scale,
        protein: searchResult.protein_g * scale,
        carbs: searchResult.carbs_g * scale,
        fats: searchResult.fats_g * scale,
      };
    }

    // Otherwise it's OpenFoodFactsProduct
    const product = food as OpenFoodFactsProduct;
    return {
      calories: safeFloat(product.nutriments['energy-kcal_100g']) * scale,
      protein: safeFloat(product.nutriments.proteins_100g) * scale,
      carbs: safeFloat(product.nutriments.carbohydrates_100g) * scale,
      fats: safeFloat(product.nutriments.fat_100g) * scale,
    };
  };

  const nutrition = calculateNutrition();

  const handleAmountChange = (delta: number) => {
    const currentAmount = parseFloat(amount) || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    setAmount(newAmount.toString());
  };

  const handleAdd = () => {
    const grams = getGramsFromAmount();
    if (grams <= 0) return;

    const foodEntry: FoodEntry = {
      name: getFoodName(),
      grams,
      calories: nutrition.calories,
      protein_g: nutrition.protein,
      carbs_g: nutrition.carbs,
      fats_g: nutrition.fats,
    };

    onAdd(foodEntry);
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle={Platform.OS === 'web' ? 'fullScreen' : 'pageSheet'}
    >
      <SafeAreaView style={styles.container} edges={Platform.OS === 'web' ? [] : ['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {getFoodName()}
            </Text>
            {getBrand() && (
              <Text style={styles.brand}>{getBrand()}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <View style={styles.amountInputRow}>
                <TouchableOpacity
                  style={styles.amountButton}
                  onPress={() => handleAmountChange(-1)}
                >
                  <Minus color="#059669" size={20} />
                </TouchableOpacity>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.amountButton}
                  onPress={() => handleAmountChange(1)}
                >
                  <Plus color="#059669" size={20} />
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                {Object.entries(UNIT_CONVERSIONS).map(([unit, config]) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      selectedUnit === unit && styles.unitButtonActive
                    ]}
                    onPress={() => setSelectedUnit(unit as UnitType)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      selectedUnit === unit && styles.unitButtonTextActive
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <Text style={styles.conversionText}>
              = {getGramsFromAmount().toFixed(1)}g
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.nutritionCard}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(nutrition.calories)} kcal
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>
                  {nutrition.protein.toFixed(1)}g
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Carbohydrates</Text>
                <Text style={styles.nutritionValue}>
                  {nutrition.carbs.toFixed(1)}g
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fats</Text>
                <Text style={styles.nutritionValue}>
                  {nutrition.fats.toFixed(1)}g
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
            <View style={styles.macroBreakdown}>
              {[
                { name: 'Protein', value: nutrition.protein * 4, color: '#059669' },
                { name: 'Carbs', value: nutrition.carbs * 4, color: '#3b82f6' },
                { name: 'Fats', value: nutrition.fats * 9, color: '#8b5cf6' },
              ].map((macro) => {
                const totalCalories = nutrition.calories || 1;
                const percentage = (macro.value / totalCalories) * 100;
                
                return (
                  <View key={macro.name} style={styles.macroItem}>
                    <View style={styles.macroHeader}>
                      <View style={[styles.macroColor, { backgroundColor: macro.color }]} />
                      <Text style={styles.macroName}>{macro.name}</Text>
                      <Text style={styles.macroPercentage}>
                        {percentage.toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.macroBarContainer}>
                      <View
                        style={[
                          styles.macroBar,
                          { width: `${Math.min(percentage, 100)}%`, backgroundColor: macro.color }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to Log</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh' as any,
      maxHeight: '100vh' as any,
      overflow: 'hidden' as any,
    } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    lineHeight: 28,
  },
  brand: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  amountContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      paddingHorizontal: 20,
    } : {}),
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? {
      paddingHorizontal: 4,
    } : {}),
  },
  amountButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  amountInput: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    maxWidth: 120,
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: '#059669',
  },
  unitButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  unitButtonTextActive: {
    color: '#ffffff',
  },
  conversionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  nutritionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nutritionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  nutritionValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  macroBreakdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macroItem: {
    marginBottom: 16,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  macroName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  macroPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  macroBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 34,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      bottom: 0,
      zIndex: 10,
      minHeight: 80,
    } : {}),
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});