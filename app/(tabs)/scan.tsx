import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Image,
  Alert
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown, Image as ImageIcon, Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeImage } from '@/services/openai';
import { searchFoods, getNutritionFromText, NutritionInfo } from '@/services/nutritionix';
import NutritionCard from '@/components/NutritionCard';
import NutritionDetailModal from '@/components/NutritionDetailModal';
import { addMeal } from '@/services/firebase';
import { Link } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, SlideInUp, SlideOutDown } from 'react-native-reanimated';

export default function ScanScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NutritionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NutritionInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const resultsHeight = useSharedValue(0);

  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setShowResults(true);
      
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'Failed to search for foods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMealLog = async (item: NutritionInfo, mealType: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const mealData = {
        name: item.name,
        mealType,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        sugar_g: item.sugar_g,
        sodium_mg: item.sodium_mg,
        potassium_mg: item.potassium_mg,
        cholesterol_mg: item.cholesterol_mg,
        serving_qty: item.serving_qty,
        serving_unit: item.serving_unit,
        serving_weight_grams: item.serving_weight_grams,
        photoUrl: item.photo?.thumb || null,
      };
      
      await addMeal(user.uid, mealData);
      Alert.alert('Success', `Added ${item.name} to ${mealType}`);
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal to log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePicture = async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    
    try {
      setLoading(true);
      setCameraActive(false);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeFood(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeFood(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFood = async (imageUri: string) => {
    try {
      setLoading(true);
      setShowResults(true);
      
      // Get AI analysis
      const analysis = await analyzeImage(imageUri, 'Identify the food in this image. List the main ingredients and approximate nutritional information if possible.');
      setAiAnalysis(analysis);
      
      // Search for foods based on AI analysis
      // Extract the main food name from the analysis
      const foodMatch = analysis.match(/(?:This appears to be|This is|I can see|The image shows|This looks like) ([\w\s]+)/i);
      const searchTerm = foodMatch ? foodMatch[1].trim() : analysis.split('.')[0].trim();
      
      const results = await searchFoods(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setAiAnalysis(null);
    setImage(null);
    setSearchResults([]);
    setShowResults(false);
  };

  const handleCardPress = (item: NutritionInfo) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const resultsStyle = useAnimatedStyle(() => {
    return {
      height: showResults ? withTiming('70%', { duration: 300 }) : withTiming(0, { duration: 300 }),
      opacity: showResults ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
    };
  }, [showResults]);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Scan Food</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search for food..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleTextSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={resetSearch}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {cameraActive && Platform.OS !== 'web' ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={styles.camera}
            facing={CameraType.back}
            onMountError={(error) => {
              console.error('Camera error:', error);
              setCameraActive(false);
            }}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => setCameraActive(false)}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.scanOptions}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity 
                style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => setImage(null)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.optionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.optionButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      setCameraActive(true);
                    } else {
                      Alert.alert('Not Available', 'Camera is not available in web mode');
                    }
                  }}
                >
                  <Camera size={24} color="white" />
                  <Text style={styles.optionButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionButton, { backgroundColor: theme.secondary }]}
                  onPress={pickImage}
                >
                  <ImageIcon size={24} color="white" />
                  <Text style={styles.optionButtonText}>Upload Image</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.orText, { color: theme.textSecondary }]}>OR</Text>
              
              <TouchableOpacity 
                style={[styles.searchButton, { backgroundColor: theme.accent }]}
                onPress={() => searchInputRef.current?.focus()}
              >
                <Search size={20} color="white" />
                <Text style={styles.searchButtonText}>Search by food name</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      
      <Animated.View style={[styles.resultsContainer, resultsStyle]}>
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: theme.textPrimary }]}>
            Results
          </Text>
          <TouchableOpacity onPress={() => setShowResults(false)}>
            <ChevronDown size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView style={styles.resultsList}>
            {aiAnalysis && (
              <View style={[styles.aiAnalysisContainer, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
                <Text style={[styles.aiAnalysisTitle, { color: theme.textPrimary }]}>
                  AI Analysis
                </Text>
                <Text style={[styles.aiAnalysisText, { color: theme.textSecondary }]}>
                  {aiAnalysis}
                </Text>
              </View>
            )}
            
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => (
                <NutritionCard 
                  key={index} 
                  item={item} 
                  onPress={() => handleCardPress(item)} 
                />
              ))
            ) : (
              !loading && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                    {showResults ? "No results found. Try another search." : "Search for food or take a photo to see results"}
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        )}
      </Animated.View>
      
      <NutritionDetailModal 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        onAddToMealLog={handleAddToMealLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  scanOptions: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  optionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '48%',
  },
  optionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  orText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginVertical: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  searchButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    margin: 20,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  aiAnalysisContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});