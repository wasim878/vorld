import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

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

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Create terrain plane
const size = 100;
const segments = 100;

const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
geometry.rotateX(-Math.PI / 2);

// Simple height variation
for (let i = 0; i < geometry.attributes.position.count; i++) {
  const y = Math.random() * 2;
  geometry.attributes.position.setY(i, y);
}

geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0x222244,
  wireframe: false,
});

const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

// AI entity
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
const explorer = new THREE.Mesh(sphereGeometry, sphereMaterial);
explorer.position.set(0, 5, 0);
scene.add(explorer);

camera.position.set(0, 30, 50);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);

  explorer.position.x += 0.05; // simple movement

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});