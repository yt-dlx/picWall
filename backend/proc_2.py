import os
from shutil import copy2, move, rmtree
from dotenv import load_dotenv
from collections import defaultdict
load_dotenv("../.env")
prerem = os.getenv("PREREM", "").split(",")
output_directory = os.path.join("sources", "input")
input_directory = os.path.join("scripts", "Generated", "Images")
def clean_base_name(filename):
    for prefix in prerem:
        if filename.startswith(prefix.strip()):
            filename = filename.replace(prefix.strip(), "").strip()
            break
    if "(" in filename and ")" in filename:
        filename = filename.rsplit("(", 1)[0].strip()
    if filename.endswith(".jpg"):
        filename = filename[:-4].strip()
    filename = filename.replace("_", " ").title()
    return filename
def generate_new_name(base_name):
    return f"{base_name}.jpg"
for root, _, files in os.walk(input_directory):
    relative_path = os.path.relpath(root, input_directory)
    target_folder = os.path.join(output_directory, relative_path)
    os.makedirs(target_folder, exist_ok=True)
    files = [f for f in files if f.endswith(".jpg")]
    files.sort()
    grouped_files = defaultdict(list)
    for filename in files:
        base_name = clean_base_name(filename)
        grouped_files[base_name].append(filename)
    for group, group_files in grouped_files.items():
        for filename in group_files:
            old_file = os.path.join(root, filename)
            new_name = generate_new_name(group)
            new_file = os.path.join(target_folder, new_name)
            copy2(old_file, new_file)
            print(f"Done: {new_name} (in) {target_folder}")
for subdir in os.listdir(output_directory):
    subdir_path = os.path.join(output_directory, subdir)
    if os.path.isdir(subdir_path):
        for folder in os.listdir(subdir_path):
            folder_path = os.path.join(subdir_path, folder)
            target_path = os.path.join(output_directory, folder)
            if os.path.isdir(folder_path):
                move(folder_path, target_path)
                print(f"Moved: {folder_path} to {target_path}")
        if not os.listdir(subdir_path):
            rmtree(subdir_path)
            print(f"Deleted empty folder: {subdir_path}")
print("Processing, folder reorganization, and cleanup complete!")