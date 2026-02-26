import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Terrain
const geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
geometry.rotateX(-Math.PI / 2);

for (let i = 0; i < geometry.attributes.position.count; i++) {
  geometry.attributes.position.setY(i, Math.random() * 2);
}

geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({ color: 0x222244 });
const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

// GLB Loader
const loader = new GLTFLoader();

loader.load(
  'hotelss.glb',
  function (gltf) {
    const model = gltf.scene;

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Center the model
    model.position.sub(center);

    // Auto scale
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 10 / maxDim;
    model.scale.setScalar(scale);

    scene.add(model);

    // Position camera based on size
    camera.position.set(0, size.y * 1.5, size.z * 2);
    controls.update();
  },
  undefined,
  function (error) {
    console.error('Error loading GLB:', error);
  }
);

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});