import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface DateNavigationProps {
  currentDate: string;
  onPrevious: () => void;
  onNext: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  onPrevious,
  onNext,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const canGoNext = () => {
    const date = new Date(currentDate);
    const today = new Date();
    return date < today;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
        <ChevronLeft color="#6b7280" size={20} />
      </TouchableOpacity>
      
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.navButton, !canGoNext() && styles.navButtonDisabled]} 
        onPress={onNext}
        disabled={!canGoNext()}
      >
        <ChevronRight color={canGoNext() ? "#6b7280" : "#d1d5db"} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
});