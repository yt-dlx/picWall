// src/components/useRewardAd.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { Platform } from "react-native";
import { useEffect, useState, useRef } from "react";
import { RewardedInterstitialAd, RewardedAdEventType, TestIds, AdEventType } from "react-native-google-mobile-ads";

type RewardAdConfig = {
  adUnitId?: string;
  keywords?: string[];
  onAdClosed?: () => void;
  onRewardEarned?: (reward: { amount: number; type: string }) => void;
};
export default function useRewardAd({ adUnitId, keywords = [], onRewardEarned, onAdClosed }: RewardAdConfig) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adClientRef = useRef<RewardedInterstitialAd | null>(null);
  const defaultAdUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : Platform.select({ ios: "ca-app-pub-8756720176445763/2109425101", android: "ca-app-pub-8756720176445763/4851138511" });
  const finalAdUnitId = adUnitId || defaultAdUnitId;
  const createAndLoadAd = () => {
    const adClient = RewardedInterstitialAd.createForAdRequest(finalAdUnitId!, { keywords });
    adClientRef.current = adClient;
    setAdLoaded(false);
    const handleAdLoaded = () => setAdLoaded(true);
    const handleAdFailedToLoad = () => setTimeout(createAndLoadAd, 5000);
    const handleAdClosed = () => {
      createAndLoadAd();
      if (onAdClosed) onAdClosed();
    };
    const handleRewardEarned = (reward: { amount: number; type: string }) => {
      if (onRewardEarned) onRewardEarned(reward);
    };
    adClient.addAdEventListener(AdEventType.CLOSED, handleAdClosed);
    adClient.addAdEventListener(AdEventType.ERROR, handleAdFailedToLoad);
    adClient.addAdEventListener(RewardedAdEventType.LOADED, handleAdLoaded);
    adClient.addAdEventListener(RewardedAdEventType.EARNED_REWARD, handleRewardEarned);
    adClient.load();
  };
  useEffect(() => {
    createAndLoadAd();
    return () => {
      if (adClientRef.current) adClientRef.current.removeAllListeners();
    };
  }, []);
  const showAd = () => {
    if (adLoaded && adClientRef.current) {
      adClientRef.current.show().catch((error) => {
        console.error("Error showing ad:", error);
      });
    }
  };
  return { showAd, adLoaded };
}
