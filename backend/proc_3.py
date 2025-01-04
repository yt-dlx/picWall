import os
import re
import logging
import subprocess
from tqdm import tqdm
from colorama import init, Fore, Style
from PIL import Image, ImageEnhance, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
Image.MAX_IMAGE_PIXELS = None
init(autoreset=True)
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger()
class ColorFormatter(logging.Formatter):
    COLORS = {"ERROR": Fore.RED, "INFO": Fore.GREEN, "DEBUG": Fore.CYAN, "WARNING": Fore.YELLOW, "CRITICAL": Fore.RED + Style.BRIGHT}
    def format(self, record):
        levelname = record.levelname
        log_message = super().format(record)
        return f"{self.COLORS.get(levelname, '')}{log_message}"
console_handler = logging.StreamHandler()
console_handler.setFormatter(ColorFormatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(console_handler)
def load_images(input_path):
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🔍 Searching for images...")
    if os.path.isdir(input_path):
        images = []
        for file_name in os.listdir(input_path):
            file_path = os.path.join(input_path, file_name)
            if file_path.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                images.append(file_path)
        images.sort(key=lambda x: int(re.search(r'(\d+)', x).group()) if re.search(r'(\d+)', x) else 0)
        return images
    else:
        return [input_path]
def apply_filters(image, sharpness, saturation, brightness, contrast):
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🎨 Applying image filters:")
    logger.debug(f"   - 📈 Sharpness: {sharpness}%")
    logger.debug(f"   - 🌈 Saturation: {saturation}%")
    logger.debug(f"   - ☀️ Brightness: {brightness}%")
    logger.debug(f"   - 🔲 Contrast: {contrast}%")
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1 + sharpness / 100)
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1 + saturation / 100)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1 + brightness / 100)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1 + contrast / 100)
    return image
def save_temp_image(image, original_image_path):
    temp_dir = os.path.join(os.path.dirname(original_image_path), "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_image_path = os.path.join(temp_dir, f"temp_{os.path.basename(original_image_path)}")
    image.save(temp_image_path)
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 💾 Temporary image saved: {temp_image_path}")
    return temp_image_path
def run_upscale_command(input_path, output_path, model_name):
    upscaling_command = [
        os.path.join("include", "real-esrgan", "engine.exe"),
        "-m", os.path.join("include", "real-esrgan", "models"),
        "-n", model_name, "-o", output_path, "-i", input_path,
        "-f", input_path.split(".")[-1], "-s", "4"
    ]
    progress_pattern = re.compile(r"(\d+\.\d+)%")
    process = subprocess.Popen(upscaling_command, shell=True, bufsize=0, text=True, stderr=subprocess.STDOUT, universal_newlines=True, stdout=subprocess.PIPE)
    with tqdm(total=100, desc="INFO: 🔬 Upscaling Progress", unit="%") as pbar:
        last_percentage = 0
        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if line.strip():
                match = progress_pattern.search(line)
                if match:
                    try:
                        current_percentage = float(match.group(1))
                        if current_percentage > last_percentage:
                            pbar.update(current_percentage - last_percentage)
                            last_percentage = current_percentage
                    except ValueError:
                        pass
        if last_percentage < 100:
            pbar.update(100 - last_percentage)
    process.wait()
    if process.returncode != 0:
        logger.error("❌ Error during the upscaling process!")
        raise Exception("Error during the upscaling process.")
def save_final_image(output_path):
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 💾 Final images will be saved to: {output_path}")
def cleanup(temp_image_path):
    if os.path.exists(temp_image_path):
        os.remove(temp_image_path)
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL}  🗑️ Temporary image removed")
    temp_dir = os.path.dirname(temp_image_path)
    if not os.listdir(temp_dir):
        os.rmdir(temp_dir)
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🧹 Temporary directory cleaned up")
def inference(input_path, sharpness, saturation, brightness, contrast, image_anime_style=False, double_upscale_4x_to_16x=False):
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🎨 Starting Image Enhancement and Upscaling 🚀")
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🖼️  Image Processing Pipeline Initiated 🚀")
    image_paths = load_images(input_path)
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🖼️  Found {len(image_paths)} image(s) to process")
    for image_path in image_paths:
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🔧 Processing image: {os.path.basename(image_path)}")
        image = Image.open(image_path)
        logger.debug(f"📐 Original image size: {image.size}")
        image = apply_filters(image, sharpness, saturation, brightness, contrast)
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} ✨ Filters applied successfully")
        temp_image_path = save_temp_image(image, image_path)
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🚀 Upscaling image...")
        input_path = temp_image_path
        original_ext = os.path.splitext(input_path)[1]
        final_image_name = os.path.basename(input_path).replace("temp_", "")
        final_image_name_without_ext = os.path.splitext(final_image_name)[0]
        output_path = os.path.join(os.path.dirname(image_path), "output", f"{final_image_name_without_ext}{original_ext}")
        model_name = "realesrgan-x4plus-anime" if image_anime_style else "realesrgan-x4plus"
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🤖 Using model: {model_name}")
        print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 📊 Upscaling mode: {'Double Upscale (4x to 16x)' if double_upscale_4x_to_16x else 'Single Upscale (4x)'}")
        if double_upscale_4x_to_16x:
            intermediate_output_path = input_path.replace(".png", "_4x.png")
            run_upscale_command(input_path, intermediate_output_path, model_name)
            final_output_path = intermediate_output_path.replace("_4x", "_16x")
            run_upscale_command(intermediate_output_path, final_output_path, model_name)
            final_image_name = os.path.splitext(os.path.basename(final_output_path).replace("temp_", ""))[0]
            output_path = os.path.join(os.path.dirname(image_path), "output", f"{final_image_name}{original_ext}")
            os.rename(final_output_path, output_path)
        else:
            run_upscale_command(input_path, output_path, model_name)
        save_final_image(os.path.dirname(image_path))
        cleanup(temp_image_path)
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} ✅ Image Processing Completed Successfully!")
    print(f"{Fore.GREEN}INFO:{Style.RESET_ALL} 🎉 Image Processing Script Finished!")
if __name__ == "__main__":
    """
    @input_path >>>Required: Path to the image or folder containing images.
    @double_upscale_4x_to_16x >>> (Optional) If True, upscales the input image twice.
    @image_anime_style >>> (Optional) If True, applies a model suited for anime-style images.
    @saturation >>> (Optional):Adjusts the color saturation of the image. Limit: (-)100 - (+)100
    @brightness >>> (Optional) Adjusts the brightness of the image. Limit: (-)100 - (+)100
    @sharpness >>> (Optional):Adjusts the sharpness of the image. Limit: (-)100 - (+)100
    @contrast >>> (Optional):Adjusts the contrast of the image. Limit: (-)100 - (+)100
    """
    main_directory = os.path.join("sources", "input")
    folder_names = [name for name in os.listdir(main_directory) if os.path.isdir(os.path.join(main_directory, name))]
    for name in folder_names:
        inference(
            image_anime_style=("Anime" in os.path.join(main_directory, name)),
            input_path=os.path.join(main_directory, name),
            double_upscale_4x_to_16x=False,
            sharpness=80,
            brightness=8,
            saturation=8,
            contrast=8
        )