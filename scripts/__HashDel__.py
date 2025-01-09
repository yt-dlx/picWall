import os
import hashlib
def calculate_hash(file_path, chunk_size=1024):
    hash_obj = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            while chunk := f.read(chunk_size):
                hash_obj.update(chunk)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None
    return hash_obj.hexdigest()
def find_and_delete_duplicates(directory):
    if not os.path.isdir(directory):
        print(f"{directory} is not a valid directory.")
        return
    file_hashes = {}
    duplicates = []
    for root, _, files in os.walk(directory):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            file_hash = calculate_hash(file_path)
            if file_hash:
                if file_hash in file_hashes:
                    duplicates.append(file_path)
                else:
                    file_hashes[file_hash] = file_path
    print("Duplicates found:")
    for dup in duplicates:
        print(dup)
        try:
            os.remove(dup)
            print(f"Deleted: {dup}")
        except Exception as e:
            print(f"Error deleting {dup}: {e}")

if __name__ == "__main__":
    find_and_delete_duplicates("Download")
