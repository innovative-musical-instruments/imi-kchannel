#!/bin/bash
# apply_plugin_icon.sh
#
# Injects Images/Icon.png as the Finder bundle icon for KChannel's compiled
# AU (.component) and VST3 (.vst3) bundles on macOS.
#
# WHY THIS EXISTS: HISE's built-in "Icon.png in the Images folder" feature
# only wires up to standalone app builds (confirmed in HISE's own docs).
# For plugin bundles (AU/VST3), JUCE/HISE never touch CFBundleIconFile, so
# the bundle folder shows the generic plugin icon in Finder no matter what
# you put in the Images folder. This script patches that in after the fact.
#
# WHAT IT DOES, per bundle found:
#   1. Builds a proper multi-resolution .icns from Images/Icon.png
#   2. Copies the .icns into <bundle>/Contents/Resources/
#   3. Sets CFBundleIconFile in <bundle>/Contents/Info.plist to point at it
#   4. Re-signs the bundle ad-hoc (codesign -s -), since editing files
#      inside an already-signed bundle invalidates its existing signature
#      and can make AU validation / DAW loading fail otherwise
#
# WHEN TO RUN: after every fresh compile. HISE overwrites the bundle
# contents (including Info.plist) each time you build, so this patch does
# not "stick" across rebuilds - it has to be re-applied each time.
#
# USAGE:
#   ./apply_plugin_icon.sh                  (uses defaults below)
#   ./apply_plugin_icon.sh /path/to/project  (override project root)

set -euo pipefail

# ---------------- Config ----------------
PROJECT_DIR="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
PRODUCT_NAME="KChannel"
ICON_SRC="$PROJECT_DIR/Images/Icon.png"
ICNS_NAME="$PRODUCT_NAME.icns"

# Places to look for built/installed copies of the bundles. Not all of these
# will exist on every machine - the script just skips whatever it can't find.
SEARCH_ROOTS=(
    "$PROJECT_DIR/Binaries/Builds/MacOSX/build/Release"
    "$PROJECT_DIR/Binaries/Builds/MacOSX/build/Debug"
    "$HOME/Library/Audio/Plug-Ins/Components"
    "$HOME/Library/Audio/Plug-Ins/VST3"
    "/Library/Audio/Plug-Ins/Components"
    "/Library/Audio/Plug-Ins/VST3"
)

# ---------------- Sanity checks ----------------
if [[ "$(uname)" != "Darwin" ]]; then
    echo "This script uses macOS-only tools (sips, iconutil, PlistBuddy) and must be run on your Mac, not in a sandbox." >&2
    exit 1
fi

if [[ ! -f "$ICON_SRC" ]]; then
    echo "Icon source not found: $ICON_SRC" >&2
    exit 1
fi

# ---------------- Build the .icns ----------------
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

ICONSET="$WORKDIR/$PRODUCT_NAME.iconset"
mkdir -p "$ICONSET"

echo "Building $ICNS_NAME from $ICON_SRC ..."
sips -z 16   16   "$ICON_SRC" --out "$ICONSET/icon_16x16.png"      >/dev/null
sips -z 32   32   "$ICON_SRC" --out "$ICONSET/icon_16x16@2x.png"   >/dev/null
sips -z 32   32   "$ICON_SRC" --out "$ICONSET/icon_32x32.png"      >/dev/null
sips -z 64   64   "$ICON_SRC" --out "$ICONSET/icon_32x32@2x.png"   >/dev/null
sips -z 128  128  "$ICON_SRC" --out "$ICONSET/icon_128x128.png"    >/dev/null
sips -z 256  256  "$ICON_SRC" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 256  256  "$ICON_SRC" --out "$ICONSET/icon_256x256.png"    >/dev/null
sips -z 512  512  "$ICON_SRC" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
sips -z 512  512  "$ICON_SRC" --out "$ICONSET/icon_512x512.png"    >/dev/null
cp "$ICON_SRC" "$ICONSET/icon_512x512@2x.png"   # source is already 1024x1024

ICNS_OUT="$WORKDIR/$ICNS_NAME"
iconutil -c icns "$ICONSET" -o "$ICNS_OUT"

# ---------------- Patch each bundle found ----------------
FOUND_ANY=0

patch_bundle () {
    local bundle="$1"
    local plist="$bundle/Contents/Info.plist"
    local resources="$bundle/Contents/Resources"

    if [[ ! -f "$plist" ]]; then
        echo "  Skipping $bundle (no Info.plist found - not a valid bundle?)"
        return
    fi

    echo "  Patching $bundle"
    mkdir -p "$resources"
    cp "$ICNS_OUT" "$resources/$ICNS_NAME"

    /usr/libexec/PlistBuddy -c "Set :CFBundleIconFile $ICNS_NAME" "$plist" 2>/dev/null \
        || /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string $ICNS_NAME" "$plist"

    # Re-sign ad-hoc: adding files after the original build invalidates
    # whatever signature was already on the bundle.
    codesign --force --deep -s - "$bundle" 2>&1 | sed 's/^/    codesign: /' || true

    touch "$bundle"
    FOUND_ANY=1
}

for root in "${SEARCH_ROOTS[@]}"; do
    [[ -d "$root" ]] || continue
    for ext in component vst3; do
        candidate="$root/$PRODUCT_NAME.$ext"
        [[ -d "$candidate" ]] && patch_bundle "$candidate"
    done
done

if [[ "$FOUND_ANY" -eq 0 ]]; then
    echo "No $PRODUCT_NAME.component / $PRODUCT_NAME.vst3 bundles found in any of:" >&2
    printf '  %s\n' "${SEARCH_ROOTS[@]}" >&2
    exit 1
fi

echo "Done. If Finder still shows the old icon, it's usually just icon-cache staleness:"
echo "  killall Finder"
echo "(or just wait / reopen the folder - macOS refreshes eventually)"
