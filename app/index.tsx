import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Bu fonksiyon history verilerini önceden kontrol eder
async function preloadHistoryData() {
  try {
    // History verilerini önceden yükle (cache)
    await AsyncStorage.getItem('conversion_history');
    return true;
  } catch (error) {
    console.error("Error preloading history data:", error);
    return false;
  }
}

export default function IndexPage() {
  useEffect(() => {
    // Ana sayfaya geldiğimizde history verilerini önceden yüklüyoruz
    preloadHistoryData();
  }, []);

  // Doğrudan tabs dizinine yönlendiriyoruz, 
  // ancak önceki preload sayesinde veriler hazır olacak
  return <Redirect href="/(tabs)" />;
}
