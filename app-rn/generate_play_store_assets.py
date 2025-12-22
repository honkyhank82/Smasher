#!/usr/bin/env python3
"""
Generate Google Play Store marketing assets
- App icon 512x512
- Feature graphic 1024x500
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon_512(output_path):
    """Create 512x512 app icon for Play Store"""
    size = 512
    img = Image.new('RGB', (size, size), color='black')
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (approximately 60% of image size)
    font_size = int(size * 0.6)
    
    # Try to use a bold font
    try:
        font = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Draw red S in center
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, fill='#FF0000', font=font)
    
    # Save
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"✅ Created: {output_path}")

def create_feature_graphic(output_path):
    """Create 1024x500 feature graphic for Play Store"""
    width = 1024
    height = 500
    
    img = Image.new('RGB', (width, height), color='black')
    draw = ImageDraw.Draw(img)
    
    # Draw red S logo on left
    logo_size = int(height * 0.6)
    try:
        logo_font = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", logo_size)
    except:
        try:
            logo_font = ImageFont.truetype("arial.ttf", logo_size)
        except:
            logo_font = ImageFont.load_default()
    
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=logo_font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Position S on left side
    x = 100
    y = (height - text_height) // 2 - bbox[1]
    draw.text((x, y), text, fill='#FF0000', font=logo_font)
    
    # Draw app name
    try:
        title_font = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 80)
        tagline_font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 40)
    except:
        title_font = ImageFont.load_default()
        tagline_font = ImageFont.load_default()
    
    # App name
    title = "SMASHER"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_x = x + text_width + 80
    title_y = height // 2 - 60
    draw.text((title_x, title_y), title, fill='white', font=title_font)
    
    # Tagline
    tagline = "Connect Nearby"
    tagline_y = title_y + 90
    draw.text((title_x, tagline_y), tagline, fill='#CCCCCC', font=tagline_font)
    
    # Save
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"✅ Created: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("\n🎨 Generating Google Play Store Assets...\n")
    
    # Create play-store-assets directory
    assets_dir = os.path.join(base_dir, 'play-store-assets')
    os.makedirs(assets_dir, exist_ok=True)
    
    # Generate app icon 512x512
    icon_path = os.path.join(assets_dir, 'app-icon-512.png')
    create_app_icon_512(icon_path)
    
    # Generate feature graphic 1024x500
    feature_path = os.path.join(assets_dir, 'feature-graphic-1024x500.png')
    create_feature_graphic(feature_path)
    
    print("\n✅ All assets generated successfully!")
    print(f"\n📁 Assets saved to: {assets_dir}")
    print("\nNext steps:")
    print("1. Review the generated assets")
    print("2. Upload to Google Play Console:")
    print("   - app-icon-512.png → Store listing → App icon")
    print("   - feature-graphic-1024x500.png → Store listing → Feature graphic")
    print("3. Take screenshots of your app for the store listing")
    print("\nSee GOOGLE_PLAY_PUBLISH.md for complete guide")

if __name__ == '__main__':
    main()
