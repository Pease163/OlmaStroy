from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user

from app.models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='')


@auth_bp.route('/admin/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.index'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        user = User.query.filter_by(username=username).first()

        if user is None or not user.check_password(password):
            flash('Неверное имя пользователя или пароль.', 'danger')
            return redirect(url_for('auth.login'))

        login_user(user)
        next_page = request.args.get('next')
        return redirect(next_page or url_for('admin.index'))

    return render_template('auth/login.html')


@auth_bp.route('/admin/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))
