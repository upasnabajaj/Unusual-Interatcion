import { rounds, glyphPoints, pathString, discoveryPath } from "./patterns.js";
import { createFairy, positionFairy, twirl } from "./fairy.js";
import { environment as env } from "./environment.js";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  ns = "http://www.w3.org/2000/svg",
  speech = document.querySelector("#speech"),
  dots = document.querySelector("#dots"),
  glyphs = document.querySelector("#glyphs");
let phase = "opening",
  round = 0,
  found = new Set(),
  active = createFairy(0),
  drag = null,
  lastTap = 0,
  tapTimer,
  partial,
  route;
const fairies = [active],
  completed = [];
env.fairies = fairies;
const wait = (ms) =>
  new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 220) : ms));
function say(text) {
  speech.textContent = text;
  speech.classList.toggle("visible", !!text);
  document.querySelector("#accessible").textContent = text;
  placeSpeech();
}
function placeSpeech() {
  const x = (active.x / 1440) * innerWidth,
    y = (active.y / 900) * innerHeight;
  speech.style.left =
    Math.max(12, Math.min(innerWidth - speech.offsetWidth - 16, x + 45)) + "px";
  speech.style.top = Math.max(18, y - 100) + "px";
}
function animate(ms, fn) {
  return new Promise((resolve) => {
    let start;
    function tick(t) {
      start ??= t;
      const p = Math.min(1, (t - start) / (reduced ? Math.min(ms, 450) : ms));
      fn(p);
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}
async function move(f, x, y, ms = 1400) {
  const ox = f.x,
    oy = f.y;
  await animate(ms, (p) => {
    const v = p * p * (3 - 2 * p);
    f.x = ox + (x - ox) * v;
    f.y = oy + (y - oy) * v;
    positionFairy(f);
  });
}
function makePath(points, color = "#edf2ef", opacity = 0.7) {
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", pathString(points));
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", color);
  p.setAttribute("stroke-width", "1.25");
  p.setAttribute("opacity", opacity);
  p.style.filter = "drop-shadow(0 0 5px " + color + "55)";
  glyphs.append(p);
  return p;
}
function exposePath(p, amount) {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  p.style.strokeDashoffset = len * (1 - amount);
}
async function follow(f, path, ms) {
  const len = path.getTotalLength();
  await animate(ms, (p) => {
    const pt = path.getPointAtLength(p * len);
    f.x = pt.x;
    f.y = pt.y - 18;
    positionFairy(f);
  });
}
async function begin() {
  if (phase !== "opening") return;
  phase = "intro";
  say("");
  twirl(active);
  await wait(1400);
  await move(active, 640, 430);
  startRound();
}
function startRound() {
  phase = "discover";
  found = new Set();
  route = discoveryPath(rounds[round]);
  partial = makePath(route, "#e4eceb", 0);
  exposePath(partial, 0);
  dots.replaceChildren();
  rounds[round].points.forEach(([x, y], i) => {
    const b = document.createElement("button");
    b.className = "dot";
    b.style.left = x / 14.4 + "%";
    b.style.top = y / 9 + "%";
    b.style.setProperty("--delay", -i * 0.63 + "s");
    b.setAttribute("aria-label", `Explore light ${i + 1}`);
    b.addEventListener("click", () => discover(i));
    dots.append(b);
  });
  say(
    round === 0
      ? "Carry me to the little lights."
      : "Let’s find the hidden light.",
  );
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => say(""), 5500);
}
function discover(i) {
  if (
    phase !== "discover" ||
    found.has(i) ||
    !rounds[round].correct.includes(i)
  )
    return;
  found.add(i);
  dots.children[i].classList.add("found");
  say("");
  const [x, y] = rounds[round].points[i];
  const spark = makePath(
    glyphPoints(rounds[round].kind, x, y, 0.2).slice(0, 220),
    "#e4eceb",
    0.5,
  );
  spark.classList.add("discovery-fragment");
  if (found.size === rounds[round].correct.length) {
    partial.setAttribute("opacity", ".65");
    exposePath(partial, 1);
    awaken();
  }
}
async function awaken() {
  phase = "bloom";
  clearTimeout(tapTimer);
  dots.replaceChildren();
  document.querySelectorAll(".discovery-fragment").forEach((p) => p.remove());
  const config = rounds[round];
  partial.setAttribute("stroke", config.color);
  await animate(1000, (p) => partial.setAttribute("opacity", 0.5 + p * 0.4));
  await follow(active, partial, 5300);
  const flower = makePath(
    glyphPoints(config.kind, ...config.home),
    config.color,
    0,
  );
  await move(active, ...config.home, 1800);
  await animate(1300, (p) => {
    flower.setAttribute("opacity", p * 0.85);
    exposePath(flower, p);
  });
  await follow(active, flower, 2600);
  await move(active, ...config.home, 650);
  twirl(active);
  await wait(700);
  active.color = config.color;
  positionFairy(active);
  env.colors.push(config.color);
  completed.push(flower);
  await animate(1600, (p) => {
    env.level = round + p;
    partial.setAttribute("opacity", 0.9 - p * 0.875);
  });
  active.el.classList.add("resting");
  active.el.setAttribute("aria-label", `Awakened ${config.name} fairy`);
  await move(active, config.home[0], config.home[1] - 63);
  if (round < 2) {
    round++;
    active = createFairy(round);
    active.x = round === 1 ? 180 : 1260;
    active.y = 430;
    fairies.push(active);
    bind(active);
    await move(active, round === 1 ? 520 : 800, 360, 1900);
    startRound();
  } else {
    await wait(1600);
    finalDance();
  }
}
async function finalDance() {
  phase = "dance";
  say("");
  await Promise.all(fairies.map((f, i) => follow(f, completed[i], 6500)));
  await Promise.all(
    fairies.map((f, i) =>
      move(f, rounds[i].home[0], rounds[i].home[1] - 45, 1800),
    ),
  );
  for (let k = 0; k < 3; k++) {
    fairies.forEach(twirl);
    await animate(1500, (p) => {
      if (k === 0) {
        env.pulse = p;
        completed.forEach((e) =>
          e.setAttribute("stroke-width", 1.25 + p * 1.7),
        );
      }
      if (k === 1) env.spread = p;
      if (k === 2) env.beam = p;
    });
    await wait(450);
  }
  phase = "gate";
  await animate(4300, (p) => {
    env.gate = p;
    env.beam = 1 - p;
    env.spread = 1 - p * 0.85;
  });
  phase = "ending";
  document.querySelector("#accessible").textContent =
    "The living gateway opens. The grove is awake.";
}
async function edgeTravel(dx, dy) {
  if (phase !== "discover") return;
  phase = "travel";
  say("");
  const horizontal = Math.abs(dx) > Math.abs(dy),
    sx = Math.sign(dx) || 1,
    sy = Math.sign(dy) || 1;
  const oldX = active.x,
    oldY = active.y;
  await move(
    active,
    horizontal ? (sx > 0 ? 1530 : -90) : oldX,
    horizontal ? oldY : sy > 0 ? 990 : -90,
    550,
  );
  active.x = horizontal ? (sx > 0 ? -70 : 1510) : oldX;
  active.y = horizontal ? oldY : sy > 0 ? -70 : 970;
  positionFairy(active);
  await move(
    active,
    horizontal ? (sx > 0 ? 190 : 1250) : oldX,
    horizontal ? oldY : sy > 0 ? 175 : 735,
    1500,
  );
  phase = "discover";
}
function bind(f) {
  const b = f.el;
  b.addEventListener("dblclick", begin);
  b.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (phase === "opening") begin();
    }
    if (phase === "discover" && e.key.startsWith("Arrow")) {
      e.preventDefault();
      f.x = Math.max(
        60,
        Math.min(1380, f.x + ({ ArrowLeft: -30, ArrowRight: 30 }[e.key] || 0)),
      );
      f.y = Math.max(
        70,
        Math.min(830, f.y + ({ ArrowUp: -30, ArrowDown: 30 }[e.key] || 0)),
      );
      positionFairy(f);
      checkNearby();
    }
  });
  b.addEventListener("pointerdown", (e) => {
    if (f !== active || !["opening", "discover"].includes(phase)) return;
    b.setPointerCapture(e.pointerId);
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      fx: f.x,
      fy: f.y,
      started: performance.now(),
      moved: false,
    };
  });
  b.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId || phase !== "discover") return;
    const dx = ((e.clientX - drag.x) / innerWidth) * 1440,
      dy = ((e.clientY - drag.y) / innerHeight) * 900;
    drag.moved = Math.hypot(dx, dy) > 8;
    f.x = Math.max(-10, Math.min(1450, drag.fx + dx));
    f.y = Math.max(0, Math.min(900, drag.fy + dy));
    positionFairy(f);
    say("");
    checkNearby();
  });
  b.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) {
      const now = performance.now();
      if (now - lastTap < 380) begin();
      lastTap = now;
    } else if (phase === "discover") {
      const dx = f.x - d.fx,
        dy = f.y - d.fy;
      if (
        Math.hypot(dx, dy) > 120 &&
        (f.x < 55 || f.x > 1385 || f.y < 50 || f.y > 850)
      )
        edgeTravel(dx, dy);
    }
  });
  b.addEventListener("pointercancel", () => (drag = null));
}
function checkNearby() {
  rounds[round].points.forEach(([x, y], i) => {
    if (Math.hypot(active.x - x, active.y - y) < 38) discover(i);
  });
}
bind(active);
positionFairy(active);
say("Tap me twice to choose a pattern.");
addEventListener("resize", placeSpeech);
// Read-only diagnostics support journey tests without introducing user-facing controls.
window.grove = {
  get state() {
    return {
      phase,
      round,
      found: found.size,
      dots: dots.children.length,
      awakened: env.colors.length,
      gate: env.gate,
    };
  },
};
