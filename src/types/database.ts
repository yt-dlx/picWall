type ImageMetadata = {
  type: string;
  mode: string;
  folder: string;
  format: string;
  branch: string;
  width: number;
  tertiary: string;
  height: number;
  primary: string;
  secondary: string;
  file_size_bytes: number;
  original_file_name: string;
  file_size_megabytes: number;
  [key: string]: string | number;
};
type EnvironmentEntry = {
  environment_title: string;
  images: ImageMetadata[];
};
export type { EnvironmentEntry, ImageMetadata };
