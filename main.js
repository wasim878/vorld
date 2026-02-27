import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js?module';

import { VorldSpace } from './vorld/space.js';
import { Ahad } from './entities/ahad.js';

// ----------------------------------
// SCENE
// ----------------------------------

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ----------------------------------
// LIGHTS
// ----------------------------------

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// ----------------------------------
// CLOCK
// ----------------------------------

const clock = new THREE.Clock();

// ----------------------------------
// INIT ENTITIES
// ----------------------------------

Ahad.init(scene);

// ----------------------------------
// VORLD UPDATE LOOP
// ----------------------------------

function updateVorld(delta) {
  Ahad.update(delta);
}

// ----------------------------------
// LOOP
// ----------------------------------

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  updateVorld(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ----------------------------------
// RESIZE
// ----------------------------------

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});