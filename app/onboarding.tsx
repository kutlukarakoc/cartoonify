import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const sampleColors = [
  '#FF7F50', '#6495ED', '#9370DB',
  '#3CB371', '#FFD700', '#8A2BE2',
  '#FF69B4', '#00BFFF', '#32CD32',
];

export default function OnboardingScreen() {
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <ScrollView className="flex-grow items-center pb-10">
        <View className="flex-row flex-wrap justify-center w-full my-5">
          {sampleColors.map((color, index) => (
            <View key={index} className="w-1/3 aspect-square p-0.5">
              <View style={{ backgroundColor: color }} className="w-full h-full rounded-lg" />
            </View>
          ))}
        </View>

        <View className="items-center px-5 my-5">
          <Text className="text-4xl font-bold text-white mb-4">Ghibli Style</Text>
          
          <Text className="text-2xl text-[#cccccc] text-center mb-3">
            Transforms photos into{' '}
            <Text className="text-[#b861ff] font-semibold">Ghibli Style-inspired characters</Text>
          </Text>
          
          <Text className="text-lg text-[#aaaaaa] text-center mt-2 px-2.5">
            Create your own Ghibli-style anime characters 
            using our AI-powered transformation tool
          </Text>
        </View>

        <TouchableOpacity 
          className="bg-[#b861ff] py-4 px-6 rounded-full w-[85%] items-center mt-8"
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl font-bold">Let's Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 