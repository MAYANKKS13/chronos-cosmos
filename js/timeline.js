/**
 * Deep Time Cosmic Timeline Controller
 */

export const EPOCHS = [
  {
    step: 0,
    name: "Primordial Inflation & QGP",
    timeStr: "t = 10⁻⁴³ s to 380,000 yr",
    tempStr: "> 10¹² K (Superheated Plasma)",
    description: "Cosmic inflation triggers exponential expansion. Quark-gluon plasma simmers until nucleosynthesis forms primordial hydrogen and helium."
  },
  {
    step: 1,
    name: "Recombination & Cosmic Microwave Background",
    timeStr: "t = 380,000 yr (z ≈ 1100)",
    tempStr: "3,000 K (Redshifting to 2.73 K)",
    description: "Electrons and protons bind into neutral hydrogen. Photons decouple, leaving the relic Planck/WMAP thermal anisotropy snapshot."
  },
  {
    step: 2,
    name: "Cosmic Dark Ages & Cosmic Dawn",
    timeStr: "t = 100 Myr – 1 Gyr (z ≈ 20 – 6)",
    tempStr: "60 K – 10 K",
    description: "Neutral hydrogen shrouds space in darkness until the first supermassive Population III stars ignite, driving cosmic reionization."
  },
  {
    step: 3,
    name: "Galaxy Formation & Modern Cosmic Web",
    timeStr: "t = 13.8 Gyr (Present Day, z = 0)",
    tempStr: "2.7255 K",
    description: "Gravity organizes billions of galaxies along cold dark matter filaments and vast cosmic voids, including Laniakea and the Boötes Void."
  },
  {
    step: 4,
    name: "The Degenerate Era",
    timeStr: "t = 10¹⁴ to 10³⁹ yr",
    tempStr: "< 10⁻³ K",
    description: "Star formation ceases. All stars burn through nuclear fuel, leaving cooling white dwarfs, neutron stars, brown dwarfs, and black holes."
  },
  {
    step: 5,
    name: "The Black Hole Era",
    timeStr: "t = 10⁴⁰ to 10¹⁰⁰ yr",
    tempStr: "10⁻¹⁴ K to 10⁻³⁰ K",
    description: "Protons decay. Stellar and supermassive black holes dominate space, slowly glowing and evaporating via quantum Hawking radiation."
  },
  {
    step: 6,
    name: "Dark Era / Heat Death",
    timeStr: "t > 10¹⁰⁰ yr (Cosmic Freeze)",
    tempStr: "0.000... K (Asymptotic 0)",
    description: "The last supermassive black holes evaporate. The universe reaches maximum thermodynamic entropy: an eternal, dark, frozen void."
  }
];

export class TimelineController {
  constructor(onChangeCallback) {
    this.currentStep = 3.0; // Default to present day
    this.isPlaying = false;
    this.playbackSpeed = 0.004;
    this.onChangeCallback = onChangeCallback;
  }

  setStep(val) {
    this.currentStep = Math.max(0, Math.min(6, val));
    if (this.onChangeCallback) {
      this.onChangeCallback(this.getCurrentState());
    }
  }

  getCurrentState() {
    const idx = Math.min(EPOCHS.length - 1, Math.floor(this.currentStep));
    const nextIdx = Math.min(EPOCHS.length - 1, idx + 1);
    const alpha = this.currentStep - idx;

    const currentEpoch = EPOCHS[idx];
    return {
      step: this.currentStep,
      epochIndex: idx,
      alpha: alpha,
      epoch: currentEpoch,
      nextEpoch: EPOCHS[nextIdx]
    };
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  update(delta) {
    if (!this.isPlaying) return;

    this.currentStep += this.playbackSpeed * (delta * 60);
    if (this.currentStep > 6.0) {
      this.currentStep = 0.0; // Loop back
    }

    if (this.onChangeCallback) {
      this.onChangeCallback(this.getCurrentState());
    }
  }
}
