# Kadabra KChannel — User Guide

KChannel is IMI's channel-strip processor: a 5-band parametric EQ with a
real-time spectrum analyzer, followed by a Gate/Compressor dynamics
section and an output stage with clip metering. Built for the Kadabra
Music Workstation™, it's the standard channel-strip insert used alongside
the Kadabra KSamplers and inside Kadabra KPlayer's channel and master
insert slots.

## Table of Contents

1. [Installing the Plugin](#1-install)
2. [Loading It in Your DAW](#2-loading)
3. [The Interface at a Glance](#3-interface)
4. [Signal Flow](#4-signal-flow)
5. [The Parametric EQ](#5-eq)
6. [Gate & Compressor](#6-dynamics)
7. [Output Gain & Clip Meters](#7-output-gain)
8. [The Preset Browser](#8-presets)
9. [Cross-Platform & Format Notes](#9-cross-platform)
10. [Troubleshooting](#10-troubleshooting)
11. [Licensing & Credits](#11-licensing)

---

## 1. Installing the Plugin

Unlike the Kadabra KSamplers, KChannel doesn't ship a separate sample
library — every audio and image resource it needs is embedded directly in
the plugin bundle. Installing it is a single step:

- **macOS:** copy `KChannel.vst3` to `~/Library/Audio/Plug-Ins/VST3/`, and
  `KChannel.component` to `~/Library/Audio/Plug-Ins/Components/`.
- **Windows:** copy `KChannel.vst3` to
  `C:\Program Files\Common Files\VST3\`.

There's no sample folder to link and no `LinkOSX`/`LinkWindows` file to
create — once the plugin file is in place, it's ready to load.

## 2. Loading It in Your DAW

After installing, rescan plugins in your DAW (or restart it) and load
KChannel as an insert like any other VST3 or Audio Unit effect — on a
channel, a bus, or (in Kadabra KPlayer) any insert slot, including the
master bus. No iLok, license file, or online activation is required.

## 3. The Interface at a Glance

KChannel opens in a single fixed-size panel with everything visible at
once — no tabs or sub-pages:

- **Top bar** — the IMI logo on the left; **Presets** button; the
  KCHANNEL wordmark; **About** button; the Tribal Tools logo on the
  right. See [The Preset Browser](#8-presets) for what Presets/About do.
- **EQ graph** — a live curve over a real-time input spectrum analyzer,
  with a draggable marker per band and an **EQOnOff** toggle above the
  graph that bypasses the entire 5-band EQ module in one click. See
  [The Parametric EQ](#5-eq).
- **Five EQ band strips** below the graph, each with its own on/off
  toggle, a Freq knob, and (for bands 2–4) a Gain knob — band 3 adds a
  Width/Q knob.
- **Gate & Compressor section** — two labeled sub-sections, each with its
  own on/off toggle and knobs, sharing one gain-reduction meter. See
  [Gate & Compressor](#6-dynamics).
- **Output strip** — a vertical output-gain fader with a built-in peak
  meter and two clip-indicator LEDs above it.

## 4. Signal Flow

The knobs are laid out on screen as EQ-then-dynamics, top to bottom — but
the actual processing order is the reverse of what you'd guess from the
layout:

```
Input  →  Gate  →  Compressor  →  Parametric EQ  →  Output Gain
```

Dynamics come first, shaping the signal's level before the EQ carves its
tone; Output Gain is the final stage before the clip meters described in
[Output Gain & Clip Meters](#7-output-gain).

## 5. The Parametric EQ

Five bands, each independently enabled/disabled, plus one master switch
for the whole module:

- **EQOnOff** (above the graph) — bypasses all five bands at once,
  regardless of each band's individual on/off state.

| Band | Type | Freq range | Gain | Other |
|---|---|---|---|---|
| 1 | Low Cut | 20 Hz – 1 kHz | — | |
| 2 | Low Shelf | 40 Hz – 3 kHz | ±24 dB | |
| 3 | Bell (parametric peak) | 300 Hz – 9 kHz | ±24 dB | Width/Q: 0.3 – 8.0 (default 1.5) |
| 4 | High Shelf | 20 Hz – 20 kHz | ±24 dB | |
| 5 | High Cut | 20 Hz – 20 kHz | — | |

Each band's own on/off toggle (the small circle above its filter-shape
icon) disables that band without affecting the others.

**The graph is fully interactive both ways:** dragging a numbered marker
directly on the curve changes that band's frequency (and gain, for bands
2–4), and turning the knobs moves the marker on the graph — the two stay
in sync no matter which one you touch. The gray filled shape behind the
curve is a real-time analyzer showing your input signal's spectrum, so
you can see exactly what you're EQing against as you shape the curve.

## 6. Gate & Compressor

Two independent dynamics stages, each with its own on/off toggle, sharing
a single gain-reduction meter:

**Gate**
| Control | Range | Default |
|---|---|---|
| Threshold | −100 – 0 dB | −100 dB (open/off) |
| Attack | 0.1 – 100 ms | |
| Release | 0 – 100 ms | 50 ms |

**Compressor**
| Control | Range | Default |
|---|---|---|
| Threshold | −100 – 0 dB | |
| Ratio | 1:1 – 32:1 | 1:1 (off) |
| Attack | 0.1 – 100 ms | |
| Release | ~0 – 300 ms | 150 ms |

**Gain Reduction meter** — one vertical amber meter, top-anchored at
0 dB, covering a −24 dB range with reference lines at −6/−12/−18 dB. It
combines both stages: with the gate closed it reads full-scale (the gate
dominates); with the gate open, it tracks compressor gain reduction only.
There's no live numeric readout — the ballistics move too fast to read as
text, which is why the reference lines are drawn on the meter itself
instead.

## 7. Output Gain & Clip Meters

- **Output Gain** — the vertical fader on the right, −100 dB to +36 dB,
  the final stage before KChannel's output.
- **Clip LEDs** — two indicators (left/right) light up when the output
  gets close to full scale (around −0.1 dBFS). Each LED latches on and
  auto-releases after about 5 seconds of staying below threshold, or you
  can click directly on a lit LED to clear it immediately.

## 8. The Preset Browser

Click **Presets** (top bar) to open HISE's standard preset browser:
search by name, browse by folder, and save/load/organize your own
presets alongside the factory ones (favorites, notes, and
save/rename/delete controls included). Clicking **About** or **Presets**
again — or opening the other panel — closes whichever is currently open,
since only one can be shown at a time.

No factory presets ship with KChannel yet — the browser currently only
shows what you've saved yourself.

The **About** panel shows the plugin version and license summary, plus
clickable links to the IMI site, Tribal Tools, the GitHub repository,
JUCE, and HISE.

## 9. Cross-Platform & Format Notes

KChannel is built with [HISE](https://hise.dev/) and
[JUCE](https://juce.com/), and is available as:

- **VST3 + Audio Unit** on macOS
- **VST3** on Windows

Presets are plain XML and carry over between platforms without
conversion — there's no sample library to keep in sync, since everything
KChannel needs is embedded in the plugin itself.

## 10. Troubleshooting

**A clip LED stays lit.**
Click directly on the lit LED to clear it, or lower Output Gain — it also
auto-releases on its own after a few seconds below threshold.

**The EQ knobs don't seem to do anything.**
Check the **EQOnOff** toggle above the graph — it bypasses the entire
5-band EQ at once, independent of each band's own on/off state.

**Gating/compression seems to have no effect.**
Check that stage's own on/off toggle (next to the "Gate" or "Compressor"
label) — each is independent of the other, and both are separate from
the shared Gain Reduction meter, which reflects whichever stage(s) are
actually enabled.

**The preset browser is empty aside from what I've saved myself.**
Expected for now — no factory presets ship with KChannel yet.

## 11. Licensing & Credits

KChannel is developed by
[Innovative Musical Instruments (IMI)](https://www.innovativemusicalinstruments.com),
collaborators of [Tribal Tools](https://www.tribal-tools.com), creators
of the Kadabra Music Workstation. Source is available at
[github.com/innovative-musical-instruments/imi-kchannel](https://github.com/innovative-musical-instruments/imi-kchannel).
Built with [HISE](https://hise.dev/) and [JUCE](https://juce.com/).

KChannel is provided free of charge, with no warranty.

---

*This guide covers KChannel as currently shipped (v1.0.0). Factory
presets are not yet included — this section will grow once they ship.*
