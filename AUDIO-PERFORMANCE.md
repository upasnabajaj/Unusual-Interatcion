# Quiet cues and two performances

The three recordings in `assets/audio/` are the supplied files, copied unchanged. Source edits live in `js/audio/cues.js`. The files are each 30 seconds long. Boundaries were selected from decoded waveform energy and quiet points; they have not been verified by an auditory listening review. Short fades soften the edits. All cue times remain editable in one place.

- Flower selections 1, 2, 3 trigger the existing source excerpts 1.42–6.65, 6.85–11.90, and 12.05–17.72 respectively. No opening autoplay. Each selection milestone is voiced once per journey; deselecting/reselecting does not add extra AAAHs. Existing flower accents remain unchanged. Rapid selections gently release the preceding vocal rather than stacking vocals.
- Both the Screen 1 twirl and the ready Screen 2 fairy twirl trigger the same sparkling passage, source 22.95–25.58. Pending selection vocals cannot spill into the next stage. The animation/progression timing is unchanged.
- Three rounds: source 2.60–22.025, 19.425 seconds total. Phrase boundaries 7.15 and 13.10 in the source separate the three laps.
- Awakened dance: source .475–26.125, 25.65 seconds total. Entry, answering formations, turns, writing, and settling use this playback clock.

`music.js` owns one context, prefetch/decode, bounded source playback, short synthesized event voices, silence, suspension, cancellation, and reset. There is no ambient music scheduler, music toggle, spatial note interaction, or positional remix. Flower motifs are original and remain compatible for all 20 trios. Voice limit is 16, with release envelopes, source fades, gentle compression, and a conservative master level.

`choreography.js` owns renderer-independent positions/depth and phrase markers. Screen 3 applies those to the existing fairy renderer without modifying its design. Both performances advance on the AudioContext clock; suspended audio holds their timeline. Missing audio falls back to a bounded animation clock, so the user is not stranded.

`ending.js` draws actual SVG pen strokes. Each fairy follows its assigned strokes and pen-up travel; the first line precedes the restart line. The restart lettering supports pointer and keyboard activation. Restart dissolves the scene, cancels sound, disposes characters/listeners, and constructs a fresh initial scene. It reuses the context and decoded buffers.

Approved background, flower artwork, stone coordinates, assignment rules, and fairy model files are unchanged. The awakened state is now an automatic performance followed by the lettering restart, as requested, rather than a draggable musical instrument.
