/**
 * Cosmology Simulator: Friedmann Equations & Fate Predictor
 */

export class CosmologyModel {
  constructor(omegaM = 0.31, omegaLambda = 0.69, h0 = 67.4) {
    this.omegaM = omegaM;
    this.omegaLambda = omegaLambda;
    this.h0 = h0;
  }

  getCurvature() {
    // Omega_k = 1 - (Omega_m + Omega_Lambda)
    const omegaK = 1.0 - (this.omegaM + this.omegaLambda);
    return parseFloat(omegaK.toFixed(3));
  }

  getDecelerationParameter() {
    // q0 = 0.5 * Omega_m - Omega_Lambda
    const q0 = 0.5 * this.omegaM - this.omegaLambda;
    return parseFloat(q0.toFixed(3));
  }

  getPredictedFate() {
    const omegaK = this.getCurvature();
    const q0 = this.getDecelerationParameter();

    if (this.omegaLambda >= 1.4) {
      return {
        title: "RUNAWAY EXPANSION (BIG RIP)",
        class: "glow-magenta",
        description: "Phantom-like dark energy overwhelms all fundamental forces. Galaxy clusters, stars, planets, and ultimately atoms themselves are ripped apart at finite cosmic time."
      };
    } else if (q0 < 0) {
      return {
        title: "ACCELERATING EXPANSION (BIG FREEZE)",
        class: "glow-cyan",
        description: `Dark energy dominates cosmic evolution (Ω_Λ > 0.5 Ω_m). Space expands indefinitely at an exponential rate, driving galaxies beyond the cosmological horizon toward maximum entropy Heat Death.`
      };
    } else if (this.omegaM > 1.0 && this.omegaLambda < 0.2) {
      return {
        title: "RECOLLAPSE (BIG CRUNCH)",
        class: "glow-gold",
        description: "High matter density halts the cosmic expansion and reverses it under gravity, collapsing all cosmic structures back into a superheated singularity."
      };
    } else {
      return {
        title: "CRITICAL COASTING (FLAT / OPEN)",
        class: "glow-cyan",
        description: "Expansion slows asymptotically toward zero, coasting forever without recollapse."
      };
    }
  }

  // Calculate expansion scale factor factor for shaders
  getExpansionMultiplier() {
    // Standard baseline H0=67.4, omegaLambda=0.69
    const lambdaEffect = Math.max(0.2, this.omegaLambda / 0.69);
    const h0Effect = this.h0 / 67.4;
    return lambdaEffect * h0Effect;
  }
}
