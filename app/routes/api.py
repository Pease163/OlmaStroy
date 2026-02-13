import logging

from flask import Blueprint, request, jsonify, current_app, render_template
from flask_mail import Message

from app.extensions import db, mail
from app.models.contact import ContactSubmission

api_bp = Blueprint('api', __name__, url_prefix='/api')
logger = logging.getLogger(__name__)


def _send_contact_email(name, phone, email, subject, message):
    """Send email notification about new contact submission."""
    try:
        recipient = current_app.config.get('MAIL_RECIPIENT')
        if not recipient or not current_app.config.get('MAIL_USERNAME'):
            return  # Mail not configured

        html = render_template('email/new_contact.html',
                               name=name, phone=phone, email=email,
                               subject=subject, message=message)
        msg = Message(
            subject=f'Новая заявка с сайта: {name}',
            recipients=[recipient],
            html=html,
        )
        mail.send(msg)
    except Exception:
        logger.exception('Failed to send contact email notification')


@api_bp.route('/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'success': False, 'error': 'Неверный формат данных.'}), 400

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()
    subject = (data.get('subject') or '').strip()

    if not name:
        return jsonify({'success': False, 'error': 'Поле "Имя" обязательно.'}), 400

    if not phone and not email:
        return jsonify({'success': False, 'error': 'Укажите телефон или email.'}), 400

    submission = ContactSubmission(
        name=name,
        phone=phone,
        email=email,
        message=message,
        subject=subject,
    )
    db.session.add(submission)
    db.session.commit()

    _send_contact_email(name, phone, email, subject, message)

    return jsonify({'success': True, 'message': 'Заявка успешно отправлена!'}), 201
