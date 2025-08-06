import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = '#059669', 
  height = 8 
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={[color, color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progress, { width: `${clampedProgress * 100}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});