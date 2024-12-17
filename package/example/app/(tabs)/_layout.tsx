import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/example/components/HapticTab";
import { IconSymbol } from "@/example/components/ui/IconSymbol";
import TabBarBackground from "@/example/components/ui/TabBarBackground";
import { Colors } from "@/example/constants/Colors";
import { useColorScheme } from "@/example/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute"
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />
        }}
      />
    </Tabs>
  );
}
