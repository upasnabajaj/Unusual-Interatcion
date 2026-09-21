import { Fairy } from "./fairy.js";

const scene = document.querySelector("#screen-one");
const fairy = new Fairy(scene);
let down = null;
let previousTap = null;

scene.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || down)
    fairy.moveTo(event.clientX, event.clientY);
});

scene.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0))
    return;
  // Touch can drag the character; only taps on her activate the response.
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
