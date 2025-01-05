import React, { useEffect, useState } from "react";
import { Button, Platform, StatusBar } from "react-native";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : "ca-app-pub-9464475307933754/3867856186";
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["fashion", "clothing"]
});

const AppPage: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });
    const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      if (Platform.OS === "ios") StatusBar.setHidden(true);
    });
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      if (Platform.OS === "ios") StatusBar.setHidden(false);
    });
    interstitial.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);
  if (!loaded) return null;
  return (
    <Button
      title="Show Interstitial"
      onPress={() => {
        interstitial.show();
      }}
    />
  );
};

export default AppPage;
