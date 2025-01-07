# =================================================XX=================================================
# =================================================XX=================================================
# deformed hands, extra limbs, blurry, low quality, watermark, collage, split image, multiple panels, grid layout, split frame, multiple sections, deformed face, deformed eyes, asymmetrical features, extra fingers, extra eyes, distorted proportions, unnatural lighting, oversaturated colors, pixelated, artifacts, unrealistic anatomy, cropped composition, cut-off edges, double exposure, lens flare, text, logos, repetitive patterns, overexposed, underexposed, cartoonish, unrealistic shadows, noise, grain, unnatural expressions
# =================================================XX=================================================
# =================================================XX=================================================
import os
data = {
    "1. pajahek528": ["Geometry", ["2D", "3D", "Vector", "Pop Art"]],
    "2. nomijo1842": ["Realism", ["Long Exposure", "Minimalist", "Ray Traced"]],
    "3. peyefe4118": ["Anime", ["Background", "Semi Realism", "Illustration", "Monochrome", "Manga"]],
    "4. jehofe3770": ["Cinematic", ["Cinematic", "CloseUp", "Bokeh", "Film", "HDR", "Moody", "Retro", "Unprocessed"]],
    "5. jibowe3622": ["Geometry", ["2D", "3D", "Vector", "PopArt"]],
    "6. mohobon785": ["Realism", ["Long Exposure", "Minimalist", "Ray Traced"]],
    "7. jajad21269": ["Anime", ["Background", "Semi Realism", "Illustration", "Monochrome", "Manga"]],
    "8. sejodi5715": ["Cinematic", ["Cinematic", "CloseUp", "Bokeh", "Film", "HDR", "Moody", "Retro", "Unprocessed"]]
}
for email, (main_category, sub_categories) in data.items():
    email_dir = os.path.join("Generated", email)
    os.makedirs(email_dir, exist_ok=True)
    category_dir = os.path.join(email_dir, main_category)
    os.makedirs(category_dir, exist_ok=True)
    for sub_category in sub_categories:
        sub_dir = os.path.join(category_dir, sub_category)
        os.makedirs(sub_dir, exist_ok=True)