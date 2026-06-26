# Limits of the analogy

This is the page that keeps the rest honest. The front page shows two crisp
endpoints; here is what is *actually* being claimed, and what is not.

## What destroys the fringes is incoherence, not classicality

The reflex "classical = no interference, quantum = interference" is wrong, and the
four-cell layout is built to defeat it. A coherent classical **wave** shows full
fringes; **incoherent** light shows none. A single photon — unmistakably
"quantum" by any clicks-based test — still interferes **with itself**. So the axis
that turns fringes on and off is **coherence**, not whether the object is
"classical" or "quantum." The contrast between the two right-hand cells carries
this; it is not a footnote.

## Which-path, said precisely

On the front page the coherence control is labelled *"How distinguishable are the
paths?"* and the true statement *"more distinguishable → weaker fringes."* That is
as far as the front page goes. Here is the precise version:

> Marking a path **correlates** it with an auxiliary degree of freedom (a
> "marker"). When the marker is left unobserved, the path coherence available for
> interference is reduced by the overlap `|γ| = |⟨m₁|m₂⟩|` of the two marker
> states; complete distinguishability (`γ = 0`, orthogonal markers) removes the
> interference term entirely.

Note what is **not** written: we do *not* say "which-path information *is*
decoherence." Distinguishability, mutual coherence, and dephasing are related but
not identical (next section). The identity-claim is a common shortcut that hides
real physics, so we avoid it deliberately.

## Three notions behind one slider

The single `γ` slider stands in for three things that all reduce interference but
are **not operationally identical** in a real experiment:

1. **Mutual coherence** between the paths — the magnitude of the relevant
   off-diagonal element of the density matrix.
2. **Which-path distinguishability** available in an auxiliary degree of freedom —
   the marker-state overlap above.
3. **Dephasing noise** from uncontrolled phase fluctuations averaged over an
   ensemble.

In a careful experiment these are distinguishable: marker entanglement is in
principle *reversible* (erase the marker, recover the fringes — a quantum eraser),
whereas ensemble phase noise is *irreversible* mixing. v0 exposes one real-`γ`
slider and does **not** separate them; that separation is a documented future
"advanced coherence" control, not a hidden simplification.

## The quantum-to-classical claim, qualified

"Full coherence = quantum walk; zero coherence = classical Galton board" is true
**for the specific channel we use** and not in general:

- We apply the dephasing channel `D_γ(ρ) = γρ + (1−γ)·diag(ρ)` in the
  **directed-edge (position, coin) basis** after **every layer** (Appendix A).
- This is a per-layer, Markovian which-path record: each step the environment
  acquires a fresh, orthogonal record of which directed path was taken.

Dephasing only at the **final read-out**, or in a **different basis**, does *not*
generally reproduce the exact binomial. We commit to the per-layer path-basis
model and document it rather than implying the limit is convention-free.

### Why the *full* directed-edge basis, not just per-node chirality

A density matrix retains coherence between amplitudes that have separated in space
and later recombine at a downstream node. If you dephased only the local
two-chirality off-diagonal *at each node*, those spatially-separated coherences
would survive, still interfere on recombination, and the `γ = 0` limit would
**not** be the exact Pascal distribution. Dephasing the full directed-edge basis
each layer removes every coherence at birth, so no two paths reach a downstream
node with a surviving phase relationship — which is exactly what guarantees the
exact classical limit. (This corrects the v0.2 formulation; see the task card
changelog and the [DEVLOG](../../DEVLOG.md).)

## γ is kept real in v0

The slider uses real `γ ∈ [0,1]`, so it washes fringes out **without shifting
them** — isolating loss of coherence from any added phase offset. In general
`γ = ⟨m₁|m₂⟩` is complex: its magnitude suppresses visibility and its phase
contributes a relative shift. The complex case is a noted later extension, not in
the first release.

## The non-monotonic crossover (the honest middle)

The front-page slider shows the two endpoints crisply. The middle is **not** a
smooth morph between them, and we say so:

> Coming down from `γ = 1`, a little dephasing first **flattens** the
> edge-enhanced horn toward a broad, near-uniform profile; only stronger
> dephasing gives the diffusive Gaussian. **Horn → flattened → binomial.**

A caution we learned the hard way (and recorded in the [DEVLOG](../../DEVLOG.md)):
the standard deviation `σ` is a **poor** diagnostic for this — it falls
*monotonically*, because the horn already has large `σ`. The right diagnostic is
**flatness** (peak height, or the inverse participation ratio): peak height dips
to a minimum at intermediate `γ` (≈ 0.95 for `N = 60`), where the distribution is
nearest uniform. The advanced layer of the front page plots exactly this. The
multi-layer shape being non-monotonic is also why the visibility-monotonicity
test is scoped to a **single cell**, where visibility *does* fall monotonically
with `γ`.

## Summary of what is tested, so you can trust the prose

Every quantitative claim here is backed by `tests/limiting-cases.test.mjs`:
probability conservation at every depth, the `I_j ≡ |ψ_j|²` identity, the exact
`γ = 0` binomial (against two independent oracles), the ballistic and diffusive
`σ` laws, mirror symmetry and sign-independence, the single-MZ formula, and the
non-monotonic flattening. A physics bug in a teaching object teaches something
false; the suite is the guard.
