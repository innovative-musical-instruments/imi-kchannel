Content.makeFrontInterface(400, 800);
// ---------------- Module references ----------------
const eq      = Synth.getEffect("Parametriq EQ"); // CurveEq
const dyn     = Synth.getEffect("Dynamics");       // Gate + Compressor
const outGain = Synth.getEffect("Simple Gain");    // Output stage
inline function eqParam(bandIndex, param)
{
    return bandIndex * eq.BandOffset + param;
}
// Shared freq label formatting (used by onBandFreq and the graph->knob sync below)
inline function formatFreqText(value)
{
    if (value >= 1000)
        return Engine.doubleToString(value / 1000, 2) + " kHz";
    else
        return Math.round(value) + " Hz";
}
// ---------------- EQ band on/off ----------------
// Historical note: toggling a band's Enabled state from script used to
// leave the fltEqGraph tile visually stale (curve + drag markers) until
// some other coefficient-changing control was touched, even though the
// audio and the bound knob were already correct. Root-caused to two bugs
// in HISE's own source, not something fixable from script:
//   1. FilterDragOverlay::checkEnabledBands() (EqComponent.cpp) updated
//      the drag-handle marker data but never called repaint() on itself.
//   2. FilterGraph::enableBand() (FilterGraph.h) only called repaint(),
//      not refreshAsync(), so the cached curve path was never recomputed.
// Both patched locally in the HISE source tree; the graph now updates

inline function onBandOnOff(component, value)
{
    local bandNum = parseInt(component.get("id").substring(7, 8));
    local bandIndex = bandNum - 1;
    eq.setAttribute(eqParam(bandIndex, eq.Enabled), value);
}
for (i = 1; i <= 5; i++)
    Content.getComponent("btnBand" + i + "OnOff").setControlCallback(onBandOnOff);
// ---------------- EQ band frequency ----------------
inline function onBandFreq(component, value)
{
    local bandNum = parseInt(component.get("id").substring(7, 8));
    eq.setAttribute(eqParam(bandNum - 1, eq.Freq), value);
    Content.getComponent("lblBand" + bandNum + "Freq").set("text", formatFreqText(value));
}
for (i = 1; i <= 5; i++)
    Content.getComponent("sldBand" + i + "Freq").setControlCallback(onBandFreq);
// ---------------- EQ band gain (bands 2, 3, 4 only) ----------------
inline function onBandGain(component, value)
{
    local bandNum = parseInt(component.get("id").substring(7, 8));
    eq.setAttribute(eqParam(bandNum - 1, eq.Gain), value);
    Content.getComponent("lblBand" + bandNum + "Gain").set("text", Engine.doubleToString(value, 1) + " dB");
}
const gainBands = [2, 3, 4];
for (idx = 0; idx < gainBands.length; idx++)
{
    local i = gainBands[idx];
    Content.getComponent("sldBand" + i + "Gain").setControlCallback(onBandGain);
}
// ---------------- EQ band 3 width (Q) ----------------
inline function onBand3Width(component, value)
{
    eq.setAttribute(eqParam(2, eq.Q), value);
    Content.getComponent("lblBand3Width").set("text", Engine.doubleToString(value, 2));
}
Content.getComponent("sldBand3Width").setControlCallback(onBand3Width);
// ---------------- EQ graph -> knob sync ----------------
// Dragging a band marker on the native fltEqGraph floating tile writes
// straight to the EQ module's attributes, which the knobs never hear about
// since they're only wired script -> module (setControlCallback above).
// This broadcaster watches mouse activity on the graph and re-reads each
// band's current attribute values back into the matching sliders/labels.
inline function syncBandFromEQ(bandNum)
{
    local bandIndex = bandNum - 1;

    local enabled = eq.getAttribute(eqParam(bandIndex, eq.Enabled));
    Content.getComponent("btnBand" + bandNum + "OnOff").setValue(enabled);

    local freq = eq.getAttribute(eqParam(bandIndex, eq.Freq));
    Content.getComponent("sldBand" + bandNum + "Freq").setValue(freq);
    Content.getComponent("lblBand" + bandNum + "Freq").set("text", formatFreqText(freq));

    if (gainBands.indexOf(bandNum) != -1)
    {
        local gain = eq.getAttribute(eqParam(bandIndex, eq.Gain));
        Content.getComponent("sldBand" + bandNum + "Gain").setValue(gain);
        Content.getComponent("lblBand" + bandNum + "Gain").set("text", Engine.doubleToString(gain, 1) + " dB");
    }

    if (bandNum == 3)
    {
        local width = eq.getAttribute(eqParam(bandIndex, eq.Q));
        Content.getComponent("sldBand3Width").setValue(width);
        Content.getComponent("lblBand3Width").set("text", Engine.doubleToString(width, 2));
    }
}

