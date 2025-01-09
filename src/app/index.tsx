// src/app/index.tsx;
import { Link } from "expo-router";
import { Image } from "expo-image";
import Colorizer from "@/utils/Colorizer";
import imageSets from "@/database/static";
import Footer from "@/components/Footer";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollingSlotProps } from "@/types/components";
import { Text, View, TouchableOpacity } from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, withSpring, Easing, FadeIn, FadeInDown } from "react-native-reanimated";
// ============================================================================================
// ============================================================================================
const ScrollingSlot: React.FC<ScrollingSlotProps> = ({ images, reverse, delay }) => {
  const imageHeight = 220;
  const totalHeight = images.length * imageHeight;
  const scrollValue = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 90 }));
    scrollValue.value = withDelay(delay, withRepeat(withTiming(totalHeight, { duration: 30000, easing: Easing.linear }), -1, reverse));
  }, [delay, opacity, reverse, scale, scrollValue, totalHeight]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollValue.value % totalHeight }, { scale: scale.value }],
    opacity: opacity.value
  }));
  return (
    <View style={{ flex: 1, overflow: "hidden", padding: 2 }}>
      <Animated.View style={[animatedStyle]}>
        {images.concat(images).map((uri, idx) => (
          <Image
            key={idx}
            source={uri}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={{
              shadowColor: Colorizer("#0C0C0C", 1.0),
              height: imageHeight,
              borderRadius: 15,
              width: "100%",
              margin: 2
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
};
// ============================================================================================
// ============================================================================================
const AnimatedTitle: React.FC = () => {
  const scale = useSharedValue(0.5);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), withTiming(1.0, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) })),
      -1,
      true
    );
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowColor: Colorizer("#0C0C0C", 1.0),
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12
        }
      ]}
      className="items-center mb-4"
      entering={FadeIn.delay(300).duration(1500)}
    >
      <View className="rounded-full p-1" style={{ backgroundColor: Colorizer("#0C0C0C", 0.8), justifyContent: "center", alignItems: "center" }}>
        <Image
          alt="logo"
          contentFit="contain"
          cachePolicy="memory-disk"
          source={require("@/assets/images/logo.jpg")}
          style={{ width: 150, height: 150, borderWidth: 1, borderRadius: 9999, borderColor: Colorizer("#FFFFFF", 1.0) }}
        />
      </View>
    </Animated.View>
  );
};
// ============================================================================================
// ============================================================================================
const DevMsgModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [countdown, setCountdown] = useState(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible, opacity, scale]);
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value * 0.5 }));
  const modalStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  if (!visible) return null;
  return (
    <View className="absolute inset-0 justify-center items-center" style={{ zIndex: 1000 }}>
      <Animated.View className="absolute inset-0" style={[{ backgroundColor: "#0C0C0C" }, backdropStyle]} />
      <Animated.View className="w-5/5 rounded-3xl p-10 border-4" style={[{ backgroundColor: "#0C0C0C", borderColor: "#FFFFFF" }, modalStyle]}>
        <View className="items-center">
          <Text className="mt-2.5 text-4xl" style={{ fontFamily: "Lobster_Regular", color: "#FFFFFF" }}>
            👋🏻 Hello From Dev Team!
          </Text>
          <Text className="p-4 text-2xl underline" style={{ fontFamily: "Kurale_Regular", color: "#FFFFFF" }}>
            We Hate Ads (💀) Too !!
          </Text>
          <Text className="p-2 text-xl" style={{ fontFamily: "Kurale_Regular", color: "#FFFFFF" }}>
            However It's The Only Way To Provide You Free AI-Generated Wallpapers Everyday. 💘 Hope You Understand And Watch The Ads. We Will Try Our Best To Keep The Ads Minimun.
          </Text>
          <Text className="p-2 text-xl" style={{ fontFamily: "Kurale_Regular", color: "#FFFFFF" }}>
            🔥Welcome-To-picWall-Fam🔥
          </Text>
          <TouchableOpacity className="mt-2.5 px-5 py-2 rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF" }} onPress={onClose} disabled={countdown > 0}>
            <Text className="text-lg" style={{ fontFamily: "Lobster_Regular", color: "#0C0C0C" }}>
              {countdown > 0 ? `Please Read: ${countdown}s` : "I understand!"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
// ============================================================================================
// ============================================================================================
export default function BasePage(): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);
  const buttonRotate = useSharedValue(0);
  useEffect(() => {
    if (__DEV__) setShowModal(true);
    AsyncStorage.getItem("hasSeenModal").then((value) => {
      if (!value) {
        setShowModal(true);
        AsyncStorage.setItem("hasSeenModal", "true");
      }
    });
    buttonGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), withTiming(0, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.2, 1) })),
      -1,
      true
    );
  }, [buttonGlow]);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }, { rotate: `${buttonRotate.value}deg` }],
    shadowOpacity: 0.3 + buttonGlow.value * 0.3,
    shadowRadius: 8 + buttonGlow.value * 4
  }));
  const onPressIn = () => {
    buttonScale.value = withSpring(0.94, { damping: 15, stiffness: 90 });
    buttonRotate.value = withSpring(-2, { damping: 15, stiffness: 90 });
  };
  const onPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 90 });
    buttonRotate.value = withSpring(0, { damping: 15, stiffness: 90 });
  };
  return (
    <View style={{ backgroundColor: "#0C0C0C" }} className="h-full w-full">
      <DevMsgModal visible={showModal} onClose={() => setShowModal(false)} />
      <View className="flex-1 justify-center items-center relative">
        <View className="flex-row h-full overflow-hidden relative">
          {imageSets.map((images, slotIndex) => (
            <ScrollingSlot key={slotIndex} images={images} reverse={slotIndex % 2 === 0} delay={slotIndex * 400} />
          ))}
          <LinearGradient
            colors={[Colorizer("#0C0C0C", 1.0), Colorizer("#0C0C0C", 0.4), Colorizer("#0C0C0C", 0.1), Colorizer("#0C0C0C", 0.4), Colorizer("#0C0C0C", 1.0)]}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            locations={[0, 0.2, 0.4, 0.5, 1]}
          />
          <View className="absolute inset-0 justify-center items-center mt-14">
            <AnimatedTitle />
            <Animated.View entering={FadeInDown.delay(600).duration(1500).springify()}>
              <View>
                <Text className="text-center" style={{ fontSize: 80, fontFamily: "Lobster_Regular", color: "#FFFFFF", textShadowColor: "#0C0C0C" }}>
                  picWall
                </Text>
                <Animated.View style={{ alignSelf: "center" }} entering={FadeInDown.delay(600).duration(1500).springify()}>
                  <View style={{ backgroundColor: "rgba(12, 12, 12, 0.6)", borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: "Lobster_Regular", color: "#FFFFFF", fontSize: 10, textAlign: "center" }}>
                      Crafted with <AntDesign name="heart" size={10} color="#FFFFFF" /> in India. All rights reserved
                    </Text>
                  </View>
                </Animated.View>
              </View>
              <Link href="./Home" asChild>
                <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} className="mt-44 rounded-full overflow-hidden">
                  <Animated.View style={[buttonAnimatedStyle, { shadowColor: "#0C0C0C", shadowOffset: { width: 0, height: 4 } }]}>
                    <View style={{ backgroundColor: "#FFFFFF" }} className="flex-row items-center justify-center py-4">
                      <FontAwesome5 name="camera-retro" size={32} color="#0C0C0C" style={{ marginRight: 12 }} />
                      <Text className="text-2xl" style={{ fontFamily: "Lobster_Regular", color: "#0C0C0C" }}>
                        Let's Explore Wallpapers
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </Link>
              <Animated.View entering={FadeIn.delay(1200).duration(1500)} style={{ marginTop: 10, paddingHorizontal: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Lobster_Regular", color: "rgba(255, 255, 255, 0.8)", fontSize: 15, textAlign: "center", marginBottom: 4 }}>Personalised AI Wallpapers</Text>
                <Text style={{ fontFamily: "Lobster_Regular", color: "rgba(255, 255, 255, 0.6)", fontSize: 10, textAlign: "center", maxWidth: 300 }}>
                  Create stunning collections, share your moments, and discover amazing photographs from around the world. Join our community of passionate photographers today!
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </View>
      <Footer />
    </View>
  );
}
