# The random walk

*Add probabilities. Read out clicks. You get a bell curve.*

A ball dropped into a Galton board hits a peg and goes left or right with equal
chance, then hits another peg, and another — `N` independent, equal-weight binary
choices. Count how many went right (`k`) out of `N`. The position is `x = 2k − N`.

Many balls pile up into the **binomial distribution**

$$P_N(k) = \binom{N}{k}\,2^{-N},$$

a bell curve centred on `x = 0` whose width grows as `σ = √N`. Most balls finish
near the middle; the extremes (all-left, all-right) are vanishingly rare.

## Why probabilities, not amplitudes

At each peg the ball *is* somewhere — it really went one way. The alternatives
don't coexist; they're just things that could have happened. So you combine the
two ways of reaching a spot by **adding their probabilities**:

$$P_{n+1}(x) = \tfrac12 P_n(x-1) + \tfrac12 P_n(x+1).$$

There is no phase, nothing to cancel. Every path that arrives adds positively.
This is the whole content of "classical": *which* path happened is, in principle,
a fact.

## What this corresponds to in the model

This is the `γ = 0` corner of the [engine](../../engine.mjs). When coherence is
fully removed in the directed-edge basis after every layer (Appendix A of the
[task card](../../optical-galton-board-taskcard-v0.3.md)), the surviving
populations evolve by exactly the recursion above. Two independent pieces of code
check this:

- `densityWalk(N, 0)` (the full density-matrix engine at `γ = 0`) and
- `classicalWalk(N)` (a standalone `½/½` probability engine),

agree to ~`10⁻¹⁶`, and both match the closed-form `C(N,k)2⁻ᴺ`
(`tests/limiting-cases.test.mjs`). The bell curve is not asserted; it is derived
and tested.

## Where this picture breaks

The binomial is faithful for *branching and accumulation*. It breaks the moment
the alternatives are allowed to **recombine** while still sharing a phase — then
you must add amplitudes, and the answer changes completely. That is the subject
of [interference and phase](interference-and-phase.md) and the
[quantum walk](quantum-walk.md). Where it breaks is the interesting part; see the
[build-an-analogy challenge](../design-challenge.md).
