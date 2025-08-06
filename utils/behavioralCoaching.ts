import { HabitCoachingTip, BehavioralInsight, MindfulEatingPrompt, TriggerAnalysis, FoodEntry, DailyLog } from '@/types';

// Habit-breaking coaching tips
export const COACHING_TIPS: HabitCoachingTip[] = [
  {
    id: 'mindful_hunger',
    title: 'Check Your Hunger Level',
    description: 'Before eating, rate your hunger from 1-5. Aim to eat when you\'re at a 3-4.',
    category: 'mindful_eating',
    difficulty: 'beginner'
  },
  {
    id: 'pause_before_eating',
    title: 'Take a 3-Minute Pause',
    description: 'Before eating, take 3 deep breaths and ask yourself: "Am I hungry or am I feeling something else?"',
    category: 'mindful_eating',
    difficulty: 'beginner'
  },
  {
    id: 'emotional_check',
    title: 'Identify Your Emotions',
    description: 'When you want to eat, first identify what emotion you\'re feeling. Are you actually hungry?',
    category: 'emotional_eating',
    difficulty: 'beginner'
  },
  {
    id: 'stress_alternatives',
    title: 'Stress-Relief Alternatives',
    description: 'Instead of eating when stressed, try: 5-minute walk, calling a friend, or deep breathing.',
    category: 'stress_management',
    difficulty: 'intermediate'
  },
  {
    id: 'portion_visualization',
    title: 'Use Visual Portion Guides',
    description: 'Palm = protein serving, fist = vegetables, cupped hand = carbs, thumb = fats.',
    category: 'portion_control',
    difficulty: 'beginner'
  },
  {
    id: 'mindful_chewing',
    title: 'Chew Slowly and Mindfully',
    description: 'Put your fork down between bites. Chew each bite 20-30 times and notice flavors.',
    category: 'mindful_eating',
    difficulty: 'intermediate'
  },
  {
    id: 'trigger_identification',
    title: 'Map Your Eating Triggers',
    description: 'Notice patterns: What time? What mood? What situation? Knowledge is power.',
    category: 'emotional_eating',
    difficulty: 'intermediate'
  },
  {
    id: 'meal_timing',
    title: 'Regular Meal Schedule',
    description: 'Eat at consistent times to prevent extreme hunger that leads to overeating.',
    category: 'meal_timing',
    difficulty: 'beginner'
  }
];

// Mindful eating prompts
export const MINDFUL_EATING_PROMPTS: MindfulEatingPrompt = {
  pre_meal: [
    "How hungry am I right now on a scale of 1-5?",
    "What emotion am I feeling right now?",
    "Am I eating because I'm hungry or for another reason?",
    "What would satisfy me right now?",
    "How do I want to feel after this meal?"
  ],
  during_meal: [
    "How does this food taste?",
    "What textures and flavors do I notice?",
    "Am I eating quickly or slowly?",
    "How satisfied am I feeling?",
    "Am I still hungry?"
  ],
  post_meal: [
    "How satisfied do I feel (1-5)?",
    "How was my mindfulness during this meal?",
    "What did I enjoy most about this food?",
    "How do I feel emotionally now?",
    "What would I do differently next time?"
  ]
};

