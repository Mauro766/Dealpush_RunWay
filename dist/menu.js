/* menu.js — Nav menu toggle & header scroll shrink logic */
(function () {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const menu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');
    const header = document.querySelector('.header');

    if (toggleBtn && menu && overlay) {
        function openMenu() {
            menu.classList.add('is-open');
            overlay.classList.add('is-open');
            menu.setAttribute('aria-hidden', 'false');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        function closeMenu() {
            menu.classList.remove('is-open');
            overlay.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        toggleBtn.addEventListener('click', function () {
            const isOpen = menu.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });

        // Close on overlay click
        overlay.addEventListener('click', closeMenu);

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });

        // Close when a nav link is clicked
        menu.querySelectorAll('.nav-menu__link').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    // Scroll shrink effect for the header
    if (header) {
        let isScrolled = false;
        function updateHeaderScroll() {
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            const shouldBeScrolled = scrollY > 40;
            if (shouldBeScrolled !== isScrolled) {
                isScrolled = shouldBeScrolled;
                header.classList.toggle('is-scrolled', isScrolled);
            }
        }

        window.addEventListener('scroll', updateHeaderScroll, { passive: true });

        // Hook with Lenis if available
        if (window.lenis) {
            window.lenis.on('scroll', updateHeaderScroll);
        } else {
            const checkLenisInterval = setInterval(function () {
                if (window.lenis) {
                    window.lenis.on('scroll', updateHeaderScroll);
                    clearInterval(checkLenisInterval);
                }
            }, 200);
            setTimeout(function () { clearInterval(checkLenisInterval); }, 5000);
        }

        updateHeaderScroll();
    }
})();
