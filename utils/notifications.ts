import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserProfile } from '@/types';

// Only configure notification behavior on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we'll simulate permission granted but won't actually schedule notifications
      console.log('Web platform: Notifications simulated');
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleMealReminders = async (profile: UserProfile): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('Web platform: Meal reminders would be scheduled for:', profile.meal_times);
      return; // Web doesn't support background notifications, but we allow the toggle
    }
    
    if (!profile.notifications_enabled || !profile.meal_times) {
      return;
    }

    // Cancel existing meal notifications
    await cancelMealReminders();

    const mealTimes = profile.meal_times;
    const reminderDelay = 30; // minutes after meal time to remind

    // Schedule notifications for each meal
    const meals = [
      { name: 'Breakfast', time: mealTimes.breakfast, type: 'Breakfast' },
      { name: 'Lunch', time: mealTimes.lunch, type: 'Lunch' },
      { name: 'Dinner', time: mealTimes.dinner, type: 'Dinner' },
      ...(mealTimes.snack ? [{ name: 'Snack', time: mealTimes.snack, type: 'Snacks' }] : []),
    ];

    for (const meal of meals) {
      const [hours, minutes] = meal.time.split(':').map(Number);
      
      // Calculate reminder time (30 minutes after meal time)
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes + reminderDelay, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (reminderDate <= new Date()) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        identifier: `meal-reminder-${meal.type.toLowerCase()}`,
        content: {
          title: `${meal.name} Reminder`,
          body: `Don't forget to log your ${meal.name.toLowerCase()}! Track your nutrition goals.`,
          data: { mealType: meal.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: reminderDate.getHours(),
          minute: reminderDate.getMinutes(),
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });
    }

    console.log('Meal reminders scheduled successfully');
  } catch (error) {
    console.error('Error scheduling meal reminders:', error);
  }
};

export const cancelMealReminders = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('Web platform: Meal reminders would be cancelled');
      return;
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const mealNotificationIds = scheduledNotifications
      .filter(notification => notification.identifier.startsWith('meal-reminder-'))
      .map(notification => notification.identifier);

    if (mealNotificationIds.length > 0) {
      // Cancel each notification individually
      for (const id of mealNotificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      console.log('Cancelled existing meal reminders');
    }
  } catch (error) {
    console.error('Error cancelling meal reminders:', error);
  }
};

export const scheduleHabitReminder = async (habitName: string, time: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') return;

    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      identifier: `habit-reminder-${habitName.toLowerCase().replace(/\s+/g, '-')}`,
      content: {
        title: 'Habit Reminder',
        body: `Time for your ${habitName} habit!`,
        data: { type: 'habit', habitName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

// Check if user has logged a specific meal today
export const checkMealLogged = (dailyLog: any, mealType: string): boolean => {
  return dailyLog?.meals?.[mealType]?.length > 0;
};

// Send immediate notification if meal not logged
export const sendMealReminderIfNeeded = async (dailyLog: any, mealType: string): Promise<void> => {
  try {
    if (Platform.OS === 'web' || checkMealLogged(dailyLog, mealType)) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${mealType} Reminder`,
        body: `You haven't logged your ${mealType.toLowerCase()} yet. Don't forget to track your nutrition!`,
        data: { mealType, immediate: true },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending immediate meal reminder:', error);
  }
};
