// src/app/Image/index.tsx
/* ============================================================================================ */
/* ============================================================================================ */
import { Image } from "expo-image";
import useAppState from "@/utils/store";
import Colorizer from "@/utils/Colorizer";
import Footer from "@/components/Footer";
import * as FileSystem from "expo-file-system";
import { ImageMetadata } from "@/types/database";
import { useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import { setWallpaper, TYPE_SCREEN } from "rn-wallpapers";
import { createPreviewLink, createDownloadLink } from "@/utils/linker";
import { FontAwesome5, MaterialIcons, Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { View, Text, Dimensions, StatusBar, ActivityIndicator, TouchableOpacity, Alert, Modal, Animated, Easing, ScrollView } from "react-native";
const { width: screenWidth } = Dimensions.get("window");
/* ============================================================================================ */
/* ============================================================================================ */
const SuccessModal: React.FC<{ visible: boolean; message: string; onClose: () => void }> = ({ visible, message, onClose }) => {
  const [modalAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    if (visible) Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    else Animated.timing(modalAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [visible, modalAnim]);
  const backdropStyle = { opacity: modalAnim };
  const scale = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const modalStyle = { opacity: modalAnim, transform: [{ scale }] };
  if (!visible) return null;
  return (
    <View className="absolute inset-0 justify-center items-center">
      <Animated.View className="absolute inset-0" style={[{ backgroundColor: Colorizer("#0C0C0C", 0.5) }, backdropStyle]} />
      <Animated.View className="w-4/5 rounded-3xl p-5 border-4" style={[{ backgroundColor: Colorizer("#0C0C0C", 1.0), borderColor: Colorizer("#25BE8B", 1.0) }, modalStyle]}>
        <View className="items-center">
          <Ionicons name="checkmark-done-circle" size={50} color={Colorizer("#25BE8B", 1.0)} />
          <Text className="mt-2.5 text-5xl" style={{ fontFamily: "Lobster_Regular", color: Colorizer("#25BE8B", 1.0) }}>
            Success
          </Text>
          <Text className="my-2.5 text-center text-lg" style={{ fontFamily: "Lobster_Regular", color: Colorizer("#25BE8B", 1.0) }}>
            {message}
          </Text>
          <TouchableOpacity className="mt-2.5 px-5 py-2 rounded-2xl overflow-hidden" style={{ backgroundColor: Colorizer("#25BE8B", 0.4) }} onPress={onClose}>
            <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
const ErrorModal: React.FC<{ visible: boolean; message: string; onClose: () => void }> = ({ visible, message, onClose }) => {
  const [modalAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    if (visible) Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    else Animated.timing(modalAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [visible, modalAnim]);
  const backdropStyle = { opacity: modalAnim };
  const scale = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const modalStyle = { opacity: modalAnim, transform: [{ scale }] };
  if (!visible) return null;
  return (
    <View className="absolute inset-0 justify-center items-center">
      <Animated.View className="absolute inset-0" style={[{ backgroundColor: Colorizer("#0C0C0C", 0.5) }, backdropStyle]} />
      <Animated.View className="w-4/5 rounded-3xl p-5 border-4" style={[{ backgroundColor: Colorizer("#0C0C0C", 1.0), borderColor: Colorizer("#FFFFFF", 1.0) }, modalStyle]}>
        <View className="items-center">
          <MaterialIcons name="error" size={50} color={Colorizer("#FFFFFF", 1.0)} />
          <Text className="mt-2.5 text-5xl" style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0) }}>
            Error
          </Text>
          <Text className="my-2.5 text-center text-lg" style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0) }}>
            {message}
          </Text>
          <TouchableOpacity className="mt-2.5 px-5 py-2 rounded-2xl overflow-hidden" style={{ backgroundColor: Colorizer("#FFFFFF", 0.4) }} onPress={onClose}>
            <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
const DownloadingModal: React.FC<{ visible: boolean; percentage: number; downloadRate: number; eta: number; primaryColor: string }> = ({ visible, percentage, downloadRate, eta, primaryColor }) => {
  const [progressAnim] = useState(new Animated.Value(percentage / 100));
  useEffect(() => {
    Animated.timing(progressAnim, { toValue: percentage / 100, duration: 500, easing: Easing.linear, useNativeDriver: false }).start();
  }, [percentage, progressAnim]);
  const widthInterpolated = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };
  if (!visible) return null;
  return (
    <View className="absolute inset-0 justify-center items-center">
      <View className="absolute inset-0" style={{ backgroundColor: Colorizer("#0C0C0C", 0.5) }} />
      <View className="w-4/5 rounded-3xl p-5 border-4" style={{ backgroundColor: Colorizer("#0C0C0C", 1.0), borderColor: Colorizer(primaryColor, 1.0) }}>
        <View className="items-center">
          <MaterialIcons name="cloud-download" size={50} color={Colorizer(primaryColor, 1.0)} />
          <Text className="mt-2.5 text-5xl" style={{ fontFamily: "Lobster_Regular", color: Colorizer(primaryColor, 1.0) }}>
            Downloading...
          </Text>
          <Text className="mt-4 text-3xl" style={{ color: Colorizer(primaryColor, 1.0), fontFamily: "Lobster_Regular" }}>
            {percentage.toFixed(1)}%
          </Text>
          <View className="w-full h-3 rounded-full overflow-hidden mt-4 bg-gray-800">
            <Animated.View style={{ width: widthInterpolated, backgroundColor: Colorizer(primaryColor, 1.0), height: "100%" }} />
          </View>
          <View className="flex-row justify-between w-full mt-4">
            <Text className="text-lg" style={{ color: Colorizer(primaryColor, 1.0), fontFamily: "Lobster_Regular" }}>
              {formatBytes(downloadRate)}/s
            </Text>
            <Text className="text-lg" style={{ color: Colorizer(primaryColor, 1.0), fontFamily: "Lobster_Regular" }}>
              ETA: {formatTime(eta)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
const PreviewImage: React.FC<{ selectedImage: ImageMetadata; screenWidth: number; onViewFullScreen: () => void }> = ({ selectedImage, screenWidth, onViewFullScreen }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const aspectRatio = selectedImage.width / selectedImage.height;
  const imageHeight = (screenWidth / aspectRatio) * 0.7;
  const scaleValue = useRef(new Animated.Value(1.1)).current;
  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(scaleValue, { toValue: 1.4, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ]);
    Animated.loop(animation).start();
  }, [scaleValue]);
  const lowResLink = createPreviewLink(selectedImage);
  const highResLink = lowResLink.replace("min", "max");
  return (
    <View className="relative">
      <View className="absolute inset-0 z-50 justify-center items-center">
        {!imageLoading && (
          <View className="rounded-full p-1 mb-28" style={{ backgroundColor: Colorizer("#0C0C0C", 0.8), justifyContent: "center", alignItems: "center" }}>
            <Image
              alt="logo"
              contentFit="contain"
              cachePolicy="memory-disk"
              source={require("@/assets/picWall.png")}
              style={{ width: 70, height: 70, borderWidth: 1, borderRadius: 9999, borderColor: Colorizer("#FFFFFF", 1.0) }}
            />
          </View>
        )}
      </View>
      {imageLoading && (
        <View className="absolute inset-0 z-40 justify-center items-center" style={{ backgroundColor: Colorizer("#0C0C0C", 1.0) }}>
          <ActivityIndicator size="large" color={Colorizer(selectedImage.primary, 1.0)} />
          <Text className="mt-2.5" style={{ fontFamily: "Lobster_Regular", color: Colorizer(selectedImage.primary, 1.0) }}>
            Loading HD Image Preview...
          </Text>
        </View>
      )}
      <Animated.View className="overflow-hidden rounded-t-3xl" style={[{ width: "100%", height: imageHeight, borderTopLeftRadius: 20, borderTopRightRadius: 20, transform: [{ scale: scaleValue }] }]}>
        <Image
          contentFit="cover"
          cachePolicy="memory-disk"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          source={{ uri: highResLink }}
          style={{ width: "100%", height: "100%", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          onError={() => {
            setImageLoading(false);
            Alert.alert("Error", "Failed to load image. Please try again.");
          }}
        />
      </Animated.View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onViewFullScreen}
        className="absolute bottom-2 mx-4 px-4 py-2 z-50 flex-row items-center justify-center"
        style={{ backgroundColor: Colorizer(selectedImage.secondary, 0.9), borderColor: Colorizer(selectedImage.primary, 1.0), width: screenWidth - 32, borderRadius: 20, borderWidth: 2 }}
      >
        <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
          Set as Wallpaper
        </Text>
        <FontAwesome6 name="mobile-button" size={15} color={Colorizer("#FFFFFF", 1.0)} style={{ margin: 4 }} />
        <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
          (Full-Screen View)
        </Text>
      </TouchableOpacity>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
interface DownloadButtonProps {
  onDownload?: (event: any) => void;
  colors: { primary: string; secondary: string; tertiary: string };
}
const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload, colors }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleValue]);
  return (
    <TouchableOpacity onPress={onDownload} activeOpacity={0.8} className="mt-2 rounded-2xl overflow-hidden" style={{ backgroundColor: Colorizer(colors.primary, 0.4) }}>
      <Animated.View className="flex-row items-center justify-center p-3" style={{ transform: [{ scale: scaleValue }] }}>
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
            Download Wallpaper
          </Text>
          <FontAwesome5 name="download" size={15} color={Colorizer("#FFFFFF", 1.0)} style={{ marginHorizontal: 8 }} />
          <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
            (Highest Quality)
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
interface OtherImagesProps {
  primaryColor: string;
  tertiaryColor: string;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  otherImages: { img: ImageMetadata; idx: number }[];
}
const OtherImages: React.FC<OtherImagesProps> = ({ otherImages, setCurrentIndex, primaryColor, tertiaryColor, currentIndex }) => {
  const uniqueFileNames = new Set<string>();
  const uniqueImages = otherImages.filter((item) => {
    if (!item || !item.img) return false;
    const { img } = item;
    if (uniqueFileNames.has(img.original_file_name) || img.original_file_name === otherImages[currentIndex]?.img?.original_file_name) return false;
    uniqueFileNames.add(img.original_file_name);
    return true;
  });
  return (
    <View className="p-1 my-2 rounded-2xl" style={{ backgroundColor: Colorizer(primaryColor, 0.2) }}>
      <View className="p-1 rounded-2xl" style={{ backgroundColor: Colorizer(tertiaryColor, 0.2) }}>
        <Text className="ml-2 text-xl" style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0) }}>
          Other Wallpapers:
        </Text>
        <View className="flex-row flex-wrap my-1">
          {uniqueImages.map(({ img, idx }) => {
            if (!img) return null;
            const lowResLink = createPreviewLink(img);
            return (
              <TouchableOpacity
                key={idx}
                className="relative rounded-2xl overflow-hidden mx-0.5 flex-1"
                style={{ aspectRatio: 9 / 16, borderRadius: 10, borderWidth: 1, borderColor: Colorizer(primaryColor, 1.0) }}
                onPress={() => setCurrentIndex(idx)}
              >
                <Image source={{ uri: lowResLink }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                <View className="absolute top-1 left-1 bg-black/50 px-1 py-1 rounded-lg">
                  <Text className="text-white text-xs" style={{ fontFamily: "Lobster_Regular" }}>
                    {img.original_file_name.replace(".jpg", "")}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
interface WallModalProps {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
  wallType: "HOME" | "LOCK" | "BOTH";
  primaryColor: string;
}
const WallModal: React.FC<WallModalProps> = ({ visible, onComplete, onCancel, wallType, primaryColor }) => {
  const [countdown, setCountdown] = useState(5);
  const [modalAnim] = useState(new Animated.Value(0));
  const countdownRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (visible) {
      setCountdown(5);
      Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      Animated.timing(modalAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      clearInterval(countdownRef.current);
    }
    return () => {
      clearInterval(countdownRef.current);
    };
  }, [visible, modalAnim, onComplete]);
  const backdropStyle = { opacity: modalAnim };
  const scale = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const modalStyle = { opacity: modalAnim, transform: [{ scale }] };
  if (!visible) return null;
  return (
    <View className="absolute inset-0 justify-center items-center">
      <Animated.View className="absolute inset-0" style={[{ backgroundColor: Colorizer("#0C0C0C", 0.5) }, backdropStyle]} />
      <Animated.View className="w-4/5 rounded-3xl p-5 border-4" style={[{ backgroundColor: Colorizer("#0C0C0C", 1.0), borderColor: Colorizer(primaryColor, 1.0) }, modalStyle]}>
        <View className="items-center">
          <MaterialIcons name="warning" size={50} color={Colorizer(primaryColor, 1.0)} />
          <Text className="mt-2.5 text-5xl" style={{ fontFamily: "Lobster_Regular", color: Colorizer(primaryColor, 1.0) }}>
            {wallType === "BOTH" ? "Setting Both Screens" : wallType === "HOME" ? "Setting HomeScreen" : "Setting LockScreen"}
          </Text>
          <Text className="my-2.5 text-center text-lg" style={{ fontFamily: "Lobster_Regular", color: Colorizer(primaryColor, 1.0) }}>
            Due to Android's Material You, the system UI will restart after setting the wallpaper. This is normal behavior.
          </Text>
          <Text className="text-6xl my-4" style={{ fontFamily: "Lobster_Regular", color: Colorizer(primaryColor, 1.0) }}>
            {countdown}
          </Text>
          <TouchableOpacity
            className="mt-2.5 px-5 py-2 rounded-2xl overflow-hidden"
            style={{ backgroundColor: Colorizer(primaryColor, 0.4) }}
            onPress={() => {
              clearInterval(countdownRef.current);
              onCancel();
            }}
          >
            <Text className="text-white text-lg" style={{ fontFamily: "Lobster_Regular" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
interface FullScreenViewProps {
  isFullScreen: boolean;
  selectedIndex: number;
  data: ImageMetadata[];
  environment_title: string;
  selectedImage: ImageMetadata;
  setIsFullScreen: (isFullScreen: boolean) => void;
}
const FullScreenView: React.FC<FullScreenViewProps> = ({ isFullScreen, setIsFullScreen, selectedImage, selectedIndex, data, environment_title }) => {
  const [showWallModal, setShowWallModal] = useState(false);
  const [wallType, setWallType] = useState<"HOME" | "LOCK" | "BOTH">("HOME");
  const saveCurrentState = async () => {
    const { setLastState } = useAppState.getState();
    const stateToSave = { selectedIndex, data, environment_title };
    setLastState(stateToSave);
  };
  const handleWallpaperSet = async () => {
    await saveCurrentState();
    const lowResLink = createPreviewLink(selectedImage);
    const highResLink = lowResLink.replace("min", "max");
    await setWallpaper({ uri: highResLink }, TYPE_SCREEN[wallType]);
    setShowWallModal(false);
  };
  return (
    <Modal visible={isFullScreen} transparent={false} onRequestClose={() => setIsFullScreen(false)} presentationStyle="fullScreen" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: Colorizer("#0C0C0C", 1.0) }}>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} showsHorizontalScrollIndicator={false}>
          <Image contentFit="fill" source={{ uri: createPreviewLink(selectedImage).replace("min", "max") }} style={{ height: "100%", width: (Dimensions.get("window").height * 9) / 16 }} />
        </ScrollView>
        <View style={{ position: "absolute", bottom: 8, left: 10, right: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <LinearGradient
            end={[1, 0]}
            start={[0, 0]}
            style={{ flex: 1, height: 40, borderTopLeftRadius: 5, borderBottomLeftRadius: 20, marginHorizontal: 1 }}
            colors={[Colorizer(selectedImage.primary, 1.0), Colorizer(selectedImage.primary, 0.9), Colorizer(selectedImage.primary, 0.8)]}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }}
              onPress={() => {
                setWallType("LOCK");
                setShowWallModal(true);
              }}
            >
              <Ionicons name="image" size={20} color={Colorizer("#FFFFFF", 1.0)} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "Lobster_Regular" }}>Set LockScreen</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
            end={[1, 0]}
            start={[0, 0]}
            style={{ flex: 1, height: 40, marginHorizontal: 1 }}
            colors={[Colorizer(selectedImage.primary, 1.0), Colorizer(selectedImage.primary, 0.9), Colorizer(selectedImage.primary, 0.8)]}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }}
              onPress={() => {
                setWallType("HOME");
                setShowWallModal(true);
              }}
            >
              <Ionicons name="image" size={20} color={Colorizer("#FFFFFF", 1.0)} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "Lobster_Regular" }}>Set HomeScreen</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
            end={[1, 0]}
            start={[0, 0]}
            style={{ flex: 1, height: 40, borderTopRightRadius: 5, borderBottomRightRadius: 20, marginHorizontal: 1 }}
            colors={[Colorizer(selectedImage.primary, 1.0), Colorizer(selectedImage.primary, 0.9), Colorizer(selectedImage.primary, 0.8)]}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }}
              onPress={() => {
                setWallType("BOTH");
                setShowWallModal(true);
              }}
            >
              <Ionicons name="image" size={20} color={Colorizer("#FFFFFF", 1.0)} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "Lobster_Regular" }}>Set BothScreens</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <WallModal visible={showWallModal} onComplete={handleWallpaperSet} onCancel={() => setShowWallModal(false)} wallType={wallType} primaryColor={selectedImage.primary} />
      </View>
    </Modal>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