// Analyze eating patterns and provide insights
export function analyzeBehavioralPatterns(logs: { [date: string]: DailyLog }, days: number = 7): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  const recentLogs = Object.entries(logs).slice(-days);
  
  // Analyze emotional eating patterns
  const emotionalEatingEntries = recentLogs.flatMap(([date, log]) => 
    Object.values(log.meals).flat().filter(entry => 
      entry.eating_trigger === 'emotion' || 
      (entry.mood_before && entry.mood_before !== 'neutral')
    )
  );

  if (emotionalEatingEntries.length > 3) {
    insights.push({
      type: 'pattern',
      title: 'Emotional Eating Pattern Detected',
      message: `You've logged ${emotionalEatingEntries.length} emotional eating episodes this week.`,
      actionable_tip: 'Try the 3-minute pause technique before eating to check if you\'re truly hungry.'
    });
  }

  // Analyze mindfulness ratings
  const mindfulnessRatings = recentLogs.flatMap(([date, log]) => 
    Object.values(log.meals).flat()
      .filter(entry => entry.mindful_rating)
      .map(entry => entry.mindful_rating!)
  );

  if (mindfulnessRatings.length > 0) {
    const avgMindfulness = mindfulnessRatings.reduce((a, b) => a + b, 0) / mindfulnessRatings.length;
    
    if (avgMindfulness < 3) {
      insights.push({
        type: 'suggestion',
        title: 'Focus on Mindful Eating',
        message: `Your average mindfulness rating is ${avgMindfulness.toFixed(1)}/5.`,
        actionable_tip: 'Try eating one meal per day without distractions - no phone, TV, or reading.'
      });
    } else if (avgMindfulness >= 4) {
      insights.push({
        type: 'achievement',
        title: 'Great Mindful Eating!',
        message: `You're averaging ${avgMindfulness.toFixed(1)}/5 for mindful eating. Keep it up!`,
        actionable_tip: 'You\'re doing great! Try teaching someone else about mindful eating.'
      });
    }
  }

  // Analyze habit streaks
  const latestLog = recentLogs[recentLogs.length - 1]?.[1];
  if (latestLog?.habit_streak) {
    const streaks = Object.entries(latestLog.habit_streak);
    const longStreaks = streaks.filter(([habit, streak]) => streak >= 7);
    
    longStreaks.forEach(([habit, streak]) => {
      insights.push({
        type: 'achievement',
        title: 'Habit Streak!',
        message: `${streak} days strong with "${habit}"!`,
        actionable_tip: 'Celebrate this success and keep the momentum going!'
      });
    });
  }

  // Check for late night eating
  const lateNightSnacks = recentLogs.flatMap(([date, log]) => 
    log.meals['Snacks']?.filter(entry => {
      // Assuming late entries are logged later in the day
      return true; // Would need timestamp data to be more accurate
    }) || []
  );

  if (lateNightSnacks.length > days / 2) {
    insights.push({
      type: 'pattern',
      title: 'Late Night Eating Pattern',
      message: 'You seem to snack frequently in the evenings.',
      actionable_tip: 'Try having a larger, more satisfying dinner or plan a healthy evening snack.'
    });
  }

  return insights;
}

// Analyze specific eating triggers
export function analyzeTriggers(logs: { [date: string]: DailyLog }): TriggerAnalysis[] {
  const triggerData: { [trigger: string]: { count: number; foods: string[] } } = {};
  
  Object.values(logs).forEach(log => {
    Object.values(log.meals).flat().forEach(entry => {
      if (entry.eating_trigger) {
        if (!triggerData[entry.eating_trigger]) {
          triggerData[entry.eating_trigger] = { count: 0, foods: [] };
        }
        triggerData[entry.eating_trigger].count++;
        triggerData[entry.eating_trigger].foods.push(entry.name);
      }
    });
  });

  return Object.entries(triggerData).map(([trigger, data]) => ({
    trigger,
    frequency: data.count,
    associated_foods: [...new Set(data.foods)],
    suggested_alternatives: getSuggestedAlternatives(trigger)
  }));
}

function getSuggestedAlternatives(trigger: string): string[] {
  const alternatives: { [key: string]: string[] } = {
    emotion: [
      'Take 5 deep breaths',
      'Call a friend or family member',
      'Go for a short walk',
      'Journal about your feelings',
      'Listen to calming music'
    ],
    stress: [
      'Practice progressive muscle relaxation',
      'Try a 5-minute meditation',
      'Do some light stretching',
      'Take a hot shower or bath',
      'Organize something small'
    ],
    bored: [
      'Read a few pages of a book',
      'Do a quick creative activity',
      'Call someone you haven\'t talked to',
      'Take a walk outside',
      'Clean or organize a small area'
    ],
    social: [
      'Suggest a non-food activity',
      'Eat mindfully and focus on conversation',
      'Choose smaller portions',
      'Drink water between bites',
      'Focus on enjoying the company'
    ],
    habit: [
      'Replace the routine with a new habit',
      'Change your environment',
      'Set a timer before eating',
      'Drink a glass of water first',
      'Ask yourself if you\'re truly hungry'
    ]
  };

  return alternatives[trigger] || ['Take a moment to pause and reflect'];
}

// Get a random coaching tip based on user's recent patterns
export function getPersonalizedTip(recentInsights: BehavioralInsight[]): HabitCoachingTip | null {
  // Determine which category to focus on based on insights
  let focusCategory: string = 'mindful_eating'; // default
  
  if (recentInsights.some(insight => insight.message.includes('emotional'))) {
    focusCategory = 'emotional_eating';
  } else if (recentInsights.some(insight => insight.message.includes('mindful'))) {
    focusCategory = 'mindful_eating';
  } else if (recentInsights.some(insight => insight.message.includes('stress'))) {
    focusCategory = 'stress_management';
  }

  const relevantTips = COACHING_TIPS.filter(tip => tip.category === focusCategory);
  if (relevantTips.length === 0) return null;
  
  return relevantTips[Math.floor(Math.random() * relevantTips.length)];
}
