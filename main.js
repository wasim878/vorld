import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js?module';

import { VorldSpace } from './space.js';

// ----------------------------------
// SCENE SETUP
// ----------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ----------------------------------
// LIGHTING
// ----------------------------------

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// ----------------------------------
// CLOCK (Simulation Authority)
// ----------------------------------

const clock = new THREE.Clock();

// ----------------------------------
// MODEL LOADING
// ----------------------------------

const loader = new GLTFLoader();
let modelRef = null;

loader.load('ahad.glb', (gltf) => {

  const model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
      });
    }
  });

  scene.add(model);

  camera.position.set(0, 0, 10);
  controls.target.set(0, 0, 0);
  controls.update();

  modelRef = model;

  // Register inside Vorld space
  VorldSpace.registerCreation(
    "human_01",
    { x: model.position.x, y: model.position.y, z: model.position.z },
    { type: "character" }
  );
});

// ----------------------------------
// VORLD UPDATE LOOP
// ----------------------------------

function updateVorld(delta) {

  // In future:
  // - physics updates
  // - space dynamic updates
  // - AI decisions
  // - environment systems

  if (modelRef) {
    VorldSpace.updateCreationPosition(
      "human_01",
      {
        x: modelRef.position.x,
        y: modelRef.position.y,
        z: modelRef.position.z
      }
    );
  }
}

// ----------------------------------
// ANIMATION LOOP
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