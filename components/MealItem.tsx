import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface MealItemProps {
  meal: any;
  onDelete: () => void;
}

export default function MealItem({ meal, onDelete }: MealItemProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const formattedTime = meal.timestamp ? new Date(meal.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const expandStyle = useAnimatedStyle(() => {
    return {
      maxHeight: expanded ? withTiming(500, { duration: 300 }) : withTiming(0, { duration: 200 }),
      opacity: expanded ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 200 }),
      overflow: 'hidden',
    };
  }, [expanded]);

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.mealImageContainer}>
          {meal.photoUrl ? (
            <Image source={{ uri: meal.photoUrl }} style={styles.mealImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.placeholderText, { color: 'white' }]}>
                {meal.mealType?.charAt(0) || 'M'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.mealInfo}>
          <Text style={[styles.mealName, { color: theme.textPrimary }]}>{meal.name}</Text>
          <View style={styles.mealMetadata}>
            <Text style={[styles.mealType, { color: theme.textSecondary }]}>
              {meal.mealType} • {formattedTime}
            </Text>
            <Text style={[styles.calories, { color: theme.primary }]}>
              {Math.round(meal.calories)} Cal
            </Text>
          </View>
        </View>
        
        <View style={styles.expandIcon}>
          {expanded ? (
            <ChevronUp size={20} color={theme.textSecondary} />
          ) : (
            <ChevronDown size={20} color={theme.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.details, expandStyle]}>
        <View style={styles.macroContainer}>
          <MacroIndicator 
            label="Protein" 
            value={Math.round(meal.protein_g)} 
            total={Math.round(meal.protein_g + meal.carbs_g + meal.fat_g)} 
            color="#FF9800" 
            unit="g"
            theme={theme}
          />
          <MacroIndicator 
            label="Carbs" 
            value={Math.round(meal.carbs_g)} 
            total={Math.round(meal.protein_g + meal.carbs_g + meal.fat_g)} 
            color="#4CAF50" 
            unit="g"
            theme={theme}
          />
          <MacroIndicator 
            label="Fat" 
            value={Math.round(meal.fat_g)} 
            total={Math.round(meal.protein_g + meal.carbs_g + meal.fat_g)} 
            color="#2196F3" 
            unit="g"
            theme={theme}
          />
        </View>
        
        <View style={styles.nutritionDetails}>
          <NutritionDetail label="Fiber" value={`${meal.fiber_g?.toFixed(1) || 0}g`} theme={theme} />
          <NutritionDetail label="Sugar" value={`${meal.sugar_g?.toFixed(1) || 0}g`} theme={theme} />
          <NutritionDetail label="Sodium" value={`${meal.sodium_mg?.toFixed(0) || 0}mg`} theme={theme} />
          <NutritionDetail label="Cholesterol" value={`${meal.cholesterol_mg?.toFixed(0) || 0}mg`} theme={theme} />
        </View>
        
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: theme.error + '15' }]}
          onPress={onDelete}
        >
          <Trash2 size={16} color={theme.error} />
          <Text style={[styles.deleteText, { color: theme.error }]}>Remove this meal</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function MacroIndicator({ label, value, total, color, unit, theme }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <View style={styles.macroIndicator}>
      <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.macroBar}>
        <View 
          style={[
            styles.macroFill, 
            { 
              backgroundColor: color,
              width: `${percentage}%` 
            }
          ]} 
        />
      </View>
      <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
        {value}{unit}
      </Text>
    </View>
  );
}

function NutritionDetail({ label, value, theme }: any) {
  return (
    <View style={styles.nutritionDetail}>
      <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.nutritionValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  mealImageContainer: {
    marginRight: 12,
  },
  mealImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  mealMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  calories: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  expandIcon: {
    marginLeft: 8,
  },
  details: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  macroContainer: {
    marginBottom: 16,
  },
  macroIndicator: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  macroBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  nutritionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  nutritionDetail: {
    width: '50%',
    paddingVertical: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  nutritionValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
});