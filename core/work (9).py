import re, os, time
from PIL import Image
from rich.console import Console
from colorthief import ColorThief
console = Console()
GITHUB_OWNER = "yt-dlx"
GITHUB_REPO = "picWall"
def log(message, level="info"):
    timestamp = time.strftime("[%Y-%m-%d %H:%M:%S]")
    if level == "info":
        console.print(f"{timestamp} [bold cyan]INFO:[/] {message}")
    elif level == "warn":
        console.print(f"{timestamp} [bold yellow]WARNING:[/] {message}")
    elif level == "error":
        console.print(f"{timestamp} [bold red]ERROR:[/] {message}")
    elif level == "success":
        console.print(f"{timestamp} [bold green]SUCCESS:[/] {message}")
def create_temp_resized_image(file_path, size=(300, 300)):
    log(f"Creating temporary resized image for: {file_path}")
    with Image.open(file_path) as img:
        img.thumbnail(size)
        temp_path = "temp_resized.jpg"
        img.save(temp_path, "JPEG")
    return temp_path
def get_top_colors(file_path, num_colors=10):
    log(f"Extracting top colors from: {file_path}")
    return [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in ColorThief(file_path).get_palette(color_count=num_colors, quality=1)]
def get_image_metadata(file_path):
    log(f"Fetching metadata for: {file_path}")
    with Image.open(file_path) as img:
        return {"format": img.format, "mode": img.mode, "width": img.width, "height": img.height}
def create_image_data(file_path, branch_name, folder_name, type_):
    temp_file_path = create_temp_resized_image(file_path)
    try:
        hex_colors = get_top_colors(temp_file_path, num_colors=10)
    finally:
        os.remove(temp_file_path)
    file_metadata = get_image_metadata(file_path)
    file_size_bytes = os.path.getsize(file_path)
    log(f"Created image data for: {file_path}")
    return {
        "original_file_name": os.path.basename(file_path),
        "format": file_metadata["format"],
        "mode": file_metadata["mode"],
        "file_size_bytes": file_size_bytes,
        "file_size_megabytes": round(file_size_bytes / (1024 * 1024), 2),
        "width": file_metadata["width"],
        "height": file_metadata["height"],
        "primary": hex_colors[0],
        "secondary": hex_colors[1],
        "tertiary": hex_colors[2],
        "branch": branch_name,
        "folder": folder_name,
        "type": type_,
    }
def process_images_in_folder(base_path, branch_name, folder_name):
    log(f"Processing folder: {base_path}")
    parent_data = {}
    for subfolder in ["min", "max"]:
        subfolder_path = os.path.join(base_path, subfolder)
        if not os.path.isdir(subfolder_path):
            log(f"Subfolder '{subfolder}' not found in {base_path}. Skipping.", level="warn")
            continue
        for file_name in os.listdir(subfolder_path):
            file_path = os.path.join(subfolder_path, file_name)
            if os.path.isfile(file_path) and file_name.lower().endswith((".jpg", ".jpeg", ".png")):
                try:
                    log(f"Processing file: {file_path}")
                    image_data = create_image_data(file_path, branch_name, folder_name, subfolder)
                    base_name = re.sub(r"\s*\(\d+\)$", "", os.path.splitext(file_name)[0]).strip()
                    if base_name not in parent_data:
                        parent_data[base_name] = {base_name: {"environment_title": base_name, "images": []}}
                    parent_data[base_name][base_name]["images"].append(image_data)
                except Exception as e:
                    log(f"Failed to process file: {file_name}. Error: {str(e)}", level="error")
    log(f"Finished processing folder: {base_path}", level="success")
    return parent_data
def sanitize_filename(name):
    return re.sub(r"[^\w]", "_", name).strip()
def write_output_file(output_ts_path, parent_data):
    os.makedirs(os.path.dirname(output_ts_path), exist_ok=True)
    log(f"Writing output to: {output_ts_path}")
    with open(output_ts_path, "w") as ts_file:
        ts_file.write("export const database: unknown[] = ")
        ts_file.write(str(list(parent_data.values())).replace("'", "\"").replace("True", "true").replace("False", "false"))
        ts_file.write(";\n")
    log(f"Output written successfully to: {output_ts_path}", level="success")
data_folder = "data"
output_base_dir = os.path.join("source", "output")
folder_paths = [(folder, os.path.join(output_base_dir, folder)) for folder in os.listdir(output_base_dir) if os.path.isdir(os.path.join(output_base_dir, folder))]
for folder_name, folder_path in folder_paths:
    try:
        log(f"Starting to process folder: {folder_name}")
        branch_name, relative_path = map(str.strip, folder_name.split(" - ", 1))
        parent_data = process_images_in_folder(folder_path, branch_name, relative_path)
        sanitized_folder_name = sanitize_filename(folder_name)
        output_ts_path = os.path.join(data_folder, f"{sanitized_folder_name}.ts")
        write_output_file(output_ts_path, parent_data)
    except ValueError:
        log(f"Folder name '{folder_name}' is not in the correct format (Branch - Relative Path). Skipping.", level="error")