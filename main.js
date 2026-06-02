import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);


// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 5);


// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document.body.appendChild(
    renderer.domElement
);


// Controls
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;


// Lights
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

directionalLight.position.set(
    5,
    10,
    5
);

scene.add(directionalLight);


// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: 0x222222
    })
);

ground.rotation.x = -Math.PI / 2;

scene.add(ground);


// GLB Loader
const loader = new GLTFLoader();

loader.load(
    "./Sahilmodel.glb",

    (gltf) => {

        const model = gltf.scene;

        // Auto center model
        const box =
            new THREE.Box3().setFromObject(model);

        const center =
            box.getCenter(new THREE.Vector3());

        model.position.sub(center);

        // Optional scaling
        model.scale.set(
            1,
            1,
            1
        );

        scene.add(model);

        console.log("Model Loaded");
    },

    (xhr) => {

        console.log(
            (xhr.loaded / xhr.total * 100).toFixed(0)
            + "% loaded"
        );
    },

    (error) => {

        console.error(
            "GLB Error:",
            error
        );
    }
);


// Animation Loop
function animate() {

    requestAnimationFrame(
        animate
    );

    controls.update();

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