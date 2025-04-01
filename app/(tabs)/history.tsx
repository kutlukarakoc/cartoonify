import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, BackHandler, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, RefreshCw, Download } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Skeleton } from '~/components/ui/skeleton';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

type ConversionItem = {
  id: string;
  date: string;
  original: string;
  cartoon: string;
};

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<ConversionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const isLoadingRef = useRef(false);
  const isMounted = useRef(false);
  const navigation = useNavigation();

  useEffect(() => {
    isMounted.current = true;
    
    if (!dataLoaded) {
      initialLoadHistory();
    }
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    });
    
    return () => {
      isMounted.current = false;
      backHandler.remove();
    };
  }, []);
  
  const initialLoadHistory = async () => {
    if (isLoadingRef.current || !isMounted.current) return;
    
    try {
      isLoadingRef.current = true;
      
      const historyJson = await AsyncStorage.getItem('conversion_history');
      
      if (!isMounted.current) return;
      
      if (historyJson) {
        try {
          const history = JSON.parse(historyJson) as ConversionItem[];
          setHistoryItems(history);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setHistoryItems([]);
        }
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      if (isMounted.current) {
        setHistoryItems([]);
      }
    } finally {
      if (isMounted.current) {
        setDataLoaded(true);
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }
  };
  
  const loadHistory = useCallback(async () => {
    if (isLoadingRef.current || !isMounted.current) return;
    
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      
      const historyJson = await AsyncStorage.getItem('conversion_history');
      
      if (!isMounted.current) return;
      
      if (historyJson) {
        try {
          const history = JSON.parse(historyJson) as ConversionItem[];
          setHistoryItems(history);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setHistoryItems([]);
        }
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      if (isMounted.current) {
        setHistoryItems([]);
      }
    } finally {
      if (isMounted.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (dataLoaded) {
        loadHistory();
      }
    }, [loadHistory, dataLoaded])
  );

  const onRefresh = useCallback(() => {
    if (isLoadingRef.current) return;
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  const clearHistory = async () => {
    if (isLoadingRef.current) return;
    
    try {
      await AsyncStorage.removeItem('conversion_history');
      setHistoryItems([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const removeHistoryItem = async (id: string) => {
    if (isLoadingRef.current) return;
    
    try {
      const updatedItems = historyItems.filter(item => item.id !== id);
      setHistoryItems(updatedItems);
      await AsyncStorage.setItem('conversion_history', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const downloadImage = async (uri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images to your gallery.');
        return;
      }

      const timestamp = new Date().getTime();
      const fileUri = `${FileSystem.documentDirectory}cartoon_${timestamp}.png`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const base64String = base64Data.split(',')[1];

      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.createAssetAsync(fileUri);
      
      Alert.alert('Success', 'Image saved to your gallery!');
    } catch (error) {
      console.error('Detailed error in downloadImage:', error);
      Alert.alert(
        'Error', 
        'Failed to download image. Please check your internet connection and try again.'
      );
    }
  };

  const renderItem = ({ item }: { item: ConversionItem }) => {
    const formattedDate = format(parseISO(item.date), 'MMM dd, yyyy');
    
    return (
      <View className="bg-[#1f2937] rounded-xl p-4 mb-4 shadow-md">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[#9ca3af] text-sm">{formattedDate}</Text>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => downloadImage(item.cartoon)}
              className="p-2 mr-2"
            >
              <Download size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
              <Trash2 size={18} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <Text className="text-white mb-1.5 text-lg font-medium">Original</Text>
            <Image 
              source={{ uri: item.original }} 
              className="w-full h-[150px] rounded-lg bg-[#2a2a2a]" 
            />
          </View>
          
          <View className="w-[48%]">
            <Text className="text-white mb-1.5 text-lg font-medium">Anime</Text>
            <Image 
              source={{ uri: item.cartoon }} 
              className="w-full h-[150px] rounded-lg bg-[#2a2a2a]" 
            />
          </View>
        </View>
      </View>
    );
  };

  const HistorySkeleton = () => {
    return (
      <View className="p-4">
        {[1, 2, 3].map((index) => (
          <View key={index} className="bg-[#1f2937] rounded-xl p-4 mb-4 shadow-md">
            <View className="flex-row justify-between items-center mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </View>
            
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Skeleton className="h-6 w-20 mb-1.5" />
                <Skeleton className="w-full h-[150px] rounded-lg" />
              </View>
              
              <View className="w-[48%]">
                <Skeleton className="h-6 w-20 mb-1.5" />
                <Skeleton className="w-full h-[150px] rounded-lg" />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-row justify-between items-center px-4 pb-3">
        <Text className="text-lg font-bold text-white">Your Conversions</Text>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={onRefresh} 
            className="p-2 mr-2"
            disabled={isLoading || refreshing}
          >
            <RefreshCw size={18} color={isLoading || refreshing ? "#666" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={clearHistory} 
            className="p-2"
            disabled={isLoading || historyItems.length === 0}
          >
            <Text 
              className={`font-semibold underline ${isLoading || historyItems.length === 0 ? 'text-[#666]' : 'text-white'}`}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <HistorySkeleton />
      ) : historyItems.length > 0 ? (
        <FlatList
          data={historyItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6a0dad"]} />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-xl font-bold text-white mb-2">No conversions yet</Text>
          <Text className="text-base text-[#9ca3af] text-center">
            Images you convert will appear here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
} 