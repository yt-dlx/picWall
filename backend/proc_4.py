import os
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor
def add_watermark_to_image(input_path, output_path, text, font_path, orientation, opacity=204):
    print(f"Processing image: {input_path}")
    image = Image.open(input_path).convert("RGBA")
    original_format = image.format
    watermark = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(watermark)
    font_size = int(image.size[0] / 50)
    font = ImageFont.truetype(font_path, font_size)
    if orientation == "portrait" or (orientation == "auto" and image.size[1] > image.size[0]):
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        position = (
            (image.size[0] - text_width) // 2,
            (image.size[1] - text_height) // 2
        )
        draw.text(position, text, font=font, fill=(255, 255, 255, opacity))
    elif orientation == "landscape" or (orientation == "auto" and image.size[0] >= image.size[1]):
        positions = generate_watermark_grid(image.size, text, font, spacing_multiplier=3.0)
        for position in positions:
            draw.text(position, text, font=font, fill=(255, 255, 255, opacity))
    watermarked_image = Image.alpha_composite(image, watermark).convert("RGB")
    watermarked_image.save(output_path, format=original_format, quality=100)
    print(f"Saved watermarked image: {output_path}")
def generate_watermark_grid(image_size, text, font, spacing_multiplier=3.0):
    draw = ImageDraw.Draw(Image.new("RGBA", image_size, (255, 255, 255, 0)))
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    spacing = int(max(text_width, text_height) * spacing_multiplier)
    positions = []
    for y in range(0, image_size[1], text_height + spacing):
        for x in range(0, image_size[0], text_width + spacing):
            positions.append((x, y))
    return positions
def process_images(input_folder, output_folder, text, font_path, orientation):
    os.makedirs(output_folder, exist_ok=True)
    for filename in os.listdir(input_folder):
        input_path = os.path.join(input_folder, filename)
        if os.path.isfile(input_path) and filename.lower().endswith((".png", ".jpg", ".jpeg")):
            output_path = os.path.join(output_folder, filename)
            add_watermark_to_image(input_path, output_path, text, font_path, orientation)
input_base_dir = os.path.join("sources", "input")
output_base_dir = os.path.join("sources", "output")
input_folders = [os.path.join(input_base_dir, folder) for folder in os.listdir(input_base_dir) if os.path.isdir(os.path.join(input_base_dir, folder))]
output_folders = [os.path.join(output_base_dir, folder, "max") for folder in os.listdir(input_base_dir) if os.path.isdir(os.path.join(input_base_dir, folder))]
for output_folder in output_folders:
    os.makedirs(output_folder, exist_ok=True)
text = "picWall™ AI"
font_path = os.path.join("include", "picWall.ttf")
orientation = input("Enter orientation (portrait, landscape, or auto): ").strip().lower()
if orientation not in {"portrait", "landscape", "auto"}:
    orientation = "auto"
def process_folder(input_folder, output_folder, text, font_path, orientation):
    print(f"Processing folder: {input_folder} -> {output_folder}")
    process_images(input_folder, output_folder, text, font_path, orientation)
    print(f"Finished processing folder: {input_folder}")
print("Starting watermark processing...")
with ThreadPoolExecutor() as executor:
    executor.map(
        process_folder,
        input_folders,
        output_folders,
        [text] * len(input_folders),
        [font_path] * len(input_folders),
        [orientation] * len(input_folders)
    )
print("Watermark processing complete.")