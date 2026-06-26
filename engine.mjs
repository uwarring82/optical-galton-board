// engine.mjs — numerical core of the optical Galton board.
//
// One physical model, exposed several ways. The SINGLE SOURCE OF TRUTH for every
// coherence value is the density-matrix evolution (`densityWalk`): it runs the
// per-layer dephasing channel of Appendix A and is what the UI reads in every
// cell. The pure-amplitude path (`amplitudeWalk`) and the two classical engines
// (`classicalWalk`, `classicalBinomial`) are INDEPENDENT oracles used by the
// tests to pin the limits — they are deliberately written from scratch rather
// than sharing internals with the density path, so a bug in one does not hide a
// bug in the other (see DEVLOG 2026-06-26, "One evolution code path, not two").
//
// Basis. A directed edge on the line is (position x, coin c), with
//   c = 0  → "up"  / right-mover  (shift x → x+1)
//   c = 1  → "down" / left-mover  (shift x → x−1).
// This (x, c) basis *is* the directed-edge basis of Appendix A; dephasing in it
// is the ordinary "kill the off-diagonals" channel. (DEVLOG: edge basis ≡ (x,c).)
//
// One layer is  U = Shift ∘ Phase ∘ Coin  followed by the dephasing channel D_γ.
// The amplitude path applies the same Coin, Phase, Shift (no D_γ) so that at γ=1
//   diag(ρ)  ≡  |ψ|²   (the §2 invariant, checked in the test suite).
//
// Indexing. For depth N we allocate P = 2N+1 positions (x = −N … N, stored at
// p = x + N) and D = 2P basis states. A density matrix is two Float64Arrays
// (real, imag) of length D·D in row-major order: entry (a,b) at a·D + b, where a
// basis index is a = 2·p + c.

const SQRT1_2 = Math.SQRT1_2; // 1/√2

// Default coin/phase convention (Appendix B). COIN_SIGN fixes the relative phase
// of the symmetric initial coin state (|↑⟩ + i·COIN_SIGN·|↓⟩)/√2. The sign that
// yields a mirror-symmetric distribution is convention-dependent and is PINNED
// BY THE TEST SUITE, not asserted here — see tests/limiting-cases.test.mjs and
// DEVLOG. We default to +1 and the suite verifies P(x) = P(−x).
export const DEFAULTS = Object.freeze({ coinSign: +1, phi: 0 });

// ---------------------------------------------------------------------------
// Initial coin state
// ---------------------------------------------------------------------------

// Symmetric initial coin state at x = 0: (|↑⟩ + i·coinSign·|↓⟩)/√2, returned as
// an amplitude vector over the full (x,c) basis for depth N.
function initialAmplitudes(N, coinSign) {
  const P = 2 * N + 1, D = 2 * P;
  const re = new Float64Array(D), im = new Float64Array(D);
  const p0 = N; // x = 0
  re[2 * p0 + 0] = SQRT1_2;            // ↑ component:  1/√2
  im[2 * p0 + 1] = coinSign * SQRT1_2; // ↓ component:  i·coinSign/√2
  return { re, im, N, P, D };
}

// ---------------------------------------------------------------------------
// Amplitude (pure-state) evolution — independent oracle for the γ = 1 limit
// ---------------------------------------------------------------------------

function coinAmplitudes(re, im, P) {
  // Apply Hadamard coin H = (1/√2)[[1,1],[1,−1]] to the 2-vector at each position.
  for (let p = 0; p < P; p++) {
    const a = 2 * p, b = 2 * p + 1;
    const ar = re[a], ai = im[a], br = re[b], bi = im[b];
    re[a] = (ar + br) * SQRT1_2; im[a] = (ai + bi) * SQRT1_2;
    re[b] = (ar - br) * SQRT1_2; im[b] = (ai - bi) * SQRT1_2;
  }
}

