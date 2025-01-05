/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { RewardedInterstitialAd, RewardedAdEventType, TestIds, AdEventType } from "react-native-google-mobile-ads";

type RewardAdConfig = {
  adUnitId?: string;
  keywords?: string[];
  onAdClosed?: () => void;
  onRewardEarned?: (reward: { amount: number; type: string }) => void;
};

export default function useRewardAd({ adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : "ca-app-pub-9464475307933754/8430751878", keywords = [], onRewardEarned, onAdClosed }: RewardAdConfig) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adClientRef = useRef<RewardedInterstitialAd | null>(null);

  const createAndLoadAd = () => {
    const adClient = RewardedInterstitialAd.createForAdRequest(adUnitId, { keywords });
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

    // Correct event types
    adClient.addAdEventListener(RewardedAdEventType.LOADED, handleAdLoaded);
    adClient.addAdEventListener(AdEventType.CLOSED, handleAdClosed);
    adClient.addAdEventListener(AdEventType.ERROR, handleAdFailedToLoad);
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
      adClientRef.current.show().catch((error) => console.error("Error showing ad:", error));
    }
  };

  return { showAd, adLoaded };
}
