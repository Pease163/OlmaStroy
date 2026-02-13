/* ============================================
   OLMASTROY — Mobile Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    const body = document.body;

    if (!hamburger || !mobileNav) return;

    function openMenu() {
        hamburger.classList.add('active');
        mobileNav.classList.add('active');
        body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Закрыть меню');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Открыть меню');
    }

    function toggleMenu() {
        if (mobileNav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /* Toggle hamburger */
    hamburger.addEventListener('click', toggleMenu);

    /* Close on nav link click */
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    /* Close on overlay click (click on .mobile-nav itself, not children) */
    mobileNav.addEventListener('click', (e) => {
        if (e.target === mobileNav) {
            closeMenu();
        }
    });

    /* Close on Escape key */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });
});
