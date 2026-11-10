import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CosmicScene {
  constructor(container, onSelectGalaxy) {
    this.container = container;
    this.onSelectGalaxy = onSelectGalaxy;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.clock = new THREE.Clock();

    // Visual layers
    this.cosmicWebMesh = null;
    this.galaxyPoints = null;
    this.cmbSphere = null;
    this.primordialPlasma = null;
    this.blackHoleGroup = null;
    this.interactivePOIObjects = [];

    // State uniforms
    this.uniforms = {
      uTime: { value: 0.0 },
      uEpochStep: { value: 3.0 }, // 0 to 6
      uExpansion: { value: 1.0 },
      uOmegaM: { value: 0.31 },
      uOmegaLambda: { value: 0.69 },
      uH0: { value: 67.4 }
    };

    this.poiData = [
      {
        id: "laniakea",
        name: "Milky Way (Local Group)",
        structure: "Laniakea Supercluster",
        pos: new THREE.Vector3(0, 0, 0),
        redshift: 0.000,
        lookback: "0.0 Gyr",
        dmRatio: "84.5%",
        type: "Barred Spiral (SBbc)",
        desc: "Our home galaxy, nestled in the Virgo Cluster branch of the vast 520-million-light-year Laniakea filamentary basin."
      },
      {
        id: "andromeda",
        name: "Andromeda Galaxy (M31)",
        structure: "Local Group",
        pos: new THREE.Vector3(15, 8, -10),
        redshift: -0.001,
        lookback: "2.5 Myr",
        dmRatio: "88.0%",
        type: "Barred Spiral (SA(s)b)",
        desc: "Major neighbor currently approaching the Milky Way under mutual gravitational attraction; will merge into 'Milkomeda' in ~4.5 Gyr."
      },
      {
        id: "bootes",
        name: "Boötes Supervoid",
        structure: "Cosmic Void",
        pos: new THREE.Vector3(120, 50, -80),
        redshift: 0.052,
        lookback: "700 Myr",
        dmRatio: "99.1% (Void deficit)",
        type: "Macro Void (~330 Mly diameter)",
        desc: "One of the largest known voids in the cosmos. Contains only ~60 galaxies in a volume that should normally contain ~2,000."
      },
      {
        id: "sloan",
        name: "Sloan Great Wall",
        structure: "Giant Galactic Filament",
        pos: new THREE.Vector3(-140, -60, 110),
        redshift: 0.078,
        lookback: "1.0 Gyr",
        dmRatio: "86.2%",
        type: "Supercluster Complex",
        desc: "A gigantic cosmic filament measuring 1.37 billion light-years across, mapped by the Sloan Digital Sky Survey."
      },
      {
        id: "shapley",
        name: "Shapley Supercluster",
        structure: "Massive Attractor Basin",
        pos: new THREE.Vector3(-90, 80, -120),
        redshift: 0.046,
        lookback: "650 Myr",
        dmRatio: "85.0%",
        type: "High-Density Supercluster",
        desc: "The largest concentration of gravitationally bound galaxies in our local universe, creating a strong cosmic dipole flow."
      }
    ];

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030308, 0.0012);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 4000);
    this.camera.position.set(0, 70, 220);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 1200;
    this.controls.minDistance = 10;

    // 5. Build components
    this.createPrimordialPlasmaLayer();
    this.createCMBSphere();
    this.createCosmicWebFilaments();
    this.createGalaxyAtlas();
    this.createBlackHoleEraLayer();
    this.createInteractivePOIs();

    // 6. Window resize and raycasting
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    // 7. Start render loop
    this.animate();
  }

  /* -------------------------------------------------------------
     EPOCH 0: Primordial Inflation & QGP Shader
  ------------------------------------------------------------- */
  createPrimordialPlasmaLayer() {
    const geo = new THREE.SphereGeometry(180, 64, 64);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uTime: this.uniforms.uTime,
        uEpochStep: this.uniforms.uEpochStep
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uEpochStep;
        varying vec3 vPosition;
        varying vec3 vNormal;

        // Simple Simplex Noise function
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          // Visibility envelope for Epoch 0 (peaks at 0, drops by 0.9)
          float visibility = smoothstep(0.9, 0.0, uEpochStep);
          if (visibility <= 0.001) discard;

          vec3 p = vPosition * 0.015 + vec3(0.0, uTime * 0.3, 0.0);
          float n = snoise(p) * 0.5 + 0.5;
          float n2 = snoise(p * 2.5 + vec3(uTime * 0.5)) * 0.5 + 0.5;

          // Hot white-orange-violet primordial plasma gradient
          vec3 c1 = vec3(1.0, 0.2, 0.05); // intense plasma orange
          vec3 c2 = vec3(0.95, 0.95, 1.0); // superheated white
          vec3 c3 = vec3(0.6, 0.05, 0.9); // high-energy violet

          vec3 col = mix(c1, c2, n);
          col = mix(col, c3, n2 * 0.4);

          gl_FragColor = vec4(col * 2.2, visibility * 0.85);
        }
      `
    });

    this.primordialPlasma = new THREE.Mesh(geo, mat);
    this.scene.add(this.primordialPlasma);
  }

  /* -------------------------------------------------------------
     EPOCH 1: Cosmic Microwave Background (Planck Thermal Fluctuations)
  ------------------------------------------------------------- */
  createCMBSphere() {
    const geo = new THREE.SphereGeometry(320, 64, 64);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: {
        uTime: this.uniforms.uTime,
        uEpochStep: this.uniforms.uEpochStep
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uEpochStep;
        varying vec3 vPos;

        // Noise functions for multipole power spectrum simulation
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          // Envelope peaks around step 1.0 (CMB Recombination)
          float dist = abs(uEpochStep - 1.0);
          float visibility = smoothstep(1.0, 0.0, dist);
          if (visibility <= 0.001) discard;

          // Multi-frequency thermal fluctuations mimicking Planck temperature anisotropy
          vec3 coord = vPos * 8.0;
          float fluc = snoise(coord) * 0.5;
          fluc += snoise(coord * 2.2) * 0.25;
          fluc += snoise(coord * 5.0) * 0.125;
          fluc += snoise(coord * 11.0) * 0.06;

          // Map to Planck color scale: Blue (cold, -200 uK) to Cyan to Orange to Red (hot, +200 uK)
          vec3 coldBlue = vec3(0.02, 0.15, 0.85);
          vec3 cyan = vec3(0.1, 0.7, 0.9);
          vec3 orange = vec3(0.95, 0.5, 0.05);
          vec3 hotRed = vec3(0.9, 0.05, 0.02);

          vec3 color = mix(coldBlue, cyan, smoothstep(-0.6, -0.05, fluc));
          color = mix(color, orange, smoothstep(-0.05, 0.25, fluc));
          color = mix(color, hotRed, smoothstep(0.25, 0.7, fluc));

          gl_FragColor = vec4(color, visibility * 0.95);
        }
      `
    });

    this.cmbSphere = new THREE.Mesh(geo, mat);
    this.scene.add(this.cmbSphere);
  }

  /* -------------------------------------------------------------
     EPOCH 2, 3, 4: Cosmic Web Dark Matter Filaments
  ------------------------------------------------------------- */
  createCosmicWebFilaments() {
    // Generate an intricate filament volume using shader points and line segments
    const filamentPointsCount = 45000;
    const positions = new Float32Array(filamentPointsCount * 3);
    const density = new Float32Array(filamentPointsCount);

    const radius = 350;
    for (let i = 0; i < filamentPointsCount; i++) {
      // Create fractal filament distributions (Zel'dovich pancake approximation)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;

      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      // Create Boötes Void: empty sphere around (120, 50, -80)
      const voidCenter = new THREE.Vector3(120, 50, -80);
      const distToVoid = new THREE.Vector3(x, y, z).distanceTo(voidCenter);
      if (distToVoid < 65) {
        // Displace particles away from void center
        const dir = new THREE.Vector3(x, y, z).sub(voidCenter).normalize();
        x = voidCenter.x + dir.x * (65 + Math.random() * 20);
        y = voidCenter.y + dir.y * (65 + Math.random() * 20);
        z = voidCenter.z + dir.z * (65 + Math.random() * 20);
      }

      // Pinch towards Sloan Great Wall plane
      if (Math.abs(z - 110) < 40 && Math.abs(x + 140) < 80) {
        y *= 0.3; // Flatten into sheet
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      density[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aDensity', new THREE.BufferAttribute(density, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: this.uniforms.uTime,
        uEpochStep: this.uniforms.uEpochStep,
        uExpansion: this.uniforms.uExpansion,
        uOmegaLambda: this.uniforms.uOmegaLambda
      },
      vertexShader: `
        attribute float aDensity;
        uniform float uTime;
        uniform float uEpochStep;
        uniform float uExpansion;
        varying float vDensity;
        varying float vAlpha;

        void main() {
          vDensity = aDensity;
          vec3 pos = position;

          // Scale with cosmological expansion
          pos *= (0.8 + 0.3 * uExpansion);

          // Dark Ages (step 2) to Web (step 3) to Degenerate (step 4)
          // Filament visibility envelope
          float vis = 0.0;
          if (uEpochStep >= 1.5 && uEpochStep <= 4.8) {
            vis = 1.0 - abs(uEpochStep - 3.0) / 1.6;
            vis = clamp(vis, 0.0, 1.0);
          }
          vAlpha = vis;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (2.5 + aDensity * 3.5) * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vDensity;
        varying float vAlpha;
        uniform float uEpochStep;

        void main() {
          if (vAlpha <= 0.01) discard;

          // Circular soft glow
          vec2 coord = gl_PointCoord - vec2(0.5);
          float d = length(coord);
          if (d > 0.5) discard;
          float falloff = smoothstep(0.5, 0.0, d);

          // Filament color shift across cosmic time:
          // Cosmic Dawn: Neutral cyan/UV
          // Present Web: Cyan-blue dark matter glow with gold galaxy nodes
          // Degenerate: Cooling red/infrared embers
          vec3 cDawn = vec3(0.2, 0.4, 0.9);
          vec3 cPresent = vec3(0.0, 0.75, 1.0);
          vec3 cDegen = vec3(0.8, 0.15, 0.05);

          vec3 color = cPresent;
          if (uEpochStep < 3.0) {
            color = mix(cDawn, cPresent, (uEpochStep - 1.5) / 1.5);
          } else {
            color = mix(cPresent, cDegen, (uEpochStep - 3.0) / 1.8);
          }

          gl_FragColor = vec4(color, falloff * vAlpha * (0.35 + 0.45 * vDensity));
        }
      `
    });

    this.cosmicWebMesh = new THREE.Points(geometry, material);
    this.scene.add(this.cosmicWebMesh);
  }

  /* -------------------------------------------------------------
     Thousands of Star/Galaxy Particles
  ------------------------------------------------------------- */
  createGalaxyAtlas() {
    const galaxyCount = 15000;
    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);

    const colorPool = [
      new THREE.Color(0xffffff), // Bright white cores
      new THREE.Color(0x70d6ff), // Blue starburst spirals
      new THREE.Color(0xffd166), // Yellow ellipticals
      new THREE.Color(0xff70a6)  // Red giants / irregulars
    ];

    for (let i = 0; i < galaxyCount; i++) {
      // Clustered around filaments
      const r = Math.pow(Math.random(), 0.6) * 320;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);

      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = colorPool[Math.floor(Math.random() * colorPool.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uEpochStep: this.uniforms.uEpochStep,
        uExpansion: this.uniforms.uExpansion
      },
      vertexShader: `
        varying vec3 vColor;
        varying float vVisibility;
        uniform float uEpochStep;
        uniform float uExpansion;

        void main() {
          vColor = color;
          vec3 pos = position * (0.8 + 0.35 * uExpansion);

          // Stars ignite during Cosmic Dawn (2.0), peak at Present (3.0), die in Degenerate (4.0 - 5.0)
          float vis = 0.0;
          if (uEpochStep >= 2.0 && uEpochStep <= 4.8) {
            vis = 1.0 - abs(uEpochStep - 3.2) / 1.7;
            vis = clamp(vis, 0.0, 1.0);
          }
          vVisibility = vis;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 4.0 * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vVisibility;
        uniform float uEpochStep;

        void main() {
          if (vVisibility <= 0.01) discard;

          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * vVisibility;

          // Redshift galaxies as time enters degenerate era
          vec3 finalColor = vColor;
          if (uEpochStep > 3.5) {
            finalColor = mix(vColor, vec3(0.7, 0.1, 0.02), (uEpochStep - 3.5) / 1.5);
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });

    this.galaxyPoints = new THREE.Points(geo, mat);
    this.scene.add(this.galaxyPoints);
  }

  /* -------------------------------------------------------------
     EPOCH 5: Black Hole Era (Hawking Radiation & Accretion Glows)
  ------------------------------------------------------------- */
  createBlackHoleEraLayer() {
    this.blackHoleGroup = new THREE.Group();

    // Create several supermassive black hole nodes with faint Hawking halos
    const bhPositions = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(60, -40, 50),
      new THREE.Vector3(-80, 50, -70),
      new THREE.Vector3(100, 20, -110),
      new THREE.Vector3(-40, -60, 90)
    ];

    bhPositions.forEach(pos => {
      // Event horizon sphere (pure black)
      const coreGeo = new THREE.SphereGeometry(6, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.copy(pos);

      // Glowing Hawking Radiation Disc/Halo
      const haloGeo = new THREE.RingGeometry(6.2, 18, 32);
      const haloMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: this.uniforms.uTime,
          uEpochStep: this.uniforms.uEpochStep
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uEpochStep;
          varying vec2 vUv;

          void main() {
            // Peaks at Epoch 5.0 (Black Hole Era)
            float dist = abs(uEpochStep - 5.0);
            float vis = smoothstep(1.1, 0.0, dist);
            if (vis <= 0.01) discard;

            float r = length(vUv - vec2(0.5));
            float ring = smoothstep(0.5, 0.2, r) * smoothstep(0.15, 0.25, r);

            // Hawking radiation spectral tint: eerie violet-cyan
            vec3 hawkingColor = vec3(0.5, 0.2, 1.0) * 1.5;
            gl_FragColor = vec4(hawkingColor, ring * vis * 0.9);
          }
        `
      });

      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(new THREE.Vector3(pos.x + 1, pos.y + 1, pos.z + 1));

      this.blackHoleGroup.add(core);
      this.blackHoleGroup.add(halo);
    });

    this.scene.add(this.blackHoleGroup);
  }

  /* -------------------------------------------------------------
     Clickable Galaxy POIs
  ------------------------------------------------------------- */
  createInteractivePOIs() {
    this.poiData.forEach(poi => {
      // Marker sprite/mesh
      const geo = new THREE.SphereGeometry(3.5, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: poi.id === 'bootes' ? 0xff007b : 0x00f3ff,
        wireframe: true
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(poi.pos);
      mesh.userData = poi;

      // Outer beacon ring
      const ringGeo = new THREE.RingGeometry(4.5, 5.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: poi.id === 'bootes' ? 0xff007b : 0x00f3ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      this.scene.add(mesh);
      this.interactivePOIObjects.push(mesh);
    });
  }

  /* -------------------------------------------------------------
     Interaction: Raycasting
  ------------------------------------------------------------- */
  onPointerDown(event) {
    // Only process left mouse click
    if (event.button !== 0) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactivePOIObjects, false);

    if (intersects.length > 0) {
      const selected = intersects[0].object.userData;
      if (this.onSelectGalaxy) {
        this.onSelectGalaxy(selected);
      }
    }
  }

  selectPOIById(id) {
    const poi = this.poiData.find(p => p.id === id);
    if (!poi) return;

    if (this.onSelectGalaxy) {
      this.onSelectGalaxy(poi);
    }

    // Smoothly pan camera towards POI
    const targetPos = poi.pos.clone().add(new THREE.Vector3(20, 25, 45));
    this.smoothCameraTo(targetPos, poi.pos);
  }

  smoothCameraTo(newPos, newTarget) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    let progress = 0;

    const animatePan = () => {
      progress += 0.04;
      if (progress <= 1.0) {
        this.camera.position.lerpVectors(startPos, newPos, progress);
        this.controls.target.lerpVectors(startTarget, newTarget, progress);
        requestAnimationFrame(animatePan);
      }
    };
    animatePan();
  }

  resetCamera() {
    this.smoothCameraTo(new THREE.Vector3(0, 70, 220), new THREE.Vector3(0, 0, 0));
  }

  /* -------------------------------------------------------------
     Dynamic Uniforms & Cosmological Updates
  ------------------------------------------------------------- */
  setEpochStep(step) {
    this.uniforms.uEpochStep.value = step;

    // Toggle Black Hole Group visibility
    if (this.blackHoleGroup) {
      this.blackHoleGroup.visible = (step >= 4.2 && step <= 5.8);
    }
  }

  setCosmologyParams(omegaM, omegaLambda, h0, expansionMultiplier) {
    this.uniforms.uOmegaM.value = omegaM;
    this.uniforms.uOmegaLambda.value = omegaLambda;
    this.uniforms.uH0.value = h0;
    this.uniforms.uExpansion.value = expansionMultiplier;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.uniforms.uTime.value += delta;

    // Slowly rotate cosmic web to give a dynamic galactic drift feeling
    if (this.cosmicWebMesh) {
      this.cosmicWebMesh.rotation.y += 0.0003;
    }
    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y += 0.0003;
    }

    // Orient POI rings toward camera
    this.interactivePOIObjects.forEach(mesh => {
      if (mesh.children[0]) {
        mesh.children[0].lookAt(this.camera.position);
      }
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
