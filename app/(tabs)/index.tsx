import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Bell, Search, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserProfile, getMeals } from '@/services/firebase';
import { getDailyTip, NutritionTip } from '@/services/openai';
import { Link } from 'expo-router';
import NutritionCard from '@/components/NutritionCard';
import MealItem from '@/components/MealItem';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [dailyTip, setDailyTip] = useState<NutritionTip | null>(null);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (user) {
      setUserName(user.displayName?.split(' ')[0] || 'Friend');
      
      const loadUserData = async () => {
        try {
          setIsLoading(true);
          // Load user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Load recent meals
          const meals = await getMeals(user.uid, 1); // Get today's meals
          setRecentMeals(meals);
          
          // Calculate today's stats
          calculateTodayStats(meals);
          
          // Get daily tip based on user preferences
          if (profile) {
            const tip = await getDailyTip(profile.preferences);
            setDailyTip(tip);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadUserData();
    }
  }, [user]);

  const calculateTodayStats = (meals: any[]) => {
    const stats = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    meals.forEach(meal => {
      stats.calories += meal.calories || 0;
      stats.protein += meal.protein_g || 0;
      stats.carbs += meal.carbs_g || 0;
      stats.fat += meal.fat_g || 0;
    });
    
    setTodayStats(stats);
  };

  const getCalorieProgress = () => {
    const target = userProfile?.preferences?.calorieTarget || 2000;
    return Math.min((todayStats.calories / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Good {getTimeOfDay()}
            </Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {userName}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: theme.surface }]}
          >
            <Bell size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <Link href="/(tabs)/scan" asChild>
          <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.divider }]}
          >
            <Search size={20} color={theme.textSecondary} />
            <Text style={[styles.searchText, { color: theme.textSecondary }]}>
              Scan food or search...
            </Text>
            <View style={[styles.searchCamera, { backgroundColor: theme.primaryLight }]}>
              <TouchableOpacity>
                <View style={styles.cameraIconContainer}>
                  <View style={styles.cameraIcon} />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <View style={styles.statsHeader}>
              <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>
                Today's Nutrition
              </Text>
              <Link href="/(tabs)/diary" asChild>
                <TouchableOpacity>
                  <Text style={[styles.viewAll, { color: theme.primary }]}>
                    View All
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.calorieContainer}>
              <View style={styles.calorieTextContainer}>
                <Text style={[styles.calorieConsumed, { color: theme.textPrimary }]}>
                  {Math.round(todayStats.calories)}
                </Text>
                <Text style={[styles.calorieTotal, { color: theme.textSecondary }]}>
                  /{userProfile?.preferences?.calorieTarget || 2000} kcal
                </Text>
              </View>
              
              <View style={[styles.progressBarContainer, { backgroundColor: theme.divider }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${getCalorieProgress()}%` 
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.macroContainer}>
                <MacroIndicator 
                  label="Protein" 
                  value={`${Math.round(todayStats.protein)}g`}
                  color="#FF9800" 
                  icon={<View style={[styles.macroIcon, { backgroundColor: '#FF9800' }]} />}
                  theme={theme}
                />
                <MacroIndicator 
                  label="Carbs" 
                  value={`${Math.round(todayStats.carbs)}g`}
                  color="#4CAF50" 
                  icon={<View style={[styles.macroIcon, { backgroundColor: '#4CAF50' }]} />}
                  theme={theme}
                />
                <MacroIndicator 
                  label="Fat" 
                  value={`${Math.round(todayStats.fat)}g`}
                  color="#2196F3" 
                  icon={<View style={[styles.macroIcon, { backgroundColor: '#2196F3' }]} />}
                  theme={theme}
                />
              </View>
            </View>
          </View>
        </View>
        
        {dailyTip && (
          <View style={styles.tipContainer}>
            <View style={[styles.tipCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' }}
                style={styles.tipImage}
              />
              <View style={styles.tipContent}>
                <View style={[styles.tipCategoryBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={styles.tipCategoryText}>{dailyTip.category}</Text>
                </View>
                <Text style={[styles.tipTitle, { color: theme.textPrimary }]}>
                  {dailyTip.title}
                </Text>
                <Text style={[styles.tipDescription, { color: theme.textSecondary }]} numberOfLines={3}>
                  {dailyTip.description}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.recentMealsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Recent Meals
            </Text>
            <Link href="/(tabs)/diary" asChild>
              <TouchableOpacity>
                <Text style={[styles.viewAll, { color: theme.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          {recentMeals.length > 0 ? (
            recentMeals.slice(0, 3).map((meal) => (
              <MealItem 
                key={meal.id} 
                meal={meal} 
                onDelete={() => {/* Handle delete */}} 
              />
            ))
          ) : (
            <View style={[
              styles.emptyStateContainer, 
              { backgroundColor: theme.cardBg, borderColor: theme.divider }
            ]}>
              <TrendingUp size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
                No meals logged today
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                Start tracking your nutrition by adding meals using the scan feature.
              </Text>
              <Link href="/(tabs)/scan" asChild>
                <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.emptyStateButtonText}>Scan Food</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MacroIndicator({ label, value, color, icon, theme }: any) {
  return (
    <View style={styles.macroIndicator}>
      {icon}
      <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  searchCamera: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  calorieContainer: {
    borderRadius: 12,
  },
  calorieTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  calorieConsumed: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  calorieTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroIndicator: {
    alignItems: 'center',
  },
  macroIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  tipContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: 150,
  },
  tipContent: {
    padding: 16,
  },
  tipCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tipCategoryText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  tipTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  recentMealsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  emptyStateContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});