import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sampleImages = [
  require('../assets/images/ob-1.jpeg'),
  require('../assets/images/ob-2.jpeg'),
  require('../assets/images/ob-3.jpeg'),
  require('../assets/images/ob-4.jpeg'),
  require('../assets/images/ob-5.jpeg'),
  require('../assets/images/ob-6.jpeg'),
  require('../assets/images/ob-7.jpeg'),
  require('../assets/images/ob-8.jpeg'),
  require('../assets/images/ob-9.jpeg'),
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
      <ScrollView className="flex-grow pb-10">
        <View className="flex-row flex-wrap justify-center w-full my-5">
          {sampleImages.map((image, index) => (
            <View key={index} className="w-1/3 aspect-square p-0.5">
              <Image 
                source={image} 
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>
          ))}
        </View>

        <View className="items-center px-5 my-5">
          <Text className="text-4xl font-bold text-white mb-4">Cartoon Style</Text>
          
          <Text className="text-2xl text-[#cccccc] text-center mb-3">
            Transforms photos into{' '}
            <Text className="text-[#b861ff] font-semibold">Cartoon Style-inspired characters</Text>
          </Text>
          
          <Text className="text-lg text-[#aaaaaa] text-center mt-2 px-2.5">
            Create your own cartoon-style anime characters 
            using our AI-powered transformation tool
          </Text>
        </View>

        <TouchableOpacity 
          className="bg-[#b861ff] py-4 px-6 rounded-full w-[85%] items-center mt-8 mx-auto"
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl font-bold">Let's Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 