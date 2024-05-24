from PIL import Image
import glob
import os

def convert_black_to_transparency(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] == 0 and item[1] == 0 and item[2] == 0:  # Finding black color by its RGB value
            newData.append((255, 255, 255, 0))  # Setting alpha to 0 for black
        else:
            newData.append(item)
    img.putdata(newData)
    return img

def resize_save_convert_to_icon(image_path, output_path='icon.ico'):
    sizes = [16, 32, 48, 64, 128, 256]
    icons = []
    temp_files = []

    img = Image.open(image_path)
    img = convert_black_to_transparency(img)
    
    width, height = img.size
    if width > height:
        new_size = height
        left = (width - new_size) / 2
        top = 0
        right = (width + new_size) / 2
        bottom = new_size
    else:
        new_size = width
        left = 0
        top = (height - new_size) / 2
        right = new_size
        bottom = (height + new_size) / 2

    img_cropped = img.crop((left, top, right, bottom))

    for size in sizes:
        img_resized = img_cropped.resize((size, size), Image.LANCZOS)
        img_resized_path = f"{image_path.rsplit('.', 1)[0]}_{size}x{size}.png"
        img_resized.save(img_resized_path)
        icons.append(img_resized)
        temp_files.append(img_resized_path)

    icons.sort(key=lambda x: x.width * x.height, reverse=True)
    icons[0].save(output_path, format='ICO', sizes=[(icon.width, icon.height) for icon in icons])

    # Delete temporary files
    for file in temp_files:
        os.remove(file)

supported_formats = ('*.jpeg', '*.jpg', '*.webp')
images = []
for format in supported_formats:
    images.extend(glob.glob(format))
first_image_path = images[0] if images else None
if first_image_path:
    resize_save_convert_to_icon(first_image_path)