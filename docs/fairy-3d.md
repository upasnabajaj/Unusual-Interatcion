# 3D fairy character system

`js/fairy3d/model.js` constructs the same original articulated sculpture for every
fairy. The body, head, arms, legs, petal dress and four curved wing surfaces have
real volume. Wings have independent pivots and fine geometry-based veins. Colour
updates affect silk, wing membranes, veins and emissive details independently;
the small pearl core remains neutral. No textures or raster fairy planes are used.

`js/fairy3d/controller.js` owns one shared transparent Three.js WebGL renderer and
one requestAnimationFrame loop. Each character is rendered from its current 3D
pose into its original transparent DOM canvas. Keeping those canvases within the
existing scene layers preserves fades, materialisation, hit targets, particle
occlusion and dialogue placement. Rendering resolution is bounded at 360×628 per
fairy. Hidden completed screens release their models; disconnected hosts also
release geometry/materials. The loop pauses with page visibility. Idle bobbing,
flutter and secondary motion are disabled for reduced-motion preferences.

## Character API

- `setColour(hex, amount)` blends the neutral character into any flower identity.
- `moveTo(x, y, depth)` samples the game's actual path; velocity controls tangent
  facing, lean, banking and wing intensity. Repeated stationary samples do not
  erase velocity. The game continues to own DOM/world position and timing.
- `twirl(milliseconds)` returns `{ finished, cancel }` compatible with the existing
  animation awaits. It rotates the sculpture's yaw through one full turn, never
  the canvas or a flattened DOM plane.
- `setState(name)` accepts idle, hover, fly, turn, twirl, orbit, approach, activate,
  celebrate and dance. Existing flight, hover, activation, twirl and orbit are
  integrated. Dance is a future pose-control state, not implemented choreography.
- `setPose({x,y,depth,yaw,pitch,roll,armLeft,armRight,wingIntensity})` provides local
  offsets/orientation and independent shoulder poses for future authored tracks.
  `clearPose()` restores procedural controls.
- `dispose()` releases per-character resources.

Three.js 0.160.1 is vendored with its MIT license in `js/vendor`, so deployment
needs no package build or runtime CDN. No shadow maps, external 3D assets,
postprocessing pipeline or per-fairy WebGL contexts are required.

## Integration boundaries

`Fairy` still dispatches the same twirl events and uses the same durations.
Screen 3 retains its exact positions, paths, state machine and timings. Its tint
and twirl hooks now call the 3D character. Existing illumination, reflections,
dust, musical control and all stone logic remain unchanged. `fairy-3d.css` only
overrides character rendering styles and obsolete PNG tint/pearl duplication.

## Validation

Automated model checks cover real depth, four curved wings, independent colour
materials and disposal. Desktop browser checks cover front, side, back, a full
spin, horizontal/diagonal/curved flight, all three transformations, the three
rounds and the movable final state. A touch/reduced-motion browser check covers
screen progression and rotation from portrait to landscape. Visual captures
were inspected at desktop scale. Physical iOS/Android device testing is not
available in this environment.