function phaseAmplitudes(re, im, P, N, phi) {
  // Apply the per-layer phase gradient ("electric" tilt) e^{iφx} at every
  // position x, to both coin components. NOTE: a *uniform* phase per layer is a
  // gauge transformation, invisible to |ψ|² (verified to machine precision — see
  // DEVLOG 2026-06-26). The position-linear gradient is what actually distorts
  // the clean walk. φ = 0 → identity (the Appendix-B default); e^{iφx} is
  // 2π-periodic in φ, so φ = 2π returns to the clean walk.
  if (phi === 0) return;
  for (let p = 0; p < P; p++) {
    const x = p - N, c = Math.cos(phi * x), s = Math.sin(phi * x);
    for (let q = 0; q < 2; q++) {
      const k = 2 * p + q, r = re[k], i = im[k];
      re[k] = r * c - i * s; im[k] = r * s + i * c;
    }
  }
}

function shiftAmplitudes(re, im, P) {
  // S: |x,↑⟩→|x+1,↑⟩, |x,↓⟩→|x−1,↓⟩. Returns fresh arrays (it is a permutation).
  const nre = new Float64Array(re.length), nim = new Float64Array(im.length);
  for (let p = 0; p < P; p++) {
    const up = 2 * p, dn = 2 * p + 1;
    if (re[up] !== 0 || im[up] !== 0) {
      const tp = p + 1;
      if (tp >= P) throw new RangeError('amplitude up-shift out of range');
      nre[2 * tp] = re[up]; nim[2 * tp] = im[up];
    }
    if (re[dn] !== 0 || im[dn] !== 0) {
      const tp = p - 1;
      if (tp < 0) throw new RangeError('amplitude down-shift out of range');
      nre[2 * tp + 1] = re[dn]; nim[2 * tp + 1] = im[dn];
    }
  }
  return { nre, nim };
}

// Evolve the pure state. If `onDepth` is given it is called as
// onDepth(norm, n) after each layer n (n = 0 is the initial state), where
// norm = Σ|ψ|² — used by the conservation test.
export function amplitudeWalk(N, opts = {}) {
  const { coinSign = DEFAULTS.coinSign, phi = DEFAULTS.phi, onDepth } = opts;
  let { re, im, P } = initialAmplitudes(N, coinSign);
  if (onDepth) onDepth(normOfAmplitudes(re, im), 0);
  for (let n = 1; n <= N; n++) {
    coinAmplitudes(re, im, P);
    phaseAmplitudes(re, im, P, N, phi);
    const { nre, nim } = shiftAmplitudes(re, im, P);
    re = nre; im = nim;
    if (onDepth) onDepth(normOfAmplitudes(re, im), n);
  }
  return { re, im, N, P, D: 2 * P };
}

function normOfAmplitudes(re, im) {
  let s = 0;
  for (let i = 0; i < re.length; i++) s += re[i] * re[i] + im[i] * im[i];
  return s;
}

