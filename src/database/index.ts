import Anime_Monochrome from "./styles/Anime - Monochrome";
import Anime_Background from "./styles/Anime - Background";
import Anime_Illustration from "./styles/Anime - Illustration";
import Anime_Manga from "./styles/Anime - Manga";
import DSLR_Photograpgy from "./styles/DSLR - Photography";
import Graphic_2D_Design from "./styles/Graphic - 2D Design";
import Graphic_3D_Design from "./styles/Graphic - 3D Design";
import Graphic_ArtDeco from "./styles/Graphic - Art Deco";
import Graphic_PopArt from "./styles/Graphic - Pop Art";
import Graphic_Vector from "./styles/Graphic - Vector";
import Portrait_Bokeh from "./styles/Portrait - Bokeh";
import Portrait_Cinematic from "./styles/Portrait - Cinematic";
import Portrait_CloseUp from "./styles/Portrait - Close Up";
import Portrait_Fashion from "./styles/Portrait - Fashion";
import Portrait_Film from "./styles/Portrait - Film";
import Portrait_Moody from "./styles/Portrait - Moody";
import Portrait_Retro from "./styles/Portrait - Retro";
const metaBase = {
  Anime: {
    Monochrome: Anime_Monochrome,
    Background: Anime_Background,
    Illustration: Anime_Illustration,
    Manga: Anime_Manga
  },
  DSLR: {
    Photography: DSLR_Photograpgy
  },
  Graphic: {
    TwoDDesign: Graphic_2D_Design,
    ThreeDDesign: Graphic_3D_Design,
    ArtDeco: Graphic_ArtDeco,
    PopArt: Graphic_PopArt,
    Vector: Graphic_Vector
  },
  Portrait: {
    Bokeh: Portrait_Bokeh,
    Cinematic: Portrait_Cinematic,
    CloseUp: Portrait_CloseUp,
    Fashion: Portrait_Fashion,
    Film: Portrait_Film,
    Moody: Portrait_Moody,
    Retro: Portrait_Retro
  }
};
export default metaBase;
