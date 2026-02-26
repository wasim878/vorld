import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

// Soft sky color
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// --- Cloud Layer ---
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

const cloudMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8
});

for (let i = 0; i < 20; i++) {
  const cloudGeo = new THREE.SphereGeometry(Math.random() * 3 + 2, 16, 16);
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

  cloud.position.set(
    (Math.random() - 0.5) * 100,
    Math.random() * 20 + 10,
    (Math.random() - 0.5) * 100
  );

  cloud.scale.y = 0.6; // flatten for cloud look
  cloudGroup.add(cloud);
}

// --- Load Model ---
const loader = new GLTFLoader();

loader.load('hotelss.glb', function (gltf) {
  const model = gltf.scene;

  // Center & scale automatically
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 10 / maxDim;
  model.scale.setScalar(scale);

  scene.add(model);
});

// Camera
camera.position.set(0, 5, 20);
controls.update();

// Animate
function animate() {
  requestAnimationFrame(animate);

  // slow cloud drift
  cloudGroup.children.forEach(cloud => {
    cloud.position.x += 0.02;
    if (cloud.position.x > 50) cloud.position.x = -50;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});