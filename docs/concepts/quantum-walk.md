# The quantum walk

*Add amplitudes. Read out clicks. Single events accumulate into an interference
pattern that is nothing like a bell curve.*

Replace the classical ball with a single quantum walker carrying a two-state
"coin." Each layer:

1. **Coin** — a Hadamard `H = (1/√2)[[1,1],[1,−1]]` mixes the two coin states
   (the balanced beam-splitter).
2. **Phase** — an optional per-cell phase `P_φ = diag(1, e^{iφ})` (the retarder;
   `φ = 0` by default).
3. **Shift** — coin-up moves right, coin-down moves left.

The walker's amplitude is spread over the lattice and the branches **recombine**
and interfere. Unlike the diffusive classical walk, the quantum walk is
**ballistic**: it spreads linearly, `σ ∝ N`, and concentrates probability near
the two ballistic fronts at `±N/√2` — **edge-enhanced**, with a suppressed centre.

> **The headline.** With the documented default convention, a single walker is
> *most likely found far from where it started*, near the edges — not piled up in
> the middle. Name it; do not bury it as "oscillatory."

## Clicks, not intensity — but the same distribution

Each run still produces one **click** at one position. Build the histogram over
many runs and it fills in `|ψ_j|²`. The crucial point of the four-cell layout:

> The coherent **wave** cell (continuous intensity) and the quantum-**walk** cell
> (discrete clicks) are computed from **one** distribution. They differ only in
> rendering — a smooth curve versus samples drawn from the same normalised
> distribution.

This identity, `I_j ≡ |ψ_j|²`, is a software invariant enforced as a regression
test: `densityWalk(N, 1)` (density matrix) and `amplitudeWalk(N)` (an
independent pure-state path) agree to ~`10⁻¹⁵` across phase and depth
(`tests/limiting-cases.test.mjs`).

## Conventions, pinned and verified

- **Initial coin state** `(|↑⟩ + i|↓⟩)/√2` makes `P(x)` mirror symmetric. We
  verified this numerically; we also found that the `−i` sign gives the
  *identical* distribution (the two states are complex conjugates and the
  evolution is real), so the literature's sign ambiguity is invisible to the
  read-out in v0. See the [development log](../../DEVLOG.md).
- **Single-port input** `|↑⟩` instead gives the asymmetric, drifting Hadamard
  profile — offered as a deliberate contrast, never the default.
- The asymptotic spread is `σ/N → √(1 − 1/√2) ≈ 0.5412`, reproduced by the engine.

## Where this picture breaks — and why that is the point

Every classical analogy (peg board, ripple tank, two speakers) reproduces *some*
of this and fails at one specific place. The place they *all* ultimately fail —
single-particle interference with discrete detection — is exactly this cell. It
is the quantum boundary. What turns it classical is covered in
[limits of the analogy](limits-of-the-analogy.md).
