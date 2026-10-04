# The room remembers

An original miniature in D-major pentatonic (D, E, F♯, A, B). Six authored four-note identities share a cadence vocabulary. The user's selection order places the three chosen phrases in answering rhythmic slots of a 32-step score, so no trio needs unrelated melodies layered on top of one another.

- `js/audio/score.js`: six identities, note utility and the three evolving arrangements.
- `js/audio/instruments.js`: independently decaying partials, soft attacks, filtered timbres and a quiet resonant air texture. All sources end and disconnect.
- `js/audio/music.js`: one gesture-unlocked AudioContext, master/compressor, short convolution and restrained delay, bounded look-ahead queue, voice stealing, lifecycle management and event-level music functions.

Round notes follow normalized progress from the existing animation callback. No audio callback advances gameplay. Flower revelation and twirls use their existing event boundaries. The final sparkle's last fraction makes room for the awakening resolution; the final room settles into a quiet spaced reprise of the selected identities.

The final room's capture-phase pointer listeners are passive in intent: they do not prevent events or capture pointers. Short taps trigger flower/fairy notes, water glass tones, botanical plucks, low architectural resonances or airy accents. Drag gestures remain movement only. Pointer spam is rate limited to one musical response per 120 ms, with at most 20 tracked voices and short faded tails when stealing.

No audio files, visible controls or external library are required. Audio starts on an existing pointer/key gesture. Hidden pages suspend and discard pending notes; returning pages resume gently without accumulating missed events. Page teardown closes the context; bfcache navigation suspends it.

Validation: `node --test tests/*.mjs` checks all twenty trios, compatible pitch classes, rhythmic ordering, distinct identities and progressive arrangement density, plus existing interaction regressions. Browser checks cover the real journey, nonzero unclipped output, selected identities, three rounds, spatial taps, spam and suspend/resume/cleanup.
