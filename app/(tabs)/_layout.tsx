import React from 'react';
import { Tabs } from 'expo-router';
import { ImagePlus, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f5e6d3" />
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: '#594d3f',
          tabBarInactiveTintColor: '#8b7355',
          tabBarStyle: {
            backgroundColor: '#e6d5c3',
            borderTopWidth: 1,
            borderTopColor: '#8b7355',
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          headerStyle: {
            backgroundColor: '#f5e6d3',
            borderBottomWidth: 1,
            borderBottomColor: '#8b7355',
            elevation: 0,
          },
          headerTintColor: '#594d3f',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#594d3f',
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
    </>
  );
} 