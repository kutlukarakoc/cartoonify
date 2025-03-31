import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';

type ConversionItem = {
  id: string;
  date: string;
  original: string;
  cartoon: string;
};

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<ConversionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const historyJson = await AsyncStorage.getItem('conversion_history');
      if (historyJson) {
        const history = JSON.parse(historyJson) as ConversionItem[];
        setHistoryItems(history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('conversion_history');
      setHistoryItems([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const removeHistoryItem = async (id: string) => {
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
      {historyItems.length > 0 ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Conversions</Text>
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={historyItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </>
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