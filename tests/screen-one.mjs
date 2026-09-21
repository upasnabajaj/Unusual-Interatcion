import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Test the actual Screen 1 input module with deterministic touch/mouse events.
const listeners = new Map();
const keyboard = new Map();
let time = 1000;
let twirls = 0;
let moves = 0;
const figure = {
  contains: (target) => target === figure,
  addEventListener: (type, handler) => keyboard.set(type, handler),
};
const scene = {
  addEventListener: (type, handler) => listeners.set(type, handler),
  setPointerCapture() {},
  hasPointerCapture: () => true,
  releasePointerCapture() {},
};
globalThis.document = { querySelector: () => scene };
Object.defineProperty(globalThis, "performance", {
  value: { now: () => time },
  configurable: true,
});
globalThis.TestFairy = class {
  figure = figure;
  moveTo() {
    moves++;
  }
  twirl() {
    twirls++;
  }
};
const source = (
  await readFile(new URL("../js/main.js", import.meta.url), "utf8")
).replace(
  /import \{ Fairy \} from [^;]+;/,
  "const Fairy = globalThis.TestFairy;",
);
await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const send = (type, options = {}) =>
  listeners.get(type)?.({
    isPrimary: true,
    pointerId: 1,
    pointerType: "touch",
    button: 0,
    clientX: 200,
    clientY: 300,
    target: figure,
    ...options,
  });
const tap = (options = {}) => {
  send("pointerdown", options);
  time += 40;
  send("pointerup", options);
};
tap();
assert.equal(twirls, 0, "One tap does not activate");
time += 90;
tap();
assert.equal(twirls, 1, "Double touch activates");
time += 1000;
tap({ pointerType: "mouse" });
time += 80;
tap({ pointerType: "mouse" });
assert.equal(twirls, 2, "Double mouse click activates");
time += 1000;
tap({ target: scene });
time += 80;
tap({ target: scene });
assert.equal(twirls, 2, "Background taps do not activate");
time += 1000;
send("pointerdown");
send("pointermove", { clientX: 400 });
send("pointerup", { clientX: 400 });
assert.equal(twirls, 2, "Dragging does not activate");
assert.equal(moves, 0, "Dragging cannot move the fairy");
send("pointerdown");
send("pointercancel");
send("pointerup");
assert.equal(twirls, 2);
keyboard.get("keydown")({ key: "Enter", preventDefault() {} });
assert.equal(twirls, 3, "Keyboard confirmation works");
assert.ok(!source.includes("location."), "Input does not navigate");
console.log(
  "PASS: touch, mouse, drag, cancellation, keyboard and Screen 1-only input",
);
