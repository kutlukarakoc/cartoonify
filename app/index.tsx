import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Onboarding durumunu kontrol et
const checkOnboardingStatus = async () => {
  try {
    const status = await AsyncStorage.getItem('onboarding_complete');
    return status === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export default function IndexPage() {
  // Bu sayfa sadece bir yönlendirme sayfası
  // Ana layout'taki mantığa göre yönlendirme yapılıyor
  return <Redirect href="/(tabs)" />;
}
