/**
 * AI Cosmologist Mentor Client Module
 */

export class AICosmologist {
  constructor(messagesContainer, chatInput, chatForm) {
    this.messagesContainer = messagesContainer;
    this.chatInput = chatInput;
    this.chatForm = chatForm;

    this.fallbackKnowledge = [
      {
        keywords: ["inflation", "primordial", "exponential", "bang"],
        answer: "Cosmic Inflation occurred around 10⁻³⁶ to 10⁻³² seconds after the Big Bang, driven by an inflaton scalar field. Spacetime expanded faster than light, expanding by a factor of 10²⁶ or more. This resolved the horizon and flatness problems, while quantum fluctuations became the primordial seeds of cosmic structure."
      },
      {
        keywords: ["dark matter", "evidence", "rotation", "lensing", "bullet"],
        answer: "Cold Dark Matter (CDM) makes up ~85% of cosmic matter. Major observational pillars include: 1) Flat rotation curves of spiral galaxies (Vera Rubin), 2) Gravitational lensing maps of clusters, 3) Cosmic Microwave Background multipole acoustic peaks, and 4) The Bullet Cluster (1E 0657-56), where lensing mass visibly decoupled from X-ray emitting baryonic gas."
      },
      {
        keywords: ["hubble tension", "h0", "expansion", "planck", "supernova"],
        answer: "The Hubble Tension is a 5-sigma conflict between early-universe CMB sound horizon predictions (Planck H₀ ≈ 67.4 km/s/Mpc) and late-universe distance ladder measurements (SH0ES Cepheid/Type Ia supernovae H₀ ≈ 73.0 km/s/Mpc). Possible solutions include early dark energy, interacting dark matter, or sterile neutrinos."
      },
      {
        keywords: ["cmb", "microwave background", "recombination", "fluctuation", "380"],
        answer: "At t ≈ 380,000 years (z ≈ 1100), the cooling universe dropped to ~3000 K. Protons captured electrons in Recombination, letting photons decouple. Today, the expansion of space has redshifted this glow to 2.7255 Kelvin with 10⁻⁵ temperature anisotropies detected by WMAP and Planck."
      },
      {
        keywords: ["black hole", "hawking", "evaporation", "degenerate"],
        answer: "During the Black Hole Era (10⁴⁰ – 10¹⁰⁰ years), after all matter and stars have decayed, black holes dominate the cosmos. Through quantum field fluctuations near event horizons, they emit Hawking radiation, losing mass until even supermassive black holes detonate in their final gamma-ray bursts."
      },
      {
        keywords: ["heat death", "big freeze", "entropy", "void", "dark era"],
        answer: "In the Dark Era (t > 10¹⁰⁰ years), the universe achieves maximum thermodynamic entropy. Only extremely diffuse, ultra-low energy photons, neutrinos, and occasional positronium atoms remain in a near-absolute zero temperature cosmos. Time essentially loses physical meaning."
      }
    ];

    this.init();
  }

  init() {
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.chatInput.value.trim();
      if (!text) return;
      this.sendMessage(text);
      this.chatInput.value = '';
    });

    // Suggested query chips
    document.querySelectorAll('.query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent;
        this.sendMessage(text);
      });
    });
  }

  async sendMessage(query) {
    this.addMessage(query, 'user');
    this.chatInput.disabled = true;

    // Show typing placeholder
    const typingId = this.addTypingIndicator();

    try {
      const response = await fetch('/api/ask-cosmologist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (!response.ok) throw new Error('API offline');
      const data = await response.json();
      this.removeTypingIndicator(typingId);
      this.addMessage(data.answer, 'ai');
    } catch (err) {
      // Fallback locally
      this.removeTypingIndicator(typingId);
      const answer = this.getLocalAnswer(query);
      this.addMessage(answer, 'ai');
    } finally {
      this.chatInput.disabled = false;
      this.chatInput.focus();
    }
  }

  getLocalAnswer(query) {
    const q = query.toLowerCase();
    for (const item of this.fallbackKnowledge) {
      if (item.keywords.some(k => q.includes(k))) {
        return item.answer;
      }
    }
    return "From our cosmological perspective, that inquiry ventures into fascinating physics! Explore concepts like Cosmic Inflation, Dark Matter evidence, the Hubble Tension, Recombination (CMB), or the Degenerate & Black Hole Eras.";
  }

  addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    const authorDiv = document.createElement('div');
    authorDiv.className = 'msg-author';
    authorDiv.textContent = sender === 'ai' ? 'Dr. Carl (Astrophysics AI)' : 'You (Explorer)';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content';
    contentDiv.textContent = text;

    msgDiv.appendChild(authorDiv);
    msgDiv.appendChild(contentDiv);

    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message ai';
    typingDiv.innerHTML = `<div class="msg-author">Dr. Carl (Astrophysics AI)</div><div class="msg-content">Analyzing cosmological tensor fields...</div>`;
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}
