# KChannel — context for Claude Code

KChannel is an IMI channel-strip HISE plugin: Parametric EQ + Gate/Compressor + output gain, with an about/presets overlay. Sibling project to the five IMI K-Samplers instruments (Kadabra Grand, Electric Piano, Electronic Drumkit, Acoustic Drums, Percussion) — same org, same conventions, and code/patterns are frequently ported between them.

Repo: `https://github.com/innovative-musical-instruments/imi-kchannel.git`, branch `master`. Push should just work via the existing `osxkeychain`-backed credential helper on this Mac (same as the other IMI repos) — no PAT handling needed when running here.

## Right now (2026-07-25)

`Presets/imiKChannel.hip` is modified (added a global EQ on/off switch) and already staged for commit. Suggested commit message: `"Add global EQ on/off switch (preset update)"`. Just needs `git commit` + `git push origin master`.

Before committing, delete these leftover files — they're artifacts from a sandboxed tool (Cowork) that couldn't delete its own temp files on this mounted volume; harmless, just clutter:
- `.git/index.lock`
- `.git/index.lock.old`
- `test_delete_me.txt`

After this commit/push, the next step is building a release and preparing it for notarization/distribution.

## Working rules

- **Only make changes when Vinch asks for them, or after proposing a change and getting explicit confirmation.** Don't proceed on assumption.
- **On-disk edits to any HISE script (`Interface.js`, script FX processors, etc.) are NOT live.** HISE does not hot-reload script processors from file changes. Vinch must manually copy the changed code into HISE's own script editor panel and recompile. Always give him the **full content of the affected tab(s)**, never a diff or "insert after line X" snippet — partial/miss-pasted inserts break things silently with no compile error.
- Processors with multiple callbacks (`onInit`, `prepareToPlay`, `processBlock`, `onControl`, etc.) are **separate compiled tabs**, not one shared scope. Code defined in the wrong tab compiles clean but is dead — e.g. a `processBlock` function defined inside `onInit` never runs. When handing over code for a multi-tab processor, label each tab's content separately.

## HISE gotchas specific to this project

- **Number formatting:** `.toFixed()` is unreliable in HiseScript and can silently halt a callback. Use `Engine.doubleToString(value, digits)` for any label/display formatting.
- **Filmstrip components:** filmstrip images (sliders/knobs) are calibrated to a native pixel height. Shrinking a component's height without setting `scaleFactor` (or re-rendering the asset at the target size) makes the cap/handle graphic run off its track.
- **Dynamics module metering:** `GateReduction`/`CompressorReduction` read as raw gain `0.0` (not `1.0`/unity) when idle or the stage is disabled — converts to `-Infinity` dB and pins a naive GR meter to full-scale. Guard by checking `GateEnabled`/`CompressorEnabled` and treating a disabled stage as 0 dB; don't floor near-zero raw values before the log conversion (a genuinely hard-shut gate legitimately reads near-zero, and flooring hides real gate closures).
- **EQ graph redraw on Enabled toggle:** the Parametriq EQ's `fltEqGraph` tile doesn't redraw when a band's `Enabled` attribute is toggled from script — this is a HISE C++ source bug (`FilterDragOverlay::checkEnabledBands()` missing a `repaint()`, and `FilterGraph::enableBand()` calling `repaint()` instead of `refreshAsync()`), already patched locally in Vinch's HISE source tree (not yet upstreamed). Don't chase script-side workarounds if this reappears after rebuilding against a clean HISE checkout — re-apply the two source patches instead.
- **Clip LED / peak metering:** post-fader peak detection lives in a root-level `FX` EffectChain script node (sibling to `Container1`, processes after it), writing `Globals.peakL/peakR` each block. The `Interface` script polls via a 30ms timer; latches at peak ≥ 0.989, releases after 5000ms, with a 250ms click-guard against immediate re-latch. This pattern is ported from the K-Samplers reference (`kadabra-electronic-drumkit`'s `MasterPeakDetector.js`).
- **Native Peak Meter Floating Tile (if used):** if meters work in HISE but appear dead in a compiled export, check `ENABLE_ALL_PEAK_METERS=1` in Project Settings → Extra Definitions before suspecting the script/`Globals` layer — this was the actual root cause the one time it looked like a cross-processor `Globals` bug and wasn't.

## Release / notarization (when we get there)

Credentials for git push and `notarytool` should never be typed into or embedded in a script — both are already set up via macOS Keychain on this Mac: `git config credential.helper osxkeychain` for GitHub, and a `xcrun notarytool store-credentials "<profile-name>"` keychain profile for notarization (one-time interactive setup, done previously for other IMI builds). Release scripts should reference `--keychain-profile "<profile-name>"`, never raw Apple ID credentials.
