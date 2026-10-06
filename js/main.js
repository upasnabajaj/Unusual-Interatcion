import { music } from "./audio/music.js";
import { Fairy } from "./fairy.js?v=petal-fairy-20";

const original = document.querySelector("#screen-one").cloneNode(true);
function mountOpening(scene) {
const fairy = new Fairy(scene);
scene.cleanup=()=>fairy.destroy();
let down = null;
let previousTap = null;

scene.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0))
    return;
  // Only taps on the fixed fairy activate the response. Drag gestures are ignored.
  const onFairy = fairy.figure.contains(event.target);
  down = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    time: performance.now(),
    onFairy,
  };
  scene.setPointerCapture(event.pointerId);
});

scene.addEventListener("pointerup", (event) => {
  if (!down || down.id !== event.pointerId) return;
  const tap = down;
  down = null;
  if (scene.hasPointerCapture(event.pointerId))
    scene.releasePointerCapture(event.pointerId);
  const now = performance.now();
  const moved = Math.hypot(event.clientX - tap.x, event.clientY - tap.y);
  if (!tap.onFairy || moved > 16 || now - tap.time > 500) {
    previousTap = null;
    return;
  }
  if (
    previousTap &&
    now - previousTap.time < 400 &&
    Math.hypot(tap.x - previousTap.x, tap.y - previousTap.y) < 32
  ) {
    previousTap = null;
    fairy.twirl();
  } else previousTap = { time: now, x: tap.x, y: tap.y };
});
scene.addEventListener("pointercancel", () => {
  down = null;
  previousTap = null;
});
fairy.figure.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fairy.twirl();
  }
});

// Prepare the next screen while she twirls; reveal it only when she finishes.
scene.addEventListener(
  "fairy:twirl-start",
  async () => {
    const finished = new Promise(resolve => scene.addEventListener("fairy:twirl-complete", resolve, { once: true }));
    const { showScreenTwo } = await import("./screen-two.js?v=petal-fairy-20");
    await showScreenTwo(scene, finished);
  },
  { once: true },
);

}
mountOpening(document.querySelector('#screen-one'));
document.addEventListener('fairy:restart',()=>{
 for(const scene of document.querySelectorAll('main')){scene.cleanup?.();scene.remove();}
 music.reset();const scene=original.cloneNode(true);document.body.append(scene);mountOpening(scene);music.unlock();
});
