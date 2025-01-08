type Category = {
  base: string;
  names: string[];
  subCategories: string[];
};
type ImageSet = string[];
const categories: Category[] = [
  {
    base: "Anime",
    subCategories: ["Background", "Illustration", "Manga", "Monochrome"],
    names: ["Bustling_City_Street", "Busy_Market", "Aerial_Battle", "Abandoned_Shrine"]
  },
  {
    base: "Graphic",
    subCategories: ["2D Design", "3D Design", "Art Deco", "Pop Art", "Vector"],
    names: ["Abstract_Flow", "Abstract_Architecture", "Chrysler_Elegance", "Colorful_Lips", "Celestial_Precision"]
  },
  {
    base: "DSLR",
    subCategories: ["Photography"],
    names: ["Beach_Vacation", "Corporate_Meeting", "Creative_Workspace", "Fitness_Routine", "Healthy_Breakfast", "Pet_Love", "Productivity_at_Work", "Remote_Work_Bliss"]
  },
  {
    base: "Portrait",
    subCategories: ["Bokeh", "Cinematic", "Close Up", "Fashion", "Film", "Moody", "Retro"],
    names: ["Evening_Elegance", "Candlelit_Mystery", "Focused_Athlete", "Classic_Elegance", "Golden_Hour_Breeze", "Eyes_of_Sorrow", "Classic_Fedora", "Golden_Hour_Glow"]
  }
];
const generateImageUrls = (category: Category): ImageSet => {
  const urls: ImageSet = [];
  category.names.forEach((name, index) => {
    const subCategory = category.subCategories[index % category.subCategories.length];
    const randomIndex = (): number => Math.floor(Math.random() * 4) + 1;
    urls.push(`https://raw.githubusercontent.com/yt-dlx/picWall/${category.base}/${subCategory}/min/${name} (${randomIndex()}).jpg`);
  });
  return urls;
};
const imageSets: ImageSet[] = categories.map((category) => generateImageUrls(category));
export default imageSets;
