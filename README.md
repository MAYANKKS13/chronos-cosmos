# ChronosCosmos 3D 🌌
### Deep Time & Macro-Scale Cosmic Web Simulation

ChronosCosmos 3D is an interactive 3D cosmological explorer designed to seamlessly unite two profound realms of modern astrophysics:
1. **The Cosmic Timeline (Deep Time)**: A logarithmic continuum spanning 13.8 billion years of cosmic past up to 10¹⁰⁰ years into deep future heat death.
2. **The 3D Macro-Scale Cosmic Web & Galaxy Atlas**: A real-time WebGL visualization of dark matter filaments, cosmic voids, superclusters, and Friedmann cosmological expansion parameters.

---

## 🌟 Key Features

### 1. Logarithmic Deep Time Continuum
Traverse 7 distinct cosmic epochs via the bottom timeline slider or playback engine:
- **Epoch 0: Primordial Inflation & QGP** ($t = 10^{-43}\text{s} \to 380,000\text{ yr}$): Superheated quark-gluon plasma driven by exponential inflation.
- **Epoch 1: Recombination & CMB** ($t = 380,000\text{ yr}$, $z \approx 1100$): Planck/WMAP thermal anisotropy map with multipole temperature fluctuations ($2.7255\text{ K}$).
- **Epoch 2: Cosmic Dark Ages & Cosmic Dawn** ($t = 100\text{ Myr} \to 1\text{ Gyr}$): Neutral hydrogen shrouds space until the first Population III stars ignite UV ionization bubbles.
- **Epoch 3: Galaxy Formation & the Modern Cosmic Web** ($t = 13.8\text{ Gyr}$, Present Day): Thousands of galaxies structured along dark matter filaments and surrounding massive voids.
- **Epoch 4: The Degenerate Era** ($t = 10^{14} \to 10^{39}\text{ yr}$): Star formation ceases; dying white, brown, and black dwarfs cool into infrared embers.
- **Epoch 5: The Black Hole Era** ($t = 10^{40} \to 10^{100}\text{ yr}$): Protons decay. Supermassive black holes rule the cosmos and slowly evaporate via Hawking radiation.
- **Epoch 6: Dark Era / Heat Death** ($t > 10^{100}\text{ yr}$): All black holes evaporate. Maximum entropy and absolute zero cosmic freeze.

### 2. Cosmological Parameters Simulator (Friedmann Equations)
Dynamically adjust fundamental cosmological density parameters to test the fate of the universe:
- **Matter Density ($\Omega_m$)** (Baryons + Cold Dark Matter)
- **Dark Energy Density ($\Omega_\Lambda$)** (Cosmological constant)
- **Hubble Constant ($H_0$)** (Cosmic expansion rate)
- Real-time computation of **Spatial Curvature** ($\Omega_k = 1 - (\Omega_m + \Omega_\Lambda)$) and **Deceleration Parameter** ($q_0 = \frac{1}{2}\Omega_m - \Omega_\Lambda$).
- Evaluates scenarios: **Big Freeze** vs **Runaway Big Rip** vs **Recollapsing Big Crunch**.

### 3. 3D Galaxy Atlas & POI Inspector
- Interactive point-of-interest markers:
  - **Milky Way & Local Group**
  - **Andromeda (M31)**
  - **Boötes Supervoid** (~330 million light-year void deficit)
  - **Sloan Great Wall** (Gigantic 1.37 Gly filament)
  - **Shapley Supercluster** (Great cosmic dipole attractor)
- Displays Redshift ($z$), Lookback time, Dark Matter ratio, and Morphology.

### 4. AI Cosmologist Mentor (Dr. Carl)
- An integrated AI mentor ready to discuss cosmological mysteries:
  - Cosmic Inflation & Quantum Fluctuations
  - Dark Matter & Gravitational Lensing Evidence
  - The Hubble Tension ($H_0$ discrepancy between Planck CMB and SH0ES Supernovae)
  - Recombination & Photon Decoupling
  - Hawking Radiation & Thermodynamic Entropy

### 5. Procedural Cosmic Audio Synth
- Built-in Web Audio drone that modulates filter frequencies and harmonics based on cosmic epoch temperature and density.

---

## 🚀 Quick Start Instructions

### Method 1: Using the Start Script
Double-click `start.bat` or run:
```bat
start.bat
```

### Method 2: Manual Node.js Startup
```bash
npm install
node server.js
```

Open your browser and navigate to:
```
http://localhost:3300
```

---

## 🛠 Tech Stack
- **Frontend**: Vanilla JavaScript (ES modules), HTML5 Canvas, Vanilla CSS (Glassmorphism HUD).
- **3D Graphics**: Three.js (r160) + Custom WebGL Shaders (GLSL).
- **Audio**: Web Audio API (real-time procedural drone synthesis).
- **Server**: Node.js & Express.
