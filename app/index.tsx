import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

async function preloadHistoryData() {
  try {
    await AsyncStorage.getItem('conversion_history');
    return true;
  } catch (error) {
    console.error("Error preloading history data:", error);
    return false;
  }
}

export default function IndexPage() {
  useEffect(() => {
    preloadHistoryData();
  }, []);

  return <Redirect href="/(tabs)" />;
}
