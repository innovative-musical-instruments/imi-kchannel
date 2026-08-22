# KChannel — Project Summary (for Claude on other machines)

## What it is
KChannel is an IMI channel-strip HISE plugin: Parametric EQ + Gate/Compressor + output gain, with an about/presets overlay. It's a sibling project to the five IMI K-Samplers instruments (Kadabra Grand, Electric Piano, Electronic Drumkit, Acoustic Drums, Percussion) — same org, same conventions, code/patterns frequently ported between them.

## Repository
- Name: `imi-kchannel`
- URL: `https://github.com/innovative-musical-instruments/imi-kchannel.git`
- Branch: `master`
- Latest commit (as of 2026-07-25): `70c8fc9` — "Update CLAUDE.md: macOS build/notarization complete, next is Windows build"

## Current status (2026-07-25)
- Global EQ on/off switch preset change is committed and pushed to `origin/master` (through commit `fb25078`).
- macOS build is complete: `KChannel.vst3` and `KChannel.component` built in HISE, signed with Developer ID Application (Amir Vinci), notarized via `xcrun notarytool`, and stapled. Verified accepted by Gatekeeper.
- **Next step:** Vinch is moving to a Windows machine to build the Windows VST3 version. No Windows-specific build notes exist yet — HISE exporter settings, VST3 SDK paths, and Authenticode signing are all undocumented and need to be captured as they come up.

## Working rules (important for any Claude session on this project)
- Only make changes when Vinch asks for them, or after proposing a change and getting explicit confirmation — don't proceed on assumption.
- On-disk edits to any HISE script (`Interface.js`, script FX processors, etc.) are **not live** — HISE doesn't hot-reload script processors from file changes. Vinch must manually paste changed code into HISE's own script editor and recompile. Always give the **full content of the affected tab(s)**, never a diff or partial insert.
- Processors with multiple callbacks (`onInit`, `prepareToPlay`, `processBlock`, `onControl`, etc.) are separate compiled tabs, not shared scope — label each tab's content separately when handing over code.

## HISE gotchas specific to this project
- **Number formatting:** `.toFixed()` is unreliable in HiseScript and can silently halt a callback. Use `Engine.doubleToString(value, digits)` instead.
- **Filmstrip components:** filmstrip images (sliders/knobs) are calibrated to a native pixel height. Shrinking a component's height without setting `scaleFactor` (or re-rendering the asset) makes the cap/handle run off its track.
- **Dynamics module metering:** `GateReduction`/`CompressorReduction` read as raw gain `0.0` (not `1.0`) when idle or disabled — converts to `-Infinity` dB and pins a naive GR meter to full-scale. Guard by checking `GateEnabled`/`CompressorEnabled`; don't floor near-zero raw values before log conversion (a hard-shut gate legitimately reads near-zero).
- **EQ graph redraw on Enabled toggle:** the Parametriq EQ's `fltEqGraph` tile doesn't redraw when a band's `Enabled` attribute is toggled from script — this is a HISE C++ source bug, already patched locally in Vinch's HISE source tree (not yet upstreamed). Don't chase script-side workarounds if this reappears after rebuilding against a clean HISE checkout.
- **Clip LED / peak metering:** post-fader peak detection lives in a root-level `FX` EffectChain script node, writing `Globals.peakL/peakR` each block. `Interface` script polls via a 30ms timer; latches at peak ≥ 0.989, releases after 5000ms, with a 250ms click-guard against re-latch. Pattern ported from K-Samplers' `MasterPeakDetector.js`.
- **Native Peak Meter Floating Tile:** if meters work in HISE but appear dead in a compiled export, check `ENABLE_ALL_PEAK_METERS=1` in Project Settings → Extra Definitions before suspecting a script/`Globals` bug.

## Release / notarization (macOS)
Credentials for git push and notarization are never typed into or embedded in scripts — both are set up via macOS Keychain: `git config credential.helper osxkeychain` for GitHub, and an `xcrun notarytool store-credentials` keychain profile for notarization. Release scripts reference `--keychain-profile "<profile-name>"`, never raw Apple ID credentials. (Windows equivalents for code signing not yet established.)
