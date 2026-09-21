# Unusual Interaction — Screen 1

Screen 1 is implemented from [Figma node 269:2](https://www.figma.com/design/vfHLFM7rPdrIF8UjVrL1Yt/test?node-id=269-2). The original background and fairy are separate, unchanged PNG assets. The original dialogue outline is SVG; its Manrope text is live HTML.

Serve this folder over HTTP (for example `python3 -m http.server 5173`). No application dependencies or build step are required.

The fairy and dialogue remain fixed in their responsive Figma positions. Pointer movement and dragging do not move them. A soft masked lighting layer reveals the original environment near the fairy. Double-click or double-tap the fairy to twirl; keyboard users can focus her and press Enter or Space. She always remains on Screen 1. Reduced-motion preferences disable idle animation and replace the twirl with a short opacity response.

- `index.html` / `style.css`: Figma composition, responsive layout, dialogue, gentle glow and idle movement.
- `js/fairy.js`: fixed responsive position and confirmation pose.
- `js/main.js`: Screen 1 pointer/touch/keyboard input. The `fairy:twirl-complete` event is available for future screens; no transition is connected.
- `assets/`: original Figma images and vector dialogue outline, plus locally hosted Manrope.

The previous multi-round experience is retained only in Git history. There are no later screens, discovery dots, particles, or navigation in the current implementation.

The GitHub Pages workflow publishes site files and assets from `main` when Pages is configured to use GitHub Actions.

Run `node tests/screen-one.mjs` for deterministic input checks covering double-tap, double-click, dragging, cancelled gestures, and keyboard activation. Desktop and 390 × 844 layouts were also inspected in the browser, including live twirl and movement checks.
