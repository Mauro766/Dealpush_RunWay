gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector(".header");

// El header empieza oculto arriba
if (header) {
    gsap.set(header, {
        opacity: 0,
        y: -40
    });
}

function showRunway() {
    if (header) {
        gsap.to(header, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out"
        });
    }
}