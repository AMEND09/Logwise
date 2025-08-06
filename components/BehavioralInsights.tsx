import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Award, ChevronRight } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { BehavioralInsight, HabitCoachingTip } from '@/types';
import { analyzeBehavioralPatterns, getPersonalizedTip } from '@/utils/behavioralCoaching';

export const BehavioralInsights: React.FC = () => {
  const { data } = useData();
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [personalizedTip, setPersonalizedTip] = useState<HabitCoachingTip | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  useEffect(() => {
    if (data?.daily_logs) {
      const behavioralInsights = analyzeBehavioralPatterns(data.daily_logs);
      setInsights(behavioralInsights);
      
      const tip = getPersonalizedTip(behavioralInsights);
      setPersonalizedTip(tip);
    }
  }, [data]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award color="#059669" size={20} />;
      case 'pattern':
        return <TrendingUp color="#2563eb" size={20} />;
      case 'warning':
        return <AlertTriangle color="#dc2626" size={20} />;
      case 'suggestion':
        return <Lightbulb color="#f59e0b" size={20} />;
      default:
        return <Brain color="#6b7280" size={20} />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'achievement':
        return { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' };
      case 'pattern':
        return { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
      case 'warning':
        return { backgroundColor: '#fef2f2', borderColor: '#fecaca' };
      case 'suggestion':
        return { backgroundColor: '#fffbeb', borderColor: '#fed7aa' };
      default:
        return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' };
    }
  };

  if (insights.length === 0 && !personalizedTip) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain color="#2563eb" size={24} />
          <Text style={styles.title}>Behavioral Insights</Text>
        </View>
        <Text style={styles.emptyText}>
          Keep logging your meals with mindful check-ins to see personalized insights about your eating patterns.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain color="#2563eb" size={24} />
        <Text style={styles.title}>Your Insights</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personalized Tip */}
        {personalizedTip && (
          <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Lightbulb color="#f59e0b" size={20} />
              <Text style={styles.tipTitle}>Today's Focus</Text>
            </View>
            <Text style={styles.tipText}>{personalizedTip.title}</Text>
            <Text style={styles.tipDescription}>{personalizedTip.description}</Text>
            <View style={styles.tipMeta}>
              <Text style={styles.tipCategory}>
                {personalizedTip.category.replace('_', ' ')} • {personalizedTip.difficulty}
              </Text>
            </View>
          </View>
        )}

        {/* Behavioral Insights */}
        {insights.map((insight, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.insightItem,
              getInsightStyle(insight.type),
              expandedInsight === index && styles.insightItemExpanded
            ]}
            onPress={() => setExpandedInsight(expandedInsight === index ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleRow}>
                {getInsightIcon(insight.type)}
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <ChevronRight 
                color="#9ca3af" 
                size={16} 
                style={[
                  styles.chevron,
                  expandedInsight === index && styles.chevronExpanded
                ]}
              />
            </View>
            
            <Text style={styles.insightMessage}>{insight.message}</Text>
            
            {expandedInsight === index && insight.actionable_tip && (
              <View style={styles.actionableTip}>
                <Text style={styles.actionableTipLabel}>Try this:</Text>
                <Text style={styles.actionableTipText}>{insight.actionable_tip}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Encouragement section if no major insights */}
        {insights.length < 2 && (
          <View style={styles.encouragementContainer}>
            <TrendingUp color="#059669" size={32} />
            <Text style={styles.encouragementTitle}>You're on the right track!</Text>
            <Text style={styles.encouragementText}>
              Keep using the mindful check-ins when you eat. The more data you provide, 
              the better insights we can give you about your eating patterns.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  content: {
    maxHeight: 400,
  },
  tipContainer: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tipCategory: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  insightItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  insightItemExpanded: {
    paddingBottom: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  insightMessage: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  actionableTip: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  actionableTipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actionableTipText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  encouragementContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginTop: 12,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 12,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
});
