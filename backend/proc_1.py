import os
import sys
import requests
import platform
import subprocess
def cprint(message, color="green"):
    colors = {"red": "\033[91m", "green": "\033[92m", "reset": "\033[0m"}
    print(f"{colors.get(color, '')}{message}{colors['reset']}")
def execute_command(command, capture=False):
    try:
        result = subprocess.run(command, shell=True, text=True, 
                                stdout=subprocess.PIPE if capture else None, 
                                stderr=subprocess.PIPE if capture else None)
        if result.returncode != 0:
            if capture:
                cprint(f"ERROR: running command: {command}", "red")
                cprint(result.stderr, "red")
            return False
        return result.stdout.strip() if capture else True
    except Exception as e:
        cprint(f"Unexpected error: {e}", "red")
        return False

def is_windows():
    return platform.system().lower() == "windows"

def get_venv_activate_path():
    if is_windows():
        return os.path.join("python", "Scripts", "activate")
    else:
        return os.path.join("python", "bin", "activate")
def venv_exists():
    return os.path.exists("python")
def setup_virtual_environment():
    if not venv_exists():
        cprint("Creating virtual environment...", "green")
        execute_command("python3 -m venv python" if not is_windows() else "python -m venv python")
    activate_command = f". {get_venv_activate_path()}" if not is_windows() else f".\\{get_venv_activate_path()}"
    execute_command(f"{activate_command} && python -m pip install --upgrade pip")
    cuda_torch_command = f"{activate_command} && pip install --index-url https://download.pytorch.org/whl/cu124 torch torchvision torchaudio xformers"
    execute_command(cuda_torch_command)
    other_packages = [
        "loguru", "colorama", "tqdm", "pillow", "numpy", "wheel", "sentencepiece", "protobuf", 
        "fire", "accelerate", "diffusers", "safetensors", "mediapipe", "peft", "einops", 
        "opencv-python", "controlnet_aux", "rich", "colorthief"
    ]
    for package in other_packages:
        execute_command(f"{activate_command} && pip install {package}")
def install_triton():
    if is_windows():
        python_version = f"cp{sys.version_info.major}{sys.version_info.minor}"
        try:
            response = requests.get("https://api.github.com/repos/woct0rdho/triton-windows/releases/latest")
            if response.status_code != 200:
                cprint(f"ERROR fetching release data: {response.status_code}", "red")
                return False
            release_data = response.json()
            matching_assets = [asset for asset in release_data["assets"] if python_version in asset["name"] and asset["name"].endswith(".whl")]
            if not matching_assets:
                cprint(f"No compatible .whl file found for Python version {sys.version}", "red")
                return False
            latest_asset = max(matching_assets, key=lambda asset: asset["name"])
            download_url = latest_asset["browser_download_url"]
            filename = latest_asset["name"]
            cprint(f"Downloading {filename}...", "green")
            response = requests.get(download_url)
            with open(filename, 'wb') as f:
                f.write(response.content)
            activate_command = f". {get_venv_activate_path()}" if not is_windows() else f".\\{get_venv_activate_path()}"
            install_result = execute_command(f"{activate_command} && pip install {filename}")
            try:
                os.remove(filename)
                cprint(f"Deleted {filename}", "green")
            except Exception as delete_error:
                cprint(f"Error deleting {filename}: {delete_error}", "red")
            return install_result
        except Exception as e:
            cprint(f"Triton Windows installation error: {e}", "red")
            return False
    else:
        activate_command = f". {get_venv_activate_path()}"
        return execute_command(f"{activate_command} && pip install triton")
def main():
    try:
        cprint("Setting up virtual environment...", "green")
        setup_virtual_environment()
        install_triton()
        cprint("Evnironment Setup Complete!", "green")
    except Exception as e:
        cprint(f"Installation failed: {e}", "red")
        sys.exit(1)
if __name__ == "__main__":
    main()