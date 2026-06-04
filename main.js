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
    camera.position.set(0, 3, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

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
    const groundGeo = new THREE.PlaneGeometry(40, 40);
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
    const grid = new THREE.GridHelper(40, 60, 0x1a2a3a, 0x1a2a3a);
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

    // ─── Models ───────────────────────────────────────────────────
    let modelGroup = null;
    let carGroup   = null;

    // Sahil model
    const sahilLoader = new THREE.GLTFLoader();
    sahilLoader.load(
      './Sahilmodel.glb',
      (gltf) => {
        const model = gltf.scene;
        const box    = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale  = 2 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += size.y * scale * 0.5;
        model.position.set(0, 0, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        modelGroup = model;
        onModelLoaded();
      },
      (xhr) => {
        loadingEl.textContent = `Loading Sahil… ${Math.round((xhr.loaded / xhr.total) * 100)}%`;
      },
      (err) => {
        console.warn('Sahil load failed:', err);
        // Placeholder capsule
        const group = new THREE.Group();
        const geo = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x2255aa, roughness: 0.4, metalness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1;
        mesh.castShadow = true;
        group.add(mesh);
        scene.add(group);
        modelGroup = group;
        onModelLoaded();
      }
    );

    // Car model
    const carLoader = new THREE.GLTFLoader();
    carLoader.load(
      './wagonR.glb',
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
        car.position.set(6, 0, 0);

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
        loadingEl.textContent = `Loading Car… ${Math.round((xhr.loaded / xhr.total) * 100)}%`;
      },
      (err) => {
        console.warn('Car load failed:', err);
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.4, metalness: 0.6 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.9), bodyMat);
        body.position.y = 0.45; body.castShadow = true; group.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.85), bodyMat);
        roof.position.set(-0.1, 1.0, 0); roof.castShadow = true; group.add(roof);
        const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        [[ 0.6,0.25, 0.52],[-0.6,0.25, 0.52],[ 0.6,0.25,-0.52],[-0.6,0.25,-0.52]].forEach(([x,y,z]) => {
          const w = new THREE.Mesh(wheelGeo, wheelMat);
          w.rotation.z = Math.PI / 2; w.position.set(x,y,z); w.castShadow = true; group.add(w);
        });
        group.position.set(6, 0, 0);
        scene.add(group);
        carGroup = group;
        onModelLoaded();
      }
    );

    // ─── Particle starfield ───────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 80;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 })));

    // ─── Resize handler ───────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ─── Input tracking ───────────────────────────────────────────
    const keys = {};
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup',   (e) => { keys[e.code] = false; });

    // ─── Movement config ──────────────────────────────────────────
    const CHAR_SPEED   = 0.06;
    const CAR_SPEED    = 0.08;
    const TURN_SPEED   = 0.03;

    // Camera follow config
    const CAM_OFFSET   = new THREE.Vector3(0, 3, 6);  // behind & above character
    const CAM_LERP     = 0.08;                          // smoothness (lower = smoother)

    // ─── HUD ──────────────────────────────────────────────────────
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      color: #7df3c0; font-family: monospace; font-size: 13px;
      background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 8px;
      border: 1px solid #7df3c020; pointer-events: none; text-align: center;
      letter-spacing: 0.5px;
    `;
    hud.innerHTML = `
      <b>CHARACTER</b>: WASD / Arrow Keys &nbsp;|&nbsp;
      <b>CAR</b>: I J K L &nbsp;|&nbsp;
      <b>CAMERA</b>: follows character
    `;
    document.body.appendChild(hud);

    // ─── Render loop ──────────────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      clock.getDelta(); // keep clock ticking

      // ── Character movement (WASD / Arrows) ──
      if (modelGroup) {
        let moved = false;

        if (keys['KeyW'] || keys['ArrowUp']) {
          modelGroup.position.x -= Math.sin(modelGroup.rotation.y) * CHAR_SPEED;
          modelGroup.position.z -= Math.cos(modelGroup.rotation.y) * CHAR_SPEED;
          moved = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
          modelGroup.position.x += Math.sin(modelGroup.rotation.y) * CHAR_SPEED;
          modelGroup.position.z += Math.cos(modelGroup.rotation.y) * CHAR_SPEED;
          moved = true;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
          modelGroup.rotation.y += TURN_SPEED;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
          modelGroup.rotation.y -= TURN_SPEED;
        }

        // ── 3rd person camera follow ──
        const charPos = modelGroup.position;
        const charRot = modelGroup.rotation.y;

        // Rotate offset behind character based on facing direction
        const camX = charPos.x + Math.sin(charRot) * CAM_OFFSET.z;
        const camY = charPos.y + CAM_OFFSET.y;
        const camZ = charPos.z + Math.cos(charRot) * CAM_OFFSET.z;

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), CAM_LERP);
        camera.lookAt(charPos.x, charPos.y + 1, charPos.z);
      }

      // ── Car movement (IJKL) ──
      if (carGroup) {
        if (keys['KeyI']) {
          carGroup.position.x -= Math.sin(carGroup.rotation.y) * CAR_SPEED;
          carGroup.position.z -= Math.cos(carGroup.rotation.y) * CAR_SPEED;
        }
        if (keys['KeyK']) {
          carGroup.position.x += Math.sin(carGroup.rotation.y) * CAR_SPEED;
          carGroup.position.z += Math.cos(carGroup.rotation.y) * CAR_SPEED;
        }
        if (keys['KeyJ']) {
          carGroup.rotation.y += TURN_SPEED;
        }
        if (keys['KeyL']) {
          carGroup.rotation.y -= TURN_SPEED;
        }
      }

      renderer.render(scene, camera);
    }

    animate();