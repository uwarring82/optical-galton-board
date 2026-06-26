# Development log — `optical-galton-board`

A lab notebook, not a changelog. It records **what was done, why, what was
considered and rejected, and what is still unverified**. Entries are
append-only and dated. When a later entry overturns an earlier claim, the
earlier entry stays and the later one cites it — the record of being wrong is
part of the science.

Conventions:
- **W** = work done · **C** = choice made (with the alternative not taken) ·
  **M** = missed/rejected route · **?** = open / unverified · **!** = correction
  of a previous entry.

---

## 2026-06-26 — Session 1: scaffolding + engine design

Starting state: repository contained only `optical-galton-board-taskcard-v0.3.md`
(the v0.3 task card, cleared for Phase 0). Not yet a git repo. No code.

### W — Repository scaffolding
- `git init`; created the §4 directory tree (`docs/concepts`, `docs/build/images`,
  `tests`).
- FAIR/provenance first (§10): `LICENSE` (MIT), `CITATION.cff` (version 0.0.0,
  DOI deferred to first tagged release), `.gitignore` (records that the
  dependency-free / no-build-step choice is deliberate).

### C — One evolution code path, not two
The task card's hardest invariant (§2 pin 1, §5) is `I_j ≡ |ψ_j|²` between the
wave and quantum cells. The cleanest way to *guarantee* that rather than test it
after the fact is to run **one** evolution and render it two ways. But the
density-matrix path is needed anyway for `0 < γ < 1`.

Decision: the **density-matrix evolution is the single source of truth** for all
γ. A separate pure-amplitude evolution exists only as an independent oracle in
the tests — if `diag(ρ)` at γ=1 disagrees with `|ψ|²`, that is a real bug, and we
want two independently-written code paths to catch it. The UI reads populations
from ρ in every cell; "wave" vs "quantum" differ *only* in rendering (smooth
intensity vs sampled clicks), which is exactly what §2 demands.

- *Alternative not taken:* run the amplitude path in the coherent cells and the
  density-matrix path only for partial γ. Rejected — it makes `I_j ≡ |ψ_j|²` an
  emergent coincidence of two renderers instead of a structural identity, and it
  is the bug class most likely to "confidently teach something false" (§5).

### C — Directed-edge basis ≡ (position, coin) basis
Appendix A writes the dephasing channel in a "directed-edge basis" {|e⟩}, e = an
outgoing directed path segment. On a line, a directed edge leaving a node is
exactly (position, direction) = (x, c) with c ∈ {↑ (right), ↓ (left)}. So the
Appendix-A channel
  D_γ(ρ) = γ ρ + (1−γ) Σ_e |e⟩⟨e| ρ |e⟩⟨e|
is the ordinary **dephasing channel in the (x, c) basis**: keep the diagonal,
multiply every off-diagonal by γ. This identification is what makes the model
implementable with elementary array operations; recorded here because the task
card's edge-basis language could otherwise be read as something exotic.

### W — γ=0 → binomial, derived before coding (don't trust the prose)
Verified on paper that the per-layer channel at γ=0 reproduces the classical
symmetric walk, so the §5 "channel-limit equivalence" test is testing a true
statement and not a hopeful one. With one layer U = S·C (Hadamard coin then
shift) followed by full dephasing:

  p_{n+1}(x,↑) = ½[p_n(x−1,↑) + p_n(x−1,↓)]
  p_{n+1}(x,↓) = ½[p_n(x+1,↑) + p_n(x+1,↓)]

so the position marginal P_n(x) = p_n(x,↑)+p_n(x,↓) obeys
  P_{n+1}(x) = ½P_n(x−1) + ½P_n(x+1),
the classical random walk → P_N(x) = C(N, (N+x)/2)·2⁻ᴺ. Key point: dephasing
must come **after** the unitary each layer, and in the **full** (x,c) basis — the
Appendix-A correction over v0.2. Suppressing only the per-node chirality
off-diagonal would leave separated-then-recombining coherences alive and the
γ=0 limit would *not* be exact Pascal.

### C — Structured sparse ops on a dense ρ, not dense matmul
U·ρ·U† could be a dense (2(2N+1))³ matmul per layer. Instead apply the two
factors structurally:
- coin C = ⊕_x H: a 2×2 transform on each (x₁,x₂) coin sub-block of ρ — O(D²),
- shift S: a pure index permutation of ρ's entries — O(D²),
- dephasing: scale off-diagonals by γ — O(D²).
Per layer O(D²) with D≈4N, total O(N³); for N=64, ~4·10⁶ flops — negligible. The
binding constraint on depth is pedagogical legibility, not compute (Appendix A).

- *Alternative not taken:* dense matmul (correct but O(N³) **per layer**, ~10⁹ at
  N=64 and needlessly slow in plain JS). Also rejected for now: a sparse/banded
  representation exploiting the parity structure — premature; revisit only if a
  profile says so.

### M — Missed/deferred routes (recorded so they are choices, not omissions)
- **Complex γ.** Held real in v0 per §2/§12 so the slider washes fringes out
  without shifting them. The complex-γ extension (magnitude→visibility,
  phase→shift) is noted in `CITATION`/docs as a growth path, not built.
