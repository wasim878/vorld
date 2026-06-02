import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// Scene
const scene = new THREE.Scene();


// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 3;


// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

document.body.appendChild(renderer.domElement);


// Cube
const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshStandardMaterial({
  color: 0x00ffff
});

const cube = new THREE.Mesh(
  geometry,
  material
);

scene.add(cube);


// Lights
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  1
);

scene.add(ambientLight);

const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

directionalLight.position.set(
  5,
  5,
  5
);

scene.add(directionalLight);


// Animation Loop
function animate() {

  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(
    scene,
    camera
  );
}

animate();


// Resize
window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);