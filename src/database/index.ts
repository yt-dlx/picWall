import Anime_Monochrome from "./Anime - Monochrome";
import Anime_Background from "./Anime - Background";
import Anime_Illustration from "./Anime - Illustration";
import Anime_Manga from "./Anime - Manga";
import DSLR_Photograpgy from "./DSLR - Photography";
import Graphic_2D_Design from "./Graphic - 2D Design";
import Graphic_3D_Design from "./Graphic - 3D Design";
import Graphic_ArtDeco from "./Graphic - Art Deco";
import Graphic_PopArt from "./Graphic - Pop Art";
import Graphic_Vector from "./Graphic - Vector";
import Portrait_Bokeh from "./Portrait - Bokeh";
import Portrait_Cinematic from "./Portrait - Cinematic";
import Portrait_CloseUp from "./Portrait - Close Up";
import Portrait_Fashion from "./Portrait - Fashion";
import Portrait_Film from "./Portrait - Film";
import Portrait_Moody from "./Portrait - Moody";
import Portrait_Retro from "./Portrait - Retro";
const picWall = {
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
export default picWall;
