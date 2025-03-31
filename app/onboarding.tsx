import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Örnek kutular için renkler (görseller yerine)
const sampleColors = [
  '#FF7F50', '#6495ED', '#9370DB',
  '#3CB371', '#FFD700', '#8A2BE2',
  '#FF69B4', '#00BFFF', '#32CD32',
];

export default function OnboardingScreen() {
  const handleGetStarted = async () => {
    try {
      // Onboarding tamamlandı olarak işaretleyelim
      await AsyncStorage.setItem('onboarding_complete', 'true');
      // Tab navigasyonuna yönlendirelim
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ghibli tarzı görsel grid'i (renkli kutular) */}
        <View style={styles.imageGrid}>
          {sampleColors.map((color, index) => (
            <View key={index} style={styles.imageContainer}>
              <View style={[styles.colorBox, { backgroundColor: color }]} />
            </View>
          ))}
        </View>

        {/* Başlık ve açıklama */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ghibli Style</Text>
          
          <Text style={styles.description}>
            Transforms photos into{' '}
            <Text style={styles.highlight}>Ghibli Style-inspired characters</Text>
          </Text>
          
          <Text style={styles.subtext}>
            Create your own Ghibli-style anime characters 
            using our AI-powered transformation tool
          </Text>
        </View>

        {/* Başlangıç butonu */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width,
    marginVertical: 20,
  },
  imageContainer: {
    width: width / 3,
    height: width / 3,
    padding: 2,
  },
  colorBox: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  description: {
    fontSize: 22,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 12,
  },
  highlight: {
    color: '#b861ff',
    fontWeight: '600',
  },
  subtext: {
    fontSize: 18,
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#b861ff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: width * 0.85,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  }
}); 