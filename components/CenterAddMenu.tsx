import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Utensils, Droplets, Scale, Dumbbell, X } from 'lucide-react-native';
import { router } from 'expo-router';

interface CenterAddMenuProps {
  visible: boolean;
  onClose: () => void;
  onWaterPress: () => void;
  onWeightPress: () => void;
}

const { width } = Dimensions.get('window');

export const CenterAddMenu: React.FC<CenterAddMenuProps> = ({
  visible,
  onClose,
  onWaterPress,
  onWeightPress,
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const actions = [
    {
      icon: Utensils,
      label: 'Food',
      color: '#059669',
      onPress: () => router.push('/(tabs)/food'),
    },
    {
      icon: Droplets,
      label: 'Water',
      color: '#06b6d4',
      onPress: onWaterPress,
    },
    {
      icon: Scale,
      label: 'Weight',
      color: '#8b5cf6',
      onPress: onWeightPress,
    },
    {
      icon: Dumbbell,
      label: 'Workout',
      color: '#f59e0b',
      onPress: () => router.push('/(tabs)/workout'),
    },
  ];

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <View style={styles.menuContainer}>
        {actions.map((action, index) => {
          const itemAnimation = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(60 + index * 60)],
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View
              key={action.label}
              style={[
                styles.actionContainer,
                {
                  opacity: itemAnimation,
                  transform: [
                    { translateY },
                    { scale },
                  ],
                },
              ]}
            >
              <View style={styles.actionRow}>
                <View style={styles.labelContainer}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={() => handleAction(action.onPress)}
                  activeOpacity={0.8}
                >
                  <action.icon color="#ffffff" size={20} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 85, // Position above tab bar
    left: width / 2 - 28, // Center horizontally
    alignItems: 'center',
  },
  actionContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});