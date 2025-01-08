import os
base_dir = "Themes"
themes = {
    "Nature Themes": [
        "Mountains", "Sunset", "Forest", "Blossoms", "Desert",
        "Aurora", "Rain", "Coral", "Snow", "Beach"
    ],
    "Space and Galaxy": [
        "Stars", "Milkyway", "Planets", "Nebula", "Astronautics",
        "Blackhole", "Spacecraft", "Earth", "Meteor", "Cosmos"
    ],
    "Abstract and Minimalist": [
        "Gradient", "Geometry", "Lineart", "Pastel", "Swirls",
        "Watercolor", "Monochrome", "Neon", "Patterns", "Symmetry"
    ],
    "Vintage and Retro": [
        "Posters", "Cars", "Neonlights", "Maps", "Polaroid",
        "Typewriter", "Rustic", "Psychedelic", "VHS", "Pixels"
    ],
    "Anime and Gaming": [
        "Frames", "Fantasy", "Landscapes", "Cyberpunk", "Cities",
        "Pixelart", "Quotes", "Consoles", "Avatars", "Logos"
    ],
    "Fantasy and Mythology": [
        "Dragons", "Castles", "Unicorns", "Magic", "Mermaids",
        "Fairytales", "Portals", "Villages", "Dystopia", "Creatures"
    ],
    "Animals and Wildlife": [
        "Wolves", "Tigers", "Birds", "Dolphins", "Kittens",
        "Puppies", "Butterflies", "Owls", "Horses", "Pandas"
    ],
    "Urban and Cityscapes": [
        "Skyline", "Tower", "Streets", "Graffiti", "Rooftops",
        "Bridges", "Sunsetcity", "Subways", "Markets", "Gardens"
    ],
    "Artistic and Textures": [
        "Holographic", "Oilpaint", "Sketches", "Mosaic", "Embroidery",
        "Marble", "Fabric", "Basket", "Notes", "Scribbles"
    ],
    "Lifestyle and Objects": [
        "Coffee", "Books", "Music", "Lanterns", "Watches",
        "Bikes", "Desk", "Workspace", "Candles", "Tea"
    ]
}
if not os.path.exists(base_dir):
    os.makedirs(base_dir)
for theme, subfolders in themes.items():
    theme_path = os.path.join(base_dir, theme)
    if not os.path.exists(theme_path):
        os.makedirs(theme_path)
    for subfolder in subfolders:
        subfolder_path = os.path.join(theme_path, subfolder)
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)
print("Folders and subfolders created successfully!")