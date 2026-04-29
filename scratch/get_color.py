from PIL import Image
import sys

try:
    img = Image.open(sys.argv[1])
    # Get the color of the middle pixel
    w, h = img.size
    r, g, b = img.getpixel((w//2, h//2))
    print(f"#{r:02x}{g:02x}{b:02x}")
except Exception as e:
    print(e)
