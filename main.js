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

// Controls (for rotation)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Terrain
const size = 100;
const segments = 100;
const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
geometry.rotateX(-Math.PI / 2);

for (let i = 0; i < geometry.attributes.position.count; i++) {
  const y = Math.random() * 2;
  geometry.attributes.position.setY(i, y);
}

geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({ color: 0x222244 });
const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

// Load GLB model
const loader = new GLTFLoader();

loader.load('hotelss.glb', function (gltf) {
  const model = gltf.scene;
  model.position.set(0, 2, 0);
  model.scale.set(2, 2, 2);
  scene.add(model);
});

// Camera position
camera.position.set(0, 20, 40);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});