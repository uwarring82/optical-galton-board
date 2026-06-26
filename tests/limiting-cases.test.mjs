// tests/limiting-cases.test.mjs
//
// The §5 correctness suite. "A physics bug in a teaching object is worse than an
// ordinary bug: the tool then confidently teaches something false." Every test
// here pins a physical claim the UI relies on. Run with:  node --test
//
// The runner is node's built-in test module — dependency-free, no framework.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  amplitudeWalk, amplitudeMarginal,
  densityWalk, densityMarginal, densityTrace, densityHermiticityError,
  classicalWalk, classicalBinomial,
  singleMZ, mzVisibility, marginalStd, makeRng, sampleCounts,
} from '../engine.mjs';

// --- helpers ---------------------------------------------------------------

function maxAbsDiff(a, b) {
  assert.equal(a.length, b.length, 'length mismatch');
  let m = 0;
  for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i]));
  return m;
}
const peakOf = (m) => { let v = 0; for (const x of m) if (x > v) v = x; return v; };
const argmaxIndex = (m) => { let k = 0; for (let i = 0; i < m.length; i++) if (m[i] > m[k]) k = i; return k; };

// --- 1. Probability conservation after every layer -------------------------

test('Tr ρ = 1 after every layer, for every γ (with phase on)', () => {
  for (const gamma of [0, 0.25, 0.5, 0.75, 1]) {
    densityWalk(30, gamma, { phi: 0.4, onDepth: (tr, n) => {
      assert.ok(Math.abs(tr - 1) < 1e-12, `Tr=${tr} at depth ${n}, γ=${gamma}`);
    }});
  }
});

test('Σ|ψ|² = 1 after every layer (amplitude path)', () => {
  amplitudeWalk(40, { phi: 0.4, onDepth: (norm, n) => {
    assert.ok(Math.abs(norm - 1) < 1e-12, `norm=${norm} at depth ${n}`);
  }});
});

test('ρ stays Hermitian', () => {
  for (const gamma of [0, 0.5, 1]) {
    const s = densityWalk(24, gamma, { phi: 0.3 });
    assert.ok(densityHermiticityError(s.re, s.im, s.D) < 1e-12);
  }
});

// --- 2. Coherent-wave / coherent-click identity:  diag(ρ)|_{γ=1} ≡ |ψ|² -----
// The §2 pin: the wave and quantum cells share one unitary; they may differ only
// in rendering. We verify the two INDEPENDENT code paths agree to machine eps,
// across phase and depth.

test('diag(ρ) at γ=1 equals |ψ|² across phase and depth', () => {
  for (const N of [5, 12, 20]) {
    for (const phi of [0, 0.3, 1.1, Math.PI / 2, 2.0]) {
      const dq = densityMarginal(densityWalk(N, 1, { phi }));
      const aq = amplitudeMarginal(amplitudeWalk(N, { phi }));
      assert.ok(maxAbsDiff(dq, aq) < 1e-12, `N=${N}, phi=${phi}`);
    }
  }
});

// --- 3. Classical limit, closed form:  γ=0 ≡ C(N,k)2^−N (full distribution) --

test('γ=0 density marginal equals the closed-form binomial', () => {
  for (const N of [10, 20, 35]) {
    const d0 = densityMarginal(densityWalk(N, 0));
    assert.ok(maxAbsDiff(d0, classicalBinomial(N)) < 1e-12, `N=${N}`);
  }
});

// --- 4. Channel-limit equivalence: γ=0 ≡ standalone classical probability eng -
// Guards against a future change silently moving the dephasing basis while
// keeping the same prose claim.

test('γ=0 density marginal equals the standalone classical walk engine', () => {
  for (const N of [8, 20, 40]) {
    const d0 = densityMarginal(densityWalk(N, 0));
    assert.ok(maxAbsDiff(d0, classicalWalk(N)) < 1e-12, `N=${N}`);
  }
});

test('the two classical oracles agree (recursion vs closed form)', () => {
  for (const N of [10, 30, 50]) {
    assert.ok(maxAbsDiff(classicalWalk(N), classicalBinomial(N)) < 1e-12, `N=${N}`);
  }
});

// --- 5. Ballistic limit (documented default convention only) ----------------
// σ_N ∝ N, with σ/N → √(1 − 1/√2) ≈ 0.5412 for the Hadamard walk. We do NOT
// assert twin edge-peaks universally — that is an Appendix-B property (next test).

test('ballistic spreading: σ_N ∝ N at γ=1', () => {
  const ratios = [16, 32, 48, 64].map((N) => marginalStd(densityMarginal(densityWalk(N, 1)), N) / N);
  for (const r of ratios) assert.ok(r > 0.535 && r < 0.55, `σ/N=${r} outside ballistic band`);
  // doubling N doubles σ
  const s24 = marginalStd(densityMarginal(densityWalk(24, 1)), 24);
  const s48 = marginalStd(densityMarginal(densityWalk(48, 1)), 48);
  assert.ok(Math.abs(s48 / s24 - 2) < 0.03, `σ(48)/σ(24)=${s48 / s24}`);
});

test('diffusive limit: σ_N = √N at γ=0', () => {
  for (const N of [16, 32, 64]) {
    const s = marginalStd(densityMarginal(densityWalk(N, 0)), N);
    assert.ok(Math.abs(s - Math.sqrt(N)) < 1e-9, `N=${N}: σ=${s}, √N=${Math.sqrt(N)}`);
  }
});

