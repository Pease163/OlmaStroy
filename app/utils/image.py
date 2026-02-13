import os
from PIL import Image
from flask import current_app


def process_image(input_path, output_dir=None, max_width=1920, quality=None, create_webp=True, create_thumbnail=False, thumb_size=(400, 300)):
    """
    Process an image: create WebP version and optional thumbnail.

    Args:
        input_path: Path to source image
        output_dir: Directory for output (defaults to same as input)
        max_width: Maximum width for the image
        quality: JPEG/WebP quality (1-100), defaults to config IMAGE_QUALITY
        create_webp: Whether to create WebP version
        create_thumbnail: Whether to create a thumbnail
        thumb_size: Thumbnail dimensions (width, height)

    Returns:
        dict with paths to created files
    """
    if quality is None:
        quality = current_app.config.get('IMAGE_QUALITY', 85)
    thumb_quality = current_app.config.get('THUMBNAIL_QUALITY', 80)

    if output_dir is None:
        output_dir = os.path.dirname(input_path)

    os.makedirs(output_dir, exist_ok=True)

    img = Image.open(input_path)

    # Convert RGBA to RGB if needed
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    # Resize if wider than max_width
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)

    base_name = os.path.splitext(os.path.basename(input_path))[0]
    result = {'original': input_path}

    # Save optimized JPEG
    jpg_path = os.path.join(output_dir, base_name + '.jpg')
    img.save(jpg_path, 'JPEG', quality=quality, optimize=True)
    result['jpg'] = jpg_path

    # Create WebP
    if create_webp:
        webp_path = os.path.join(output_dir, base_name + '.webp')
        img.save(webp_path, 'WEBP', quality=quality)
        result['webp'] = webp_path

    # Create thumbnail
    if create_thumbnail:
        thumb = img.copy()
        thumb.thumbnail(thumb_size, Image.LANCZOS)
        thumb_path = os.path.join(output_dir, base_name + '_thumb.jpg')
        thumb.save(thumb_path, 'JPEG', quality=thumb_quality, optimize=True)
        result['thumbnail'] = thumb_path

        if create_webp:
            thumb_webp_path = os.path.join(output_dir, base_name + '_thumb.webp')
            thumb.save(thumb_webp_path, 'WEBP', quality=thumb_quality)
            result['thumbnail_webp'] = thumb_webp_path

    return result
