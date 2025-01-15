import os
def rename_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(".jpg"):
                continue
            file_parts = file.split()
            if len(file_parts) > 2:
                new_name = f"{file_parts[0]} {file_parts[1]} {file_parts[-1]}"
                old_path = os.path.join(root, file)
                new_path = os.path.join(root, new_name)
                os.rename(old_path, new_path)
                print(f"Renamed: {file} -> {new_name}")
directory_path = os.path.join("core", "source", "inputs")
rename_files(directory_path)