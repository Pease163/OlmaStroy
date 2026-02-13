/* ============================================
   OLMASTROY — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Scroll Reveal (IntersectionObserver) --- */
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* --- Timeline Progress Animation --- */
    const timeline = document.querySelector('.timeline');
    let hasTimeline = false;
    let updateTimelineProgress;
    if (timeline) {
        hasTimeline = true;
        const timelineItems = timeline.querySelectorAll('.timeline-item');

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('timeline-item--visible');
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        timelineItems.forEach(item => timelineObserver.observe(item));

        updateTimelineProgress = () => {
            const rect = timeline.getBoundingClientRect();
            const timelineTop = rect.top + window.scrollY;
            const timelineHeight = rect.height;
            const scrollPos = window.scrollY + window.innerHeight * 0.6;
            const progress = Math.min(Math.max(((scrollPos - timelineTop) / timelineHeight) * 100, 0), 100);
            timeline.style.setProperty('--timeline-progress', progress);
        };
        updateTimelineProgress();
    }

    /* --- Smooth Scroll for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* --- Unified Scroll Handler --- */
    const header = document.querySelector('header');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTopBtn = document.getElementById('scrollTop');

    const onScroll = () => {
        const scrollY = window.scrollY;

        // Navbar background
        if (header) {
            header.classList.toggle('scrolled', scrollY > 100);
        }

        // Scroll progress bar
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = scrollPercent + '%';
        }

        // Scroll to top button
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollY > 300);
        }

        // Timeline progress
        if (hasTimeline) {
            updateTimelineProgress();
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --- Counter Animation for Stats --- */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'), 10);
                    if (isNaN(target)) return;
                    const suffix = el.getAttribute('data-suffix') || '';
                    const duration = 2000;
                    const start = performance.now();

                    const animate = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);
                        el.textContent = current + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            el.textContent = target + suffix;
                        }
                    };
                    requestAnimationFrame(animate);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    /* --- Phone Input Mask --- */
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.startsWith('8')) value = '7' + value.slice(1);
            if (!value.startsWith('7')) value = '7' + value;

            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length > 4) formatted += ') ' + value.slice(4, 7);
            if (value.length > 7) formatted += '-' + value.slice(7, 9);
            if (value.length > 9) formatted += '-' + value.slice(9, 11);

            this.value = formatted;
        });

        input.addEventListener('focus', function() {
            if (!this.value) this.value = '+7';
        });

        input.addEventListener('blur', function() {
            if (this.value === '+7') this.value = '';
        });
    });

    /* --- Form Validation --- */
    document.querySelectorAll('form[novalidate]').forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;

            // Clear previous errors
            form.querySelectorAll('.form-error').forEach(err => err.textContent = '');
            form.querySelectorAll('.input-error').forEach(inp => inp.classList.remove('input-error'));

            // Check required fields
            form.querySelectorAll('[aria-required="true"], [required]').forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('input-error');
                    const errorSpan = field.parentElement.querySelector('.form-error');
                    if (errorSpan) errorSpan.textContent = 'Обязательное поле';
                }
            });

            // Check phone format
            form.querySelectorAll('input[type="tel"]').forEach(tel => {
                const digits = tel.value.replace(/\D/g, '');
                if (tel.value && digits.length !== 11) {
                    valid = false;
                    tel.classList.add('input-error');
                    const errorSpan = tel.parentElement.querySelector('.form-error');
                    if (errorSpan) errorSpan.textContent = 'Введите полный номер телефона';
                }
            });

            if (!valid) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    /* --- Header Inner Page Detection --- */
    const heroSection = document.querySelector('.hero');
    const headerEl = document.querySelector('header');
    if (headerEl && !heroSection) {
        headerEl.classList.add('header--inner');
    }

    /* --- Flash Message Close --- */
    document.querySelectorAll('.flash-message__close').forEach(btn => {
        btn.addEventListener('click', function() {
            const msg = this.closest('.flash-message');
            msg.style.opacity = '0';
            msg.style.transform = 'translateX(-20px)';
            setTimeout(() => msg.remove(), 300);
        });
    });

    /* --- Service Accordion --- */
    const serviceItems = document.querySelectorAll('.service-item[data-accordion]');
    if (serviceItems.length > 0) {
        serviceItems.forEach(item => {
            const header = item.querySelector('.service-header');
            const body = item.querySelector('.service-body');
            if (!header || !body) return;

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all others (accordion style)
                serviceItems.forEach(other => {
                    if (other !== item && other.classList.contains('open')) {
                        other.classList.remove('open');
                        other.querySelector('.service-body').style.maxHeight = '0';
                    }
                });

                // Toggle current
                if (isOpen) {
                    item.classList.remove('open');
                    body.style.maxHeight = '0';
                } else {
                    item.classList.add('open');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    }

    /* --- Cookie Banner --- */
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    if (cookieBanner && cookieAccept) {
        if (!localStorage.getItem('cookie_consent')) {
            setTimeout(() => {
                cookieBanner.classList.add('visible');
            }, 1500);
        }

        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'true');
            cookieBanner.classList.remove('visible');
        });
    }

});
