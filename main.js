import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// ── Canvas & Renderer ──────────────────────────────────────────
const canvas = document.getElementById('draw');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// ── Scene & Camera ─────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// ── Controls ───────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;

// ── Lights ─────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// ── Load your GLB ──────────────────────────────────────────────
const loader = new GLTFLoader();

loader.load(
  './Sahilmodel.glb',           // 👈 put your .glb file in the same folder
  (gltf) => {
    const model = gltf.scene;

    // Auto-center & scale
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale  = 2 / Math.max(size.x, size.y, size.z);

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    model.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });

    scene.add(model);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// ── Resize ─────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Render Loop ────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
