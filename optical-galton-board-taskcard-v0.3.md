# Task Card — `optical-galton-board`

Repository set-up · v0.3 · 26 June 2026 · Status: cleared for Phase 0

## Changes from v0.2

- **Appendix A dephasing channel corrected.** Dephasing now acts on the full directed-edge basis each layer, not on local chirality off-diagonals only. This guarantees the exact γ=0 Pascal limit; the previous formulation left spatially-separated recombination coherences alive.
- **γ kept real in v0.** Display slider is \|γ\|∈[0,1]; the internal model uses γ∈[0,1]⊂ℝ, deliberately isolating loss of coherence from any added phase offset. Complex γ=⟨m₁\|m₂⟩ (magnitude → visibility, phase → relative shift) noted as a later extension.
- **Appendix B explanation revised.** Removed the "factor of i decouples the lobes" gloss; mirror symmetry is now stated as convention-dependent and to be verified numerically. Both ±i initial-coin conventions exist in the literature.
- **New §5 test.** γ=0 channel-limit equivalence: density-matrix populations after N layers must equal the standalone classical probability-engine output.
- **§12 crossover confirmed.** Non-monotonic crossover moved from open question to decided: endpoints plainly on the front page; horn → flattened → diffusive in the advanced layer.

## 1. Purpose

A small, durable public repository that is, in order of priority:

1. a teaching object for the Schülerlabor co-learning programme;
2. an honest interactive model of the random-walk → interference → decoherence sequence;
3. a light record of the Mach-1 demonstrator that anchors the model to a real bench.

It is **not** a hardware build log, and it is **not** a general programmable-optics simulation framework. Both are explicit non-goals for v0.

The repository doubles as a testbed for the co-learning pedagogy: it is organised around *predict → observe → explain*, and around inviting learners to design their own physical analogies — not around transmitting finished demonstrations.

## 2. The conceptual spine (must not drift)

The interface is organised by the two variables that actually generate the behaviour, not by three "modes":

- **Combination rule:** add *probabilities* (incoherent) vs add *amplitudes* (coherent).
- **Read-out:** *continuous* intensity vs *discrete* clicks.

This gives four cells:

| | Discrete read-out (clicks) | Continuous read-out (intensity) |
|---|---|---|
| **Add probabilities** | Classical particle Galton board; balls → binomial P(k)=C(N,k)·2⁻ᴺ; σ∝√N | Incoherent classical light; washed-out, no fringes |
| **Add amplitudes** | Single-particle quantum walk; clicks accumulate to \|ψ\|²; ballistic σ∝N, edge-enhanced | Coherent classical wave; intensity fringes I∝½(1±cosφ) |

Two pins the implementation must respect:

1. **The wave and quantum cells share one unitary, encoded as a software invariant.** For every output *j*, phase configuration, lattice depth, and coherence value in the coherent limit, I_j ≡ \|ψ_j\|². The two displays may differ *only* in rendering — continuous intensity / smooth histogram vs discrete samples drawn from the same normalised distribution. This is a regression test (§5), not a sentence.
2. **What destroys the fringes is incoherence, not classicality.** The contrast between the coherent-wave cell (fringes) and the incoherent-light cell (no fringes) carries this; a lone photon still interferes with itself. The "classical = no interference / quantum = interference" reflex must be defeated by the interaction, not parked in a footnote.

**Coherence as the organising control.** A single slider, \|γ\|∈[0,1] for display; the internal model uses **real γ∈[0,1] in v0** (Appendix A). Three related but non-identical notions sit behind it, and the technical layer must name them as distinct:

- mutual coherence between paths;
- which-path distinguishability available in an auxiliary degree of freedom;
- dephasing noise from uncontrolled phase fluctuations.

All three reduce interference; they are not operationally identical in a real experiment. v0 exposes one slider and keeps γ real, so the control washes fringes out *without* also shifting them. In general γ=⟨m₁\|m₂⟩ is complex — magnitude suppresses visibility, phase contributes a relative shift — but the complex case (and the separation of reversible marker entanglement from irreversible ensemble phase noise) is deferred to a later "advanced" control. Not for the first release.

