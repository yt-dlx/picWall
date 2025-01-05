import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { RewardedInterstitialAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["fashion", "clothing"]
});

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log("User earned reward of ", reward);
    });

    // Start loading the rewarded interstitial ad straight away
    rewardedInterstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  // No advert ready to show yet
  if (!loaded) {
    return null;
  }

  return (
    <Button
      title="Show Rewarded Interstitial Ad"
      onPress={() => {
        rewardedInterstitial.show();
      }}
    />
  );
}
export default App;
