// src/app/Shared/index.tsx
import { Image } from "expo-image";
import useAd from "@/Hooks/useAd";
import Colorizer from "@/utils/Colorizer";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { View, Text, ActivityIndicator, Dimensions, Button, StatusBar, Animated } from "react-native";
/* ============================================================================================ */
/* ============================================================================================ */
const { width, height } = Dimensions.get("screen");
interface ImageData {
  previewLink: string;
  original_file_name: string;
  primary: string;
}
interface ParsedData {
  environment_title: string;
  selectedIndex: number;
  data: ImageData[];
}
/* ============================================================================================ */
/* ============================================================================================ */
export default function AdmobPage(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [adError, setAdError] = useState(false);
  const [adEarned, setAdEarned] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const opacity = useRef(new Animated.Value(0)).current;
  let parsedData: ParsedData | null = null;
  if (params.data) {
    const dataParam = Array.isArray(params.data) ? params.data[0] : params.data;
    parsedData = JSON.parse(dataParam) as ParsedData;
  }
  const selectedImage = parsedData?.data[parsedData.selectedIndex]?.previewLink.replace("min", "max") || null;
  const { showAd, adLoaded } = useAd({
    onRewardEarned: () => setAdEarned(true),
    onAdClosed: () => {
      if (!adEarned) setAdError(true);
    }
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          if (!adLoaded && !adEarned) router.replace({ pathname: "/Image", params });
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adLoaded, adEarned, router, params]);
  useEffect(() => {
    if (adLoaded) showAd();
  }, [adLoaded, showAd]);
  useEffect(() => {
    if (adEarned && imageLoaded) router.replace({ pathname: "/Image", params });
  }, [adEarned, imageLoaded, router, params]);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true })])
    ).start();
  }, [opacity]);
  const handleTryAgain = () => {
    setAdError(false);
    if (adLoaded) showAd();
  };
  return (
    <View className="flex-1">
      <StatusBar hidden />
      <Image source={require("@/assets/images/admob.jpg")} style={{ position: "absolute", width, height, top: 0, left: 0 }} contentFit="cover" />
      <View className="flex-1 items-center justify-center p-6">
        <View
          className="items-center"
          style={{ backgroundColor: Colorizer("#0C0C0C", 0.9), paddingTop: height / 8, paddingBottom: height / 8, paddingHorizontal: width / 4, borderRadius: 20, position: "relative" }}
        >
          {selectedImage && (
            <View
              className="mb-6"
              style={{ width: width / 3, height: height / 4, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#000", position: "relative" }}
            >
              <Image source={{ uri: selectedImage }} style={{ width: "100%", height: "100%" }} contentFit="cover" onLoadEnd={() => setImageLoaded(true)} />
              {!imageLoaded && (
                <Animated.View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -12 }, { translateY: -12 }], opacity: opacity }}>
                  <FontAwesome6 name="download" size={24} color={Colorizer("#FFFFFF", 1.0)} />
                </Animated.View>
              )}
            </View>
          )}
          {!imageLoaded && <ActivityIndicator size="large" color={Colorizer("#FFFFFF", 1.0)} />}
          {adError && (
            <View className="mt-4 items-center">
              <Text className="text-red-500 text-center mb-2" style={{ fontFamily: "Lobster_Regular" }}>
                Reward not received. Please try again.
              </Text>
              <Button title="Try Again" onPress={handleTryAgain} />
            </View>
          )}
          {!adError && (
            <View className="mt-6 items-center">
              <Text className="text-white text-lg text-center mb-4" style={{ fontFamily: "Lobster_Regular" }}>
                Preparing Your Experience
              </Text>
              <Text className="text-white/60 text-sm text-center" style={{ fontFamily: "Lobster_Regular" }}>
                After watching the ad, you'll be redirected to your selected content.
              </Text>
              <Text className="text-white text-lg text-center mt-4" style={{ fontFamily: "Lobster_Regular" }}>
                Redirecting in {countdown} seconds...
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
