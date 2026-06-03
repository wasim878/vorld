// ─── Scene setup ──────────────────────────────────────────────
    const container = document.getElementById('canvas-container');
    const loadingEl = document.getElementById('loading');

    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog        = new THREE.FogExp2(0x0a0a0f, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.minDistance    = 1;
    controls.maxDistance    = 20;

    // ─── Lighting ─────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x202040, 1.5));

    const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.5);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width  = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7df3c0, 1.2);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    scene.add(new THREE.PointLight(0x4488ff, 0.8, 12));

    // ─── Ground plane ─────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111120,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ─── Grid helper ──────────────────────────────────────────────
    const grid = new THREE.GridHelper(20, 30, 0x1a2a3a, 0x1a2a3a);
    grid.position.y = 0.001;
    scene.add(grid);

    // ─── Loading manager ──────────────────────────────────────────
    let loadedCount = 0;
    const totalModels = 2;

    function onModelLoaded() {
      loadedCount++;
      if (loadedCount >= totalModels) {
        loadingEl.style.display = 'none';
      }
    }

    // ─── Sahil Model ──────────────────────────────────────────────
    const SAHIL_URL = './Sahilmodel.glb';

    function addPlaceholderModel() {
      const group = new THREE.Group();

      const geo = new THREE.IcosahedronGeometry(1, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2255aa,
        roughness: 0.3,
        metalness: 0.8,
        envMapIntensity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      group.add(mesh);

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x7df3c0,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), wireMat));

      const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 8, 64);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x7df3c0, emissive: 0x3a9970, roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);

      group.position.y = 1;
      scene.add(group);
      onModelLoaded();

      return group;
    }

    let modelGroup = null;
    let carGroup   = null;

    let sahilMixer = null;

    // Load Sahil model
    const sahilLoader = new THREE.GLTFLoader();
    sahilLoader.load(
  SAHIL_URL,
  (gltf) => {

    console.log("========== MODEL INFO ==========");
    console.log("Animations:", gltf.animations);
    console.log("Animation Count:", gltf.animations.length);

    gltf.animations.forEach((clip, index) => {
      console.log(`Animation ${index}: ${clip.name}`);
    });

    let boneCount = 0;

    gltf.scene.traverse((child) => {
      if (child.isBone) {
        boneCount++;
      }
    });

    console.log("Bone Count:", boneCount);

    const model = gltf.scene;

    // Play built-in animation

if (gltf.animations.length > 0) {

    sahilMixer = new THREE.AnimationMixer(model);

    const idleAction = sahilMixer.clipAction(
        gltf.animations[0]
    );

    idleAction.play();

    console.log(
        "Playing animation:",
        gltf.animations[0].name
    );

    console.log(gltf.animations[0].tracks);
}

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.position.y += size.y * scale * 0.5;
    model.position.x += 1.8;

    scene.add(model);
    modelGroup = model;

    onModelLoaded();
  }
);

    // ─── Car (WagonR) Model ───────────────────────────────────────
    const CAR_URL = './wagonR.glb';

    const carLoader = new THREE.GLTFLoader();
    carLoader.load(
      CAR_URL,
      (gltf) => {
        const car = gltf.scene;

        const box    = new THREE.Box3().setFromObject(car);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale  = 3.5 / maxDim;

        car.scale.setScalar(scale);
        car.position.sub(center.multiplyScalar(scale));
        car.position.y += size.y * scale * 0.5;
        car.position.x -= 1.8;

        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
          }
        });

        scene.add(car);
        carGroup = car;
        onModelLoaded();
      },
      (xhr) => {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        loadingEl.textContent = `Loading Car… ${pct}%`;
      },
      (err) => {
        console.warn('Car model load failed:', err);
        const group = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(1.8, 0.7, 0.9);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.4, metalness: 0.6 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.45;
        body.castShadow = true;
        group.add(body);

        const roofGeo = new THREE.BoxGeometry(1.0, 0.5, 0.85);
        const roof = new THREE.Mesh(roofGeo, bodyMat);
        roof.position.set(-0.1, 1.0, 0);
        roof.castShadow = true;
        group.add(roof);

        const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const wheelPositions = [
          [ 0.6, 0.25,  0.52],
          [-0.6, 0.25,  0.52],
          [ 0.6, 0.25, -0.52],
          [-0.6, 0.25, -0.52],
        ];
        wheelPositions.forEach(([x, y, z]) => {
          const w = new THREE.Mesh(wheelGeo, wheelMat);
          w.rotation.z = Math.PI / 2;
          w.position.set(x, y, z);
          w.castShadow = true;
          group.add(w);
        });

        group.position.x = -1.8;
        scene.add(group);
        carGroup = group;
        onModelLoaded();
      }
    );

    // ─── Particle starfield ───────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 })));

    // ─── Resize handler ───────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ─── Car Square Path ──────────────────────────────────────────
    const SQUARE_SIZE = 3.5;
    const CENTER_X    = 1.8;
    const CENTER_Z    = 0;
    const CAR_SPEED   = 0.06;

    const squareWaypoints = [
      new THREE.Vector3(CENTER_X + SQUARE_SIZE, 0, CENTER_Z - SQUARE_SIZE),
      new THREE.Vector3(CENTER_X + SQUARE_SIZE, 0, CENTER_Z + SQUARE_SIZE),
      new THREE.Vector3(CENTER_X - SQUARE_SIZE, 0, CENTER_Z + SQUARE_SIZE),
      new THREE.Vector3(CENTER_X - SQUARE_SIZE, 0, CENTER_Z - SQUARE_SIZE),
    ];

    let waypointIndex = 0;

    // ─── Render loop ──────────────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

if (sahilMixer) {
    sahilMixer.update(delta);
}

      if (carGroup) {
        const target = squareWaypoints[waypointIndex];
        const carPos = carGroup.position;
        const dx     = target.x - carPos.x;
        const dz     = target.z - carPos.z;
        const dist   = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.1) {
          carGroup.position.x = target.x;
          carGroup.position.z = target.z;
          waypointIndex = (waypointIndex + 1) % squareWaypoints.length;
        } else {
          carGroup.position.x += (dx / dist) * CAR_SPEED;
          carGroup.position.z += (dz / dist) * CAR_SPEED;
          carGroup.rotation.y = Math.atan2(dx, dz);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();