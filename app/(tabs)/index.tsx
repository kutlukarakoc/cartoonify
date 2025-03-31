import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Image, Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Upload } from "~/lib/icons/Upload";
import { Camera } from "~/lib/icons/Camera";
import { Download } from "~/lib/icons/Download";
import { LoaderPinwheel } from "~/lib/icons/Loader";
import * as ImagePicker from "expo-image-picker";
import { Skeleton } from "~/components/ui/skeleton";
import { useCameraPermissions } from "expo-camera";
import { NoImageSelected } from "~/components/NoImageSelected";
import { CardWrapper } from "~/components/CardWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Fragment } from "react";

export default function ConvertScreen() {
  const [activeTab, setActiveTab] = useState("original");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cartoonImage, setCartoonImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = result.assets[0].base64 as string;
      setOriginalImage(`data:image/png;base64,${base64Image}`);

      await cartoonifyImage(base64Image);
    }
  };

  const takePhoto = async () => {
    if (permission?.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = result.assets[0].base64 as string;
        setOriginalImage(`data:image/png;base64,${base64Image}`);
        await cartoonifyImage(base64Image);
      }
    } else {
      const { status } = await requestPermission();
      if (status === "granted") {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
          base64: true,
        });
        if (!result.canceled) {
          const base64Image = result.assets[0].base64 as string;
          setOriginalImage(`data:image/png;base64,${base64Image}`);
          const cartoonImage = await cartoonifyImage(base64Image);
          setCartoonImage(cartoonImage);
        }
      } else {
        alert("Camera permission is required to take a photo.");
      }
    }
  };

  async function cartoonifyImage(base64: string): Promise<string> {
    setIsProcessing(true);
    setActiveTab("cartoon");

    const response = await fetch(
      process.env.EXPO_PUBLIC_BE_API_URL + "/api/conversion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: base64,
        }),
      }
    );

    if (!response.ok) {
      console.error("Error fetching cartoon image:", response);
      setIsProcessing(false);
      return "";
    }

    const data = await response.json();
    const cartoonImageUri = data.data;
    const imageData = `data:image/png;base64,${cartoonImageUri}`;

    setCartoonImage(imageData);
    setIsProcessing(false);
    
    // Burada originalImage state'i yerine doğrudan URI kullanıyoruz
    const originalUri = `data:image/png;base64,${base64}`;
    console.log("Saving to history with original and cartoon images");
    await saveToHistory(originalUri, imageData);
    
    return imageData;
  }
  
  // Save images to AsyncStorage history
  const saveToHistory = async (original: string, cartoon: string) => {
    try {
      console.log("History save started");
      // AsyncStorage'dan mevcut verileri oku
      const historyJson = await AsyncStorage.getItem('conversion_history');
      console.log("Current history data:", historyJson ? "Found existing data" : "No existing data");
      
      // JSON parse işlemi
      const history = historyJson ? JSON.parse(historyJson) : [];
      console.log(`Current history has ${history.length} items`);
      
      // Yeni öğe oluştur
      const newItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        original,
        cartoon
      };
      
      // Yeni öğeyi array'in başına ekle
      const updatedHistory = [newItem, ...history];
      console.log(`Updated history now has ${updatedHistory.length} items`);
      
      // Limit history to 20 items to prevent storage issues
      const limitedHistory = updatedHistory.slice(0, 20);
      
      // AsyncStorage'a kaydet
      const jsonValue = JSON.stringify(limitedHistory);
      console.log(`Saving JSON data of length: ${jsonValue.length}`);
      await AsyncStorage.setItem('conversion_history', jsonValue);
      console.log("History saved successfully");
      
      // Kaydetme işlemini doğrula
      const verifyData = await AsyncStorage.getItem('conversion_history');
      console.log(`Verification: Data exists after save: ${!!verifyData}`);
      if (verifyData) {
        const parsedData = JSON.parse(verifyData);
        console.log(`Verification: Saved ${parsedData.length} items`);
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const saveImageToGallery = async () => {
    if (cartoonImage) {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            "Permission needed", 
            "Please grant permission to save images to your gallery",
            [{ text: "OK" }]
          );
          return;
        }

        const base64Data = cartoonImage.split(',')[1];
        
        const fileUri = FileSystem.documentDirectory + `cartoon_${Date.now()}.png`;
        
        // Base64 veriyi dosyaya yazalım
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Dosyayı medya kütüphanesine kaydedelim
        await MediaLibrary.createAssetAsync(fileUri);
        
        // Kullanıcıya başarı mesajı gösterelim
        Alert.alert(
          "Success", 
          "Image saved to your gallery successfully!",
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error('Error saving to gallery:', error);
        Alert.alert(
          "Error", 
          "Failed to save image to gallery",
          [{ text: "OK" }]
        );
      }
    }
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 items-center p-6 bg-secondary/30">
        <View className="flex-row justify-between w-screen px-3">
          <Button
            variant="outline"
            className="bg-purple-700 flex-row items-center gap-2 active:bg-purple-800"
            onPress={pickImage}
          >
            <Upload size={16} className="text-primary" />
            <Text className="text-primary">Select Image</Text>
          </Button>

          <Button
            variant="outline"
            className="bg-purple-700 active:bg-purple-800 flex-row items-center gap-2"
            onPress={takePhoto}
          >
            <Camera size={16} className="text-primary" />
            <Text className="text-primary">Take a Photo</Text>
          </Button>
        </View>

        <View className="justify-center p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-[400px] mx-auto flex-col gap-1.5"
          >
            <TabsList className="flex-row w-full mb-3">
              <TabsTrigger value="original" className="flex-1">
                <Text>Original</Text>
              </TabsTrigger>
              <TabsTrigger
                value="cartoon"
                className="flex-1"
                disabled={!originalImage}
              >
                <Text>Cartoon</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="original">
              <CardWrapper>
                {originalImage ? (
                  <Image
                    source={{ uri: originalImage }}
                    className="w-full h-full rounded-md"
                  />
                ) : (
                  <NoImageSelected />
                )}
              </CardWrapper>
            </TabsContent>
            <TabsContent value="cartoon">
              <CardWrapper>
                {!cartoonImage || isProcessing ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  <Image
                    source={{ uri: cartoonImage }}
                    className="w-full h-full rounded-md"
                  />
                )}
              </CardWrapper>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            className="bg-purple-700 active:bg-purple-800 flex-row items-center gap-2 -mt-20"
            onPress={saveImageToGallery}
            disabled={!cartoonImage || isProcessing}
          >
            {isProcessing ? (
              <LoaderPinwheel size={24} color="#fff" className="text-primary animate-spin" />
            ) : (
              <Fragment>
                <Download size={16} className="text-primary" />
                <Text className="text-primary">Save Cartoon</Text>
              </Fragment>
            )}
          </Button>
        </View>
      </View>
    </SafeAreaProvider>
  );
} 