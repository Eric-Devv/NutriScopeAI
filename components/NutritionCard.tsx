import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight } from 'lucide-react-native';

interface NutritionInfo {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_qty: number;
  serving_unit: string;
  photo?: {
    thumb: string;
    highres: string;
  };
}

interface NutritionCardProps {
  item: NutritionInfo;
  onPress?: () => void;
}

export default function NutritionCard({ item, onPress }: NutritionCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          {item.photo?.thumb ? (
            <Image 
              source={{ uri: item.photo.thumb }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.primaryLight }]}>
              <Text style={styles.placeholderText}>
                {item.name.substring(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.foodName, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          
          <Text style={[styles.servingInfo, { color: theme.textSecondary }]}>
            {item.serving_qty} {item.serving_unit}
          </Text>
          
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                {Math.round(item.calories)}
              </Text>
              <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
                Cal
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                {item.protein_g.toFixed(1)}g
              </Text>
              <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
                Protein
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                {item.carbs_g.toFixed(1)}g
              </Text>
              <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
                Carbs
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                {item.fat_g.toFixed(1)}g
              </Text>
              <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
                Fat
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <ArrowRight size={20} color={theme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  infoContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  servingInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});