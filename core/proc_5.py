import os
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
def rescale_image(file_path, target_path, width, height):
    try:
        with Image.open(file_path) as img:
            img_resized = img.resize((width, height), Image.LANCZOS)
            img_resized.save(target_path)
            print(f"Rescaled and saved: {target_path}")
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")
def rescale_images(source_dir, target_dir, width, height):
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    tasks = []
    with ThreadPoolExecutor() as executor:
        for filename in os.listdir(source_dir):
            file_path = os.path.join(source_dir, filename)
            if not (filename.lower().endswith((".png", ".jpg", ".jpeg"))):
                continue
            target_path = os.path.join(target_dir, filename)
            tasks.append(executor.submit(rescale_image, file_path, target_path, width, height))
        for task in tasks:
            task.result()
if __name__ == "__main__":
    print("Choose the image format:")
    print("1: Landscape (640 x 360)")
    print("2: Portrait (360 x 640)")
    choice = input("Enter 1 for Landscape or 2 for Portrait: ")
    if choice == "1":
        width, height = 640, 360
    elif choice == "2":
        width, height = 360, 640
    else:
        print("Invalid choice. Exiting the program.")
        exit()
    output_base_dir = os.path.join("assets", "output")
    directories = [
        (folder, os.path.join(output_base_dir, folder, "max"), os.path.join(output_base_dir, folder, "min"))
        for folder in os.listdir(output_base_dir)
        if os.path.isdir(os.path.join(output_base_dir, folder)) and
           os.path.isdir(os.path.join(output_base_dir, folder, "max"))
    ]
    for _, _, target_dir in directories:
        os.makedirs(target_dir, exist_ok=True)
    with ThreadPoolExecutor() as executor:
        for name, source_dir, target_dir in directories:
            print(f"Processing {name} images...")
            executor.submit(rescale_images, source_dir, target_dir, width, height)