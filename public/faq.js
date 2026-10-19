// ==========================================================================
// FAQ ACCORDION INTERACTION — faq.js
// Manejo interactivo de preguntas frecuentes y formulario de contacto
// ==========================================================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const btn = item.querySelector('.faq-question-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Cierra los demás items para mantener un orden minimalista
            faqItems.forEach((other) => {
                if (other !== item) {
                    other.classList.remove('is-open');
                    const otherBtn = other.querySelector('.faq-question-btn');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Conmuta el estado del item actual
            if (isOpen) {
                item.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Manejo de envío del formulario de contacto
    const contactForm = document.getElementById('dealershipContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.faq-submit-btn');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '¡Mensaje Enviado!';
                submitBtn.style.backgroundColor = '#16403d';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQAccordion);
} else {
    initFAQAccordion();
}
