// src/app/Admob/index.tsx
// -----------------------------------------------------------------------------
import { Image } from "expo-image";
import React, { useEffect } from "react";
import Colorizer from "@/utils/Colorizer";
import useRewardAd from "@/components/useRewardAd";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
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

export default function AdmobPage(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  let parsedData: ParsedData | null = null;
  if (params.data) {
    const dataParam = Array.isArray(params.data) ? params.data[0] : params.data;
    parsedData = JSON.parse(dataParam) as ParsedData;
  }
  const selectedImage = parsedData?.data[parsedData.selectedIndex]?.previewLink || null;
  const { showAd, adLoaded } = useRewardAd({
    onRewardEarned: () => {
      setTimeout(() => {
        router.push({ pathname: "/Image", params });
      }, 100);
    },
    onAdClosed: () => router.back()
  });
  useEffect(() => {
    if (adLoaded) showAd();
  }, [adLoaded, showAd]);
  return (
    <View className="flex-1">
      <Image source={require("@/assets/bg-admob.png")} style={{ position: "absolute", width, height, top: 0, left: 0 }} contentFit="cover" />
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center" style={{ backgroundColor: Colorizer("#0C0C0C", 0.9), paddingTop: height / 8, paddingBottom: height / 8, paddingHorizontal: width / 4, borderRadius: 20 }}>
          {selectedImage && (
            <View className="mb-6" style={{ width: width / 3, height: height / 4, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#000" }}>
              <Image source={{ uri: selectedImage }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          )}
          <ActivityIndicator size="large" color="#FFFFFF" />
          <View className="mt-6 items-center">
            <Text className="text-white text-lg text-center mb-4" style={{ fontFamily: "Lobster_Regular" }}>
              Preparing Your Experience
            </Text>
            <Text className="text-white/60 text-sm text-center" style={{ fontFamily: "Lobster_Regular" }}>
              After watching the ad, you'll be redirected to your selected content
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
