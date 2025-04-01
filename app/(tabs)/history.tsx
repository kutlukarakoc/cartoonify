import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, BackHandler } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, RefreshCw } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

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

  const renderItem = ({ item }: { item: ConversionItem }) => {
    const formattedDate = format(parseISO(item.date), 'MMM dd, yyyy');
    
    return (
      <View className="bg-[#1f2937] rounded-xl p-4 mb-4 shadow-md">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[#9ca3af] text-sm">{formattedDate}</Text>
          <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
            <Trash2 size={18} color="#ff4d4d" />
          </TouchableOpacity>
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
            <RefreshCw size={18} color={isLoading || refreshing ? "#666" : "#6a0dad"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={clearHistory} 
            className="p-2"
            disabled={isLoading || historyItems.length === 0}
          >
            <Text 
              className={`font-semibold ${isLoading || historyItems.length === 0 ? 'text-[#666]' : 'text-[#6a0dad]'}`}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-xl font-bold text-white mb-2">Loading...</Text>
        </View>
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