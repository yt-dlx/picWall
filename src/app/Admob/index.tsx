// src/app/Admob/index.tsx
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import useRewardAd from "@/components/useRewardAd";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AdmobPage(): JSX.Element {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showAd, adLoaded } = useRewardAd({
    onRewardEarned: () => {
      router.push({ pathname: "/Image", params: params });
    },
    onAdClosed: () => router.back()
  });
  useEffect(() => {
    if (adLoaded) showAd();
  }, [adLoaded, showAd]);
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text className="text-white mt-4" style={{ fontFamily: "Lobster_Regular" }}>
        Loading...
      </Text>
    </View>
  );
}
