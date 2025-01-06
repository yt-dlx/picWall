// src/utils/HeaderAnimated.tsx
import React, { useEffect } from "react";
import Colorizer from "@/utils/Colorizer";
import imageSets from "@/database/static";
import { AntDesign } from "@expo/vector-icons";
import { Text, View, Image } from "react-native";
import { ScrollingSlotProps } from "@/types/components";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, FadeInDown } from "react-native-reanimated";
// ============================================================================================
// ============================================================================================
const ScrollingSlot: React.FC<ScrollingSlotProps> = ({ images, reverse, delay }) => {
  const imageHeight = 150;
  const totalHeight = images.length * imageHeight;
  const scrollValue = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1000 }));
    scrollValue.value = withDelay(delay, withRepeat(withTiming(totalHeight, { duration: 10000 }), -1, reverse));
  }, [scrollValue, totalHeight, reverse, delay, opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -scrollValue.value % totalHeight }], opacity: opacity.value }));
  return (
    <View className="flex-1 overflow-hidden p-1">
      <Animated.View style={animatedStyle} className="flex-col">
        {images.concat(images).map((uri: string, idx: number) => (
          <Image key={idx} source={{ uri }} alt="Scrolling Image" className="w-full h-24 rounded-xl mb-1" resizeMode="cover" blurRadius={1.5} style={{ height: imageHeight }} />
        ))}
      </Animated.View>
    </View>
  );
};
// ============================================================================================
// ============================================================================================
const AnimatedTitle: React.FC = () => {
  const scale = useSharedValue(0.95);
  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 2000 }), withTiming(0.95, { duration: 2000 })), -1, true);
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animatedStyle} className="items-center mt-10">
      <View style={{ backgroundColor: Colorizer("#0C0C0C", 0.6) }} className="rounded-full p-1">
        <Image source={require("@/assets/images/logo.png")} alt="logo" className="w-24 h-24 rounded-full border-2" style={{ borderColor: Colorizer("#FFFFFF", 1.0) }} resizeMode="contain" />
      </View>
    </Animated.View>
  );
};
// ============================================================================================
// ============================================================================================
const HeaderAnimated: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex-row overflow-hidden rounded-xl relative" style={{ height: 300 }}>
        {imageSets.map((images, slotIndex) => (
          <ScrollingSlot key={slotIndex} images={images} reverse={slotIndex % 2 === 0} delay={slotIndex * 200} />
        ))}
        <View
          className="absolute inset-0 items-center justify-center rounded-lg overflow-hidden"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", borderRadius: 8 }}
        >
          <View style={{ backgroundColor: Colorizer("#0C0C0C", 0.5) }} className="absolute inset-0" />
          <View style={{ position: "absolute", justifyContent: "center", alignItems: "center", margin: 8, padding: 4 }} className="absolute justify-center items-center">
            <View className="flex-row mb-1">
              <AnimatedTitle />
            </View>
            <Text style={{ fontFamily: "Lobster_Regular", fontSize: 30, marginTop: 15, color: Colorizer("#FFFFFF", 1.0), lineHeight: 34 }} className="tracking-tight">
              picWall
            </Text>
            <Animated.View style={{ alignSelf: "center" }} entering={FadeInDown.delay(600).duration(1500).springify()}>
              <View style={{ backgroundColor: Colorizer("#0C0C0C", 0.6), borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0), fontSize: 12, textAlign: "center" }}>
                  Crafted with <AntDesign name="heart" size={10} color={Colorizer("#FFFFFF", 1.0)} /> in India. All rights reserved
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
};
export default HeaderAnimated;
