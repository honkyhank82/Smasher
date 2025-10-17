#!/usr/bin/env python3
"""
Generate app icons with black background and red letter S
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a square icon with black background and red S"""
    # Create image with black background
    img = Image.new('RGB', (size, size), color='black')
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (approximately 60% of image size)
    font_size = int(size * 0.6)
    
    # Try to use a bold font, fall back to default if not available
    try:
        # Try common system fonts
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", font_size)
                except:
                    # Use default font
                    font = ImageFont.load_default()
    
    # Draw red S in center
    text = "S"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate position to center text
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # Draw the text in red
    draw.text((x, y), text, fill='#FF0000', font=font)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Android icon sizes
    android_icons = [
        ('mipmap-mdpi', 48),
        ('mipmap-hdpi', 72),
        ('mipmap-xhdpi', 96),
        ('mipmap-xxhdpi', 144),
        ('mipmap-xxxhdpi', 192),
    ]
    
    print("Generating Android icons...")
    for density, size in android_icons:
        # Regular icon
        path = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', density, 'ic_launcher.png')
        create_icon(size, path)
        
        # Round icon
        path_round = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', density, 'ic_launcher_round.png')
        create_icon(size, path_round)
    
    # iOS icon sizes
    ios_icons = [
        ('icon-20@2x.png', 40),
        ('icon-20@3x.png', 60),
        ('icon-29@2x.png', 58),
        ('icon-29@3x.png', 87),
        ('icon-40@2x.png', 80),
        ('icon-40@3x.png', 120),
        ('icon-60@2x.png', 120),
        ('icon-60@3x.png', 180),
        ('icon-1024.png', 1024),
    ]
    
    print("\nGenerating iOS icons...")
    ios_base = os.path.join(base_dir, 'ios', 'SmasherApp', 'Images.xcassets', 'AppIcon.appiconset')
    for filename, size in ios_icons:
        path = os.path.join(ios_base, filename)
        create_icon(size, path)
    
    print("\nAll icons generated successfully!")

if __name__ == '__main__':
    main()
