import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Minus, Droplets } from 'lucide-react-native';

interface WaterDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number) => void;
}

const UNIT_CONVERSIONS = {
  ml: { multiplier: 1, label: 'ml' },
  'fl oz': { multiplier: 29.5735, label: 'fl oz' },
  cups: { multiplier: 240, label: 'cup' },
  liters: { multiplier: 1000, label: 'L' },
  glasses: { multiplier: 250, label: 'glass' },
};

type UnitType = keyof typeof UNIT_CONVERSIONS;

const QUICK_ADD_AMOUNTS = [
  { label: '1 Glass', amount: 250, icon: '🥛' },
  { label: '1 Bottle', amount: 500, icon: '🍼' },
  { label: '1 Cup', amount: 240, icon: '☕' },
  { label: '12 fl oz', amount: 355, icon: '🥤' },
];

export const WaterDetailModal: React.FC<WaterDetailModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [amount, setAmount] = useState('250');
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('ml');

  useEffect(() => {
    if (visible) {
      setAmount('250');
      setSelectedUnit('ml');
    }
  }, [visible]);

  const getMlFromAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount * UNIT_CONVERSIONS[selectedUnit].multiplier;
  };

  const handleAmountChange = (delta: number) => {
    const currentAmount = parseFloat(amount) || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    setAmount(newAmount.toString());
  };

  const handleQuickAdd = (quickAmount: number) => {
    onAdd(quickAmount);
  };

  const handleAdd = () => {
    const ml = getMlFromAmount();
    if (ml <= 0) return;
    onAdd(ml);
  };

  const waterLevel = Math.min(getMlFromAmount() / 500, 1); 

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle={Platform.OS === 'web' ? 'fullScreen' : 'pageSheet'}
    >
      <SafeAreaView style={styles.container} edges={Platform.OS === 'web' ? [] : ['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Log Water Intake</Text>
            <Text style={styles.subtitle}>Stay hydrated, stay healthy</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.visualSection}>
            <View style={styles.glassContainer}>
              <View style={styles.glass}>
                <View 
                  style={[
                    styles.water, 
                    { 
                      height: `${waterLevel * 80}%`,
                      backgroundColor: waterLevel > 0.7 ? '#06b6d4' : waterLevel > 0.3 ? '#0891b2' : '#0e7490'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.amountDisplay}>
                {Math.round(getMlFromAmount())} ml
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.quickAddGrid}>
              {QUICK_ADD_AMOUNTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAddButton}
                  onPress={() => handleQuickAdd(item.amount)}
                >
                  <Text style={styles.quickAddIcon}>{item.icon}</Text>
                  <Text style={styles.quickAddLabel}>{item.label}</Text>
                  <Text style={styles.quickAddAmount}>{item.amount}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Amount</Text>
            <View style={styles.amountContainer}>
              <View style={styles.amountInputRow}>
                <TouchableOpacity
                  style={styles.amountButton}
                  onPress={() => handleAmountChange(-10)}
                >
                  <Minus color="#06b6d4" size={20} />
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
                  onPress={() => handleAmountChange(10)}
                >
                  <Plus color="#06b6d4" size={20} />
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
              = {getMlFromAmount().toFixed(0)}ml
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Stay Hydrated?</Text>
            <View style={styles.benefitsContainer}>
              {[
                { icon: '🧠', title: 'Better Focus', desc: 'Improves cognitive function' },
                { icon: '💪', title: 'More Energy', desc: 'Prevents fatigue and tiredness' },
                { icon: '✨', title: 'Healthy Skin', desc: 'Keeps skin moisturized' },
                { icon: '🏃', title: 'Better Performance', desc: 'Optimizes physical performance' },
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Droplets color="#ffffff" size={20} />
            <Text style={styles.addButtonText}>Add Water</Text>
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
  glassContainer: {
    alignItems: 'center',
  },
  glass: {
    width: 80,
    height: 120,
    borderWidth: 3,
    borderColor: '#06b6d4',
    borderTopWidth: 1,
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 12,
  },
  water: {
    width: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  amountDisplay: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#06b6d4',
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
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '45%',
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
  quickAddIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAddLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  quickAddAmount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
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
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06b6d4',
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
    backgroundColor: '#06b6d4',
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
  benefitsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  benefitDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
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
    } : {}),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
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