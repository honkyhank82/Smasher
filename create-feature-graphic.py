from PIL import Image, ImageDraw, ImageFont

# Create 1024x500 image with black background
img = Image.new('RGB', (1024, 500), color='black')
d = ImageDraw.Draw(img)

# Try to load fonts
try:
    font_large = ImageFont.truetype('arial.ttf', 100)
    font_medium = ImageFont.truetype('arial.ttf', 50)
    font_small = ImageFont.truetype('arial.ttf', 35)
except:
    try:
        font_large = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 100)
        font_medium = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 50)
        font_small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 35)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()

# Draw icon circle on left
d.ellipse([50, 125, 250, 325], fill='#222222')
d.text((150, 225), '♂♂', fill='white', anchor='mm', font=font_medium)

# Draw main text
d.text((550, 200), 'SMASHER', fill='white', anchor='mm', font=font_large)
d.text((550, 280), 'Connect Nearby', fill='#999999', anchor='mm', font=font_small)

# Save
img.save('feature-graphic-1024x500.png')
print('✅ Feature graphic created: feature-graphic-1024x500.png')
