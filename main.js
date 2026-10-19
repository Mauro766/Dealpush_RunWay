import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import Lenis from 'lenis'


// Initialize Lenis with smooth inertial scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.8,
  infinite: false,
});
window.lenis = lenis;

// Synchronize Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

// Direct GSAP Ticker synchronization for silky smooth 60-120fps lockstep updates
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


const hdrLoader = new EXRLoader();

hdrLoader.load(
  '/texture/fondo3.exr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    // Ilumina el auto y sus reflejos.
    scene.environment = texture;


    // Muestra el HDRI como fondo de toda la escena.
    scene.background = texture;

    console.log('HDRI cargado correctamente');
  },
  undefined,
  (error) => {
    console.error('Error al cargar el HDRI:', error);
  }
);


const container = document.querySelector('#scene');
const status = document.querySelector('.hero-status');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

camera.position.set(6, 2, 3);

const cameraTarget = new THREE.Vector3(0.5, 0.5, 0);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// Luces
const keyLight = new THREE.DirectionalLight(0xffffff, 4);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const sideLight = new THREE.DirectionalLight(0xb8d8ff, 1.2);
sideLight.position.set(-5, 2, 1);
scene.add(sideLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 5);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

// Modelo 3D
const loader = new GLTFLoader();
let carModel = null;

status.textContent = 'THREE.JS — LOADING CAR';

loader.load(
  '/models/auto1.1.glb',

  (gltf) => {
    carModel = gltf.scene;

    carModel.scale.setScalar(1);
    carModel.position.set(0, 0.3, 0);

    scene.add(carModel);

    console.log('Auto cargado correctamente:', carModel);

    status.textContent = 'THREE.JS — CAR LOADED';

     // El modelo ya se cargó: aparece el texto
     showRunway();
  },

  (progress) => {
    if (progress.total > 0) {
      const percent = Math.round(
        (progress.loaded / progress.total) * 100
      );

      status.textContent = `THREE.JS — LOADING ${percent}%`;
    }
  },

  (error) => {
    console.error('Error al cargar el auto:', error);
    status.textContent = 'ERROR AL CARGAR EL AUTO';
  }
);

// Adaptar la escena al tamaño de la ventana
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener('resize', resize);


 // Animación vinculada al scroll

const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '+=1600',
    scrub: 1,
    pin: true,
    anticipatePin: 1
  }
});

// 1. Primera toma: acercamiento lateral
timeline.to(camera.position, {
  x: 3,
  y: 2,
  z: 7,
  duration: 1,
  ease: 'none'
}, 0);

timeline.to(cameraTarget, {
  x: 0.5,
  y: 0.5,
  z: 0,
  duration: 1,
  ease: 'none'
}, 0);



// Transición para ocultar el primer texto
timeline.to('.hero_info', {
  opacity: 0,
  duration: 0.5,
  ease: 'power1.out',

}, 0);



// 2. Órbita alrededor del auto
// La cámara pasa hacia el costado y la parte trasera.
timeline.to(camera.position, {
  x: -5,
  y: 0,
  z: 2,
  duration: 1.5,
  ease: 'none'
}, 1);

// Aparecen las letras de la segunda animación
timeline.to('.hero_info_step2', {
  opacity: 1,
  duration: 1,
  ease: 'power1.inOut'
}, 1);

// Mantiene la atención en el vehículo durante la órbita.
timeline.to(cameraTarget, {
  x: 0,
  y: 0.5,
  z: 0,
  duration: 1.5,
  ease: 'none'
}, 2);

// Ocultar segundo texto al finalizar la toma
timeline.to('.hero_info_step2', {
  opacity: 0,
  duration: 0.5,
  ease: 'power1.out'
}, 2.5);

// 3. Alejamiento final: conservamos la idea de tu última toma.
timeline.to(camera.position, {
  x: 0,
  y: 6,
  z: -10,
  duration: 1,
  ease: 'none'
}, 3);

// Aparición de las letras de la tercera animación (a los lados del auto)
timeline.to('.hero_step3', {
  opacity: 1,
  duration: 1,
  ease: 'power1.inOut'
}, 3.5);


function animate() {
  requestAnimationFrame(animate);

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}

animate();

const scrollBtn = document.getElementById('heroScrollBtn');
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    lenis.scrollTo(window.scrollY + window.innerHeight * 0.85, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  });
}

// Intercept all internal anchor navigation links for buttery-smooth Lenis scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -30,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  });
});

// Refresh ScrollTrigger so all positions align with Lenis
ScrollTrigger.refresh();

// Delayed refresh to ensure scroll_card.js ScrollTriggers sync with Lenis
window.addEventListener('load', () => {
  setTimeout(() => ScrollTrigger.refresh(true), 300);
});
