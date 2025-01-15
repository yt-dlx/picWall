// src/database/index.ts
import Anime_Background from "./styles/Anime - Background";
import Anime_Illustration from "./styles/Anime - Illustration";
import Anime_Manga from "./styles/Anime - Manga";
import Anime_Monochrome from "./styles/Anime - Monochrome";
import Anime_SemiRealism from "./styles/Anime - Semi Realism";
import Cinematic_Bokeh from "./styles/Cinematic - Bokeh";
import Cinematic_Cinematic from "./styles/Cinematic - Cinematic";
import Cinematic_CloseUp from "./styles/Cinematic - Close Up";
import Cinematic_Film from "./styles/Cinematic - Film";
import Cinematic_Moody from "./styles/Cinematic - Moody";
import Cinematic_Retro from "./styles/Cinematic - Retro";
import Cinematic_Unprocessed from "./styles/Cinematic - Unprocessed";
import Geometry_2D from "./styles/Geometry - 2D";
import Geometry_3D from "./styles/Geometry - 3D";
import Geometry_PopArt from "./styles/Geometry - Pop Art";
import Geometry_Vector from "./styles/Geometry - Vector";
import Realism_LongExposure from "./styles/Realism - Long Exposure";
import Realism_Minimalist from "./styles/Realism - Minimalist";
import Realism_RayTraced from "./styles/Realism - Ray Traced";
const metaBase: Record<string, Record<string, any>> = {
  Anime: {
    Monochrome: Anime_Monochrome,
    Background: Anime_Background,
    Illustration: Anime_Illustration,
    Manga: Anime_Manga,
    SemiRealism: Anime_SemiRealism
  },
  Cinematic: {
    Bokeh: Cinematic_Bokeh,
    Cinematic: Cinematic_Cinematic,
    CloseUp: Cinematic_CloseUp,
    Film: Cinematic_Film,
    Moody: Cinematic_Moody,
    Retro: Cinematic_Retro,
    Unprocessed: Cinematic_Unprocessed
  },
  Geometry: {
    TwoD: Geometry_2D,
    ThreeD: Geometry_3D,
    PopArt: Geometry_PopArt,
    Vector: Geometry_Vector
  },
  Realism: {
    LongExposure: Realism_LongExposure,
    Minimalist: Realism_Minimalist,
    RayTraced: Realism_RayTraced
  }
};
export default metaBase;
