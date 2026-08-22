# HISE Source Fix — EQ Graph Doesn't Redraw on Band Enabled Toggle

## Symptom
In the Parametriq EQ (`CurveEq`), toggling a band's `Enabled` attribute from script —
```js
eq.setAttribute(bandIndex * eq.BandOffset + eq.Enabled, value);
```
(see KChannel's `Interface.js`, `onBandOnOff`) — leaves the `fltEqGraph` floating tile (`DraggableFilterPanel` / `FilterDisplay`) visually stale. Both the curve and the drag-handle markers keep showing the old on/off state, even though:
- audio processing is already correct (the band is actually bypassed/active)
- the raw attribute value is correct
- the bound knob/UI control is correct

The graph self-corrects the moment any *other* coefficient-changing parameter (Freq/Gain/Q) on any band is touched — which is what makes this look like a script/UI bug rather than a rendering bug.

Script-side workarounds do **not** fix this: attribute nudges, forcing a `Data` JSON change, calling `updateValueFromProcessorConnection` — none of it works, because the bug is not in the script layer. It's in HISE's own C++.

## Root cause — two compounding bugs in HISE's C++ source (`develop` branch)

**1. `FilterDragOverlay::checkEnabledBands()`**
File: `hi_core/hi_components/audio_components/EqComponent.cpp`

This is invoked by the generic `Processor::OtherListener` change notification that fires on every EQ attribute change (including from script). It correctly updates the child `filterGraph`'s enabled flags — but never calls `repaint()` on itself (`FilterDragOverlay`, the parent component that actually draws the drag-handle markers in `paintOverChildren()`). The marker data is read live and is already correct; the component is just never told to redraw.

**2. `FilterGraph::enableBand()`**
File: `hi_tools/hi_standalone_components/eq_plot/FilterGraph.h`

This only calls `repaint()`, which redraws the existing *cached* `tracePath`. That path is only recalculated inside `refreshFilterPath()`, which normally fires via `refreshAsync()` when `setCoefficients()` detects an actual frequency/gain/Q coefficient change (via `memcmp` against the old coefficients). Toggling `Enabled` doesn't touch coefficients at all, so the recompute never fires — the curve keeps showing the band's old contribution until an unrelated control forces a recompute that incidentally also picks up the correct enabled state.

## The fix

1. In `FilterDragOverlay::checkEnabledBands()` (`EqComponent.cpp`) — add a `repaint()` call at the end of the function, after it updates the enabled flags.
2. In `FilterGraph::enableBand()` (`FilterGraph.h`) — change the call from `repaint()` to `refreshAsync()`.

That's the entire fix: two call-site changes, no new members, no signature changes. `git diff --stat` against a clean checkout confirms these are the only two lines that need to change.

## Verification
Tested against a clean `ReleaseWithFaust` standalone build. After patching: the graph (curve + drag-handle markers) updates immediately on toggle, whether the toggle is triggered from a script `setControlCallback` or by clicking a band's enable marker directly in the UI.

## Status
- Patched locally in Vinch's HISE source checkout as of 2026-07-20 (macOS).
- **Not yet upstreamed** — no PR merged into HISE's `develop` branch. A forum post proposing this PR was drafted but the file is not currently present in this project folder.
- **Action needed if rebuilding on Windows:** these two changes must be re-applied to whatever HISE source tree is used to build KChannel on Windows, or the bug will reappear. Don't chase script-side workarounds if it does — the fix lives in HISE's C++ source, not `Interface.js`.
