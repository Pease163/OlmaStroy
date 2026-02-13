import re

TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def generate_slug(title):
    """Generate a URL-safe slug from a title, transliterating Cyrillic characters."""
    slug = title.lower().strip()
    result = []
    for char in slug:
        if char in TRANSLIT_MAP:
            result.append(TRANSLIT_MAP[char])
        elif char.isalnum() or char == '-':
            result.append(char)
        elif char == ' ':
            result.append('-')
    slug = ''.join(result)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug
