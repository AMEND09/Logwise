import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Minus, Scale, TrendingUp, Target } from 'lucide-react-native';

interface WeightDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (weight: number) => void;
  currentWeight?: number;
  goalWeight?: number;
  startWeight?: number;
}

const UNIT_CONVERSIONS = {
  kg: { multiplier: 1, label: 'kg' },
  lbs: { multiplier: 0.453592, label: 'lbs' },
  stone: { multiplier: 6.35029, label: 'st' },
};

type UnitType = keyof typeof UNIT_CONVERSIONS;

const QUICK_ADJUSTMENTS = [
  { label: '-1 kg', amount: -1, icon: '⬇️' },
  { label: '-0.5 kg', amount: -0.5, icon: '📉' },
  { label: '+0.5 kg', amount: 0.5, icon: '📈' },
  { label: '+1 kg', amount: 1, icon: '⬆️' },
];

export const WeightDetailModal: React.FC<WeightDetailModalProps> = ({
  visible,
  onClose,
  onAdd,
  currentWeight = 70,
  goalWeight = 65,
  startWeight = 75,
}) => {
  const [weight, setWeight] = useState(currentWeight.toString());
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('kg');

  useEffect(() => {
    if (visible) {
      setWeight(currentWeight.toString());
      setSelectedUnit('kg');
    }
  }, [visible, currentWeight]);

  const getKgFromWeight = () => {
    const numWeight = parseFloat(weight) || 0;
    return numWeight * UNIT_CONVERSIONS[selectedUnit].multiplier;
  };

  const getDisplayWeight = (kgWeight: number) => {
    return (kgWeight / UNIT_CONVERSIONS[selectedUnit].multiplier).toFixed(1);
  };

  const handleWeightChange = (delta: number) => {
    const currentKg = getKgFromWeight();
    const newKg = Math.max(0, currentKg + delta);
    setWeight(getDisplayWeight(newKg));
  };

  const handleQuickAdjustment = (adjustment: number) => {
    const newWeight = getKgFromWeight() + adjustment;
    if (newWeight > 0) {
      onAdd(newWeight);
    }
  };

  const handleAdd = () => {
    const kg = getKgFromWeight();
    if (kg <= 0) return;
    onAdd(kg);
  };

  const weightDifference = getKgFromWeight() - currentWeight;
  const progressToGoal = Math.abs((startWeight - getKgFromWeight()) / (startWeight - goalWeight)) * 100;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Log Weight</Text>
            <Text style={styles.subtitle}>Track your progress</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weight Scale Visualization */}
          <View style={styles.visualSection}>
            <View style={styles.scaleContainer}>
              <View style={styles.scale}>
                <Scale color="#8b5cf6" size={48} />
              </View>
              <Text style={styles.weightDisplay}>
                {getDisplayWeight(getKgFromWeight())} {UNIT_CONVERSIONS[selectedUnit].label}
              </Text>
              {weightDifference !== 0 && (
                <Text style={[
                  styles.weightDifference,
                  { color: weightDifference > 0 ? '#dc2626' : '#059669' }
                ]}>
                  {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)} kg from last entry
                </Text>
              )}
            </View>
          </View>

          {/* Quick Adjustments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Adjustments</Text>
            <View style={styles.quickAdjustGrid}>
              {QUICK_ADJUSTMENTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAdjustButton}
                  onPress={() => handleQuickAdjustment(item.amount)}
                >
                  <Text style={styles.quickAdjustIcon}>{item.icon}</Text>
                  <Text style={styles.quickAdjustLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Weight Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Weight</Text>
            <View style={styles.weightContainer}>
              <View style={styles.weightInputRow}>
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => handleWeightChange(-0.1)}
                >
                  <Minus color="#8b5cf6" size={20} />
                </TouchableOpacity>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => handleWeightChange(0.1)}
                >
                  <Plus color="#8b5cf6" size={20} />
                </TouchableOpacity>
              </View>
              
              {/* Unit Selector */}
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
              = {getKgFromWeight().toFixed(1)} kg
            </Text>
          </View>

          {/* Progress Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress Insights</Text>
            <View style={styles.insightsContainer}>
              <View style={styles.insightItem}>
                <TrendingUp color="#059669" size={20} />
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Goal Progress</Text>
                  <Text style={styles.insightDesc}>
                    {progressToGoal.toFixed(1)}% towards your goal weight
                  </Text>
                </View>
              </View>
              
              <View style={styles.insightItem}>
                <Target color="#3b82f6" size={20} />
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Remaining</Text>
                  <Text style={styles.insightDesc}>
                    {Math.abs(getKgFromWeight() - goalWeight).toFixed(1)} kg to goal
                  </Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <Scale color="#f59e0b" size={20} />
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Total Change</Text>
                  <Text style={styles.insightDesc}>
                    {(startWeight - getKgFromWeight()).toFixed(1)} kg from start
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weight Tracking Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight Tracking Tips</Text>
            <View style={styles.tipsContainer}>
              {[
                { icon: '🌅', title: 'Weigh in the morning', desc: 'For most consistent results' },
                { icon: '📅', title: 'Same time daily', desc: 'Consistency is key for accuracy' },
                { icon: '👕', title: 'Minimal clothing', desc: 'Wear similar clothes each time' },
                { icon: '📊', title: 'Track trends', desc: 'Focus on weekly averages' },
              ].map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <View style={styles.tipText}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Scale color="#ffffff" size={20} />
            <Text style={styles.addButtonText}>Log Weight</Text>
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
  subtitle: {
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
  visualSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scaleContainer: {
    alignItems: 'center',
  },
  scale: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  weightDisplay: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  weightDifference: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  quickAdjustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAdjustButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAdjustIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickAdjustLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  weightContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  weightInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
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
    backgroundColor: '#8b5cf6',
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
  insightsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  insightDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  tipDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});