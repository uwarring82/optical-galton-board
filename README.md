# Optical Galton Board

*An honest interactive model of the random walk → interference → decoherence
sequence.* A dependency-free teaching object for the Schülerlabor co-learning
programme, anchored to the Mach-1 bench demonstrator.

[![tests](https://img.shields.io/badge/§5_correctness_tests-16%2F16-1f9d6b)](tests/limiting-cases.test.mjs)
&nbsp;MIT licensed · no build step · no dependencies

> _Screenshot: add `docs/build/images/screenshot.png` on the first tagged release._
> _(Not committed yet — see the [DEVLOG](DEVLOG.md); we don't ship placeholder images as if they were real.)_

## What it is

Open `index.html` (served over `http://`, see below). No build step, no
dependencies, no server-side anything. The **same** numerical engine
([`engine.mjs`](engine.mjs)) drives both the page and the
[test suite](tests/limiting-cases.test.mjs), so what you see is what is tested.

The interface is organised by the **two variables that actually generate the
behaviour** — not by three "modes":

|                       | Discrete read-out (clicks)               | Continuous read-out (intensity)      |
|-----------------------|------------------------------------------|--------------------------------------|
| **Add probabilities** | Classical Galton board · binomial `P(k)`, `σ ∝ √N` | Incoherent light · washed out, no fringes |
| **Add amplitudes**    | Single-particle quantum walk · ballistic, edge-enhanced, `σ ∝ N` | Coherent wave · interference fringes |

The **combination-rule axis** (add probabilities ↔ add amplitudes) *is* the
coherence slider: real `γ ∈ [0,1]` interpolates between the classical binomial
(`γ=0`) and the fully coherent Hadamard quantum walk (`γ=1`) via the per-layer
dephasing channel of Appendix A. The **read-out axis** (clicks ↔ intensity) is
just rendering. The four table cells are the four corners.

**Headline behaviour:** at full coherence the walker is *most likely found near
the edges*, not the centre — ballistic, edge-enhanced spreading.

## What it does *not* show

What destroys the fringes is **incoherence, not classicality** — a lone photon
still interferes with itself. The quantum-to-classical reading holds only for the
*specific per-layer dephasing channel* used here. The full qualification —
which-path framing stated precisely, the three distinct notions behind the one
slider, the non-monotonic "horn → flattened → binomial" crossover, and why `γ` is
kept real in v0 — is in
[docs/concepts/limits-of-the-analogy.md](docs/concepts/limits-of-the-analogy.md).
Reading it is the difference between using this object and being misled by it.

## Run it

`index.html` imports `engine.mjs` as an ES module, so it must be served over
`http://` — a `file://` open is blocked by the browser's module CORS rules.

```sh
python3 -m http.server      # then open http://localhost:8000
# or: npx serve   ·   VS Code "Live Server"   ·   any static host
```

Everything runs in your browser; no data leaves the page.

## Test it

The §5 correctness suite is **non-negotiable**: a physics bug in a teaching object
teaches something false. It uses Node's built-in runner — still zero
dependencies — and runs in CI on every push
([`.github/workflows/test.yml`](.github/workflows/test.yml)).

```sh
node --test tests/*.test.mjs
```

It pins, to machine precision: probability conservation at every depth; the
`I_j ≡ |ψ_j|²` wave/quantum identity; the exact `γ=0` binomial against two
independent classical oracles; the ballistic (`σ∝N`) and diffusive (`σ=√N`) laws;
mirror symmetry and coin-sign independence; the single-MZ formula `I_±=½(1±γcosφ)`
with visibility `V=γ`; and the non-monotonic flattening.

## Repository layout

```
index.html            UI + rendering; imports engine.mjs
engine.mjs            numerical engine (amplitude + density-matrix core)
tests/                §5 correctness suite (node --test)
docs/concepts/        random-walk · interference-and-phase · quantum-walk · limits-of-the-analogy
docs/design-challenge.md   build-an-analogy prompts + three-column rubric
docs/build/mach-1.md       the one real bench evidence packet (§6)
DEVLOG.md             lab notebook: decisions, corrections, rejected routes
CITATION.cff · LICENSE     FAIR provenance (Zenodo DOI on first tagged release)
```

## Growth path (the minimalism is a decision, not an omission)

v0 is deliberately small and is **not** a programmable-optics framework. Natural
next steps, recorded so the scope reads as a choice: extract further engine
modules; a complex-`γ` control separating reversible marker entanglement from
irreversible ensemble phase noise; a learner-submitted lattice simulated in the
engine; and the second Mach-1 evidence packet (the which-path / marker
experiment). See the [task card](optical-galton-board-taskcard-v0.3.md) and
[DEVLOG](DEVLOG.md).

## License & citation

MIT (see [LICENSE](LICENSE)). Please cite via [CITATION.cff](CITATION.cff); a
Zenodo DOI is minted on the first tagged release.
