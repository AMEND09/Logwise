import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Utensils, 
  Droplets, 
  Scale, 
  Dumbbell, 
  Camera, 
  TrendingUp,
  Calendar,
  ChevronRight 
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { router } from 'expo-router';
import { ProgressPhotosModal } from '@/components/ProgressPhotosModal';

const { width } = Dimensions.get('window');

type JournalSection = 'food' | 'weight' | 'workout' | 'photos';

interface JournalCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  stats?: string;
  onPress: () => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  stats, 
  onPress 
}) => (
  <TouchableOpacity style={[styles.journalCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <ChevronRight color="#9ca3af" size={20} />
      </View>
      
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{stats}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function JournalScreen() {
  const { data, getCurrentLog } = useData();
  const [selectedSection, setSelectedSection] = useState<JournalSection | null>(null);
  const [showPhotosModal, setShowPhotosModal] = useState(false);

  const log = getCurrentLog();
  const profile = data?.profile;

  // Calculate stats for each section
  const getFoodStats = () => {
    const totalEntries = Object.values(log.meals || {}).flat().length;
    const totalCalories = Object.values(log.meals || {}).flat()
      .reduce((sum, entry) => sum + entry.calories, 0);
    
    return `${totalEntries} meals • ${Math.round(totalCalories)} cal today`;
  };

  const getWeightStats = () => {
    const weightLogs = data?.weight_logs || {};
    const entries = Object.keys(weightLogs).length;
    const currentWeight = profile?.weight_kg || 0;
    const goalWeight = profile?.goal_weight_kg || 0;
    const difference = currentWeight - goalWeight;
    
    return `${entries} entries • ${difference > 0 ? '+' : ''}${difference.toFixed(1)}kg to goal`;
  };

  const getWorkoutStats = () => {
    const workouts = log.workout_entries || [];
    const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories_burned, 0);
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration_min, 0);
    
    if (workouts.length === 0) {
      return 'No workouts logged today';
    }
    
    return `${workouts.length} workouts • ${totalDuration}min • ${Math.round(totalCalories)} cal`;
  };

  const handleFoodJournal = () => {
    router.push('/food');
  };

  const handleWeightProgress = () => {
    router.push('/profile');
  };

  const handleWorkoutJournal = () => {
    router.push('/workout');
  };

  const handleProgressPhotos = () => {
    setShowPhotosModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Journals</Text>
          <Text style={styles.subtitle}>Track your progress across all areas</Text>
        </View>

        <View style={styles.content}>
          {/* Main Journal Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <JournalCard
                  title="Food Journal"
                  subtitle="Meals & mindful eating"
                  icon={<Utensils color="#059669" size={24} />}
                  color="#059669"
                  stats={getFoodStats()}
                  onPress={handleFoodJournal}
                />
              </View>
              
              <View style={styles.gridItem}>
                <JournalCard
                  title="Weight Progress"
                  subtitle="Track weight changes"
                  icon={<Scale color="#8b5cf6" size={24} />}
                  color="#8b5cf6"
                  stats={getWeightStats()}
                  onPress={handleWeightProgress}
                />
              </View>
            </View>
            
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <JournalCard
                  title="Workout Journal"
                  subtitle="Exercise & activities"
                  icon={<Dumbbell color="#f59e0b" size={24} />}
                  color="#f59e0b"
                  stats={getWorkoutStats()}
                  onPress={handleWorkoutJournal}
                />
              </View>
              
              <View style={styles.gridItem}>
                <JournalCard
                  title="Progress Photos"
                  subtitle="Visual transformation"
                  icon={<Camera color="#ec4899" size={24} />}
                  color="#ec4899"
                  stats="Compare your progress"
                  onPress={handleProgressPhotos}
                />
              </View>
            </View>
          </View>

          {/* Quick Stats Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <TrendingUp color="#2563eb" size={20} />
              <Text style={styles.summaryTitle}>Today's Summary</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Object.values(log.meals || {}).flat().length}</Text>
                <Text style={styles.summaryLabel}>Meals Logged</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{log.workout_entries?.length || 0}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Object.values(log.daily_habits || {}).filter(Boolean).length}
                </Text>
                <Text style={styles.summaryLabel}>Habits Done</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {data?.weight_logs ? Object.keys(data.weight_logs).length : 0}
                </Text>
                <Text style={styles.summaryLabel}>Weight Logs</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <ProgressPhotosModal
        visible={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  gridContainer: {
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
  },
  journalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  statsContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
