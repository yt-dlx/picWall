import re
import os
from PIL import Image
from rich.console import Console
from colorthief import ColorThief
console = Console()
def create_temp_resized_image(file_path, size=(300, 300)):
    with Image.open(file_path) as img:
        img.thumbnail(size)
        temp_path = "Tri.jpg"
        img.save(temp_path, "JPEG")
    return temp_path
def get_top_colors(file_path, num_colors=10):
    color_thief = ColorThief(file_path)
    palette = color_thief.get_palette(color_count=num_colors, quality=1)
    hex_colors = [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in palette]
    return hex_colors
def get_image_metadata(file_path):
    with Image.open(file_path) as img:
        return {"format": img.format, "mode": img.mode, "width": img.width, "height": img.height}
def create_image_data(file_path):
    temp_file_path = create_temp_resized_image(file_path)
    try:
        hex_colors = get_top_colors(temp_file_path, num_colors=10)
    finally:
        os.remove(temp_file_path)
    file_metadata = get_image_metadata(file_path)
    file_size_bytes = os.path.getsize(file_path)
    file_size_megabytes = file_size_bytes / (1024 * 1024)
    directory, original_name = os.path.split(file_path)
    image_data = {
        "original_file_name": original_name,
        "format": file_metadata["format"],
        "mode": file_metadata["mode"],
        "file_size_bytes": file_size_bytes,
        "file_size_megabytes": round(file_size_megabytes, 2),
        "width": file_metadata["width"],
        "height": file_metadata["height"],
        "primary": hex_colors[0],
        "secondary": hex_colors[1],
        "tertiary": hex_colors[2],
        "downloadLink": "https://github.com/yt-dlx/picbook/blob/",
        "previewLink": "https://raw.githubusercontent.com/yt-dlx/picbook/"
    }
    for i, color in enumerate(hex_colors[3:], start=4):
        if i <= 10:
            image_data[f"hex_{i}"] = color
    return image_data
def process_images_in_folder(folder_path, output_ts_path):
    parent_data = {}
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path) and file_name.lower().endswith((".jpg", ".jpeg", ".png")):
            try:
                image_data = create_image_data(file_path)
                base_name = re.sub(r"\s*\(\d+\)$", "", os.path.splitext(file_name)[0]).strip()
                if base_name not in parent_data:
                    parent_data[base_name] = {
                        base_name: {
                            "environment_title": base_name,
                            "environment_moral": "",
                            "environment_prompt": "",
                            "images": []
                        }
                    }
                parent_data[base_name][base_name]["images"].append(image_data)
                console.print(f"[bold green]INFO:[/] Processed image: {file_name}")
            except Exception as e:
                console.print(f"[bold red]ERROR:[/] Could not process {file_name}. {str(e)}")
    with open(output_ts_path, "w") as ts_file:
        ts_file.write("export const database: unknown[] = ")
        ts_file.write(str(list(parent_data.values())).replace("'", "\"").replace("True", "true").replace("False", "false"))
        ts_file.write(";\n")
    console.print(f"[bold green]INFO:[/] All image data has been written to {output_ts_path}")
input_base_dir = os.path.join("sources", "input")
folder_paths = [
    (folder, os.path.join(input_base_dir, folder))
    for folder in os.listdir(input_base_dir)
    if os.path.isdir(os.path.join(input_base_dir, folder))
]
for folder_name, folder_path in folder_paths:
    console.print(f"[bold cyan]INFO:[/] Processing folder: {folder_path}")
    output_ts_path = f"{folder_name}.ts"
    process_images_in_folder(folder_path, output_ts_path)