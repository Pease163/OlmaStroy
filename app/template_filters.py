import re


RU_MONTHS = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
             'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']


def ru_date_filter(dt):
    """Форматирование даты на русском: '15 января 2025'"""
    return f"{dt.day} {RU_MONTHS[dt.month]} {dt.year}"


def reading_time_filter(html_content):
    """Подсчёт времени чтения из HTML-контента"""
    text = re.sub(r'<[^>]+>', '', str(html_content))
    word_count = len(text.split())
    minutes = max(1, round(word_count / 200))
    return f"{minutes} мин."


def init_template_filters(app):
    """Register Jinja2 template filters."""
    app.template_filter('ru_date')(ru_date_filter)
    app.template_filter('reading_time')(reading_time_filter)
