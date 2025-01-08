import { ImageMetadata, EnvironmentEntry } from "./database";
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type ColorValue = RGB | RGBA | HEX | string;
interface SubImagesProps {
  images: { selectedIndex: number; data: ImageMetadata[]; environment_title: string; allData: ImageMetadata[] };
  onImagePress: (previewLink: string, index: number) => void;
}
interface CardTextProps {
  data: EnvironmentEntry;
  currentIndex: number;
}
interface CardProps {
  data: EnvironmentEntry;
}
interface AlphabetGroupProps {
  title: string;
  items: EnvironmentEntry[];
}
interface CategoryButtonProps {
  category: string;
}
interface DownloadScreenProps {
  environment_title: string;
  selectedIndex: number;
  data: ImageMetadata[];
}
type GroupedData = { [key: string]: EnvironmentEntry[] };
interface ScrollingSlotProps {
  images: string[];
  reverse: boolean;
  delay: number;
}
export type {
  RGB,
  HEX,
  RGBA,
  ColorValue,
  CardProps,
  GroupedData,
  CardTextProps,
  ImageMetadata,
  SubImagesProps,
  ScrollingSlotProps,
  EnvironmentEntry,
  AlphabetGroupProps,
  CategoryButtonProps,
  DownloadScreenProps
};
