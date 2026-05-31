import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  active: '#00d4a6',
  inactive: '#7f8ea8',
  border: '#1b304c',
};

function TabIcon({
  focused,
  color,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  color: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
}) {
  return (
    <Ionicons
      name={focused ? activeIcon : inactiveIcon}
      size={24}
      color={color}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Platform.OS === 'ios' ? 18 : 12,
          height: Platform.OS === 'ios' ? 82 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: COLORS.card,
          borderWidth: 1,
          borderColor: COLORS.border,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: {
            width: 0,
            height: 8,
          },
        },
        sceneStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="home"
              inactiveIcon="home-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Treinos',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="barbell"
              inactiveIcon="barbell-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}