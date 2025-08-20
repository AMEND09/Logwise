import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, Platform, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, Clock, Info } from 'lucide-react-native';
import { useData } from '../contexts/DataContext';
import type { UserProfile } from '../types';

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { data, saveProfile, setupNotifications } = useData();
  const [localProfile, setLocalProfile] = useState(data?.profile || null);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMealForTime, setSelectedMealForTime] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [tempTimeString, setTempTimeString] = useState('');

  
  useEffect(() => {
    if (data?.profile) {
      setLocalProfile(data.profile);
    }
  }, [data?.profile]);

  if (!localProfile) return null;

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      setLoading(true);
      const success = await setupNotifications();
      setLoading(false);
      if (!success && Platform.OS !== 'web') {
        const showAlert = require('../utils/showAlert').default || require('../utils/showAlert').showAlert;
        showAlert(
          'Permission Required',
          'Please enable notifications in your device settings to receive meal reminders.'
        );
        return;
      } else if (Platform.OS === 'web') {
        const showAlert = require('../utils/showAlert').default || require('../utils/showAlert').showAlert;
        showAlert(
          'Notifications Enabled',
          'Notifications are enabled in your settings. Note: Web browsers have limited notification support. For best experience, use the mobile app.',
          [{ text: 'OK' }]
        );
      }

      setLocalProfile({
        ...localProfile,
        notifications_enabled: true,
        meal_times: localProfile.meal_times || {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '18:30',
        },
      });
    } else {
      setLocalProfile({
        ...localProfile,
        notifications_enabled: false,
      });
    }
  };

  const handleTimeChange = (meal: string, time: string) => {
    if (!localProfile) return;
    
    setLocalProfile({
      ...localProfile,
      meal_times: {
        breakfast: localProfile.meal_times?.breakfast || '08:00',
        lunch: localProfile.meal_times?.lunch || '12:30',
        dinner: localProfile.meal_times?.dinner || '18:30',
        ...localProfile.meal_times,
        [meal]: time,
      },
    });
  };

  const openTimePicker = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealForTime(mealType);
    const mealTimes = localProfile?.meal_times;
    let currentTime = '08:00';
    
    if (mealTimes) {
      switch (mealType) {
        case 'breakfast':
          currentTime = mealTimes.breakfast || '08:00';
          break;
        case 'lunch':
          currentTime = mealTimes.lunch || '12:30';
          break;
        case 'dinner':
          currentTime = mealTimes.dinner || '18:30';
          break;
      }
    }
    
    setTempTimeString(currentTime);
    setShowTimePicker(true);
  };

  const confirmTimeChange = () => {
    if (selectedMealForTime && tempTimeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      handleTimeChange(selectedMealForTime, tempTimeString);
      setShowTimePicker(false);
      setSelectedMealForTime(null);
    } else {
      const showAlert = require('../utils/showAlert').default || require('../utils/showAlert').showAlert;
      showAlert('Invalid Time', 'Please enter a valid time in HH:MM format (e.g., 08:30)');
    }
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setSelectedMealForTime(null);
  };

  const handleSave = async () => {
    if (localProfile) {
      await saveProfile(localProfile);
      onClose();
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell color="#059669" size={20} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Meal Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get notified to log your meals 30 minutes after meal times
                  </Text>
                </View>
              </View>
              <Switch
                value={localProfile.notifications_enabled}
                onValueChange={handleToggleNotifications}
                disabled={loading}
                trackColor={{ false: '#d1d5db', true: '#059669' }}
                thumbColor={'#ffffff'}
              />
            </View>
          </View>

          {localProfile.notifications_enabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meal Times</Text>
              
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Clock color="#6b7280" size={16} />
                  <Text style={styles.timeLabel}>Breakfast</Text>
                </View>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openTimePicker('breakfast')}
                >
                  <Text style={styles.timeText}>
                    {formatTime(localProfile.meal_times?.breakfast || '08:00')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Clock color="#6b7280" size={16} />
                  <Text style={styles.timeLabel}>Lunch</Text>
                </View>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openTimePicker('lunch')}
                >
                  <Text style={styles.timeText}>
                    {formatTime(localProfile.meal_times?.lunch || '12:30')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Clock color="#6b7280" size={16} />
                  <Text style={styles.timeLabel}>Dinner</Text>
                </View>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openTimePicker('dinner')}
                >
                  <Text style={styles.timeText}>
                    {formatTime(localProfile.meal_times?.dinner || '18:30')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.note}>
                Note: Reminders will be sent 30 minutes after each meal time if you haven't logged that meal yet.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {showTimePicker && selectedMealForTime && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerModal}>
            <Text style={styles.timePickerTitle}>
              Select {selectedMealForTime} time
            </Text>
            <TextInput
              style={styles.timeInput}
              value={tempTimeString}
              onChangeText={setTempTimeString}
              placeholder="HH:MM"
              maxLength={5}
              keyboardType="numeric"
            />
            <View style={styles.timePickerButtons}>
              <TouchableOpacity 
                style={[styles.timePickerButton, styles.cancelButton]} 
                onPress={closeTimePicker}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timePickerButton, styles.confirmButton]} 
                onPress={confirmTimeChange}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  note: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 16,
    lineHeight: 16,
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePickerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    textAlign: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
