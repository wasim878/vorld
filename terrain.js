// /vorld/terrain.js

import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

class VorldTerrain {

  constructor() {
    this.size = 500;
    this.divisions = 100;
    this.mesh = null;
    this.grid = null;
  }

  create(scene) {

    // --- BLACK SURFACE ---
    const geometry = new THREE.PlaneGeometry(this.size, this.size);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 1,
      metalness: 0
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;

    scene.add(this.mesh);

    // --- GREEN GRID ---
    this.grid = new THREE.GridHelper(
      this.size,
      this.divisions,
      0x00ff00,
      0x00ff00
    );

    scene.add(this.grid);
  }

}

export const VorldTerrainSystem = new VorldTerrain();