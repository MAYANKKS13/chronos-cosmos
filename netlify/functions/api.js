const knowledgeBase = [
  {
    keywords: ["inflation", "primordial", "exponential"],
    answer: "Cosmic Inflation occurred around 10^-36 to 10^-32 seconds after the Big Bang, driven by an inflaton field. The universe expanded exponentially by a factor of at least 10^26, smoothing out spacetime geometry and magnifying quantum fluctuations into macroscopic density perturbations that later seeded galaxies."
  },
  {
    keywords: ["dark matter", "evidence", "rotation", "lens"],
    answer: "Dark matter constitutes roughly 27% of the universe's mass-energy content. Primary empirical evidence includes galaxy rotation curves (Rubin & Ford), gravitational lensing of background galaxies by galaxy clusters, the temperature power spectrum of the Cosmic Microwave Background (Planck), and the separation of baryonic gas and gravitational mass in the Bullet Cluster."
  },
  {
    keywords: ["hubble tension", "expansion", "h0", "planck"],
    answer: "The Hubble Tension refers to a persistent 4-to-6 sigma discrepancy between the cosmic expansion rate H0 measured early in the universe (via CMB data: ~67.4 km/s/Mpc) versus late-universe local measurements (via Cepheids and Type Ia Supernovae: ~73.0 km/s/Mpc). It suggests either systematic errors or exciting new physics, like Early Dark Energy."
  },
  {
    keywords: ["cmb", "microwave background", "recombination", "planck"],
    answer: "The Cosmic Microwave Background formed roughly 380,000 years after the Big Bang (redshift z ≈ 1100) during Recombination. As temperatures cooled to ~3000 K, protons captured electrons to form neutral hydrogen, allowing photons to decouple and travel freely. Today, cosmological redshift has cooled these photons to a 2.7255 K blackbody glow with tiny 10^-5 relative temperature fluctuations."
  },
  {
    keywords: ["heat death", "big freeze", "entropy"],
    answer: "The Heat Death (or Big Freeze) is the hypothesized ultimate state of the universe under ongoing dark-energy accelerated expansion. All matter and stars decay, black holes gradually evaporate via Hawking radiation up to ~10^100 years, and the universe approaches thermodynamic equilibrium at maximum entropy with a temperature asymptotically approaching absolute zero."
  },
  {
    keywords: ["dark energy", "omega lambda", "cosmological constant"],
    answer: "Dark Energy comprises ~68% of the universe's total energy density. It behaves as a smooth, negative pressure fluid or a cosmological constant (Einstein's Lambda), accelerating the cosmic expansion rate over the last 5-6 billion years (since z ≈ 0.4)."
  }
];

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { question } = JSON.parse(event.body || "{}");

    if (!question || typeof question !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Question is required." })
      };
    }

    const qLower = question.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    for (const entry of knowledgeBase) {
      let score = 0;

      for (const kw of entry.keywords) {
        if (qLower.includes(kw)) score++;
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = entry.answer;
      }
    }

    const answer = bestMatch && maxScore > 0
      ? bestMatch
      : "As an astrophysicist, I observe that your question explores uncharted cosmic horizons. Based on standard ΛCDM cosmology, the universe evolves governed by general relativity and quantum mechanics. Try asking about Cosmic Inflation, Dark Matter evidence, the Hubble Tension, Recombination (CMB), or the Heat Death of the Universe!";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