const eqGraphSync = Engine.createBroadcaster({
    "id": "EQ Graph -> Knob Sync",
    "args": ["component", "event"]
});

eqGraphSync.attachToComponentMouseEvents("fltEqGraph", "Clicks, Hover & Dragging", "Watch fltEqGraph mouse activity");

eqGraphSync.addListener("", "resync knobs from EQ module", function(component, event)
{
    if (event.clicked || event.drag || event.mouseUp)
    {
        for (i = 1; i <= 5; i++)
            syncBandFromEQ(i);
    }
});
// ---------------- Gate ----------------
inline function onGateThresh(component, value)
{
    dyn.setAttribute(dyn.GateThreshold, value);
    Content.getComponent("lblGateThresh").set("text", Engine.doubleToString(value, 1) + " dB");
}
Content.getComponent("sldGateThresh").setControlCallback(onGateThresh);
inline function onGateAttack(component, value)
{
    dyn.setAttribute(dyn.GateAttack, value);
    Content.getComponent("lblGateAttack").set("text", Math.round(value) + " ms");
}
Content.getComponent("sldGateAttack").setControlCallback(onGateAttack);
inline function onGateRelease(component, value)
{
    dyn.setAttribute(dyn.GateRelease, value);
    Content.getComponent("lblGateRelease").set("text", Math.round(value) + " ms");
}
Content.getComponent("sldGateRelease").setControlCallback(onGateRelease);
// ---------------- Compressor ----------------
inline function onCompThresh(component, value)
{
    dyn.setAttribute(dyn.CompressorThreshold, value);
    Content.getComponent("lblCompThresh").set("text", Engine.doubleToString(value, 1) + " dB");
}
Content.getComponent("sldCompThresh").setControlCallback(onCompThresh);
inline function onCompRatio(component, value)
{
    dyn.setAttribute(dyn.CompressorRatio, value);
    Content.getComponent("lblCompRatio").set("text", Engine.doubleToString(value, 1) + ":1");
}
Content.getComponent("sldCompRatio").setControlCallback(onCompRatio);
inline function onCompAttack(component, value)
{
    dyn.setAttribute(dyn.CompressorAttack, value);
    Content.getComponent("lblCompAttack").set("text", Math.round(value) + " ms");
}
Content.getComponent("sldCompAttack").setControlCallback(onCompAttack);
inline function onCompRelease(component, value)
{
    dyn.setAttribute(dyn.CompressorRelease, value);
    Content.getComponent("lblCompRelease").set("text", Math.round(value) + " ms");
}
Content.getComponent("sldCompRelease").setControlCallback(onCompRelease);
// ---------------- Gain Reduction meter (Gate + Compressor) ----------------
// Vertical meter, top-anchored: 0 dB at the top, growing downward as more
// gain reduction is applied. Combines GateReduction + CompressorReduction,
// so a closed gate reads as full-scale (dominates), and with the gate open
// the bar tracks compressor GR only - one panel, two jobs.
// No live numeric label - GR moves too erratically with the ballistics to
// read as text, so static dB reference lines are drawn on the meter instead.
const var attenuationMeter = Content.getComponent("pnlAttenuationMeter");
const var GR_METER_RANGE_DB = 24.0;            // 0 dB at top, -24 dB at bottom (full-scale)
const var GR_METER_TICKS_DB = [-6, -12, -18];  // reference lines between the ends
const var GR_METER_BAR_COLOUR  = 0xFFFFAA00;   // amber
const var GR_METER_TICK_COLOUR = 0x55FFFFFF;
reg attenuationDb = 0.0;

