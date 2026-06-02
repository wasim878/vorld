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
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 1.2;

    // ─── Lighting ─────────────────────────────────────────────────
    // Ambient
    scene.add(new THREE.AmbientLight(0x202040, 1.5));

    // Key light (warm)
    const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.5);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width  = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Rim light (cool teal)
    const rimLight = new THREE.DirectionalLight(0x7df3c0, 1.2);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    // Fill light (soft blue)
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

    // ─── Model loading ────────────────────────────────────────────
    // 🔧 TO USE YOUR OWN MODEL:
    //    Replace MODEL_URL below with the path to your .glb / .gltf file.
    //    e.g. './models/my-world.glb'  or a full URL.
    //
    //    If MODEL_URL is null or loading fails, a procedural placeholder
    //    (icosahedron + wireframe) is shown instead so the scene always works.

    const MODEL_URL = './Sahilmodel.glb';  // ← set your model path here

    function addPlaceholderModel() {
      const group = new THREE.Group();

      // Solid core
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

      // Wireframe shell
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x7df3c0,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), wireMat));

      // Floating ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 8, 64);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x7df3c0, emissive: 0x3a9970, roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);

      group.position.y = 1;
      scene.add(group);
      loadingEl.style.display = 'none';

      return group;
    }

    let modelGroup = null;

    if (MODEL_URL) {
      const loader = new THREE.GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          const model = gltf.scene;

          // Auto-center and scale the model
          const box    = new THREE.Box3().setFromObject(model);
          const size   = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale  = 2 / maxDim;

          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));
          model.position.y += size.y * scale * 0.5; // sit on ground

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);
          modelGroup = model;
          loadingEl.style.display = 'none';
        },
        (xhr) => {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          loadingEl.textContent = `Loading… ${pct}%`;
        },
        (err) => {
          console.warn('GLTF load failed, using placeholder:', err);
          modelGroup = addPlaceholderModel();
        }
      );
    } else {
      modelGroup = addPlaceholderModel();
    }

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

    // ─── Render loop ──────────────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle bob on placeholder
      if (modelGroup && !MODEL_URL) {
        modelGroup.position.y = 1 + Math.sin(t * 1.2) * 0.08;
        modelGroup.rotation.y = t * 0.3;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();