// Position marginal P(x) from an amplitude state: returns Float64Array length 2N+1
// indexed by p = x + N.
export function amplitudeMarginal(state) {
  const { re, im, P } = state;
  const out = new Float64Array(P);
  for (let p = 0; p < P; p++) {
    const up = 2 * p, dn = 2 * p + 1;
    out[p] = re[up] * re[up] + im[up] * im[up] + re[dn] * re[dn] + im[dn] * im[dn];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Density-matrix evolution — the source of truth for all γ
// ---------------------------------------------------------------------------

function initialDensity(N, coinSign) {
  // ρ = |ψ0⟩⟨ψ0| for the symmetric initial coin state at x = 0.
  const { re: pr, im: pi, D, P } = initialAmplitudes(N, coinSign);
  const re = new Float64Array(D * D), im = new Float64Array(D * D);
  for (let a = 0; a < D; a++) {
    if (pr[a] === 0 && pi[a] === 0) continue;
    for (let b = 0; b < D; b++) {
      if (pr[b] === 0 && pi[b] === 0) continue;
      // ρ_ab = ψ_a · conj(ψ_b)
      re[a * D + b] = pr[a] * pr[b] + pi[a] * pi[b];
      im[a * D + b] = pi[a] * pr[b] - pr[a] * pi[b];
    }
  }
  return { re, im, N, P, D };
}

function coinDensity(re, im, P, D) {
  // ρ → C ρ C†, C = ⊕_x H. Acts as H·B·H on each 2×2 coin sub-block B of the
  // (p1,p2) position pair. H is real so re and im transform identically.
  const half = 0.5;
  for (let p1 = 0; p1 < P; p1++) {
    for (let p2 = 0; p2 < P; p2++) {
      const base = (2 * p1) * D + (2 * p2);
      // indices of the 2×2 block B[c1][c2]
      const i00 = base, i01 = base + 1, i10 = base + D, i11 = base + D + 1;
      transformBlock(re, half, i00, i01, i10, i11);
      transformBlock(im, half, i00, i01, i10, i11);
    }
  }
}

// In place: B' = H B H with the leading 1/2 supplied as `half`.
function transformBlock(M, half, i00, i01, i10, i11) {
  const b00 = M[i00], b01 = M[i01], b10 = M[i10], b11 = M[i11];
  const s0 = b00 + b10, d0 = b00 - b10; // column-combine first (H·B)
  const s1 = b01 + b11, d1 = b01 - b11;
  M[i00] = half * (s0 + s1);
  M[i01] = half * (s0 - s1);
  M[i10] = half * (d0 + d1);
  M[i11] = half * (d0 - d1);
}

function phaseDensity(re, im, P, D, N, phi) {
  // ρ → E ρ E†, E = diag e^{iφx} (the electric tilt). Entry ((p1,·),(p2,·)) picks
  // up e^{iφ(p1−p2)}; position-diagonal blocks (p1=p2) are untouched, so the
  // populations are unchanged by the phase alone and Tr ρ and Hermiticity are
  // preserved. Applied to all four coin sub-entries of the (p1,p2) block.
  if (phi === 0) return;
  for (let p1 = 0; p1 < P; p1++) {
    for (let p2 = 0; p2 < P; p2++) {
      const d = p1 - p2; if (d === 0) continue;
      const c = Math.cos(phi * d), s = Math.sin(phi * d);
      mulInPlace(re, im, (2 * p1) * D + (2 * p2), c, s);
      mulInPlace(re, im, (2 * p1) * D + (2 * p2 + 1), c, s);
      mulInPlace(re, im, (2 * p1 + 1) * D + (2 * p2), c, s);
      mulInPlace(re, im, (2 * p1 + 1) * D + (2 * p2 + 1), c, s);
    }
  }
}

function mulInPlace(re, im, k, c, s) {
  const r = re[k], i = im[k];
  re[k] = r * c - i * s;
  im[k] = r * s + i * c;
}

function shiftDensity(re, im, P, D) {
  // ρ → S ρ S†: relabel ((p1,c1),(p2,c2)) → ((p1±,c1),(p2±,c2)). Permutation;
  // returns fresh arrays.
  const nre = new Float64Array(re.length), nim = new Float64Array(im.length);
  for (let p1 = 0; p1 < P; p1++) {
    for (let c1 = 0; c1 < 2; c1++) {
      const tp1 = c1 === 0 ? p1 + 1 : p1 - 1;
      for (let p2 = 0; p2 < P; p2++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const src = (2 * p1 + c1) * D + (2 * p2 + c2);
          if (re[src] === 0 && im[src] === 0) continue;
          const tp2 = c2 === 0 ? p2 + 1 : p2 - 1;
          if (tp1 < 0 || tp1 >= P || tp2 < 0 || tp2 >= P) {
            throw new RangeError('density shift out of range');
          }
          const dst = (2 * tp1 + c1) * D + (2 * tp2 + c2);
          nre[dst] = re[src]; nim[dst] = im[src];
        }
      }
    }
  }
  return { nre, nim };
}

function dephaseDensity(re, im, D, gamma) {
  // D_γ(ρ) = γρ + (1−γ)·diag(ρ). Equivalently: scale every off-diagonal by γ.
  if (gamma === 1) return;
  for (let a = 0; a < D; a++) {
    for (let b = 0; b < D; b++) {
      if (a === b) continue;
      const k = a * D + b;
      re[k] *= gamma; im[k] *= gamma;
    }
  }
}

// Evolve ρ through N layers at coherence γ. If `onDepth` is given it is called as
// onDepth(trace, n, {re, im, D}) after each layer (n = 0 is the initial state).
export function densityWalk(N, gamma, opts = {}) {
  const { coinSign = DEFAULTS.coinSign, phi = DEFAULTS.phi, onDepth } = opts;
  let { re, im, P, D } = initialDensity(N, coinSign);
  if (onDepth) onDepth(densityTrace(re, D), 0, { re, im, D });
  for (let n = 1; n <= N; n++) {
    coinDensity(re, im, P, D);
    phaseDensity(re, im, P, D, N, phi);
    const { nre, nim } = shiftDensity(re, im, P, D);
    re = nre; im = nim;
    dephaseDensity(re, im, D, gamma);
    if (onDepth) onDepth(densityTrace(re, D), n, { re, im, D });
  }
  return { re, im, N, P, D };
}

export function densityTrace(re, D) {
  let s = 0;
  for (let a = 0; a < D; a++) s += re[a * D + a];
  return s;
}

// Largest |ρ_ab − conj(ρ_ba)| over the matrix — should be ~0 (Hermiticity check).
export function densityHermiticityError(re, im, D) {
  let worst = 0;
  for (let a = 0; a < D; a++) {
    for (let b = 0; b < D; b++) {
      const dr = re[a * D + b] - re[b * D + a];
      const di = im[a * D + b] + im[b * D + a];
      const e = Math.hypot(dr, di);
      if (e > worst) worst = e;
    }
  }
  return worst;
}

// Position marginal P(x) from a density state: Float64Array length 2N+1.
export function densityMarginal(state) {
  const { re, P, D } = state;
  const out = new Float64Array(P);
  for (let p = 0; p < P; p++) {
    out[p] = re[(2 * p) * D + (2 * p)] + re[(2 * p + 1) * D + (2 * p + 1)];
  }
  return out;
}

// Convenience: the position marginal at depth N and coherence γ. This is the
// main entry point for the UI.
export function positionMarginal(N, gamma, opts = {}) {
  return densityMarginal(densityWalk(N, gamma, opts));
}

// Per-layer position marginals: the full space-time history of the walk through
// the lattice. Returns an array of length N+1, where entry n is the position
// marginal P_n(x) after layer n (entry 0 is the source δ at x=0), each a
// Float64Array of length 2N+1. Used by the UI to draw the lattice itself, with
// every node shaded by its occupation.
export function layerMarginals(N, gamma, opts = {}) {
  const P = 2 * N + 1;
  const layers = [];
  densityWalk(N, gamma, { ...opts, onDepth: (_trace, _n, st) => {
    const out = new Float64Array(P);
    for (let p = 0; p < P; p++) {
      out[p] = st.re[(2 * p) * st.D + (2 * p)] + st.re[(2 * p + 1) * st.D + (2 * p + 1)];
    }
    layers.push(out);
  }});
  return layers;
}

// ---------------------------------------------------------------------------
// Classical engines — independent oracles for the γ = 0 limit
// ---------------------------------------------------------------------------

// Standalone classical probability engine: the symmetric ½/½ random walk run as
// a recursion. Float64Array length 2N+1 indexed by p = x + N. This is the engine
// the §5 "channel-limit equivalence" test compares the γ=0 density walk against.
export function classicalWalk(N) {
  const P = 2 * N + 1;
  let cur = new Float64Array(P);
  cur[N] = 1; // delta at x = 0
  for (let n = 1; n <= N; n++) {
    const nxt = new Float64Array(P);
    for (let p = 0; p < P; p++) {
      if (cur[p] === 0) continue;
      nxt[p - 1] += 0.5 * cur[p]; // left
      nxt[p + 1] += 0.5 * cur[p]; // right
    }
    cur = nxt;
  }
  return cur;
}

// Closed-form binomial P_N(k) = C(N,k)·2^−N, placed at x = 2k − N (p = 2k).
// Computed via log-gamma so it is genuinely independent of the recursion above.
export function classicalBinomial(N) {
  const P = 2 * N + 1;
  const out = new Float64Array(P);
  const lnHalfN = N * Math.log(0.5);
  const lgN1 = lgamma(N + 1);
  for (let k = 0; k <= N; k++) {
    const lnC = lgN1 - lgamma(k + 1) - lgamma(N - k + 1);
    out[2 * k] = Math.exp(lnC + lnHalfN);
  }
  return out;
}

// Lanczos approximation to ln Γ(z), z > 0.
function lgamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    // reflection (not needed for our positive integer args, kept for safety)
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// ---------------------------------------------------------------------------
// Single Mach–Zehnder cell — the §9 explanatory panel
// ---------------------------------------------------------------------------

// One MZ: input on port a, 50:50 BS, relative phase φ, dephasing by γ between the
// splitters, 50:50 BS. Returns output intensities {Iplus, Iminus}. Implemented
// through the same BS/phase/dephase steps as the lattice (not the closed form),
// so the test that it equals ½(1 ± γ cosφ) is a real check of engine code.
export function singleMZ(phi, gamma) {
  // State after BS1 and the phase arm: ψ = (1/√2)(1, e^{iφ}); build ρ = |ψ⟩⟨ψ|.
  const cph = Math.cos(phi), sph = Math.sin(phi);
  // ρ (2×2), real/imag:
  let r00 = 0.5, i00 = 0;
  let r11 = 0.5, i11 = 0;
  let r01 = 0.5 * cph, i01 = -0.5 * sph; // ½ e^{−iφ}
  let r10 = 0.5 * cph, i10 = 0.5 * sph;  // ½ e^{+iφ}
  // Dephase the off-diagonals by γ.
  r01 *= gamma; i01 *= gamma; r10 *= gamma; i10 *= gamma;
  // Apply BS2 = H and read the diagonal:
  //   Iplus  = ½(ρ00 + ρ01 + ρ10 + ρ11)
  //   Iminus = ½(ρ00 − ρ01 − ρ10 + ρ11)
  const Iplus = 0.5 * (r00 + r01 + r10 + r11);
  const Iminus = 0.5 * (r00 - r01 - r10 + r11);
  return { Iplus, Iminus };
}

// Fringe visibility (Imax − Imin)/(Imax + Imin) of the Iplus port over a φ sweep.
export function mzVisibility(gamma, samples = 360) {
  let max = -Infinity, min = Infinity;
  for (let i = 0; i < samples; i++) {
    const phi = (2 * Math.PI * i) / samples;
    const I = singleMZ(phi, gamma).Iplus;
    if (I > max) max = I;
    if (I < min) min = I;
  }
  return (max - min) / (max + min);
}

// ---------------------------------------------------------------------------
// Discrete read-out — sampling clicks from a marginal
// ---------------------------------------------------------------------------

// mulberry32: tiny seeded PRNG so the "clicks" read-out is reproducible in tests
// and shareable in the classroom. Returns a function () → [0,1).
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Draw `trials` clicks from a (not necessarily normalised) marginal. Returns an
// Int32Array of counts per position index. rng defaults to Math.random.
export function sampleCounts(marginal, trials, rng = Math.random) {
  const P = marginal.length;
  const cum = new Float64Array(P);
  let acc = 0;
  for (let p = 0; p < P; p++) { acc += marginal[p]; cum[p] = acc; }
  const counts = new Int32Array(P);
  if (acc <= 0) return counts;
  for (let t = 0; t < trials; t++) {
    const u = rng() * acc;
    // binary search for the first cum[p] ≥ u
    let lo = 0, hi = P - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < u) lo = mid + 1; else hi = mid;
    }
    counts[lo]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

// Map a marginal-array index p to physical position x for depth N.
export const xFromIndex = (p, N) => p - N;

// Standard deviation of a marginal about x = 0 (the walk is centred there).
export function marginalStd(marginal, N) {
  let norm = 0, m2 = 0;
  for (let p = 0; p < marginal.length; p++) {
    const x = p - N;
    norm += marginal[p];
    m2 += marginal[p] * x * x;
  }
  return Math.sqrt(m2 / norm);
}