export default function ImagePage(): JSX.Element {
  const params = useLocalSearchParams();
  const [eta, setEta] = useState<number>(0);
  const rawDataString = params.data as string;
  const Sanitized = JSON.parse(rawDataString);
  const downloadStartTime = useRef<number>(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [percentage, setPercentage] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadRate, setDownloadRate] = useState<number>(0);
  const [alertIcon, setAlertIcon] = useState<"error" | "checkmark-done-circle">("checkmark-done-circle");
  const [currentIndex, setCurrentIndex] = useState(() => {
    const parsedIndex = parseInt(Sanitized.selectedIndex);
    return !isNaN(parsedIndex) ? parsedIndex : 0;
  });
  const selectedImage = Sanitized.data[currentIndex] as ImageMetadata;
  const environmentTitle = Sanitized.environment_title as string;
  const showAlert = (title: string, message: string, iconName: "error" | "checkmark-done-circle") => {
    setAlertMessage(message);
    setAlertIcon(iconName);
    setAlertVisible(true);
  };
  const hideAlert = () => setAlertVisible(false);
  const downloadAndSaveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Required", "Please grant media library permissions to save the image.", "error");
        return;
      }
      setIsDownloading(true);
      setPercentage(0);
      setDownloadRate(0);
      setEta(0);
      downloadStartTime.current = Date.now();
      const fileUri = FileSystem.documentDirectory + selectedImage.original_file_name;
      const highResLink = createDownloadLink(selectedImage).replace("min", "max");
      const downloadResumable = FileSystem.createDownloadResumable(highResLink, fileUri, {}, (downloadProgressEvent) => {
        const progress = downloadProgressEvent.totalBytesWritten / downloadProgressEvent.totalBytesExpectedToWrite;
        setPercentage(progress * 100);
        const elapsedTime = (Date.now() - downloadStartTime.current) / 1000;
        if (elapsedTime > 0) {
          const rate = downloadProgressEvent.totalBytesWritten / elapsedTime;
          setDownloadRate(rate);
          const remainingBytes = downloadProgressEvent.totalBytesExpectedToWrite - downloadProgressEvent.totalBytesWritten;
          const estimatedTime = remainingBytes / rate;
          setEta(estimatedTime);
        }
      });
      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) {
        showAlert("Download Failed", "Unable to download the image.", "error");
        setIsDownloading(false);
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      const album = await MediaLibrary.getAlbumAsync("Download");
      if (!album) await MediaLibrary.createAlbumAsync("Download", asset, false);
      else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      setIsDownloading(false);
      showAlert("Success", "The image has been saved to your gallery.", "checkmark-done-circle");
    } catch (error) {
      setIsDownloading(false);
      showAlert("Error", "An error occurred while downloading or saving the image." + error, "error");
    }
  };
  const allImages = Sanitized.data as ImageMetadata[];
  const allImagesWithIndex = allImages.map((img, idx) => ({ img, idx }));
  const otherImages = allImagesWithIndex.filter((item) => item.idx !== currentIndex);
  return (
    <View className="flex-1" style={{ backgroundColor: Colorizer("#0C0C0C", 1.0) }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView className="flex-1">
        <PreviewImage selectedImage={selectedImage} screenWidth={screenWidth} onViewFullScreen={() => setIsFullScreen(true)} />
        <View className="p-4 border-2 rounded-3xl" style={{ borderColor: Colorizer(selectedImage.primary, 1.0), backgroundColor: Colorizer("#0C0C0C", 1.0) }}>
          <Text className="mb-2 text-3xl text-center" style={{ fontFamily: "Lobster_Regular", color: Colorizer(selectedImage.primary, 1.0) }}>
            {selectedImage.original_file_name.replace(".jpg", "")}
          </Text>
          {[
            { label: "Mode", value: selectedImage.mode },
            { label: "FileSize", value: `${selectedImage.file_size_megabytes} mb` },
            { label: "Dimensions", value: `${selectedImage.width} x ${selectedImage.height}` }
          ].map((item, index) => (
            <View key={index} className="flex-row items-center my-2">
              <FontAwesome5 name={index === 0 ? "adjust" : index === 1 ? "file-alt" : "ruler-combined"} size={16} color={Colorizer(selectedImage.primary, 1.0)} className="ml-1" />
              <View className="flex-row items-center mx-1">
                <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer(selectedImage.primary, 1.0) }}>{item.label}:</Text>
                <Text className="ml-2" style={{ fontFamily: "Lobster_Regular", color: Colorizer(selectedImage.primary, 1.0) }}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
          <DownloadButton onDownload={downloadAndSaveImage} colors={{ primary: selectedImage.primary, secondary: selectedImage.primary, tertiary: selectedImage.primary }} />
          <OtherImages otherImages={otherImages} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} primaryColor={selectedImage.primary} tertiaryColor={selectedImage.tertiary} />
        </View>
        <Footer />
      </ScrollView>
      <FullScreenView isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} selectedImage={selectedImage} selectedIndex={currentIndex} data={allImages} environment_title={environmentTitle} />
      <DownloadingModal visible={isDownloading} percentage={percentage} downloadRate={downloadRate} eta={eta} primaryColor={selectedImage.primary} />
      <SuccessModal visible={alertVisible && alertIcon === "checkmark-done-circle"} message={alertMessage} onClose={hideAlert} />
      <ErrorModal visible={alertVisible && alertIcon === "error"} message={alertMessage} onClose={hideAlert} />
    </View>
  );
}
