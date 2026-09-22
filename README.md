# Unusual Interaction

Three Figma-based screens, implemented with separate original assets and live HTML/CSS controls. Serve this folder over HTTP, for example `python3 -m http.server 5173`. No application dependencies or build step are needed.

## Screen 1

[Figma 269:2](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=269-2).
The fixed fairy and dialogue retain their original composition. The dark room is softly illuminated near her. Double-click or double-tap the fairy to twirl, then crossfade into Screen 2. Pointer movement and dragging never move her.

## Screen 2

[Figma 272:144](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=272-144).
Choose up to three flowers: Lotus, Rose, Jasmine, Daisy, Tulip and Lily. Click a selected flower to deselect it. At three selections, unselected flowers remain visible but cannot be added. Only selected flowers receive ivory illumination. The fairy responds to double-tap only with exactly three selections; her twirl transitions smoothly into Screen 3, carrying those exact three selections forward.

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

## Screen 3

[Figma 272:150](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=272-150).
A ruined chamber begins almost entirely dark. Drag the fairy (or focus her and use arrow keys) to move her local torch. Six stones receive one stable random assignment: the exact three selected flowers and three unmarked normal stones. Bringing the fairy onto a stone and holding her there activates it; a nearby stone can also be clicked.

Empty stones respond only to nearby torchlight during exploration, then darken again. Flower stones charge in the selected flower’s colour, transfer energy into the fairy, and give her a graceful twirl. Each transformed fairy makes a short orbit around only her own stone and settles there. Selection order determines ownership. A travelling orb forms each new white fairy in open space, followed by a soft pulse.

After the third transformation, all three fairies circle the complete formation exactly three times (7.5, 6 and 4.8 seconds). The first lap permanently activates empty stones with neutral outlines. The next two increase energy and particles. Behind the particle veil the same room awakens using layered illumination, live botanical SVG details and coloured floor reflections. The veil fades, and all three original coloured fairies become independently draggable. No reference-image fairies or patterns are used.

`js/stones.js` owns guarded session state and stable assignments; `js/screen-three.js` owns choreography, exploration and the final interactive state; `js/magic-effects.js` provides bounded particles. `screen-three.css` keeps all effects separate from Screens 1 and 2.

Run `node tests/stones.mjs` for all 20 selection combinations, stable assignments, distance gates, ownership, repeat-activation locks, exactly three fairies and three rounds. See `assets/screen-three/ASSET-NOTES.md` for asset provenance. The colour-reference attachment is not included or used as artwork; original individual Screen 2 assets supply every engraving.
