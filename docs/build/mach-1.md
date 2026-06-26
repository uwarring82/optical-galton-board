# Mach-1 — the bench that anchors the model

This page is the **one real evidence packet** that ties the simulation to a
physical interferometer (task card §6). It is deliberately narrow: a handful of
real measurements beside their simulated counterparts, not a hardware build log
and not decorative apparatus photography.

> **Honesty notice.** As of this commit the measured columns below are **empty
> placeholders** — the evidence packet has not yet been acquired. The simulated
> column is real (computed by [`engine.mjs`](../../engine.mjs)); the measured
> column must be filled from the bench before any fringe claim is made here.
> Nothing on this page is fabricated to look like data. See the
> [DEVLOG](../../DEVLOG.md) for status.

## The instrument

Mach-1 is a Mach–Zehnder interferometer assembled from cage-compatible optics:

- **50:50 non-polarising beam-splitter cubes** (the two recombining splitters);
- a **liquid-crystal (LC) phase retarder** in one arm — the tunable relative
  phase `φ`, the physical version of the front page's phase slider;
- an **LC polarisation rotator** (reserved for the deferred which-path / marker
  experiments);
- **fibre collimation** at the input; camera or photodiode at the outputs.

This vocabulary is exactly what the model needs: one controllable relative phase
between two recombining paths, read out as intensity (camera) or power
(photodiode).

```
        ┌─────┐        LC retarder φ
  in ──▶│ BS1 │────────[ ~~ ]────────┐
        └──┬──┘                      │
           │                       ┌─┴───┐
           └───────────────────────│ BS2 │──▶ I₊  (camera / PD)
                                   └─┬───┘
                                     └──────▶ I₋
        (sketch — replace with docs/build/images/mach-1-layout.* )
```

## The evidence packet (template)

Minimum content (§6): two output images or photodiode readings, **at least three
retarder settings**, a visible output redistribution or fitted fringe, the
corresponding simulated phase points beside the data, and full metadata.

### Simulated phase points (real — from the engine)

Ideal balanced interferometer, `I_± = ½(1 ± cosφ)`, computed by
`singleMZ(φ, γ=1)`:

| Retarder setting | φ (rad) | sim I₊ | sim I₋ |
|---|---|---|---|
| λ/4  | 0      | 1.000 | 0.000 |
| 3λ/8 | π/4    | 0.854 | 0.146 |
| λ/2  | π/2    | 0.500 | 0.500 |
| 5λ/8 | 3π/4   | 0.146 | 0.854 |
| 3λ/4 | π      | 0.000 | 1.000 |

A real interferometer has visibility `V = γ < 1`; the fit to the measured points
extracts `V`, which is the bench's reading of the coherence `γ` in the model.

### Measured points (PENDING — to be filled from Mach-1)

| Retarder setting | φ (rad) | meas I₊ | meas I₋ | notes |
|---|---|---|---|---|
| _setting 1_ | _–_ | _–_ | _–_ | _–_ |
| _setting 2_ | _–_ | _–_ | _–_ | _–_ |
| _setting 3_ | _–_ | _–_ | _–_ | _–_ |

Fitted visibility `V = ____` (extract from ≥3 settings; this is the empirical γ).

### Required metadata (fill on acquisition)

- **Wavelength** λ = ____ nm
- **Input condition** (e.g. fibre-collimated, polarisation, power) = ____
- **Retarder calibration** (drive voltage → phase) = ____
- **Read-out type**: camera **intensity** or detector **power** = ____
- **Date acquired** = ____
- **Operator / notebook reference** = ____

## Images

Place the real fringe evidence in [`images/`](images/) and link it here once
acquired (`mach-1-layout.*`, `output-bright.*`, `output-dark.*`, `fringe-fit.*`).
The directory currently holds no images — by design, nothing placeholder is
committed as if it were data.

## Why only this much

A full hardware build log is an explicit non-goal for v0. The single packet's job
is to make the object **evidence** that the model corresponds to a real bench —
one fitted fringe and its simulation, honestly labelled — rather than a gallery of
photos. The marker / which-path experiment (using the LC polarisation rotator) is
the natural next packet and is deferred.
