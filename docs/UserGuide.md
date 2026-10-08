# Kadabra KChannel — User Guide

KChannel is IMI's channel-strip processor: a 5-band parametric EQ with a
real-time spectrum analyzer, a Gate/Compressor dynamics section, and an
output stage with clip metering. Built for the Kadabra Music
Workstation™, it's the standard channel-strip insert used alongside the
Kadabra KSamplers and inside Kadabra KPlayer's channel and master insert
slots.

## Table of Contents

1. [Installing the Plugin](#1-install)
2. [Loading It in Your DAW](#2-loading)
3. [The Interface at a Glance](#3-interface)
4. [Signal Flow](#4-signal-flow)
5. [The Parametric EQ](#5-eq)
6. [Gate & Compressor](#6-dynamics)
7. [Output Gain & Clip Meters](#7-output-gain)
8. [Presets](#8-presets)
9. [Cross-Platform & Format Notes](#9-cross-platform)
10. [Troubleshooting](#10-troubleshooting)
11. [Licensing & Credits](#11-licensing)

---

## 1. Installing the Plugin

Unlike the Kadabra KSamplers, KChannel has no sample library — every
audio and image resource it needs is embedded in the plugin itself. All
it needs besides the plugin is its factory presets.

### The IMI Kadabra Kit installer (macOS, recommended)

<!-- REVIEW: the installer is on hold until after testing; confirm this
section once the new kit (with the 2026-10-08 builds) is built. -->

KChannel is always included in the **IMI Kadabra Kit** installer. It
installs the VST3 and Audio Unit plugins for all users, in
`/Library/Audio/Plug-Ins/`, and sets up the factory presets for your
user account — nothing else to do.

### Manual installation

**macOS:**

1. Copy `KChannel.vst3` to `~/Library/Audio/Plug-Ins/VST3/`.
2. Copy `KChannel.component` to `~/Library/Audio/Plug-Ins/Components/`.
3. Copy the `Factory Presets` folder into
   `~/Library/Application Support/IMI/KChannel/User Presets/`:
   ```
   mkdir -p ~/Library/Application\ Support/IMI/KChannel/User\ Presets
   cp -r "Factory Presets" ~/Library/Application\ Support/IMI/KChannel/User\ Presets/
   ```

Do step 3 **before** opening KChannel for the first time: the plugin
looks for its presets the moment it loads, so a preset folder created
afterwards only shows up the next time it opens.

**Windows:** VST3 only. Copy `KChannel.vst3` to
`C:\Program Files\Common Files\VST3\`, and copy the `Factory Presets`
folder into `%APPDATA%\IMI\KChannel\User Presets\`.

<!-- REVIEW: Windows preset path follows the KSamplers convention;
confirm against the Windows installer before publishing. -->

There's no sample folder to link and no `LinkOSX`/`LinkWindows` file to
create.

## 2. Loading It in Your DAW

After installing, rescan plugins in your DAW (or restart it) and load
KChannel as an insert like any other VST3 or Audio Unit effect — on a
channel, a bus, or (in Kadabra KPlayer) any insert slot, including the
master bus. No iLok, license file, or online activation is required.

KChannel opens on its **Full Reset** preset, a neutral starting point
that leaves your signal untouched: the EQ is on but flat (Low Shelf,
Bell and High Shelf at 0 dB, the High Shelf parked at 5 kHz, both cut
filters off), the Gate is fully open, the Compressor is at 1:1, and
Output Gain is at 0 dB.

## 3. The Interface at a Glance

KChannel opens in a single fixed-size panel (400 × 800) with everything
visible at once — no tabs or sub-pages:

- **Top bar** — the IMI logo, the **Presets** button, the KCHANNEL
  wordmark, the **About** button, and the Tribal Tools logo. See
  [Presets](#8-presets).
- **EQ graph** — the live EQ curve over a real-time spectrum analyzer of
  your signal, with a draggable numbered marker per band and an **EQ**
  switch in its top-right corner that bypasses the whole EQ. See
  [The Parametric EQ](#5-eq).
- **Five EQ band strips** below the graph, left to right — Low Cut, Low
  Shelf, Bell, High Shelf, High Cut. Each has an LED on/off switch and
  its filter-shape icon at the top, a Freq knob, and — for the shelves
  and the Bell — a Gain knob; the Bell adds a **Q** knob.
- **Dynamics panel** — **Gate** and **Compressor** side by side, each
  with its own LED on/off switch, plus the Compressor's Ratio and a
  shared **GR** (gain reduction) meter. See
  [Gate & Compressor](#6-dynamics).
- **Output** — a vertical Output Gain fader with a stereo level meter,
  two clip-indicator LEDs at the top, and the current gain readout
  underneath.

Every knob has a live value readout.

## 4. Signal Flow

The panels are laid out on screen as EQ-then-dynamics, top to bottom —
but the processing order is the other way round:

```
Input  →  Gate  →  Compressor  →  Parametric EQ  →  Output Gain
```

Dynamics come first, shaping the signal's level before the EQ carves its
tone; Output Gain is the final stage before the clip meters described in
[Output Gain & Clip Meters](#7-output-gain).

## 5. The Parametric EQ

Five bands, each with its own on/off switch, plus one master switch for
the whole EQ:

- **EQ** (top-right of the graph) — bypasses all five bands at once,
  regardless of each band's own on/off state.

| Band | Type | Freq range | Gain | Other |
|---|---|---|---|---|
| 1 | Low Cut | 20 Hz – 1 kHz | — | |
| 2 | Low Shelf | 40 Hz – 3 kHz | ±24 dB | |
| 3 | Bell (parametric peak) | 300 Hz – 9 kHz | ±24 dB | Q: 0.3 – 8.0 (default 1.5) |
| 4 | High Shelf | 20 Hz – 20 kHz | ±24 dB | |
| 5 | High Cut | 20 Hz – 20 kHz | — | |

Each band's LED switch (next to its filter-shape icon) turns that band
on or off without affecting the others. Low Cut and High Cut start off;
the other three start on.

> **The graph works both ways:** drag a band's marker on the curve to
> change its frequency (and gain, for the shelves and the Bell), or turn
> the knobs and watch the marker follow — the two always stay in sync.
> The markers are numbered 0–4 from left to right, matching the band
> strips 1–5 below. The gray shape behind the curve is a real-time
> analyzer of your signal, so you can see what you're EQing as you
> shape it.

## 6. Gate & Compressor

Two independent dynamics stages in one panel, each with its own LED
on/off switch, sharing a single gain-reduction meter:

**Gate**

| Control | Range | Default |
|---|---|---|
| Thresh | −100 – 0 dB | −100 dB (fully open) |
| Attack | 0.1 – 100 ms | 0.1 ms |
| Release | 0 – 100 ms | 50 ms |

**Compressor**

| Control | Range | Default |
|---|---|---|
| Thresh | −100 – 0 dB | 0 dB |
| Ratio | 1:1 – 32:1 | 1:1 (no compression) |
| Attack | 0.1 – 100 ms | 50 ms |
| Release | ~0 – 300 ms | 150 ms |

**GR (Gain Reduction) meter** — one vertical orange meter, anchored at
0 dB at the top and covering −24 dB, with reference marks at
−6/−12/−18/−24 dB. It combines both stages: with the gate closed it
reads full-scale (the gate dominates); with the gate open, it tracks the
compressor's gain reduction. A stage that's switched off doesn't count.
There's no numeric readout — the meter moves too fast to read as text,
which is why the reference marks are drawn alongside it.

## 7. Output Gain & Clip Meters

- **Output Gain** — the vertical fader in the Output section, −100 dB to
  +36 dB, default 0 dB. This is the final stage before KChannel's
  output; the meter next to it shows the live left/right level.
- **Clip LEDs** — two indicators (left/right) at the top of the meter
  light up when the output gets close to full scale (around
  −0.1 dBFS). Each LED latches on and auto-releases after about 5
  seconds below threshold, or you can click directly on a lit LED to
  clear it immediately.

## 8. Presets

Click **Presets** (top bar) to open HISE's standard preset browser:
search by name, and save/load/organize your own presets alongside the
factory ones (favorites, notes, and save/rename/delete controls
included). Clicking **About** or **Presets** again — or opening the
other panel — closes whichever is currently open, since only one can be
shown at a time.

KChannel ships 15 factory presets, starting points for common sources:

| Source | Presets |
|---|---|
| Reset | `Full Reset` — the neutral preset KChannel opens with |
| Drums | `Rock Kick`, `Phat Snare`, `Punchy Snare`, `Tom Tom`, `Floor Tom`, `Overheads` |
| Bass guitar | `BassGT Fat Low Bright top`, `BassGT Fat Low Super Bright`, `BassGT Low and Behold` |
| Electric guitar | `ElectricGT Drive Rythem`, `ElectricGT Driven Rythem Bright Bites` |
| Vocals | `VOX Live Male`, `VOX Overbright`, `Old Phone VOX` |

Factory presets are read-only, so you can't overwrite one by accident.
To keep a tweaked version, save it under a new name.

The **About** panel shows the license summary, plus clickable links to
the IMI site, Tribal Tools, the GitHub repository, JUCE, and HISE.

## 9. Cross-Platform & Format Notes

KChannel is built with [HISE](https://hise.dev/) and
[JUCE](https://juce.com/), and is available as:

- **VST3 + Audio Unit** on macOS (universal — runs natively on both
  Apple Silicon and Intel Macs)
- **VST3** on Windows

The macOS builds are signed and notarized by Apple, so they open without
security warnings. Presets are plain XML and carry over between
platforms without conversion — there's no sample library to keep in
sync.

## 10. Troubleshooting

**A clip LED stays lit.**
Click directly on the lit LED to clear it, or lower Output Gain — it
also auto-releases on its own after a few seconds below threshold.

**The EQ knobs don't seem to do anything.**
Check the **EQ** switch in the graph's top-right corner — it bypasses the
whole EQ at once, independent of each band's own switch. Also check that
band's own LED switch: Low Cut and High Cut start switched off.

**Gating/compression seems to have no effect.**
Check that stage's LED switch (next to the "Gate" or "Compressor"
label). At their defaults both stages are on but neutral: the Gate's
threshold is at −100 dB (always open) and the Compressor's ratio is 1:1 —
lower the Gate threshold or raise the Ratio to hear them work.

**The preset browser is empty aside from what I've saved myself.**
The `Factory Presets` folder wasn't in place before KChannel first
opened — repeat step 3 of the manual install, then reload the plugin.

## 11. Licensing & Credits

KChannel is developed by
[Innovative Musical Instruments (IMI)](https://www.innovativemusicalinstruments.com),
collaborators of [Tribal Tools](https://www.tribal-tools.com), creators
of the Kadabra Music Workstation. Source is available at
[github.com/innovative-musical-instruments/imi-kchannel](https://github.com/innovative-musical-instruments/imi-kchannel).
Built with [HISE](https://hise.dev/) and [JUCE](https://juce.com/).

KChannel is provided free of charge, with no warranty.

---

*This guide covers KChannel as currently shipped (version 1.0.0, GUI
updated October 2026).*
