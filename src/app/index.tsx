import React from "react";
import { useRouter } from "expo-router";
import { Button, View, Text } from "react-native";
import useRewardAd from "@/components/useRewardAd";

function App() {
  const router = useRouter();
  const { showAd, adLoaded } = useRewardAd({
    onRewardEarned: () => router.push({ pathname: "/Base" }),
    onAdClosed: () => console.log("Ad closed by user")
  });

  return (
    <View style={{ marginTop: 100, alignItems: "center", paddingHorizontal: 20 }}>
      <Button title="Show Rewarded Ad" onPress={showAd} disabled={!adLoaded} />
      {!adLoaded && <Text style={{ marginTop: 10, fontSize: 16, color: "gray" }}>Loading Ad...</Text>}
    </View>
  );
}

export default App;
