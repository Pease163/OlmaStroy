document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const responseDiv = document.getElementById('contactResponse');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: ''
            };

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                responseDiv.classList.add('show');
                if (res.ok) {
                    responseDiv.className = 'form-response show success';
                    responseDiv.textContent = result.message || 'Заявка отправлена! Мы свяжемся с вами.';
                    form.reset();
                } else {
                    responseDiv.className = 'form-response show error';
                    responseDiv.textContent = result.error || 'Произошла ошибка. Попробуйте позже.';
                }
            } catch (err) {
                responseDiv.className = 'form-response show error';
                responseDiv.textContent = 'Ошибка сети. Проверьте подключение.';
            }
        });
    }
});