- **Krauss-operator / Lindblad framing** of the channel. The Appendix-A
  diagonal-damping form is sufficient and cheaper; the operator-sum framing buys
  nothing for v0 and would add vocabulary the front page must not expose.
- **Single-port input as default.** Reproduces the drifting Hadamard profile;
  kept only as the deliberate "contrast" option (Appendix B), never default.

### ? — Open, to settle numerically (cannot be settled on paper — §12)
1. **Coin sign.** Initial coin (|↑⟩ ± i|↓⟩)/√2: which sign yields a
   mirror-symmetric P(x) under our chosen shift convention (↑→+1, ↓→−1)? Both
   appear in the literature. Will pin the sign by computation and assert
   `P(x)=P(−x)` as a regression test.
2. **Edge-enhancement** of the default profile (twin peaks near ±N/√2) — assert
   only for the documented Appendix-B convention, never universally (§5).

---

## 2026-06-26 — Session 1 (cont.): numerical verification, all §5 tests green

`engine.mjs` and `tests/limiting-cases.test.mjs` written; **16/16 tests pass**
(`node --test tests/*.test.mjs`). Added GitHub Actions CI (`.github/workflows/test.yml`).
Results, with the honest detours:

### W — every limit lands at machine precision
- Tr ρ = 1 and Σ|ψ|² = 1 at **every** depth, all γ, phase on: |error| ≤ 2.2e-16.
- diag(ρ)|_{γ=1} ≡ |ψ|² across phase and depth: ≤ 6.7e-16 (the §2 invariant, two
  independently written code paths).
- γ=0 marginal vs **both** classical oracles (recursion and closed-form binomial):
  ≤ 9.4e-16. The §5 "channel-limit equivalence" claim is exact, not approximate.
- Ballistic: σ/N → 0.5412 = √(1 − 1/√2), the known Hadamard-walk constant, to 3
  digits by N=48. Diffusive: σ = √N exactly at γ=0. Edge peak sits at ±N/√2.

### ! — Correction to my own first instinct on the §12 crossover (the important one)
§12 declares the crossover "horn → flattened → binomial" as *decided*. My first
measurement of it was **σ vs γ**, the obvious choice — and it is **monotonic**
(σ falls steadily from the γ=1 horn to the γ=0 binomial; max at γ=1). Taken alone
that reading would have *contradicted* the task card and tempted a "the card is
wrong" note.

It is not wrong; **σ is the wrong diagnostic.** The horn already has large σ
(mass piled at the ballistic fronts), so flattening it toward uniform barely moves
σ. The non-monotonicity lives in **flatness**, measured by peak height / inverse
participation ratio / excess kurtosis (N=60):

| γ    | peak P | eff. bins (IPR) | excess kurtosis |
|------|--------|-----------------|-----------------|
| 1.00 | 0.1015 | 23.8            | −1.65 (bimodal horn) |
| 0.95 | **0.0251** | **42.8** (≈ uniform) | −1.14 (near uniform −1.2) |
| 0.00 | 0.1026 | 13.8            | −0.03 (≈ Gaussian)   |

Peak height is **minimised at intermediate γ ≈ 0.95** (N-dependent), the inverse
participation ratio is **maximised** there (nearly the full support occupied),
and the excess kurtosis passes through the uniform value. That *is* the
"flattened toward a broad/uniform profile" of §12 — confirmed. The regression
test pins it via interior peak height, and the test file carries a comment
warning the next maintainer not to "fix" it by switching to σ.

- *Lesson logged:* a teaching object's most quotable claim ("a little decoherence
  makes it flatter") needed the right observable to even see. The front-page
  slider showing only the two endpoints (§12) is the honest simplification; the
  middle belongs in the advanced layer with this caveat.

### W/! — Coin-sign open point (§12) settled, and more cleanly than expected
Question: which sign in (|↑⟩ ± i|↓⟩)/√2 gives mirror symmetry? Finding: **both**
do — in fact the two signs give the *identical* position distribution (max diff
0.0e0). Reason: the two initial coin states are complex conjugates, and the
Hadamard coin + shift are real, so ψ₋(x) = conj(ψ₊(x)) ⇒ |ψ₋(x)|² = |ψ₊(x)|².
The sign is therefore invisible to the read-out in v0 and only matters once a
complex marker phase is introduced (the deferred complex-γ extension). We default
to +1 and the suite asserts both P(x)=P(−x) and sign-independence. This is a
stronger, cleaner resolution than "pick one and hope"; recorded because §12
framed it as the one point that "cannot be settled on paper" — it can be settled
by *computation*, which is what we did.

### C — Phase φ injected as a per-layer coin phase
Modelled the φ control as P_φ = diag(1, e^{iφ}) on the coin each layer (the LC
retarder before recombination). φ=0 ⇒ identity ⇒ exact Appendix-B walk; φ≠0
distorts it. *Ambiguity acknowledged:* there are several faithful places to inject
a per-cell phase (before/after coin, on which arm); they are not identical maps.
We fixed one, documented it, and keep the default (φ=0) walk exactly Appendix-B
regardless. A genuinely *per-cell, spatially varying* phase (the "speckle"
extreme of §2) is a single global slider in v0, not a per-node field — noted as a
growth path, not a hidden simplification.