inline function dbToMeterY(db, h)
{
    local frac = (-1.0 * db) / GR_METER_RANGE_DB;
    frac = Math.max(0.0, Math.min(1.0, frac));
    return h * frac;
}

attenuationMeter.setPaintRoutine(function(g)
{
    local w = this.getWidth();
    local h = this.getHeight();

    g.setColour(0xFF1A1A1A);
    g.fillRect([0, 0, w, h]);

    local barHeight = dbToMeterY(attenuationDb, h);
    g.setColour(GR_METER_BAR_COLOUR);
    g.fillRect([0, 0, w, barHeight]);

    g.setColour(GR_METER_TICK_COLOUR);
    g.setFont("Arial", 8);
    for (i = 0; i < GR_METER_TICKS_DB.length; i++)
    {
        local tickY = dbToMeterY(GR_METER_TICKS_DB[i], h);
        g.drawHorizontalLine(tickY, 0, w);
        g.drawAlignedText(GR_METER_TICKS_DB[i] + "", [0, tickY - 9, w - 2, 9], "right");
    }
});

// Only count a stage's reduction while it's actually enabled - a disabled
// stage still reports whatever raw value it last held, which is not
// meaningful once it's switched off. When enabled, the raw reduction is
// trusted as-is: a hard-shut gate legitimately reads close to -infinity dB,
// and that should show as full-scale on the meter, not get floored away.
const var attenuationMeterTimer = Engine.createTimerObject();
attenuationMeterTimer.setTimerCallback(function()
{
    local gateDb = 0.0;
    if (dyn.getAttribute(dyn.GateEnabled))
        gateDb = Engine.getDecibelsForGainFactor(dyn.getAttribute(dyn.GateReduction));

    local compDb = 0.0;
    if (dyn.getAttribute(dyn.CompressorEnabled))
        compDb = Engine.getDecibelsForGainFactor(dyn.getAttribute(dyn.CompressorReduction));

    attenuationDb = gateDb + compDb;
    attenuationMeter.repaint();
});
attenuationMeterTimer.startTimer(30);
// ---------------- Output gain ----------------
inline function onOutputGain(component, value)
{
    outGain.setAttribute(outGain.Gain, value);
    Content.getComponent("lblOutputGain").set("text", Engine.doubleToString(value, 1) + " dB");
}
Content.getComponent("SldOutputGain").setControlCallback(onOutputGain);
// ---------------- About / Presets overlay (radio-button style) ----------------
// Same mechanism as Electronic Drumkit: two toggle buttons, two panels.
// Turning one on forces the other button+panel off.
const var presetsButton = Content.getComponent("presetsButton");
const var presetsManager = Content.getComponent("presetsManager");
const var aboutButton = Content.getComponent("aboutButton");
const var aboutPanel = Content.getComponent("aboutPanel");

inline function onAboutButtonControl(component, value)
{
    aboutPanel.set("visible", value);
    if (value)
    {
        presetsManager.set("visible", false);
        presetsButton.setValue(0);
    }
};

inline function onPresetsButtonControl(component, value)
{
    presetsManager.set("visible", value);
    if (value)
    {
        aboutPanel.set("visible", false);
        aboutButton.setValue(0);
    }
};

presetsButton.setControlCallback(onPresetsButtonControl);
aboutButton.setControlCallback(onAboutButtonControl);
// ---------------- About panel: website link hotspots ----------------
// Invisible panels placed over the rendered URL text in the about-box art.
// Shared callback keyed off component ID, same convention as the EQ bands.
const var linkIds  = ["pnlLinkIMI", "pnlLinkTribalTools", "pnlLinkGitRepo", "pnlLinkJUCE", "pnlLinkHISE"];
const var linkUrls =
[
    "https://www.innovativemusicalinstruments.com/kchannel",
    "https://tribal-tools.com/",
    "https://github.com/innovative-musical-instruments/imi-kchannel",
    "https://juce.com/",
    "https://hise.dev/"
];

