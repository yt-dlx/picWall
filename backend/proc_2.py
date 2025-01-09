import os
from shutil import copy2
from collections import defaultdict
output_directory = os.path.join("sources", "input")
input_directory = os.path.join("scripts", "Generated", "Images")
prefixes_to_remove = [
    "Leonardo Lightning XL", 
    "Leonardo Anime XL", 
    "Leonardo Vision XL", 
    "Leonardo Kino XL",
    "AlbedoBase XL",
    "AlbedoBase_XL_",
    "Leonardo_Kino_XL_",
    "Leonardo_Anime_XL_", 
    "Leonardo_Vision_XL_", 
    "Leonardo_Lightning_XL_", 
]
def clean_base_name(filename):
    for prefix in prefixes_to_remove:
        if filename.startswith(prefix):
            filename = filename.replace(prefix, "").strip()
            break
    if "(" in filename and ")" in filename:
        filename = filename.rsplit("(", 1)[0].strip()
    if filename.endswith(".jpg"):
        filename = filename[:-4].strip()
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
            print(f'Done: {new_name} (in) {target_folder}"')