### M — Missed/deferred this session
- **Test runner.** Considered a hand-rolled assert harness for "no dependencies";
  chose Node's built-in `node:test` instead — it ships with Node, so it adds no
  dependency while giving proper TAP/CI output. (`node --test tests/` alone fails
  on Node ≥ 23, which reads the bare dir as a module; the glob `tests/*.test.mjs`
  is the portable form, now used in README and CI.)
- **σ-based crossover test.** Explicitly NOT written — see the correction above.
- **Performance work.** O(N³) total; N=64 runs in milliseconds. No sparsity/parity
  optimisation — would be premature and would obscure the code. Revisit only if a
  profile demands it.

---

## 2026-06-26 — Session 1 (cont.): UI, docs, finalisation

### W — `index.html` (dependency-free, imports `engine.mjs`)
- Organised by the two §2 axes: a **read-out toggle** (clicks/intensity) and the
  **coherence slider**, which *is* the add-probabilities ↔ add-amplitudes axis.
  The four §2 cells are its four corners, shown as a live conceptual map that
  highlights where you are. Plus depth, phase, and trials controls.
- Predict→observe→explain cards for the three §8 questions (edges / coherence
  removal / path marking), each committing a prediction before revealing.
- Single-MZ panel: live `I_±` vs φ sweep reusing the page's γ, with the one
  revealed equation `I_±=½(1±γcosφ)` behind an Explain disclosure (§9).
- "What this does and does not show" section carrying the §2 qualification.
- Advanced disclosure: the unitary, the three coherence notions, and a live
  **peak-height-vs-γ** plot that *shows* the non-monotonic flattening (the right
  diagnostic, per the correction above).

### C — Combination-rule axis = the coherence slider (not a third toggle)
The cleanest reading of §2: "add probabilities vs add amplitudes" and the
coherence control are the same axis, so I did **not** add a separate
combination-rule toggle that could contradict the slider. One slider, two
endpoints = two table rows; the read-out toggle picks the column. Recorded
because a reader expecting three switches might think one is missing — it isn't.

### C — Phase is a front-page control (default 0), not hidden in advanced
§2 calls phase "first-class." Kept it on the main panel despite §9's "no equations
on first load," because a *slider* is not an equation and breaking the pattern on
purpose is the instructive act. The first *equation* still appears only behind
the MZ Explain reveal.

### ! — Verification honesty: what I did and did NOT check on the UI
Validated: inline module **syntax** (`node --check`), that **every** element id
the script references exists in the markup (33 defined / 22 referenced, 0
missing), that the page and `engine.mjs` **serve over HTTP** with the correct
`text/javascript` MIME (so the ES-module import resolves), and that the UI's data
path is the already-tested engine. **Not** done: a real headless-browser render
(no browser-automation tool in this environment without adding a heavy
dependency, which would violate the dependency-free constraint). So: high
confidence in logic and wiring; the pixel-level rendering is unverified by
machine and should be eyeballed once in a browser. Stated plainly rather than
claimed as "tested."

### W — Documentation (§4, §7 altitude = undergraduate technical layer)
Wrote all six docs myself rather than delegating, to hold the §2 wording rules
exactly: `concepts/{random-walk, interference-and-phase, quantum-walk,
limits-of-the-analogy}.md`, `design-challenge.md` (prompts + three-column rubric +
annotated gallery), `build/mach-1.md`. `limits-of-the-analogy.md` carries the
landmines: which-path stated *precisely* (no "which-path info IS decoherence"),
the qualified quantum→classical claim, the full-edge-basis justification, the
three distinct coherence notions, real-γ, and the σ-vs-flatness caution.

### C — Mach-1 evidence packet: template with NO fabricated data
§6 wants a real evidence packet; none exists yet. Built the **template** with the
simulated column real (from `singleMZ`) and the measured column + metadata as
explicit `PENDING` placeholders, with an honesty notice at the top. Committed an
empty `docs/build/images/` (with a README explaining why) rather than stand-in
photos. Fabricating plausible "measurements" would have been the single worst
thing to do in a teaching object about scientific honesty.

### M — Missed / deferred at end of session 1
- **Screenshot in README.** None committed — would require a browser capture;
  left an honest placeholder note instead of a fake image.
- **Worktree/commit.** `git init` done; **not committed** — no commit was
  requested. Tree is staged-ready; `git add -A && git commit` when desired.
- **Headless visual regression** for the UI — see verification-honesty note.
- **Zenodo DOI / ORCID** — deferred to first tagged release per §10 (CITATION.cff
  carries `# add before DOI` markers).

### Status vs §11 Definition of Done
All twelve checkboxes are addressable from this tree; the only items resting on
future *external* actions are the real Mach-1 measurements (§6 data), the README
screenshot, and the DOI — each explicitly flagged, none faked.
