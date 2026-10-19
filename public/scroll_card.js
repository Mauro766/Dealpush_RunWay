gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// CONFIGURACIÓN DE TARJETAS (CARDS_DATA)
// - Estilo idéntico a la imagen de referencia:
//   * 5 tarjetas con niveles arquitectónicos: 'high' (alto), 'low' (bajo), 'mid' (medio)
//   * Controlado por CSS estructurado (inmune a reseteos de transform)
//   * Rectángulos 100% nivelados (0° rotación)
// ==========================================================================
const CARDS_DATA = [
    {
        id: 1,
        title: "BMW M4 Competition",
        image: "/texture/BMW_M4_Competition.jpg",
        level: "high"   // Alto (-95px)
    },
    {
        id: 2,
        title: "Porsche 911 Carrera",
        image: "/texture/porsche_911.jpg",
        level: "low"    // Bajo (+85px, primer plano central)
    },
    {
        id: 3,
        title: "Nissan Frontier Pickup",
        image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
        level: "mid"    // Medio-Alto (-30px)
    },
    {
        id: 4,
        title: "Audi R8 V10 Plus",
        image: "/texture/Audi_R8.jpg",
        level: "high"   // Alto (-95px)
    },
    {
        id: 5,
        title: "Mercedes-AMG GT",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
        level: "low"    // Bajo (+85px)
    }
];

function renderCards(track) {
    track.innerHTML = "";
    CARDS_DATA.forEach((card, index) => {
        const cardEl = document.createElement("div");
        // Asignamos la clase de nivel de zig-zag estructural (high, low, mid)
        cardEl.className = `gallery-card gallery-card--${card.level}`;
        cardEl.setAttribute("data-card-index", index);
        cardEl.setAttribute("data-level", card.level);

        cardEl.innerHTML = `
            <img src="${card.image}" alt="${card.title}" loading="lazy">
        `;
        track.appendChild(cardEl);
    });

    const totalEl = document.getElementById("counterTotal");
    if (totalEl) totalEl.textContent = CARDS_DATA.length;
}

// Efecto de protagonista: escala e interpolación suave al centro
function updateProtagonistCards(cards, prefersReducedMotion) {
    if (prefersReducedMotion) return;

    const centerX = window.innerWidth / 2;
    const maxDist = window.innerWidth * 0.36;

    const isMobile = window.innerWidth <= 900;
    const minScale = isMobile ? 0.92 : 0.90;
    const maxScale = isMobile ? 1.08 : 1.16;

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((cardEl, index) => {
        const rect = cardEl.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(centerX - cardCenter);

        if (dist < minDistance) {
            minDistance = dist;
            closestIndex = index;
        }

        const norm = Math.min(dist / maxDist, 1);
        const factor = 0.5 * (1 + Math.cos(norm * Math.PI));

        const targetScale = minScale + factor * (maxScale - minScale);
        const targetOpacity = 0.72 + factor * 0.28;
        const targetZIndex = Math.round(10 + factor * 40);

        // Desenfoque suave en las tarjetas no centrales (efecto profundidad como el Audi de la imagen)
        const blurAmount = (1 - factor) * 1.5;

        gsap.set(cardEl, {
            scale: targetScale,
            opacity: targetOpacity,
            zIndex: targetZIndex,
            filter: `blur(${blurAmount.toFixed(1)}px)`
        });
    });

    // Actualizar contador numérico (1 | 5)
    const currentCounterEl = document.getElementById("counterCurrent");
    if (currentCounterEl) {
        currentCounterEl.textContent = closestIndex + 1;
    }
}

function initHorizontalGallery() {
    const track = document.getElementById("galleryTrack");
    const container = document.querySelector(".contacto_container");
    if (!track || !container) return;

    // Renderizar tarjetas con sus clases de nivel
    renderCards(track);

    const cards = Array.from(track.querySelectorAll(".gallery-card"));
    if (!cards.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Calcular distancia de desplazamiento horizontal
    const calculateDistance = () => {
        const firstCard = cards[0];
        const lastCard = cards[cards.length - 1];

        const firstCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2;
        const lastCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2;
        return -(lastCenter - firstCenter);
    };

    // ScrollTrigger Horizontal con Pinning
    gsap.to(track, {
        x: () => calculateDistance(),
        ease: "none",
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: () => `+=${Math.abs(calculateDistance()) + 750}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: () => {
                updateProtagonistCards(cards, prefersReducedMotion);
            }
        }
    });

    // Estado inicial
    updateProtagonistCards(cards, prefersReducedMotion);

    // Reajustes en resize
    window.addEventListener("resize", () => {
        updateProtagonistCards(cards, prefersReducedMotion);
        ScrollTrigger.refresh();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHorizontalGallery);
} else {
    initHorizontalGallery();
}
