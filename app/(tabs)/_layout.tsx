import React from 'react';
import { Tabs } from 'expo-router';
import { ImagePlus, Clock } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        lazy: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Convert',
          tabBarIcon: ({ color, size }) => (
            <ImagePlus size={size} color={color} />
          ),
          headerTitle: 'Convert',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Clock size={size} color={color} />
          ),
          headerTitle: 'Conversion History',
        }}
      />
    </Tabs>
  );
} 