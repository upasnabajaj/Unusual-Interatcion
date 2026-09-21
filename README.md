# Unusual Interaction

Two Figma-based screens, implemented with separate original assets and live HTML/CSS controls. Serve this folder over HTTP, for example `python3 -m http.server 5173`. No application dependencies or build step are needed.

## Screen 1

[Figma 269:2](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=269-2).
The fixed fairy and dialogue retain their original composition. The dark room is softly illuminated near her. Double-click or double-tap the fairy to twirl, then crossfade into Screen 2. Pointer movement and dragging never move her.

## Screen 2

[Figma 272:144](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=272-144).
Choose up to three flowers: Lotus, Rose, Jasmine, Daisy, Tulip and Lily. Click a selected flower to deselect it. At three selections, unselected flowers remain visible but cannot be added. Only selected flowers receive ivory illumination. The fairy responds to double-tap only with exactly three selections; her twirl returns to Screen 2. There is no Screen 3.

The background and flower interiors use their original separate Figma PNG layers. The original raster circle is clipped out; circular outlines, heading, labels and selection controls are live HTML/CSS. The original fairy asset is reused, mirrored and scaled to Screen 2's reference. No full-screen screenshot is used.

Keyboard users can Tab to flowers and activate with Enter or Space. The focused fairy responds to Enter or Space when available. Reduced-motion preferences disable idle movement and use shorter fades instead of rotational twirls.

## Files

- `style.css`: unchanged Screen 1 appearance and shared fairy artwork.
- `screen-two.css`: isolated Screen 2 styling.
- `js/main.js`: Screen 1 input and transition trigger.
- `js/fairy.js`: shared fixed character layout and twirl.
- `js/screen-two.js`: Screen 2 composition, selection controls and gated fairy input.
- `js/selection.js`: three-flower selection rule.
- `assets/`: original artwork, vector dialogue outline and locally hosted Manrope with its license.

Run `node tests/screen-one.mjs` and `node tests/selection.mjs` for input and selection regression checks. Browser checks cover the transition, disabled fairy, three selections, fourth-selection rejection, replacement and the Screen 2 twirl.

The GitHub Pages workflow publishes site files and assets from `main` when Pages is configured to use GitHub Actions.
