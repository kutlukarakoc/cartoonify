import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, RefreshControl, BackHandler } from 'react-native';
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
      <View style={styles.card}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
            <Trash2 size={18} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>Original</Text>
            <Image source={{ uri: item.original }} style={styles.image} />
          </View>
          
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>Cartoon</Text>
            <Image source={{ uri: item.cartoon }} style={styles.image} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Conversions</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={onRefresh} 
            style={styles.refreshButton}
            disabled={isLoading || refreshing}
          >
            <RefreshCw size={18} color={isLoading || refreshing ? "#666" : "#6a0dad"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={clearHistory} 
            style={styles.clearButton}
            disabled={isLoading || historyItems.length === 0}
          >
            <Text style={[
              styles.clearButtonText, 
              (isLoading || historyItems.length === 0) && {color: '#666'}
            ]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : historyItems.length > 0 ? (
        <FlatList
          data={historyItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6a0dad"]} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversions yet</Text>
          <Text style={styles.emptySubtext}>
            Images you convert will appear here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#6a0dad',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    color: '#9ca3af',
    fontSize: 14,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    width: '48%',
  },
  imageLabel: {
    color: '#ffffff',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
}); 