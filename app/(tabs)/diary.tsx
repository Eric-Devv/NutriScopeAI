import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMeals, deleteMeal, getUserProfile } from '@/services/firebase';
import { analyzeMealHistory } from '@/services/openai';
import { ChevronLeft, ChevronRight, ChartPie as PieChart } from 'lucide-react-native';
import MealItem from '@/components/MealItem';

export default function DiaryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [mealsByDate, setMealsByDate] = useState<{[date: string]: any[]}>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [dietFeedback, setDietFeedback] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadMeals();
  }, [user]);

  useEffect(() => {
    if (meals.length > 0) {
      organizeMealsByDate();
    }
  }, [meals]);

  useEffect(() => {
    calculateDailyStats();
  }, [selectedDate, mealsByDate]);

  const loadMeals = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedMeals = await getMeals(user.uid, 30); // Get 30 days of meals
      setMeals(fetchedMeals);
      
      // Load user profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meal data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const organizeMealsByDate = () => {
    const organized: {[date: string]: any[]} = {};
    
    meals.forEach(meal => {
      if (meal.timestamp) {
        const date = new Date(meal.timestamp.seconds * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!organized[dateStr]) {
          organized[dateStr] = [];
        }
        
        organized[dateStr].push(meal);
      }
    });
    
    setMealsByDate(organized);
  };

  const calculateDailyStats = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayMeals = mealsByDate[dateStr] || [];
    
    const dailyStats = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };
    
    dayMeals.forEach(meal => {
      dailyStats.calories += meal.calories || 0;
      dailyStats.protein_g += meal.protein_g || 0;
      dailyStats.carbs_g += meal.carbs_g || 0;
      dailyStats.fat_g += meal.fat_g || 0;
    });
    
    setStats(dailyStats);
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      
      // Update local state
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      
      Alert.alert('Success', 'Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal. Please try again.');
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getDailyMeals = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return mealsByDate[dateStr] || [];
  };

  const getCaloriePercentage = () => {
    const target = userProfile?.preferences?.calorieTarget || 2000;
    return Math.min((stats.calories / target) * 100, 100);
  };

  const getMacroPercentage = (macro: number, total: number) => {
    return total > 0 ? (macro / total) * 100 : 0;
  };

  const generateFeedback = async () => {
    if (meals.length === 0) {
      Alert.alert('Not Enough Data', 'Please log more meals to get personalized feedback.');
      return;
    }
    
    try {
      setFeedbackLoading(true);
      const feedback = await analyzeMealHistory(meals);
      setDietFeedback(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      Alert.alert('Error', 'Failed to generate feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const dailyMeals = getDailyMeals();
  const totalMacros = stats.protein_g + stats.carbs_g + stats.fat_g;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Food Diary</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.dateSelector}>
          <TouchableOpacity 
            style={[styles.dateArrow, { backgroundColor: theme.surface }]} 
            onPress={() => changeDate(-1)}
          >
            <ChevronLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.textPrimary }]}>
              {formatDate(selectedDate)}
            </Text>
            {isToday(selectedDate) && (
              <View style={[styles.todayBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.dateArrow, { backgroundColor: theme.surface }]} 
            onPress={() => changeDate(1)}
          >
            <ChevronRight size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.nutritionSummaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
                Daily Summary
              </Text>
              
              <TouchableOpacity onPress={generateFeedback} disabled={feedbackLoading}>
                <Text style={[styles.getFeedbackText, { color: theme.primary }]}>
                  {feedbackLoading ? 'Analyzing...' : 'Get AI Feedback'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calorieContainer}>
              <View style={styles.calorieTextRow}>
                <Text style={[styles.calorieValue, { color: theme.textPrimary }]}>
                  {Math.round(stats.calories)}
                </Text>
                <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>
                  /{userProfile?.preferences?.calorieTarget || 2000} kcal
                </Text>
              </View>
              
              <View style={[styles.calorieProgressBg, { backgroundColor: theme.divider }]}>
                <View 
                  style={[
                    styles.calorieProgress, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${getCaloriePercentage()}%` 
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.macrosContainer}>
              <MacroBar 
                label="Protein" 
                value={`${Math.round(stats.protein_g)}g`}
                percentage={getMacroPercentage(stats.protein_g, totalMacros)}
                color="#FF9800"
                theme={theme}
              />
              
              <MacroBar 
                label="Carbs" 
                value={`${Math.round(stats.carbs_g)}g`}
                percentage={getMacroPercentage(stats.carbs_g, totalMacros)}
                color="#4CAF50"
                theme={theme}
              />
              
              <MacroBar 
                label="Fat" 
                value={`${Math.round(stats.fat_g)}g`}
                percentage={getMacroPercentage(stats.fat_g, totalMacros)}
                color="#2196F3"
                theme={theme}
              />
            </View>
          </View>
        </View>
        
        {dietFeedback && (
          <View style={styles.feedbackContainer}>
            <View style={[styles.feedbackCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
              <View style={styles.feedbackHeader}>
                <Text style={[styles.feedbackTitle, { color: theme.textPrimary }]}>
                  AI Nutritionist Feedback
                </Text>
                <TouchableOpacity onPress={() => setDietFeedback(null)}>
                  <Text style={[styles.dismissText, { color: theme.primary }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>
                {dietFeedback}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.mealsContainer}>
          <View style={styles.mealsHeader}>
            <Text style={[styles.mealsTitle, { color: theme.textPrimary }]}>
              Meals
            </Text>
            
            <Link href="/(tabs)/scan" asChild>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.addButtonText}>Add Food</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          {dailyMeals.length > 0 ? (
            dailyMeals.map(meal => (
              <MealItem 
                key={meal.id} 
                meal={meal} 
                onDelete={() => handleDeleteMeal(meal.id)} 
              />
            ))
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
              <PieChart size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No meals logged
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                Track your nutrition by adding meals to your food diary.
              </Text>
              <Link href="/(tabs)/scan" asChild>
                <TouchableOpacity style={[styles.scanButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.scanButtonText}>Add Food</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MacroBar({ label, value, percentage, color, theme }: any) {
  return (
    <View style={styles.macroBar}>
      <View style={styles.macroLabelContainer}>
        <View style={[styles.macroIndicator, { backgroundColor: color }]} />
        <Text style={[styles.macroLabel, { color: theme.textPrimary }]}>{label}</Text>
      </View>
      
      <View style={[styles.macroProgressBg, { backgroundColor: theme.divider }]}>
        <View 
          style={[
            styles.macroProgress, 
            { backgroundColor: color, width: `${percentage}%` }
          ]} 
        />
      </View>
      
      <Text style={[styles.macroValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  todayText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  nutritionSummaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  getFeedbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  calorieContainer: {
    marginBottom: 16,
  },
  calorieTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  calorieLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  calorieProgressBg: {
    height: 8,
    borderRadius: 4,
  },
  calorieProgress: {
    height: '100%',
    borderRadius: 4,
  },
  macrosContainer: {
    marginTop: 16,
  },
  macroBar: {
    marginBottom: 12,
  },
  macroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  macroLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  macroProgressBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  macroProgress: {
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  feedbackContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});