**Which-path framing (corrected).** Do not write "which-path information *is* decoherence." Front page: the control is labelled *"How distinguishable are the paths?"*, and "more distinguishable → weaker fringes" is true without asserting an identity. Technical layer (`concepts/limits-of-the-analogy.md`) states it precisely: *marking correlates the path with an auxiliary degree of freedom; when the marker is unobserved, the path coherence available for interference is reduced by \|γ\|, and complete distinguishability (γ=0) removes the interference term.*

**The quantum-to-classical claim, qualified.** "Full coherence = quantum walk; zero coherence = classical Galton board" holds for the *specific stepwise dephasing channel* of Appendix A, in which path coherence is removed after each layer. The technical layer states this explicitly; dephasing only at the final read-out, or in a different basis, does not generally give the same limit, so we commit to the per-layer path-basis model and document it.

**Phase is first-class, not one slider among many.** In the coherent cells the per-cell phases determine everything; arbitrary phases give speckle, not a clean walk. The default convention (Appendix B) ships set to the symmetric edge-enhanced distribution; exposing phase lets a learner destroy it on purpose, which is instructive.

Headline visual: ballistic spreading with probability concentrated near the **edges** and suppressed at the centre — under the documented default — the walker most likely found far from where it started. Name it; do not bury it as "oscillatory."

## 3. Build-an-analogy: the design challenge

Constructing an analogy is a deeper act than toggling one: to build a faithful random walk a learner must isolate "independent equal-weight binary steps, accumulated"; to build interference they must find two recombining paths with a controllable relative phase. Construction forces the rule out of the apparatus.

Scaffolded by a **three-part judgement**, which requires a claim, a limitation, and a test — but is not a checklist learners merely satisfy:

| Analogy | Faithful for | Breaks at | Can be tested by |
|---|---|---|---|
| Peg board | Classical branching and binomial accumulation | No recombination of alternatives | Histogram approaches binomial |
| Ripple tank | Coherent superposition and phase-dependent fringes | No discrete single-event detection | Fringes shift with phase / path length |
| Two speakers | Interference and phase | No localised single-particle clicks | Nodes move as phase changes |
| Mach–Zehnder | Phase-controlled recombination | Classical bright-field version does not establish nonclassicality | Output fringe visibility vs phase |

The payoff is *where each analogy breaks*. The place every classical analogy ultimately breaks — single-particle interference with discrete detection — is the quantum boundary itself. Pushed far enough, the challenge lets learners rediscover the §2 qualification with their own hands.

Scope for v0: ship as (a) the prompt set plus this rubric in `docs/design-challenge.md`, and (b) the worked-example gallery above, each annotated. A learner submitting and simulating their own lattice is deferred.

## 4. Repository structure (v0 — deliberately minimal)

Dependency-free, no framework, no build step — but the engine is a shared module so the page and the tests run identical code.

```
optical-galton-board/
├── README.md            # what it is / isn't, how to run, screenshot, citation
├── LICENSE              # MIT
├── CITATION.cff         # for the eventual Zenodo DOI
├── index.html           # UI + rendering; imports engine.mjs
├── engine.mjs           # the numerical engine (amplitude / density-matrix core)
├── docs/
│   ├── concepts/
│   │   ├── random-walk.md
│   │   ├── interference-and-phase.md
│   │   ├── quantum-walk.md
│   │   └── limits-of-the-analogy.md
│   ├── design-challenge.md      # prompts + three-column rubric (§3)
│   └── build/
│       ├── mach-1.md
│       └── images/              # incl. the real fringe evidence packet (§6)
└── tests/
    └── limiting-cases.test.mjs  # imports engine.mjs (§5)
```

`index.html` imports `engine.mjs`; `tests/` imports the identical code. A README note records the growth path (extract further modules, programmable network, live data) so the minimalism reads as a decision.

## 5. Correctness tests (non-negotiable)

A physics bug in a teaching object is worse than an ordinary bug: the tool then confidently teaches something false.

