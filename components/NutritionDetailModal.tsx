import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface NutritionDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: any;
  onAddToMealLog?: (item: any, mealType: string) => void;
}

export default function NutritionDetailModal({ 
  isVisible, 
  onClose, 
  item,
  onAddToMealLog,
}: NutritionDetailModalProps) {
  const { theme } = useTheme();

  if (!item) return null;

  // Get all the nutrients from full_nutrients
  const getNutrientValue = (attr_id: number) => {
    if (!item.full_nutrients) return 0;
    const nutrient = item.full_nutrients.find((n: any) => n.attr_id === attr_id);
    return nutrient ? nutrient.value : 0;
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <TouchableOpacity style={styles.closeOverlay} onPress={onClose} />
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background, borderColor: theme.divider }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Nutrition Facts</Text>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.surface }]} 
              onPress={onClose}
            >
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.foodHeader}>
              {item.photo?.thumb ? (
                <Image 
                  source={{ uri: item.photo.highres || item.photo.thumb }} 
                  style={styles.foodImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.placeholderImage, { backgroundColor: theme.primaryLight }]}>
                  <Text style={styles.placeholderText}>
                    {item.name.substring(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.foodInfo}>
                <Text style={[styles.foodName, { color: theme.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.servingInfo, { color: theme.textSecondary }]}>
                  {item.serving_qty} {item.serving_unit} ({item.serving_weight_grams}g)
                </Text>
                <Text style={[styles.caloriesText, { color: theme.primary }]}>
                  {Math.round(item.calories)} Calories
                </Text>
              </View>
            </View>
            
            <View style={[styles.macroCirclesContainer, { borderColor: theme.divider }]}>
              <MacroCircle 
                label="Protein"
                value={Math.round(item.protein_g)} 
                unit="g"
                color="#FF9800"
                percentage={Math.round((item.protein_g * 4 / item.calories) * 100) || 0}
                theme={theme}
              />
              <MacroCircle 
                label="Carbs"
                value={Math.round(item.carbs_g)} 
                unit="g"
                color="#4CAF50"
                percentage={Math.round((item.carbs_g * 4 / item.calories) * 100) || 0}
                theme={theme}
              />
              <MacroCircle 
                label="Fat"
                value={Math.round(item.fat_g)} 
                unit="g"
                color="#2196F3"
                percentage={Math.round((item.fat_g * 9 / item.calories) * 100) || 0}
                theme={theme}
              />
            </View>
            
            <View style={[styles.nutritionContainer, { borderColor: theme.divider }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Nutrition Information
              </Text>
              
              <NutritionRow 
                label="Calories" 
                value={`${Math.round(item.calories)} kcal`} 
                theme={theme}
                isBold 
              />
              
              <NutritionRow 
                label="Total Fat" 
                value={`${item.fat_g?.toFixed(1) || 0}g`} 
                theme={theme}
                isBold 
              />
              <NutritionRow 
                label="Saturated Fat" 
                value={`${getNutrientValue(606)?.toFixed(1) || 0}g`} 
                theme={theme}
                isIndented 
              />
              <NutritionRow 
                label="Trans Fat" 
                value={`${getNutrientValue(605)?.toFixed(1) || 0}g`} 
                theme={theme}
                isIndented 
              />
              
              <NutritionRow 
                label="Cholesterol" 
                value={`${item.cholesterol_mg?.toFixed(0) || 0}mg`} 
                theme={theme}
                isBold 
              />
              
              <NutritionRow 
                label="Sodium" 
                value={`${item.sodium_mg?.toFixed(0) || 0}mg`} 
                theme={theme}
                isBold 
              />
              
              <NutritionRow 
                label="Total Carbohydrates" 
                value={`${item.carbs_g?.toFixed(1) || 0}g`} 
                theme={theme}
                isBold 
              />
              <NutritionRow 
                label="Dietary Fiber" 
                value={`${item.fiber_g?.toFixed(1) || 0}g`} 
                theme={theme}
                isIndented 
              />
              <NutritionRow 
                label="Sugars" 
                value={`${item.sugar_g?.toFixed(1) || 0}g`} 
                theme={theme}
                isIndented 
              />
              
              <NutritionRow 
                label="Protein" 
                value={`${item.protein_g?.toFixed(1) || 0}g`} 
                theme={theme}
                isBold 
              />
              
              <NutritionRow 
                label="Vitamin D" 
                value={`${getNutrientValue(324)?.toFixed(1) || 0}µg`} 
                theme={theme}
              />
              
              <NutritionRow 
                label="Calcium" 
                value={`${getNutrientValue(301)?.toFixed(0) || 0}mg`} 
                theme={theme}
              />
              
              <NutritionRow 
                label="Iron" 
                value={`${getNutrientValue(303)?.toFixed(1) || 0}mg`} 
                theme={theme}
              />
              
              <NutritionRow 
                label="Potassium" 
                value={`${item.potassium_mg?.toFixed(0) || 0}mg`} 
                theme={theme}
              />
            </View>
            
            {onAddToMealLog && (
              <View style={styles.addToMealContainer}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Add to Meal Log
                </Text>
                
                <View style={styles.mealTypeButtons}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => (
                    <TouchableOpacity
                      key={mealType}
                      style={[
                        styles.mealTypeButton,
                        { backgroundColor: theme.primary }
                      ]}
                      onPress={() => {
                        onAddToMealLog(item, mealType);
                        onClose();
                      }}
                    >
                      <Text style={styles.mealTypeText}>{mealType}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function MacroCircle({ label, value, unit, color, percentage, theme }: any) {
  return (
    <View style={styles.macroCircle}>
      <View style={styles.circleContainer}>
        <View style={[styles.circle, { borderColor: color }]}>
          <Text style={[styles.circleValue, { color: theme.textPrimary }]}>
            {value}
          </Text>
          <Text style={[styles.circleUnit, { color: theme.textSecondary }]}>
            {unit}
          </Text>
        </View>
      </View>
      <Text style={[styles.macroLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.macroPercentage, { color: theme.textSecondary }]}>
        {percentage}%
      </Text>
    </View>
  );
}

function NutritionRow({ label, value, isIndented = false, isBold = false, theme }: any) {
  return (
    <View style={[
      styles.nutritionRow,
      isIndented && { paddingLeft: 16 }
    ]}>
      <Text style={[
        styles.nutritionLabel, 
        { color: theme.textPrimary },
        isBold && { fontFamily: 'Inter-SemiBold' }
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.nutritionValue, 
        { color: theme.textPrimary },
        isBold && { fontFamily: 'Inter-SemiBold' }
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeOverlay: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  foodHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  servingInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  macroCirclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  macroCircle: {
    alignItems: 'center',
    flex: 1,
  },
  circleContainer: {
    marginBottom: 8,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  circleUnit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  macroLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  macroPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  nutritionContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  nutritionValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  addToMealContainer: {
    marginBottom: 16,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  mealTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 4,
  },
  mealTypeText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});