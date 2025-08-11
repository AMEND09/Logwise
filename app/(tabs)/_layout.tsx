import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Home, Utensils, Dumbbell, BarChart3, User, Plus, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { CenterAddMenu } from '@/components/CenterAddMenu';
import { WaterDetailModal } from '@/components/WaterDetailModal';
import { WeightDetailModal } from '@/components/WeightDetailModal';
import { ProgressPhotosModal } from '@/components/ProgressPhotosModal';
import { AuthGate } from '@/components/AuthGate';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [buttonRotation] = useState(new Animated.Value(0));
  const { logWater, logWeight, data } = useData();

  const handleAddPress = () => {
    setShowAddMenu(!showAddMenu);
    
    Animated.spring(buttonRotation, {
      toValue: showAddMenu ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleWaterPress = () => {
    setShowWaterModal(true);
  };

  const handleWeightPress = () => {
    setShowWeightModal(true);
  };

  const handlePhotosPress = () => {
    setShowPhotosModal(true);
  };

  const handleAddWater = async (amount: number) => {
    await logWater(amount);
    setShowWaterModal(false);
  };

  const handleAddWeight = async (weight: number) => {
    await logWeight(weight);
    setShowWeightModal(false);
  };

  const rotateInterpolate = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: 85 + insets.bottom,
            paddingBottom: insets.bottom + 5,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: '#6b7280',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 2,
            textAlign: 'center',
          },
          tabBarIconStyle: {
            marginBottom: -2,
            marginTop: 4,
          },
          tabBarItemStyle: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: 70,
            paddingVertical: 6,
          },
          tabBarLabelPosition: 'below-icon',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ size, color }) => (
              <BookOpen size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarButton: (props) => (
              <View style={styles.centerButtonContainer}>
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={handleAddPress}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{
                      transform: [{ rotate: rotateInterpolate }],
                    }}
                  >
                    <Plus color="#ffffff" size={28} />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={24} color={color} />
            ),
          }}
        />
        
        
        <Tabs.Screen
          name="food"
          options={{
            href: null, 
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            href: null, 
          }}
        />
      </Tabs>
      
      <CenterAddMenu
        visible={showAddMenu}
        onClose={() => {
          setShowAddMenu(false);
          Animated.spring(buttonRotation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }}
        onWaterPress={() => {
          setShowAddMenu(false);
          setShowWaterModal(true);
        }}
        onWeightPress={() => {
          setShowAddMenu(false);
          setShowWeightModal(true);
        }}
        onPhotosPress={() => {
          setShowAddMenu(false);
          setShowPhotosModal(true);
        }}
      />
      
      <WaterDetailModal
        visible={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        onAdd={handleAddWater}
      />

      <WeightDetailModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onAdd={handleAddWeight}
        currentWeight={data?.profile.weight_kg}
        goalWeight={data?.profile.goal_weight_kg}
        startWeight={data?.profile.start_weight_kg}
      />

      <ProgressPhotosModal
        visible={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
      />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginTop: -25, 
  },
});