- **Probability conservation after every cell/layer**, not merely at each rendered frame: ∑\|amplitude\|² = 1 (and Tr ρ = 1) at every depth.
- **Coherent-wave / coherent-click identity**: distribution(coherent-continuous) == distribution(coherent-discrete) up to numerical tolerance, across phase, depth, and coherence.
- **Classical limit, closed form**: at γ=0, output equals P_N(k)=C(N,k)·2⁻ᴺ within tolerance (full distribution, not only its variance).
- **Channel-limit equivalence (γ=0)**: density-matrix populations after N layers == standalone classical probability-engine output after N layers. Guards against a future implementation silently changing the dephasing basis while keeping the same prose claim.
- **Ballistic limit (documented default only)**: σ_N ∝ N over a sufficient depth range, alongside a regression snapshot of the default distribution. Do *not* assert twin edge-peaks universally; the edge-enhanced profile is a property of the Appendix B convention.
- **Single-MZ cell** returns I∝½(1±cosφ) across a φ sweep.
- **Visibility monotonicity (single cell)**: fringe visibility decreases monotonically as \|γ\| → 0 *for the single-cell case*. The multi-layer distribution shape is non-monotonic (§12), so this test is scoped to one cell.

## 6. Mach-1 coupling — one real evidence packet

Not deferred wholesale, but defined narrowly enough to be evidence rather than decorative apparatus photography. v0 includes:

- two output images or photodiode readings;
- at least three retarder settings;
- a visible output redistribution or fitted fringe;
- the corresponding simulated phase points, shown beside the data;
- metadata: wavelength, input condition, retarder setting, date, and whether the output is camera intensity or detector power.

The acquired system has the vocabulary for this bridge already: 50:50 non-polarising cubes, LC phase retardation, LC polarisation rotation, fibre collimation, cage-compatible mechanics.

## 7. Audience & default layer

School / general-outreach front page — one guided story, minimally mathematical, predict-observe-explain. An expandable second layer exposes amplitudes, phases, the unitary, the three coherence notions, and the non-monotonic crossover for undergraduate use. This governs default verbosity throughout.

## 8. Predict–observe–explain (interaction contract)

Before each key manipulation the interface asks the learner to commit a prediction, then reveals the result, then offers the explanation. Minimum set for v0:

- "What happens to the pattern as coherence is removed?" → the classical envelope (front page shows the endpoints crisply).
- "Where is the walker most likely to be found?" → near the edges, not the centre.
- "If you mark which path was taken, what happens to the fringes?" → they weaken and vanish as distinguishability completes.

## 9. Default mathematics

No equations on first load. The learner predicts from the graphic first. One compact equation behind an "Explain" reveal *after* the observation:

I_± = ½(1 ± cosφ).

The amplitude formulation belongs in the expanded undergraduate layer. The first visible equation must explain a result the learner has already seen.

## 10. Licensing & provenance (light FAIR)

MIT licence. `CITATION.cff` present from the start; mint a Zenodo DOI on the first tagged release. The README states scope, run instructions, and the §2 qualification, so the object is reusable and not misread. Sufficient FAIR-for-software for v0; no heavier apparatus.

## 11. Definition of done — v0

- [ ] Depth-adjustable binary lattice.
- [ ] Single coherence slider wired to real γ∈[0,1] with correct classical ↔ quantum interpolation (Appendix A).
- [ ] Phase exposed as a first-class control; default = Appendix B convention.
- [ ] Distinguishability slider and coherence are the *same* parameter, two readings.
- [ ] Four-cell read-out; wave and quantum cells provably identical in distribution (regression test passing).
- [ ] Trial-count slider; output histogram.
- [ ] Single-MZ explanatory panel with φ sweep and the one revealed equation.
- [ ] "What this does and does not show" section (the §2 qualification).
- [ ] One build page: Mach-1 sketch, photos, and the §6 evidence packet beside its simulation.
- [ ] `design-challenge.md` with prompts + three-column rubric.
- [ ] All §5 correctness tests passing in CI, importing `engine.mjs`.
- [ ] README, LICENSE (MIT), CITATION.cff.

## 12. Decisions and remaining open points

**Decided:**

- **Non-monotonic crossover.** Coming down from γ=1, a little dephasing first flattens the distribution toward a broad/uniform profile before strong dephasing gives the diffusive Gaussian: horn → flattened → binomial, not a smooth morph. The front-page slider shows the two endpoints crisply; the non-monotonic middle is exposed in the advanced layer as an explicit note, not a hidden simplification.
- **γ real in v0.** Slider washes fringes out without shifting them; complex γ deferred.

**Still open:**

