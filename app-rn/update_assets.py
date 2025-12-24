from PIL import Image
import os

def update_assets():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, 'assets')
    
    icon_path = os.path.join(assets_dir, 'icon.png')
    adaptive_icon_path = os.path.join(assets_dir, 'adaptive-icon.png')
    favicon_path = os.path.join(assets_dir, 'favicon.png')
    
    if not os.path.exists(icon_path):
        print(f"Error: {icon_path} not found. Please place your icon.png in the assets folder.")
        return

    print(f"Processing {icon_path}...")
    
    try:
        with Image.open(icon_path) as img:
            # Generate adaptive-icon.png (1024x1024)
            print("Generating adaptive-icon.png...")
            adaptive = img.resize((1024, 1024), Image.Resampling.LANCZOS)
            adaptive.save(adaptive_icon_path, 'PNG')
            
            # Generate favicon.png (48x48)
            print("Generating favicon.png...")
            favicon = img.resize((48, 48), Image.Resampling.LANCZOS)
            favicon.save(favicon_path, 'PNG')
            
            print("Assets updated successfully!")
            
    except Exception as e:
        print(f"Failed to process images: {e}")

if __name__ == '__main__':
    update_assets()
