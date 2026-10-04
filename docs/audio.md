# The room remembers

An original miniature in D-major pentatonic (D, E, F♯, A, B). Six authored four-note identities share a cadence vocabulary. The user's selection order places the three chosen phrases in answering rhythmic slots of a 32-step score, so no trio needs unrelated melodies layered on top of one another.

- `js/audio/score.js`: six identities, note utility and the three evolving arrangements.
- `js/audio/instruments.js`: independently decaying partials, soft attacks, filtered timbres and a quiet resonant air texture. All sources end and disconnect.
- `js/audio/music.js`: one gesture-unlocked AudioContext, master/compressor, short convolution and restrained delay, bounded look-ahead queue, voice stealing, lifecycle management and event-level music functions.

Round notes follow normalized progress from the existing animation callback. No audio callback advances gameplay. Flower revelation and twirls use their existing event boundaries. The final sparkle's last fraction makes room for the awakening resolution; the final room settles into a quiet spaced reprise of the selected identities.

The final room's capture-phase pointer listeners are passive in intent: they do not prevent events or capture pointers. Short taps trigger flower/fairy notes, water glass tones, botanical plucks, low architectural resonances or airy accents. Drag gestures remain movement only. Pointer spam is rate limited to one musical response per 120 ms, with at most 20 tracked voices and short faded tails when stealing.

No audio files, visible controls or external library are required. Audio starts on an existing pointer/key gesture. Hidden pages suspend and discard pending notes; returning pages resume gently without accumulating missed events. Page teardown closes the context; bfcache navigation suspends it.

Validation: `node --test tests/*.mjs` checks all twenty trios, compatible pitch classes, rhythmic ordering, distinct identities and progressive arrangement density, plus existing interaction regressions. Browser checks cover the real journey, nonzero unclipped output, selected identities, three rounds, spatial taps, spam and suspend/resume/cleanup.

## Continuous waltz revision
The original eight-bar 3/4 theme uses six eighth-note slots per bar, with a
returning rising pickup and falling answer. D major, B minor, G and A harmony
supports celesta, piano, harp, low strings and restrained choir. Flower voices
answer the theme rather than becoming independent loops. Interaction pitches
follow the current chord. Background and interaction buses have independent
gains; the small music toggle only fades the background bus. Its clock continues
while muted and resumes in place.

During the three rounds, actual animation progress conducts four bars per round;
this replaces the free-running conductor, while sustained voices carry across
the boundary. No visual timing is modified. The continuing score returns after
the visual awakening cue. The next fairy's flower identity supplies its birth
bloom. Approach cues are throttled; charge steps follow actual engraving progress.

Final fairy positions are smoothed and drive individual stereo/filter buses.
Register shifts are octave choices, never raw frequency sweeps. Environment zones
change orchestration of the same notes. Nearby pairs add warm chord responses;
three-way proximity gradually enriches these responses. Separating reverses it.

Validation includes all 20 trios, score bounds and harmonic mapping, positional
register/timbre changes, full browser journey, music-only muting, output peaks,
visibility and voice cleanup. Browser automation validates audio behavior and
signal levels; it is not a substitute for a subjective listening review.
