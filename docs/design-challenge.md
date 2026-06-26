# Build-an-analogy: the design challenge

Toggling between physical regimes is one thing. **Building** an analogy is deeper:
to make a faithful random walk you must isolate *independent, equal-weight binary
steps, accumulated*; to make interference you must find *two recombining paths
with a controllable relative phase*. Construction forces the rule out of the
apparatus — you cannot fake it.

This is the co-learning programme's core move: not transmitting a finished
demonstration, but inviting you to build your own — and then to find, precisely,
where it breaks.

## The prompts

Pick one and build it (in your head, on paper, on a bench, or in code):

1. **A pure random walk.** Make a system of independent, equal-weight binary
   choices that accumulate. What plays the role of "left or right"? How do you
   guarantee the steps are independent and unbiased? What does "many trials" look
   like?
2. **A two-path interferometer.** Make two paths that *recombine* with a relative
   phase you can turn. How do you set the phase? How do you read the output —
   continuously, or one event at a time?
3. **The crossover.** Take one of the above and add a way to *learn which path was
   taken* (or to scramble the relative phase). What happens to the pattern as you
   turn that knob up? Predict before you look.
4. **The one that breaks well.** Deliberately build an analogy you *know* is
   imperfect, and pin down the single place it stops being faithful. A good broken
   analogy teaches more than a vague correct one.

## The three-part judgement

Every analogy you propose should come with three things. This is a **frame for
inquiry, not a checklist to satisfy** — the interesting work is in the third
column, and a good analogy can be faithful and broken in ways the table below
never anticipated.

- **Claim** — what is this analogy faithful *for*? Which feature of the real
  physics does it genuinely capture?
- **Limitation** — where does it *break*? What does it get wrong, or simply not
  represent?
- **Test** — how could you *check* the claim and expose the break, in principle or
  in practice?

## Worked-example gallery

Four analogies, each annotated with the three-part judgement. Read them as worked
examples of the frame — then do better.

| Analogy | Faithful for | Breaks at | Can be tested by |
|---|---|---|---|
| **Peg board** (Galton board) | Classical branching and binomial accumulation | No recombination of alternatives — branches never re-interfere | Histogram approaches `C(N,k)2⁻ᴺ` as trials grow |
| **Ripple tank** | Coherent superposition and phase-dependent fringes | No discrete single-event detection — it is intensity only | Fringes shift as you change phase / path length |
| **Two speakers** | Interference and phase (audible nodes and antinodes) | No localised single-*particle* clicks | Nodes move as you change the relative phase |
| **Mach–Zehnder** | Phase-controlled recombination of two paths | The *bright-field* (many-photon) version does not by itself establish nonclassicality | Output fringe visibility vs. phase |

## Where every classical analogy ultimately breaks

Notice the pattern in the "breaks at" column. The peg board has no recombination.
The ripple tank and two speakers have no single-event detection. The bright Mach–
Zehnder has interference but cannot, on its own, show anything a wave couldn't.

Push any of them far enough and they fail at the **same** place: **single-particle
interference with discrete detection** — one walker, interfering with itself,
landing as one click. That place is not a defect of the analogies; it is the
**quantum boundary** itself. Pushed far enough, this challenge lets you
rediscover, with your own hands, the qualification spelled out in
[limits of the analogy](concepts/limits-of-the-analogy.md).

## Scope note (v0)

This release ships the prompts and rubric above, plus the annotated gallery.
Submitting your own lattice and simulating it in the engine is a planned
extension, not yet built — see the [README](../README.md) growth path and the
[task card](../optical-galton-board-taskcard-v0.3.md) §3.
