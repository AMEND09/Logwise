import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Heart, Brain, Clock } from 'lucide-react-native';
import { MINDFUL_EATING_PROMPTS } from '@/utils/behavioralCoaching';

interface MindfulEatingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (responses: {
    hunger_level: 1 | 2 | 3 | 4 | 5;
    mood_before: 'stressed' | 'happy' | 'sad' | 'bored' | 'anxious' | 'neutral';
    eating_trigger: 'hunger' | 'emotion' | 'social' | 'habit' | 'craving';
  }) => void;
  mealType: string;
}

export const MindfulEatingModal: React.FC<MindfulEatingModalProps> = ({
  visible,
  onClose,
  onComplete,
  mealType
}) => {
  const [step, setStep] = useState(1);
  const [hungerLevel, setHungerLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mood, setMood] = useState<'stressed' | 'happy' | 'sad' | 'bored' | 'anxious' | 'neutral'>('neutral');
  const [trigger, setTrigger] = useState<'hunger' | 'emotion' | 'social' | 'habit' | 'craving'>('hunger');

  const resetState = () => {
    setStep(1);
    setHungerLevel(3);
    setMood('neutral');
    setTrigger('hunger');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleComplete = () => {
    onComplete({
      hunger_level: hungerLevel,
      mood_before: mood,
      eating_trigger: trigger
    });
    resetState();
  };

  const renderHungerStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Clock color="#2563eb" size={32} />
      </View>
      <Text style={styles.stepTitle}>How hungry are you right now?</Text>
      <Text style={styles.stepSubtitle}>Take a moment to tune into your body</Text>
      
      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.scaleButton,
              hungerLevel === level && styles.scaleButtonSelected
            ]}
            onPress={() => setHungerLevel(level as 1 | 2 | 3 | 4 | 5)}
          >
            <Text style={[
              styles.scaleNumber,
              hungerLevel === level && styles.scaleNumberSelected
            ]}>
              {level}
            </Text>
            <Text style={[
              styles.scaleLabel,
              hungerLevel === level && styles.scaleLabelSelected
            ]}>
              {level === 1 && 'Not hungry'}
              {level === 2 && 'Slightly hungry'}
              {level === 3 && 'Moderately hungry'}
              {level === 4 && 'Very hungry'}
              {level === 5 && 'Extremely hungry'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMoodStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Heart color="#dc2626" size={32} />
      </View>
      <Text style={styles.stepTitle}>How are you feeling right now?</Text>
      <Text style={styles.stepSubtitle}>Your emotions can influence eating decisions</Text>
      
      <View style={styles.moodGrid}>
        {[
          { key: 'neutral', label: 'Neutral', emoji: '😐' },
          { key: 'happy', label: 'Happy', emoji: '😊' },
          { key: 'stressed', label: 'Stressed', emoji: '😰' },
          { key: 'sad', label: 'Sad', emoji: '😢' },
          { key: 'bored', label: 'Bored', emoji: '😴' },
          { key: 'anxious', label: 'Anxious', emoji: '😟' }
        ].map((moodOption) => (
          <TouchableOpacity
            key={moodOption.key}
            style={[
              styles.moodButton,
              mood === moodOption.key && styles.moodButtonSelected
            ]}
            onPress={() => setMood(moodOption.key as any)}
          >
            <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              mood === moodOption.key && styles.moodLabelSelected
            ]}>
              {moodOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep(3)}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTriggerStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Brain color="#7c3aed" size={32} />
      </View>
      <Text style={styles.stepTitle}>What's prompting you to eat?</Text>
      <Text style={styles.stepSubtitle}>Understanding your triggers helps build awareness</Text>
      
      <View style={styles.triggerContainer}>
        {[
          { key: 'hunger', label: 'Physical Hunger', desc: 'My body needs fuel' },
          { key: 'emotion', label: 'Emotions', desc: 'Feeling stressed, bored, etc.' },
          { key: 'social', label: 'Social Setting', desc: 'Eating with others' },
          { key: 'habit', label: 'Routine/Habit', desc: 'It\'s my usual eating time' },
          { key: 'craving', label: 'Craving', desc: 'Want something specific' }
        ].map((triggerOption) => (
          <TouchableOpacity
            key={triggerOption.key}
            style={[
              styles.triggerButton,
              trigger === triggerOption.key && styles.triggerButtonSelected
            ]}
            onPress={() => setTrigger(triggerOption.key as any)}
          >
            <Text style={[
              styles.triggerLabel,
              trigger === triggerOption.key && styles.triggerLabelSelected
            ]}>
              {triggerOption.label}
            </Text>
            <Text style={[
              styles.triggerDesc,
              trigger === triggerOption.key && styles.triggerDescSelected
            ]}>
              {triggerOption.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleComplete}
      >
        <Text style={styles.completeButtonText}>Continue to Food Log</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mindful Check-in</Text>
          <Text style={styles.headerSubtitle}>{mealType} • Step {step} of 3</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X color="#666" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderHungerStep()}
          {step === 2 && renderMoodStep()}
          {step === 3 && renderTriggerStep()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  scaleContainer: {
    width: '100%',
    marginBottom: 32,
  },
  scaleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  scaleButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  scaleNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b5563',
    width: 32,
  },
  scaleNumberSelected: {
    color: '#2563eb',
  },
  scaleLabel: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  scaleLabelSelected: {
    color: '#2563eb',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moodButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  moodButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: '#dc2626',
  },
  triggerContainer: {
    width: '100%',
    marginBottom: 32,
  },
  triggerButton: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  triggerButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  triggerLabelSelected: {
    color: '#7c3aed',
  },
  triggerDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  triggerDescSelected: {
    color: '#7c3aed',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
