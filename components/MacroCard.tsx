import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface MacroCardProps {
  name: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

export const MacroCard: React.FC<MacroCardProps> = ({
  name,
  current,
  goal,
  unit,
  color,
  icon,
}) => {
  const progress = goal > 0 ? current / goal : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon}
          <Text style={styles.title}>{name}</Text>
        </View>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>
      
      <View style={styles.values}>
        <Text style={styles.current}>{Math.round(current)}</Text>
        <Text style={styles.divider}>/</Text>
        <Text style={styles.goal}>{goal} {unit}</Text>
      </View>
      
      <ProgressBar progress={progress} color={color} height={6} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    marginLeft: 6,
  },
  percentage: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  current: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  divider: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginHorizontal: 4,
  },
  goal: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});