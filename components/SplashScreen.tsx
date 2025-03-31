import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Image } from "react-native";

export const SplashScreenComponent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-neutral-900">
      <Animated.View
        className="items-center justify-center"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={require("../assets/images/icon.png")}
          className="w-32 h-32 mb-5"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-white text-center">
          Cartoonify - Ghibli
        </Text>
        <Text className="text-base text-purple-400 opacity-80">
          Ghibli Style Transformer
        </Text>
      </Animated.View>
    </View>
  );
};
