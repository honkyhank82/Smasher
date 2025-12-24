from PIL import Image, ImageDraw, ImageFont
import os

def create_image(width, height, output_path, text="S", bg_color='black', text_color='#FF0000'):
    """Create an image with background and text"""
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Calculate font size
    size = min(width, height)
    font_size = int(size * 0.5)
    
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
            
    # Draw text in center
    text = str(text)
    
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow versions
        text_width, text_height = draw.textsize(text, font=font)
        
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, fill=text_color, font=font)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, 'assets')
    
    # Expo Assets
    create_image(1024, 1024, os.path.join(assets_dir, 'icon.png'))
    create_image(1024, 1024, os.path.join(assets_dir, 'adaptive-icon.png'))
    create_image(1242, 2436, os.path.join(assets_dir, 'splash.png'), text="SMASHER")
    create_image(48, 48, os.path.join(assets_dir, 'favicon.png'))

if __name__ == '__main__':
    main()
