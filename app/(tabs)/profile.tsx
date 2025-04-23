import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Moon, ChevronRight, Settings, User, Heart, Info, Shield, Bell } from 'lucide-react-native';
import { getUserProfile, updateUserPreferences } from '@/services/firebase';

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleUpdateGoal = async (goal: string) => {
    if (!userProfile) return;
    
    try {
      const currentGoals = userProfile.preferences?.dietGoals || [];
      let updatedGoals;
      
      if (currentGoals.includes(goal)) {
        updatedGoals = currentGoals.filter((g: string) => g !== goal);
      } else {
        updatedGoals = [...currentGoals, goal];
      }
      
      const updatedPreferences = {
        ...userProfile.preferences,
        dietGoals: updatedGoals,
      };
      
      await updateUserPreferences(userProfile.id, updatedPreferences);
      
      // Update local state
      setUserProfile({
        ...userProfile,
        preferences: updatedPreferences,
      });
      
      Alert.alert('Success', 'Your goals have been updated');
    } catch (error) {
      console.error('Error updating goals:', error);
      Alert.alert('Error', 'Failed to update goals. Please try again.');
    }
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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0) || 'U'}
                </Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>
                  {user?.displayName || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.surface }]}
              onPress={() => {}}
            >
              <Text style={[styles.editButtonText, { color: theme.textPrimary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.goalsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            My Nutrition Goals
          </Text>
          
          <View style={styles.goalCards}>
            <TouchableOpacity 
              style={[
                styles.goalCard, 
                { backgroundColor: theme.cardBg, borderColor: theme.divider },
                userProfile?.preferences?.dietGoals?.includes('Weight Loss') && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => handleUpdateGoal('Weight Loss')}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/4024914/pexels-photo-4024914.jpeg' }} 
                style={styles.goalImage} 
              />
              <Text style={[styles.goalText, { color: theme.textPrimary }]}>Weight Loss</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.goalCard, 
                { backgroundColor: theme.cardBg, borderColor: theme.divider },
                userProfile?.preferences?.dietGoals?.includes('Muscle Gain') && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => handleUpdateGoal('Muscle Gain')}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg' }} 
                style={styles.goalImage} 
              />
              <Text style={[styles.goalText, { color: theme.textPrimary }]}>Muscle Gain</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.goalCard, 
                { backgroundColor: theme.cardBg, borderColor: theme.divider },
                userProfile?.preferences?.dietGoals?.includes('Balanced Diet') && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => handleUpdateGoal('Balanced Diet')}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg' }} 
                style={styles.goalImage} 
              />
              <Text style={[styles.goalText, { color: theme.textPrimary }]}>Balanced Diet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.goalCard, 
                { backgroundColor: theme.cardBg, borderColor: theme.divider },
                userProfile?.preferences?.dietGoals?.includes('Plant-Based') && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => handleUpdateGoal('Plant-Based')}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1343504/pexels-photo-1343504.jpeg' }} 
                style={styles.goalImage} 
              />
              <Text style={[styles.goalText, { color: theme.textPrimary }]}>Plant-Based</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Settings
          </Text>
          
          <View style={[styles.settingsCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <SettingItem 
              icon={<User size={20} color={theme.primary} />}
              title="Account Settings"
              theme={theme}
              onPress={() => {}}
            />
            
            <SettingItem 
              icon={<Bell size={20} color={theme.primary} />}
              title="Notifications"
              theme={theme}
              onPress={() => {}}
            />
            
            <SettingItem 
              icon={<Heart size={20} color={theme.primary} />}
              title="Dietary Preferences"
              theme={theme}
              onPress={() => {}}
            />
            
            <View style={[styles.settingItem, { borderBottomColor: theme.divider }]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Moon size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary + '50' }}
                thumbColor={isDark ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <SettingItem 
              icon={<Shield size={20} color={theme.primary} />}
              title="Privacy"
              theme={theme}
              onPress={() => {}}
            />
            
            <SettingItem 
              icon={<Info size={20} color={theme.primary} />}
              title="About"
              theme={theme}
              onPress={() => {}}
              noBorder
            />
          </View>
        </View>
        
        <View style={styles.signOutSection}>
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingItem({ icon, title, theme, onPress, noBorder = false }: any) {
  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        !noBorder && { borderBottomWidth: 1, borderBottomColor: theme.divider }
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{title}</Text>
      </View>
      <ChevronRight size={20} color={theme.textSecondary} />
    </TouchableOpacity>
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
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  editButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  goalCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  goalImage: {
    width: '100%',
    height: 100,
  },
  goalText: {
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F44336',
    marginLeft: 8,
  },
});