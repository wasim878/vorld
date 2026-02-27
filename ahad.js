import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js?module';

import { VorldSpace } from './space.js';

class AhadEntity {

  constructor() {
    this.model = null;
    this.id = "ahad_01";
    this.loader = new GLTFLoader();
  }

  init(scene) {

    this.loader.load('ahad.glb', (gltf) => {

      this.model.scale.set(0.2, 0.2, 0.2);

    this.model.traverse((child) => {
  if (child.isMesh) {

    child.material = new THREE.MeshStandardMaterial({
      color: 0xFFD700,        // Gold base
      metalness: 1.0,         // Fully metallic
      roughness: 0.15,        // Slightly polished
      emissive: 0x332200,     // Subtle glow
      emissiveIntensity: 0.3
    });

    child.castShadow = true;
    child.receiveShadow = true;
  }
});

      scene.add(this.model);

      this.model.position.set(0, 0, 0);

      // Register inside Vorld
      VorldSpace.registerCreation(
        this.id,
        {
          x: this.model.position.x,
          y: this.model.position.y,
          z: this.model.position.z
        },
        { type: "character" }
      );
    });
  }

  update(delta) {

    if (!this.model) return;


    // Sync with Vorld
    VorldSpace.updateCreationPosition(
      this.id,
      {
        x: this.model.position.x,
        y: this.model.position.y,
        z: this.model.position.z
      }
    );
  }

}

export const Ahad = new AhadEntity();