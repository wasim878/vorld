alert("hey");
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js?module';

import { OrbitControls }
from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';

import { RGBELoader }
from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js?module';


// Scene
const scene = new THREE.Scene();


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

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.2;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document.body.appendChild(
    renderer.domElement
);


// Orbit Controls
const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;


// HDRI
const pmremGenerator =
    new THREE.PMREMGenerator(
        renderer
    );

new RGBELoader()
.load(

    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',

    (hdrTexture) => {

        const envMap =
            pmremGenerator
            .fromEquirectangular(
                hdrTexture
            ).texture;

        scene.environment =
            envMap;

        scene.background =
            envMap;

        hdrTexture.dispose();
        pmremGenerator.dispose();
    }

);


// Ground
const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            50,
            50
        ),

        new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 1
        })

    );

ground.rotation.x =
    -Math.PI / 2;

scene.add(
    ground
);


// Test Sphere
const sphere =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1,
            64,
            64
        ),

        new THREE.MeshPhysicalMaterial({

            color: 0xffffff,

            metalness: 1,

            roughness: 0

        })

    );

sphere.position.y = 1;

scene.add(
    sphere
);


// Resize
window.addEventListener(
    'resize',
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