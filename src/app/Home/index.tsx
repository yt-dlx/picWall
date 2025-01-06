// /src/app/Home/index.tsx
/* ============================================================================================ */
/* ============================================================================================ */
import { Link } from "expo-router";
import { Image } from "expo-image";
import metaBase from "@/database";
import { BlurView } from "expo-blur";
import Colorizer from "@/utils/Colorizer";
import Footer from "@/components/Footer";
import { LinearGradient } from "expo-linear-gradient";
import HeaderAnimate from "@/components/HeaderAnimated";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { EnvironmentEntry, ImageMetadata } from "@/types/database";
import { createPreviewLink, createDownloadLink } from "@/utils/linker";
import React, { useEffect, useRef, useCallback, useState, memo, FC } from "react";
import { SubImagesProps, CardProps, CategoryButtonProps } from "@/types/components";
import { Easing, useSharedValue, useAnimatedStyle, withTiming, withRepeat } from "react-native-reanimated";
import { Animated, View, Text, TouchableOpacity, FlatList, StatusBar, ScrollView, TextInput, Modal, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
/* ============================================================================================ */
/* ============================================================================================ */
type ParentKey = keyof typeof metaBase;
interface Category {
  name: ParentKey | "Shuffle Wallpapers";
  subcategories: string[];
  database: Partial<Record<string, Record<string, EnvironmentEntry>>>;
}
interface CategoryButtonExtendedProps extends CategoryButtonProps {
  selected: boolean;
  onPress: () => void;
}
/* ============================================================================================ */
/* ============================================================================================ */
function generateCategories(base: typeof metaBase) {
  let shuffleDB: Record<string, EnvironmentEntry> = {};
  const categoriesArray: Category[] = [{ name: "Shuffle Wallpapers", subcategories: [], database: {} }];
  Object.keys(base).forEach((parent) => {
    const typedParent = parent as ParentKey;
    const subObj = base[typedParent];
    const subCategories = Object.keys(subObj);
    const db: Partial<Record<string, Record<string, EnvironmentEntry>>> = {};
    subCategories.forEach((subKey) => {
      const environmentEntries = subObj[subKey as keyof typeof subObj] as Record<string, EnvironmentEntry>;
      shuffleDB = { ...shuffleDB, ...environmentEntries };
      db[subKey] = environmentEntries;
    });
    categoriesArray.push({ name: typedParent, subcategories: [...subCategories, "Mixed-All"], database: db });
  });
  return { categoriesArray, shuffleDB };
}
const { categoriesArray: rawCategoriesArray, shuffleDB } = generateCategories(metaBase);
/* ============================================================================================ */
/* ============================================================================================ */
const SearchBar: FC<{ onSearch: (text: string) => void }> = memo(({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };
  return (
    <View style={{ padding: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: Colorizer("#242424", 1.0), borderRadius: 9999, paddingHorizontal: 12, height: 30 }}>
        <FontAwesome5 name="search" size={16} color={Colorizer("#FFFFFF", 0.6)} />
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by image name..."
          placeholderTextColor={Colorizer("#FFFFFF", 0.6)}
          style={{ flex: 1, marginLeft: 8, fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0) }}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <FontAwesome5 name="times" size={16} color={Colorizer("#FFFFFF", 0.6)} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
SearchBar.displayName = "SearchBar";
/* ============================================================================================ */
/* ============================================================================================ */
const SubImages: FC<SubImagesProps> = memo(({ images, onImagePress }) => (
  <View className="flex flex-col justify-start">
    {images.data.map((image, index) => {
      const fullDataIndex = images.allData.findIndex((img) => img.original_file_name === image.original_file_name);
      return (
        <Link key={index} href={{ pathname: "/Admob", params: { data: JSON.stringify({ environment_title: images.environment_title, selectedIndex: fullDataIndex, data: images.allData }) } }} asChild>
          <TouchableOpacity onPress={() => onImagePress(image.previewLink as string, fullDataIndex)} className="p-[0.2px] flex-1">
            <View className="relative">
              <Image
                source={{ uri: image.previewLink as string }}
                style={{ height: 50, borderWidth: 1, width: "100%", borderRadius: 4, borderColor: Colorizer(image.primary, 0.5) }}
                cachePolicy="memory-disk"
                contentFit="cover"
              />
              <Text
                className="absolute m-1 bottom-1 right-1 px-2 text-xs rounded-2xl"
                style={{ fontFamily: "Lobster_Regular", color: Colorizer("#0C0C0C", 1.0), backgroundColor: Colorizer(image.primary, 1.0) }}
              >
                {image.primary.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      );
    })}
  </View>
));
SubImages.displayName = "SubImages";
/* ============================================================================================ */
/* ============================================================================================ */
const Card: FC<CardProps> = memo(({ data }) => {
  const textScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const imageFadeValue = useRef(new Animated.Value(1)).current;
  const [currentImage, setCurrentImage] = useState<string>(data.images[0]?.previewLink as string);
  const [loading, setLoading] = useState<boolean>(false);
  const updateImageState = useCallback(
    (nextIndex: number) => {
      setCurrentIndex(nextIndex);
      setCurrentImage(data.images[nextIndex]?.previewLink as string);
    },
    [data.images]
  );
  const animateImageOut = useCallback(
    (cb: () => void) => {
      Animated.timing(imageFadeValue, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => cb());
    },
    [imageFadeValue]
  );
  const animateImageIn = useCallback(() => {
    Animated.timing(imageFadeValue, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  }, [imageFadeValue]);
  const animateText = useCallback(() => {
    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(textScale, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ]).start();
  }, [textOpacity, textScale]);
  const startTransition = useCallback(
    (nextIndex: number) => {
      animateImageOut(() => {
        updateImageState(nextIndex);
        animateImageIn();
        animateText();
      });
    },
    [animateImageOut, animateImageIn, animateText, updateImageState]
  );
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.images.length;
      startTransition(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, data.images.length, startTransition]);
  useEffect(() => {
    updateImageState(0);
  }, [data, updateImageState]);
  return (
    <View className="rounded-xl overflow-hidden border mb-1" style={{ backgroundColor: Colorizer("#0C0C0C", 1.0), borderColor: Colorizer(data.images[currentIndex].primary, 0.2) }}>
      <Link href={{ pathname: "/Admob", params: { data: JSON.stringify({ environment_title: data.environment_title, selectedIndex: currentIndex, data: data.images }) } }} asChild>
        <TouchableOpacity>
          <View className="relative aspect-[9/16] w-full overflow-hidden">
            <Animated.Image
              source={{ uri: currentImage }}
              style={{ width: "100%", height: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5, opacity: imageFadeValue }}
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
            />
            {loading && (
              <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -10 }, { translateY: -10 }] }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
            <View className="absolute bottom-0 left-0 right-0 items-center justify-start">
              <Animated.Text
                style={{
                  opacity: textOpacity,
                  textAlign: "center",
                  fontFamily: "Lobster_Regular",
                  transform: [{ scale: textScale }],
                  color: Colorizer("#0C0C0C", 1.0),
                  backgroundColor: Colorizer(data.images[currentIndex].primary, 10.0)
                }}
                className="text-sm m-1 px-1 rounded-xl"
              >
                {data.images[currentIndex].original_file_name.replace(/_/g, " ").replace(".jpg", "")}
              </Animated.Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
      <View className="flex flex-row p-0.5">
        <View className="w-1/2">
          <SubImages
            onImagePress={(previewLink, index) => startTransition(index)}
            images={{
              allData: data.images,
              data: data.images.slice(0, 2),
              selectedIndex: currentIndex,
              environment_title: data.environment_title
            }}
          />
        </View>
        <View className="w-1/2">
          <SubImages
            onImagePress={(previewLink, index) => startTransition(index)}
            images={{
              allData: data.images,
              data: data.images.slice(2, 4),
              selectedIndex: currentIndex,
              environment_title: data.environment_title
            }}
          />
        </View>
      </View>
      <View className="border-t items-center justify-center py-0.5" style={{ backgroundColor: Colorizer(data.images[currentIndex].primary, 1.0) }}>
        <Text style={{ fontFamily: "Dm_Serif_Display_Regular", color: Colorizer("#0C0C0C", 1.0), fontSize: 10 }}>picWall AI</Text>
      </View>
    </View>
  );
});
Card.displayName = "Card";
/* ============================================================================================ */
/* ============================================================================================ */
interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (parent: ParentKey | "Shuffle Wallpapers", child?: string) => void;
}

const CategoryModal: FC<CategoryModalProps> = ({ isVisible, onClose, onSelectCategory }) => {
  const [previewLinks, setPreviewLinks] = useState<Record<string, string>>({});
  const [activeParent, setActiveParent] = useState<ParentKey | "Shuffle Wallpapers">(rawCategoriesArray.find((cat) => cat.name !== "Shuffle Wallpapers")?.name || "Shuffle Wallpapers");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const grayscaleOpacity = scale.interpolate({ inputRange: [1, 1.06], outputRange: [0.6, 0] });

  const generatePreviewLinks = useCallback(() => {
    const newLinks: Record<string, string> = {};
    rawCategoriesArray.forEach((cat) => {
      if (cat.name === "Shuffle Wallpapers") return;
      const combinedEnvs: EnvironmentEntry[] = [];
      cat.subcategories
        .filter((sub) => sub !== "Mixed-All")
        .forEach((sub) => {
          const subObj = cat.database[sub];
          if (subObj) combinedEnvs.push(...Object.values(subObj));
        });
      if (combinedEnvs.length) {
        const firstEnv = combinedEnvs[0];
        if (firstEnv.images.length) newLinks[cat.name] = createPreviewLink(firstEnv.images[0]);
      }
      cat.subcategories.forEach((subCat) => {
        const subObj = cat.database[subCat];
        if (subObj) {
          const envEntries = Object.values(subObj);
          if (envEntries.length && envEntries[0].images.length) newLinks[`${cat.name}-${subCat}`] = createPreviewLink(envEntries[0].images[0]);
        }
      });
    });
    setPreviewLinks(newLinks);
  }, []);

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      mass: 0.8,
      stiffness: 100
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        mass: 0.8,
        stiffness: 100
      }).start();
      generatePreviewLinks();
    }
  }, [isVisible, generatePreviewLinks, slideAnim]);

  useEffect(() => {
    if (animationRef.current) animationRef.current.stop();
    scale.setValue(1);
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    );
    animationRef.current.start();
    return () => {
      if (animationRef.current) animationRef.current.stop();
    };
  }, [activeParent, scale]);

  if (!modalVisible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get("window").height, 0]
  });

  return (
    <Modal visible transparent animationType="none">
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={[{ transform: [{ translateY }] }, { height: Dimensions.get("window").height * 0.9, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" experimentalBlurMethod="dimezisBlurView" blurReductionFactor={4} />
          <View style={{ flex: 1, backgroundColor: Colorizer("#0C0C0C", 0.9) }}>
            <View className="flex-row justify-between items-center p-4 border-b border-white">
              <Text className="text-3xl" style={{ fontFamily: "Lobster_Regular", color: "#FFFFFF" }}>
                Categories & Their Styles
              </Text>
              <TouchableOpacity onPress={handleClose} className="p-2">
                <FontAwesome5 name="times" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-1">
              <View className="w-1/3">
                <ScrollView className="h-full">
                  {rawCategoriesArray
                    .filter((cat) => cat.name !== "Shuffle Wallpapers")
                    .map((category) => (
                      <TouchableOpacity
                        key={String(category.name)}
                        onPress={() => {
                          setActiveParent(category.name);
                          setSelectedSubcategory(null);
                        }}
                        className="relative py-6 border-l-8 rounded-r-lg"
                        style={activeParent === category.name ? { borderColor: "#FFFFFF", backgroundColor: Colorizer("#0C0C0C", 1.0) } : { borderColor: "transparent", backgroundColor: "transparent" }}
                      >
                        <Image source={{ uri: previewLinks[category.name] }} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" />
                        <LinearGradient colors={["transparent", Colorizer("#0C0C0C", 0.8)]} style={{ position: "absolute", width: "100%", height: "100%" }} />
                        <Text
                          style={{ fontFamily: "Lobster_Regular", fontSize: activeParent === category.name ? 20 : 15, color: activeParent === category.name ? "#FFFFFF" : Colorizer("#FFFFFF", 0.5) }}
                          className="relative ml-4 z-10"
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
              <View className="flex-1 border-l border-white/40">
                <ScrollView className="h-full">
                  <View className="flex-row flex-wrap">
                    {rawCategoriesArray
                      .find((c) => c.name === activeParent)
                      ?.subcategories.sort((a, b) => (a === "Mixed-All" ? -1 : b === "Mixed-All" ? 1 : 0))
                      .map((child) => (
                        <TouchableOpacity
                          key={child}
                          onPress={() => {
                            setSelectedSubcategory(child);
                            onSelectCategory(activeParent, child === "Mixed-All" ? "Mixed-All" : child);
                            handleClose();
                          }}
                          className="w-full p-1"
                        >
                          <View className={`rounded-2xl overflow-hidden border aspect-video ${selectedSubcategory === child ? "border-2 border-[#FFFFFF]" : "border-white/20"}`}>
                            {child === "Mixed-All" ? (
                              <Image source={require("@/assets/shuffle.gif")} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                            ) : (
                              <Animated.View style={{ transform: [{ scale }] }}>
                                <Image source={{ uri: previewLinks[`${activeParent}-${child}`] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                                <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "black", opacity: grayscaleOpacity }} />
                              </Animated.View>
                            )}
                            <LinearGradient colors={["transparent", Colorizer("#0C0C0C", 0.8)]} className="absolute inset-0" />
                            <View className="absolute inset-0 justify-end p-4">
                              <Text className="text-center text-lg" style={{ fontFamily: "Lobster_Regular", color: "#FFFFFF" }}>
                                Style - {child}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
/* ============================================================================================ */
/* ============================================================================================ */
const CategoryButton: FC<CategoryButtonExtendedProps> = memo(({ category, selected, onPress }) => {
  const [currentImage, setCurrentImage] = useState<string>("");
  const updateShuffleImage = useCallback(() => {
    if (category === "All Categories") {
      const allImages: string[] = [];
      rawCategoriesArray.forEach((cat) => {
        if (cat.name === "Shuffle Wallpapers") return;
        cat.subcategories
          .filter((s) => s !== "Mixed-All")
          .forEach((sub) => {
            const subObj = cat.database[sub];
            if (subObj) Object.values(subObj).forEach((env) => env.images.forEach((img) => allImages.push(createPreviewLink(img))));
          });
      });
      if (allImages.length) setCurrentImage(allImages[Math.floor(Math.random() * allImages.length)]);
    }
  }, [category]);
  useEffect(() => {
    updateShuffleImage();
  }, [updateShuffleImage]);
  return (
    <TouchableOpacity onPress={() => onPress()} style={{ flex: 1, height: 80, width: "100%", borderWidth: 1, borderColor: Colorizer("#FFFFFF", 0.1), borderRadius: 10, margin: 1, overflow: "hidden" }}>
      <View style={{ borderRadius: 4, overflow: "hidden", width: "100%", height: "100%" }}>
        <Image source={category === "Shuffle Wallpapers" ? require("@/assets/shuffle.gif") : { uri: currentImage }} style={{ width: "100%", height: "100%", borderRadius: 10 }} contentFit="cover" />
        <LinearGradient colors={["transparent", Colorizer("#0C0C0C", 0.5), Colorizer("#0C0C0C", 1.0)]} style={{ position: "absolute", width: "100%", height: "100%", borderRadius: 10 }} />
        <View style={{ position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row", borderRadius: 10 }}>
          <FontAwesome6 name={category === "All Categories" ? "list" : "image"} size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0), fontSize: 14, textAlign: "center", paddingHorizontal: 4 }}> {category} </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
CategoryButton.displayName = "CategoryButton";
/* ============================================================================================ */
/* ============================================================================================ */
const HeaderComponent: FC<{
  selectedCategory: ParentKey | "Shuffle Wallpapers";
  onSelectCategory: (parent: ParentKey | "Shuffle Wallpapers", child?: string) => void;
  onSearch: (text: string) => void;
}> = memo(({ selectedCategory, onSelectCategory, onSearch }) => {
  const fadeInValue = useSharedValue(0);
  const leftIconTranslate = useSharedValue(0);
  const rightIconTranslate = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeInStyle = useAnimatedStyle(() => ({ opacity: fadeInValue.value }));
  const leftIconStyle = useAnimatedStyle(() => ({ transform: [{ translateX: leftIconTranslate.value }] }));
  const rightIconStyle = useAnimatedStyle(() => ({ transform: [{ translateX: rightIconTranslate.value }] }));
  useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 1200, easing: Easing.ease });
    leftIconTranslate.value = withRepeat(withTiming(-20, { duration: 800, easing: Easing.ease }), -1, true);
    rightIconTranslate.value = withRepeat(withTiming(20, { duration: 800, easing: Easing.ease }), -1, true);
  }, [fadeInValue, leftIconTranslate, rightIconTranslate]);
  return (
    <Animated.View style={fadeInStyle}>
      <View className="-m-2">
        <HeaderAnimate />
      </View>
      <View style={{ marginTop: 30, paddingRight: 6, paddingLeft: 6, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={leftIconStyle}>
            <FontAwesome5 name="caret-left" size={24} color="#FFFFFF" />
          </Animated.View>
          <Text style={{ fontFamily: "Lobster_Regular", fontSize: 20, color: "#FFFFFF", textAlign: "center", marginHorizontal: 10 }}>Explore Our AI Generated Wallpapers</Text>
          <Animated.View style={rightIconStyle}>
            <FontAwesome5 name="caret-right" size={24} color="#FFFFFF" />
          </Animated.View>
        </View>
        <SearchBar onSearch={onSearch} />
        <View className="flex-row justify-center">
          <CategoryButton category="Shuffle Wallpapers" selected={selectedCategory === "Shuffle Wallpapers"} onPress={() => onSelectCategory("Shuffle Wallpapers")} />
          <CategoryButton category="All Categories" selected={false} onPress={() => setModalVisible(true)} />
        </View>
        <CategoryModal isVisible={modalVisible} onClose={() => setModalVisible(false)} onSelectCategory={onSelectCategory} selectedCategory={String(selectedCategory)} />
      </View>
    </Animated.View>
  );
});
HeaderComponent.displayName = "HeaderComponent";
/* ============================================================================================ */
/* ============================================================================================ */
export default function HomePage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredData, setFilteredData] = useState<EnvironmentEntry[]>([]);
  const [selectedParent, setSelectedParent] = useState<ParentKey | "Shuffle Wallpapers">("Shuffle Wallpapers");
  const [selectedChild, setSelectedChild] = useState<string>("");
  const getAllCombinedData = useCallback(() => Object.values(shuffleDB), []);
  const processImageUrls = useCallback((entry: EnvironmentEntry): EnvironmentEntry => {
    return {
      ...entry,
      images: entry.images.map((image: ImageMetadata) => ({
        ...image,
        previewLink: createPreviewLink(image),
        downloadLink: createDownloadLink(image)
      }))
    };
  }, []);
  const fetchData = useCallback(() => {
    if (selectedParent === "Shuffle Wallpapers") {
      const allEntries = getAllCombinedData().map(processImageUrls);
      const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
      setFilteredData(shuffled);
      return;
    }
    const catObj = rawCategoriesArray.find((c) => c.name === selectedParent);
    if (!catObj) {
      setFilteredData([]);
      return;
    }
    if (!selectedChild) {
      const bigCombine: EnvironmentEntry[] = [];
      catObj.subcategories
        .filter((s) => s !== "Mixed-All")
        .forEach((sub) => {
          const subEnv = catObj.database[sub];
          if (!subEnv) return;
          bigCombine.push(...Object.values(subEnv));
        });
      const processed = bigCombine.map(processImageUrls);
      const shuffled = [...processed].sort(() => Math.random() - 0.5);
      setFilteredData(shuffled);
      return;
    }
    if (selectedChild === "Mixed-All") {
      const combinedEntries: EnvironmentEntry[] = [];
      catObj.subcategories
        .filter((sub) => sub !== "Mixed-All")
        .forEach((sub) => {
          const subObj = catObj.database[sub];
          if (!subObj) return;
          Object.values(subObj).forEach((env) => {
            combinedEntries.push(env);
          });
        });
      const processed = combinedEntries.map(processImageUrls);
      const shuffled = [...processed].sort(() => Math.random() - 0.5);
      setFilteredData(shuffled);
      return;
    }
    const subObj = catObj.database[selectedChild];
    if (!subObj) {
      setFilteredData([]);
      return;
    }
    const processed = Object.values(subObj).map(processImageUrls);
    const shuffled = [...processed].sort(() => Math.random() - 0.5);
    setFilteredData(shuffled);
  }, [selectedParent, selectedChild, getAllCombinedData, processImageUrls]);
  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      const searchText = text.toLowerCase().trim();
      if (!searchText) {
        fetchData();
        return;
      }
      setFilteredData((prev) => {
        const results = prev
          .map((entry) => {
            const matchedImgs = entry.images.filter((img) => img.original_file_name.toLowerCase().replace(/_/g, " ").replace(".jpg", "").includes(searchText));
            return { ...entry, images: matchedImgs };
          })
          .filter((x) => x.images.length > 0);
        return results;
      });
    },
    [fetchData]
  );
  useEffect(() => {
    fetchData();
  }, [fetchData, selectedParent, selectedChild]);
  const onSelectCategory = useCallback((parent: ParentKey | "Shuffle Wallpapers", child?: string) => {
    if (parent === "Shuffle Wallpapers") {
      setSelectedParent("Shuffle Wallpapers");
      setSelectedChild("");
      return;
    }
    setSelectedParent(parent);
    setSelectedChild(child || "");
  }, []);
  const renderItem = useCallback(
    ({ item }: { item: EnvironmentEntry }) => (
      <View style={{ flex: 1, margin: 1 }}>
        <Card data={item} />
      </View>
    ),
    []
  );
  const keyExtractor = useCallback((item: EnvironmentEntry) => item.environment_title, []);
  const renderEmptyList = useCallback(() => {
    if (searchQuery) {
      return (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 0.8), fontSize: 16, textAlign: "center" }}>No images found matching "{searchQuery}".</Text>
          <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 0.8), fontSize: 16, textAlign: "center" }}>You may request images from "Account" Section.</Text>
        </View>
      );
    }
    return null;
  }, [searchQuery]);
  return (
    <View style={{ backgroundColor: Colorizer("#0C0C0C", 1.0), flex: 1 }} className="relative">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        windowSize={2}
        data={filteredData}
        numColumns={2}
        initialNumToRender={4}
        renderItem={renderItem}
        maxToRenderPerBatch={6}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        ListFooterComponent={Footer}
        ListEmptyComponent={renderEmptyList}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ padding: 1 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListHeaderComponent={<HeaderComponent selectedCategory={selectedParent} onSelectCategory={onSelectCategory} onSearch={handleSearch} />}
      />
    </View>
  );
}
