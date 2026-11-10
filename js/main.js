import { CosmicScene } from './scene.js';
import { TimelineController, EPOCHS } from './timeline.js';
import { CosmologyModel } from './cosmology.js';
import { AICosmologist } from './ai.js';

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const currentEpochNameEl = document.getElementById('current-epoch-name');
const currentTimeDisplayEl = document.getElementById('current-time-display');
const currentTempDisplayEl = document.getElementById('current-temp-display');

const deepTimeSlider = document.getElementById('deep-time-slider');
const btnPlayPause = document.getElementById('btn-play-pause');
const milestoneMarkers = document.querySelectorAll('.milestone-marker');

// Cosmological Controls
const sliderOmegaM = document.getElementById('slider-omega-m');
const sliderOmegaLambda = document.getElementById('slider-omega-lambda');
const sliderH0 = document.getElementById('slider-h0');
const valOmegaM = document.getElementById('val-omega-m');
const valOmegaLambda = document.getElementById('val-omega-lambda');
const valH0 = document.getElementById('val-h0');
const fateResultEl = document.getElementById('fate-result');
const fateDescEl = document.getElementById('fate-desc');
const valOmegaKEl = document.getElementById('val-omega-k');
const valQ0El = document.getElementById('val-q0');

// Galaxy Inspector
const emptyStateEl = document.querySelector('.empty-state');
const galaxyDetailsEl = document.getElementById('galaxy-details');
const galNameEl = document.getElementById('gal-name');
const galStructureEl = document.getElementById('gal-structure');
const galRedshiftEl = document.getElementById('gal-redshift');
const galLookbackEl = document.getElementById('gal-lookback');
const galDmRatioEl = document.getElementById('gal-dm-ratio');
const galTypeEl = document.getElementById('gal-type');
const galDescEl = document.getElementById('gal-desc');

// AI Mentor Modal
const btnMentor = document.getElementById('btn-mentor');
const btnCloseMentor = document.getElementById('btn-close-mentor');
const aiMentorModal = document.getElementById('ai-mentor-modal');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');

// View Controls & Audio
const btnResetCam = document.getElementById('btn-reset-cam');
const audioToggleBtn = document.getElementById('audio-toggle');

// Audio Synthesizer (Web Audio API)
class CosmicAudioSynth {
  constructor() {
    this.ctx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.filter = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.filter = this.ctx.createBiquadFilter();
    this.gainNode = this.ctx.createGain();

    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 base drone

    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 harmonic

    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    this.filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.osc1.start();
    this.osc2.start();
    this.isPlaying = true;
  }

  toggle() {
    if (!this.ctx) {
      this.init();
      return true;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      this.isPlaying = true;
      return true;
    } else if (this.ctx.state === 'running') {
      this.ctx.suspend();
      this.isPlaying = false;
      return false;
    }
  }

  setEpochModulation(step) {
    if (!this.ctx || !this.filter) return;
    // Modulate audio filter with cosmic temperature & density
    // High frequency buzz at step 0 (plasma), calming drone at step 3, sub-bass at step 6
    const baseFreq = 80 + (6.0 - step) * 60;
    this.filter.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.5);
  }
}

const cosmicAudio = new CosmicAudioSynth();

// Initialize Models
const cosmology = new CosmologyModel(0.31, 0.69, 67.4);

// Initialize Three.js Scene
const scene = new CosmicScene(canvasContainer, (galaxy) => {
  displayGalaxyData(galaxy);
});

// Initialize Timeline Controller
const timeline = new TimelineController((state) => {
  onTimelineUpdate(state);
});

// Initialize AI Mentor
new AICosmologist(chatMessages, chatInput, chatForm);

/* -------------------------------------------------------------
   Galaxy Inspector Handler
------------------------------------------------------------- */
function displayGalaxyData(gal) {
  if (!gal) return;
  emptyStateEl.classList.add('hidden');
  galaxyDetailsEl.classList.remove('hidden');

  galNameEl.textContent = gal.name;
  galStructureEl.textContent = gal.structure;
  galRedshiftEl.textContent = typeof gal.redshift === 'number' ? gal.redshift.toFixed(3) : gal.redshift;
  galLookbackEl.textContent = gal.lookback;
  galDmRatioEl.textContent = gal.dmRatio;
  galTypeEl.textContent = gal.type;
  galDescEl.textContent = gal.desc;
}

// POI Quick Chips
document.querySelectorAll('.poi-chips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const targetId = chip.getAttribute('data-target');
    scene.selectPOIById(targetId);
  });
});