test('regression snapshot: default N=8 marginal is unchanged', () => {
  // Frozen 2026-06-26 after the limit tests independently validated the physics.
  const expected = [
    0.00390625, 0, 0.1484375, 0, 0.2265625, 0, 0.0859375, 0, 0.0703125,
    0, 0.0859375, 0, 0.2265625, 0, 0.1484375, 0, 0.00390625,
  ];
  const got = Array.from(densityMarginal(densityWalk(8, 1)));
  assert.ok(maxAbsDiff(got, expected) < 1e-9, 'default profile drifted');
});

// --- Edge enhancement (Appendix-B convention only) --------------------------

test('default profile is edge-enhanced: peak near ±N/√2, centre suppressed', () => {
  for (const N of [12, 24, 40]) {
    const m = densityMarginal(densityWalk(N, 1));
    const xPeak = Math.abs(argmaxIndex(m) - N);
    const front = N / Math.SQRT2;
    assert.ok(Math.abs(xPeak - front) < 0.18 * N, `N=${N}: peak |x|=${xPeak}, front=${front.toFixed(2)}`);
    assert.ok(m[N] < 0.5 * m[argmaxIndex(m)], `N=${N}: centre not suppressed`);
  }
});

// --- Coin convention / mirror symmetry (the one §12 point settled by compute) -

test('default profile is mirror symmetric P(x)=P(−x), and the ±i sign does not matter', () => {
  for (const N of [10, 25]) {
    const mp = densityMarginal(densityWalk(N, 1, { coinSign: +1 }));
    const mn = densityMarginal(densityWalk(N, 1, { coinSign: -1 }));
    // symmetry of the chosen (+1) convention
    for (let p = 0; p <= N; p++) {
      assert.ok(Math.abs(mp[p] - mp[2 * N - p]) < 1e-12, `asymmetry at N=${N}`);
    }
    // the two literature signs give the *identical* position distribution
    assert.ok(maxAbsDiff(mp, mn) < 1e-12, `coin sign changed the distribution at N=${N}`);
  }
});

// --- 6. Single-MZ cell: I_± = ½(1 ± γ cosφ) --------------------------------

test('single MZ gives I_± = ½(1 ± γ cosφ) across a φ sweep', () => {
  for (const gamma of [0, 0.3, 0.7, 1]) {
    for (let i = 0; i < 24; i++) {
      const phi = (2 * Math.PI * i) / 24;
      const { Iplus, Iminus } = singleMZ(phi, gamma);
      assert.ok(Math.abs(Iplus - 0.5 * (1 + gamma * Math.cos(phi))) < 1e-12);
      assert.ok(Math.abs(Iminus - 0.5 * (1 - gamma * Math.cos(phi))) < 1e-12);
      assert.ok(Math.abs(Iplus + Iminus - 1) < 1e-12, 'MZ ports must sum to 1');
    }
  }
});

// --- 7. Visibility monotonicity (single cell only) --------------------------

test('single-cell fringe visibility decreases monotonically as |γ| → 0', () => {
  const gammas = [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.85, 1];
  let prev = -1;
  for (const g of gammas) {
    const v = mzVisibility(g);
    assert.ok(v > prev - 1e-12, 'visibility not monotonic');
    assert.ok(Math.abs(v - g) < 1e-9, `visibility should equal γ; got ${v} for ${g}`);
    prev = v;
  }
});

// --- §12 crossover (decided): the multi-layer shape is NON-monotonic ---------
// Confirmed 2026-06-26: σ is monotonic, but FLATNESS is not. A little dephasing
// flattens the horn toward a broad/near-uniform profile (peak height minimised
// at intermediate γ) before strong dephasing re-concentrates it into the
// binomial. This test pins the confirmed non-monotonicity via peak height; see
// DEVLOG for why σ is the wrong diagnostic here.

test('crossover is non-monotonic in flatness: interior peak-height minimum', () => {
  const N = 60;
  const peakAt = (g) => peakOf(densityMarginal(densityWalk(N, g)));
  const pEnds = Math.min(peakAt(1), peakAt(0));
  let pInteriorMin = Infinity;
  for (const g of [0.99, 0.97, 0.95, 0.93, 0.9]) pInteriorMin = Math.min(pInteriorMin, peakAt(g));
  assert.ok(pInteriorMin < 0.6 * pEnds,
    `flattening not observed: interior peak min ${pInteriorMin} vs endpoints ${pEnds}`);
});

// --- Read-out sampling is reproducible and converges ------------------------

test('seeded click sampling reproduces and converges to the marginal', () => {
  const m = densityMarginal(densityWalk(16, 1));
  const a = sampleCounts(m, 5000, makeRng(12345));
  const b = sampleCounts(m, 5000, makeRng(12345));
  assert.deepEqual(Array.from(a), Array.from(b), 'same seed must reproduce');
  // empirical histogram approaches the marginal for large trials
  const trials = 200000;
  const counts = sampleCounts(m, trials, makeRng(7));
  let worst = 0;
  for (let p = 0; p < m.length; p++) worst = Math.max(worst, Math.abs(counts[p] / trials - m[p]));
  assert.ok(worst < 0.01, `empirical histogram off by ${worst}`);
});
