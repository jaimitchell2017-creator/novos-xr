# NOVOS XR v0.5 — Spatial Mansion Prototype

This is the first visual/interaction prototype built around the intended NOVOS XR experience.

## What it is
- Futuristic mansion-style spatial home
- Wall-mounted NOVOS smart display
- Physical-looking app shelf
- Apps represented as objects/books instead of giant UI panels
- Files, Browser, NOVOS AI, App Store, Settings, Camera
- Desktop walk/look/click preview
- Quest WebXR passthrough
- Quest controller targeting + select/squeeze interaction
- Optional WebXR hand tracking request
- Local usage state saved in localStorage

## Quest
The web build requests `immersive-ar`, `hand-tracking`, plane detection and anchors when available. Meta documents Quest 2 Browser support for passthrough, plane detection and persistent anchors. Quest 2 passthrough is grayscale. WebXR input sources support controllers and tracked hands.

This prototype does NOT yet claim to have reliable persistent real-world furniture placement. That comes next after the first headset test.

## Browser
The Browser app is represented as a physical app object in the spatial home. A truly unrestricted browser engine cannot be inserted into an ordinary Quest web page because the Quest Browser remains the underlying browser. The native Electron browser-engine work remains a separate desktop/native path.

## Next
1. Test mansion look on desktop.
2. Test on Quest.
3. Make app books actually lift off shelf and open as spatial windows.
4. Add grab/release physics.
5. Add persistent anchors for real-room placement.
6. Build Files as a physical file room.
7. Build Browser as a floating spatial window.
8. Add real app launching/state.
