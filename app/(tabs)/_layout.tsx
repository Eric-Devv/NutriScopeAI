import React from 'react';
import { Tabs } from 'expo-router';
import { Camera, Chrome as Home, MessageSquare, ChartPie as PieChart, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.divider,
          height: 60,
          paddingBottom: 8,
        },
        tabBarButton: (props) => {
          return <TabBarButton {...props} />;
        }
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarButton(props: any) {
  const { theme } = useTheme();
  const { onPress, accessibilityState, children } = props;
  const focused = accessibilityState.selected;

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: focused 
        ? withTiming(theme.primary + '15', { duration: 200 })
        : withTiming('transparent', { duration: 200 }),
      width: '80%',
      borderRadius: 16,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    };
  }, [focused, theme]);

  return (
    <View style={styles.tabButtonContainer}>
      <Animated.View style={animatedBgStyle}>
        <View {...props} style={styles.tabButton}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});