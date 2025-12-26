from PIL import Image
import os

input_path = 'background.png'
output_path = 'background.png' # Overwrite

try:
    with Image.open(input_path) as img:
        # Convert to RGB if necessary (e.g. if PNG has transparency but we want to save as JPEG, though user wants PNG/WebP fallback)
        # User said "Consider using WebP format with JPEG fallback", but "Compress background image to under 300KB" is the main constraint.
        # Keeping it as PNG might be hard to get under 300KB if it's complex. JPEG is better for photos.
        # But if I change to JPEG, I need to update CSS.
        # Let's try to optimize PNG first or resize.
        
        # Resize if too large (max 1920 width)
        max_dimension = 1920
        if img.width > max_dimension or img.height > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            print(f"Resized to {img.size}")
        
        # Save as optimized PNG
        # If file size is still big, we might need JPEG.
        # Let's save as JPEG for better compression as it's a background image (likely photo-like).
        # But wait, existing file is .png. If I change extension, I break imports unless I update them.
        # The user said "Consider using WebP format with JPEG fallback".
        # For now, let's try to overwrite the PNG with an optimized version. 
        # If it's a photo, PNG is bad. If it's graphics, PNG is good.
        # "splash.png" usually suggests graphics.
        
        # Let's try to save as PNG optimized.
        img.save(output_path, 'PNG', optimize=True)
        
        size = os.path.getsize(output_path)
        print(f"Size after PNG optimize: {size/1024:.2f} KB")
        
        if size > 300 * 1024:
            print("Still > 300KB. Converting to JPEG (renamed to .jpg) and updating CSS references?")
            # Actually, let's just save as a high quality JPEG but keep .png extension? No, that's bad.
            # Let's create a .jpg version and update the CSS to use it.
            jpg_path = 'background.jpg'
            rgb_img = img.convert('RGB')
            rgb_img.save(jpg_path, 'JPEG', quality=80)
            
            jpg_size = os.path.getsize(jpg_path)
            print(f"JPEG Size: {jpg_size/1024:.2f} KB")
            
            # Use the JPEG if it meets requirement
            if jpg_size < 300 * 1024:
                 print("Using JPEG version.")
                 # We will need to update CSS to point to background.jpg
                 # I can't easily signal this to the next step except by checking file existence.
                 # Let's just create both and I will check in the next step.
            
            # Also create WebP
            webp_path = 'background.webp'
            img.save(webp_path, 'WEBP', quality=80)
            print(f"WebP Size: {os.path.getsize(webp_path)/1024:.2f} KB")

except Exception as e:
    print(f"Error: {e}")
