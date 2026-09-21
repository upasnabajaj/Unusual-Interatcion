# The sleeping grove

An original, desktop-first unusual-interaction experience. No dependencies or build step. Serve the repository over HTTP and open `index.html`.

Double-click / double-tap the white fairy to begin. Drag her through lights or select lights directly. Strong drags out of the viewport carry her around the same grove and back in from the opposite edge without losing discoveries. Three rounds contain 12 lights each, with 3, 4, and 5 discoveries. Completed routes lead into flower glyphs; the same three glyphs host the final dance and open the living gateway.

Keyboard: focus the fairy and press Enter or Space to begin. Arrow keys move the active fairy; Tab and Enter also explore individual lights. Reduced-motion preferences shorten choreography and disable continuous CSS motion.

## Source layout

- `js/main.js`: states, exploration, choreography, dialogue.
- `js/patterns.js`: round configurations and exact route/glyph geometry.
- `js/fairy.js`: original SVG fairy and poses.
- `js/environment.js`: persistent procedural woodland and awakening layers.
- `style.css`: responsive placement, typography, motion preferences.

All artwork is original SVG / canvas geometry. No external assets, fonts, analytics, or services are loaded.

## Publishing

The GitHub Actions workflow publishes `main` to GitHub Pages. In repository Settings → Pages, select **GitHub Actions** as the source. Only the site files are uploaded.

## Journey regression check

With Playwright installed in your development environment and a local server on port 5173, run `node tests/journey.cjs`. The check exercises every decoy and correct light, verifies all three rounds have exactly 12 lights, reaches the opened gateway, captures opening/final screenshots in the temporary directory, and fails on JavaScript errors.