- **Coin-convention sign.** Both (\|↑⟩+i\|↓⟩)/√2 and (\|↑⟩−i\|↓⟩)/√2 appear in the literature, mirrored by shift/coin-basis convention. Pin one and verify mirror symmetry numerically (Appendix B) — this is the one point that cannot be settled on paper.
- **Advanced coherence control.** When (if) to separate reversible marker entanglement from irreversible ensemble phase noise. Not v0.
- **Faithfulness rubric.** How prescriptive before it stops being inquiry — the three-column form requires a claim, a limitation, and a test, but leaves the analogy open.

---

## Appendix A — Stepwise decoherence channel (corrected)

Represent the state after each layer in the **directed-edge basis** {|e⟩}, where *e* labels an outgoing path segment (the wavefront edges leaving that layer's beam-splitters). One layer applies, in order:

1. **Coherent splitter-and-routing step:**
   ρ → U ρ U†, where U is the balanced beam-splitter network for that layer (each node mixes its two incident edge-amplitudes via the 2×2 balanced unitary and routes the outputs).
2. **Stepwise path dephasing:**
   D_γ(ρ) = γ ρ + (1−γ) Σ_e |e⟩⟨e| ρ |e⟩⟨e|, with γ ∈ [0,1] real in v0.

Thus ρ_{n+1} = D_γ(U ρ_n U†).

**Limits.**

- γ = 1 → fully coherent unitary walk.
- γ = 0 → all coherence between alternative directed paths is removed after every layer. For balanced 50:50 splitters the surviving populations evolve exactly as the classical symmetric Galton-board random walk: P_N(k) = C(N,k)·2⁻ᴺ.
- 0 < γ < 1 → interference survives but is progressively reduced with depth.

**Why the full path basis, not just chirality off-diagonals.** A density matrix retains coherence between amplitudes that have separated spatially and recombine at a downstream node. Suppressing only the local two-chirality off-diagonal at each node leaves those separated coherences alive, so they still interfere on recombination and the γ=0 limit is *not* the exact Pascal distribution. Dephasing the full directed-edge basis each layer removes every coherence at birth, so no two paths reach a downstream node with a surviving phase relationship — which is what guarantees the exact classical limit.

**Physical reading.** Each layer the environment acquires a fresh orthogonal record of which directed path was taken — not merely a marker for the two incident chiralities at a node. γ=0 is therefore a complete per-layer which-path measurement, the "fully distinguishable" end of the §2 slider, and the model is deliberately Markovian: an independent record each step, no temporal correlation. In general γ=⟨m₁|m₂⟩ (magnitude → visibility, phase → relative shift); v0 fixes γ∈[0,1]⊂ℝ to isolate coherence loss from any added phase offset.

**Implementation.** At γ=0 no density matrix is needed — a probability vector suffices. For intermediate γ, hold the wavefront density matrix: the per-layer state dimension is ~2(N+1), so the density matrix is ~O((N+1)²) entries at the final layer — cheap into many dozens of layers. The binding constraint on depth is pedagogical legibility, not computation.

## Appendix B — Default coin, input, and phase convention

To obtain a left–right symmetric, edge-enhanced ballistic distribution, fix and document the following default (anchored on the textbook Hadamard walk, which is verifiable; the physical 50:50 beam-splitter is unitarily equivalent up to a documented local phase convention on the modes):

- **Coin:** Hadamard, C = (1/√2)[[1, 1], [1, −1]], applied at every node.
- **Initial state:** a symmetric coin state with a complex relative phase, (\|↑⟩ ± i\|↓⟩)/√2. The sign that yields mirror symmetry depends on the shift/coin-basis convention — both appear in the literature — so the implementation chooses one and **verifies mirror symmetry numerically** rather than treating the sign as convention-independent.
- **Why this initial state:** with the stated Hadamard and shift conventions, this relative phase makes the resulting position probability distribution mirror symmetric. (Do not describe it as "decoupling the chiral lobes"; state it as the symmetry property it produces, and confirm by computation.)
- **Profile:** ballistic; support scaling as ±N/√2; two peaks near the ballistic front (edge-enhanced); σ_N ∝ N.
- **Contrast option:** single-port input (\|↑⟩) reproduces the asymmetric / drifting Hadamard profile — offered as a deliberate contrast, never the default.
- **Phase control φ:** a per-cell relative phase inserted before recombination (physically the LC retarder); φ = 0 by default. Arbitrary per-cell φ destroys the clean walk into speckle — exposed as the "break it on purpose" control.