inline function onLinkPanelMouse(event)
{
    if (event.mouseUp)
    {
        local idx = linkIds.indexOf(this.get("id"));
        if (idx != -1) Engine.openWebsite(linkUrls[idx]);
    }
};

for (i = 0; i < linkIds.length; i++)
{
    local p = Content.getComponent(linkIds[i]);
    p.setMouseCursor("PointingHandCursor", Colours.white, [0, 0]);
    p.setMouseCallback(onLinkPanelMouse);
}
// ---------------- Clip indicator LEDs ----------------
// Reads Globals.peakL/peakR, written by the Script FX "Peak Detector" node
// living in imiKChannel's own root-level FX chain (post everything,
// since that chain processes after Container1's output sums in).
const var clipLedL = Content.getComponent("pnlClipLedLeft");
const var clipLedR = Content.getComponent("pnlClipLedRight");
const var CLIP_OFF_COLOUR = 0xFF330000; // dim red, idle
const var CLIP_ON_COLOUR  = 0xFFFF2222; // hot red, clipped
const var CLIP_HIGHLIGHT  = 0x99FFAAAA; // glassy strip when on
const var CLIP_THRESHOLD  = 0.989;      // ~ -0.1 dBFS
const var CLIP_HOLD_MS    = 5000;       // auto-release
const var CLICK_GUARD_MS  = 250;        // re-latch suppression after click
reg clipState    = [false, false];
reg lastClipMs   = [0.0,   0.0];
reg clickResetMs = [0.0,   0.0];
// --- Paint ---
clipLedL.setPaintRoutine(function(g)
{
    local w = this.getWidth();
    local h = this.getHeight();
    g.setColour(clipState[0] ? CLIP_ON_COLOUR : CLIP_OFF_COLOUR);
    g.fillRect([0, 0, w, h]);
    if (clipState[0])
    {
        g.setColour(CLIP_HIGHLIGHT);
        g.fillRect([0, 0, w, h / 3]);
    }
});
clipLedR.setPaintRoutine(function(g)
{
    local w = this.getWidth();
    local h = this.getHeight();
    g.setColour(clipState[1] ? CLIP_ON_COLOUR : CLIP_OFF_COLOUR);
    g.fillRect([0, 0, w, h]);
    if (clipState[1])
    {
        g.setColour(CLIP_HIGHLIGHT);
        g.fillRect([0, 0, w, h / 3]);
    }
});
// --- Click to reset ---
clipLedL.setMouseCallback(function(event)
{
    clipState[0] = false;
    clickResetMs[0] = Engine.getUptime() * 1000;
    clipLedL.repaint();
});
clipLedR.setMouseCallback(function(event)
{
    clipState[1] = false;
    clickResetMs[1] = Engine.getUptime() * 1000;
    clipLedR.repaint();
});
// --- Polling timer drives both LEDs ---
const var clipTimer = Engine.createTimerObject();
clipTimer.setTimerCallback(function()
{
    local now = Engine.getUptime() * 1000;
    local pL = Globals.peakL;
    local pR = Globals.peakR;
    local newL = clipState[0];
    local newR = clipState[1];
    if (now - clickResetMs[0] > CLICK_GUARD_MS)
    {
        if (pL >= CLIP_THRESHOLD) { newL = true;  lastClipMs[0] = now; }
        else if (clipState[0] && (now - lastClipMs[0] > CLIP_HOLD_MS)) newL = false;
    }
    if (now - clickResetMs[1] > CLICK_GUARD_MS)
    {
        if (pR >= CLIP_THRESHOLD) { newR = true;  lastClipMs[1] = now; }
        else if (clipState[1] && (now - lastClipMs[1] > CLIP_HOLD_MS)) newR = false;
    }
    if (newL != clipState[0]) { clipState[0] = newL; clipLedL.repaint(); }
    if (newR != clipState[1]) { clipState[1] = newR; clipLedR.repaint(); }
});
clipTimer.startTimer(30); // 30ms pollfunction onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 