/* -------------------------------------------------------------
   Timeline Updates & Epoch Sync
------------------------------------------------------------- */
function onTimelineUpdate(state) {
  deepTimeSlider.value = state.step;
  const currentEpoch = state.epoch;

  // Update HUD text
  currentEpochNameEl.textContent = currentEpoch.name;
  currentTimeDisplayEl.textContent = currentEpoch.timeStr;
  currentTempDisplayEl.textContent = currentEpoch.tempStr;

  // Update Epoch Marker states
  milestoneMarkers.forEach((m, idx) => {
    if (idx === state.epochIndex) {
      m.classList.add('active');
    } else {
      m.classList.remove('active');
    }
  });

  // Push step into 3D scene shaders
  scene.setEpochStep(state.step);

  // Audio modulation
  cosmicAudio.setEpochModulation(state.step);
}

// Slider Input Event
deepTimeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  timeline.setStep(val);
});

// Milestone Click Events
milestoneMarkers.forEach(marker => {
  marker.addEventListener('click', () => {
    const targetStep = parseFloat(marker.getAttribute('data-step'));
    timeline.setStep(targetStep);
  });
});

// Play / Pause Button
btnPlayPause.addEventListener('click', () => {
  const isPlaying = timeline.togglePlay();
  btnPlayPause.textContent = isPlaying ? '⏸ Pause Journey' : '▶ Play Journey';
  btnPlayPause.style.borderColor = isPlaying ? 'var(--accent-magenta)' : 'var(--accent-cyan)';
});

/* -------------------------------------------------------------
   Cosmological Simulator (Friedmann Equations)
------------------------------------------------------------- */
function updateCosmologyUI() {
  const omegaM = parseFloat(sliderOmegaM.value);
  const omegaLambda = parseFloat(sliderOmegaLambda.value);
  const h0 = parseFloat(sliderH0.value);

  cosmology.omegaM = omegaM;
  cosmology.omegaLambda = omegaLambda;
  cosmology.h0 = h0;

  valOmegaM.textContent = omegaM.toFixed(2);
  valOmegaLambda.textContent = omegaLambda.toFixed(2);
  valH0.textContent = `${h0.toFixed(1)} km/s/Mpc`;

  // Curvature & Deceleration
  const curvature = cosmology.getCurvature();
  const q0 = cosmology.getDecelerationParameter();

  let curvType = "Flat";
  if (curvature > 0.02) curvType = "Open (Hyperbolic)";
  else if (curvature < -0.02) curvType = "Closed (Spherical)";

  valOmegaKEl.textContent = `${curvature.toFixed(2)} (${curvType})`;
  valQ0El.textContent = `${q0.toFixed(3)} (${q0 < 0 ? 'Accelerating' : 'Decelerating'})`;

  // Predicted Fate
  const fate = cosmology.getPredictedFate();
  fateResultEl.textContent = fate.title;
  fateResultEl.className = `fate-outcome ${fate.class}`;
  fateDescEl.textContent = fate.description;

  // Propagate to 3D Scene
  const mult = cosmology.getExpansionMultiplier();
  scene.setCosmologyParams(omegaM, omegaLambda, h0, mult);
}

sliderOmegaM.addEventListener('input', updateCosmologyUI);
sliderOmegaLambda.addEventListener('input', updateCosmologyUI);
sliderH0.addEventListener('input', updateCosmologyUI);

/* -------------------------------------------------------------
   AI Mentor Modal Toggles
------------------------------------------------------------- */
btnMentor.addEventListener('click', () => {
  aiMentorModal.classList.toggle('hidden');
});

btnCloseMentor.addEventListener('click', () => {
  aiMentorModal.classList.add('hidden');
});

/* -------------------------------------------------------------
   Camera & Audio UI
------------------------------------------------------------- */
btnResetCam.addEventListener('click', () => {
  scene.resetCamera();
});

audioToggleBtn.addEventListener('click', () => {
  const isRunning = cosmicAudio.toggle();
  audioToggleBtn.textContent = isRunning ? '🔊' : '🔇';
  audioToggleBtn.style.borderColor = isRunning ? 'var(--accent-cyan)' : 'var(--text-dim)';
});

// Auto-run continuous timeline animation frame
let lastTime = performance.now();
function appLoop(now) {
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  timeline.update(delta);
  requestAnimationFrame(appLoop);
}
requestAnimationFrame(appLoop);

// Initial state application
updateCosmologyUI();
timeline.setStep(3.0);
