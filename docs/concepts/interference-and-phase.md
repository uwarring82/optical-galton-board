# Interference and phase

*Add amplitudes. Read out intensity. You get fringes.*

Now let the two ways of reaching a point genuinely coexist and recombine. Each
path carries a complex **amplitude** — a magnitude and a phase. You combine paths
by adding amplitudes, *then* squaring:

$$P = |\,a_1 + a_2\,|^2 = |a_1|^2 + |a_2|^2 + 2\,\mathrm{Re}(a_1^* a_2).$$

That last cross term is **interference**. It can be positive or negative depending
on the relative phase `φ` between the paths, so probability can pile up where the
classical sum would be flat, or cancel where the classical sum is large.

## The one equation we eventually show

For a single balanced two-path cell (a Mach–Zehnder; see
[the panel on the front page](../../index.html)), the two outputs are

$$I_\pm = \tfrac12\,(1 \pm \cos\varphi).$$

Sweep the phase `φ` and the two ports trade intensity sinusoidally — bright and
dark **fringes**. At `φ = 0` one port gets everything; at `φ = π` the other does.
This is the first equation the interface reveals, and only *after* you have
watched the outputs swap, because it explains a result you have already seen
(§9 of the task card).

## Phase is first-class

The fringe pattern is *entirely* set by the per-cell phases. The clean,
symmetric walk on the front page is a property of one particular phase convention
(Appendix B). Choose arbitrary phases and the clean structure dissolves into
speckle. Phase is therefore not "one slider among many" — it is half of what
generates the behaviour. Exposing it lets you break the pattern on purpose, which
is instructive.

## Coherence controls the contrast

Real interference requires the two amplitudes to keep a definite phase
relationship — to be **coherent**. Partial coherence `γ` reduces the cross term
without removing it:

$$I_\pm = \tfrac12\,(1 \pm \gamma\cos\varphi),\qquad \text{visibility } V = \gamma.$$

`γ = 1` gives full-contrast fringes; `γ → 0` flattens both ports to `½` — no
fringes. This is checked across a full `φ` sweep and several `γ` in
`tests/limiting-cases.test.mjs`.

## Where this picture breaks

A coherent **wave** explains the fringes but says nothing about *discrete*
detection — it is a continuous-intensity story. The deeper question is what
happens when interference and single-event clicks occur **together**: that is the
[quantum walk](quantum-walk.md), and pushing this analogy until it breaks is the
quantum boundary itself ([limits of the analogy](limits-of-the-analogy.md)).
