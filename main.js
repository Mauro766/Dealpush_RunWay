import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { applyDissolveShader } from './dissolve-shader.js';

gsap.registerPlugin(ScrollTrigger);


const hdrLoader = new EXRLoader();

hdrLoader.load(
  './texture/fondo2.exr',
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

camera.position.set(2, 0.2, 4);

const cameraTarget = new THREE.Vector3(-1, 1, 0);
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
  './models/auto1.glb',

  (gltf) => {
    carModel = gltf.scene;

    carModel.scale.setScalar(1);
    carModel.position.set(0, 0.3, 0);

    scene.add(carModel);

    // Crear textura de sombra suave
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;

    const ctx = shadowCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
      128, 128, 10,
      128, 128, 128
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.28)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Primera sombra
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      shadowMaterial
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0.7, 0, -1.3);
    shadow.renderOrder = 1;

    scene.add(shadow);

    // Segunda sombra
    const shadow2 = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      shadowMaterial.clone()
    );

    shadow2.material.opacity = 0.65;
    shadow2.rotation.x = -Math.PI / 2;
    shadow2.position.set(0.9, 0, 1.2);
    shadow2.renderOrder = 2;

    scene.add(shadow2);

    console.log('Auto cargado correctamente:', carModel);

    status.textContent = 'THREE.JS — CAR LOADED';
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
    end: '+=1200',
    scrub: 1,
    pin: true,
    anticipatePin: 1
  }
});

timeline.to(camera.position, {
  x: 6,
  y: 2,
  z: 3,
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

timeline.to(camera.position, {
  x: 0,
  y: 6,
  z: 0.01,
  duration: 1,
  ease: 'none'
}, 1);

timeline.to(cameraTarget, {
  x: 0,
  y: 0.5,
  z: 0,
  duration: 1,
  ease: 'none'
}, 1);

timeline.to(camera.position, {
  x: 0,
  y: 0,
  z: -10,
  duration: 1,
  ease: 'none'
}, 2);

timeline.to(camera.position, {
  x: 0,
  y: 6,
  z: -10,
  duration: 1,
  ease: 'none'
}, 2);


function animate() {
  requestAnimationFrame(animate);

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}

animate();
