import { Fairy } from "./fairy.js";
import { FlowerSelection } from "./selection.js";

const flowers = [
  { name: "Lotus", x: 258, y: 214, w: 194, h: 196, labelX: 323, labelY: 406 },
  {
    name: "Rose",
    x: 479.44,
    y: 215.88,
    w: 188.5,
    h: 192,
    labelX: 546,
    labelY: 408,
  },
  {
    name: "Jasmine",
    x: 709.14,
    y: 217.53,
    w: 188.8,
    h: 188.9,
    labelX: 758,
    labelY: 408,
  },
  {
    name: "Daisy",
    x: 258,
    y: 454.96,
    w: 194,
    h: 186.3,
    labelX: 322,
    labelY: 655,
  },
  {
    name: "Tulip",
    x: 476.38,
    y: 454.72,
    w: 194.5,
    h: 186.8,
    labelX: 547,
    labelY: 655,
  },
  {
    name: "Lily",
    x: 709.61,
    y: 454.72,
    w: 188,
    h: 186.8,
    labelX: 785,
    labelY: 655,
  },
];
// Screen 2 positions the same character inside its Figma-scaled stage.
class SelectionFairy extends Fairy {
  resize() {}
}

export async function showScreenTwo(previous) {
  const scene = document.createElement("main");
  scene.id = "screen-two";
  scene.dataset.state = "idle";
  scene.setAttribute("aria-label", "Choose three flowers");
  scene.innerHTML = `
    <img class="selection-background" src="assets/screen-two/environment.png" alt="" draggable="false">
    <img class="selection-background selection-light" src="assets/screen-two/environment.png" alt="" draggable="false">
    <div class="selection-stage">
      <h1>Choose Any Three Flowers.</h1>
      <div class="flower-options" aria-label="Flowers"></div>
      <div class="selection-dialogue" aria-hidden="true"><img src="assets/screen-three/dialogue.svg" alt=""><p>Tap me twice<br>to move next.</p></div>
      <div class="fairy-position selection-fairy">
        <div class="fairy-turn" role="button" tabindex="0" aria-label="Fairy. Double-tap to twirl" aria-disabled="true">
          <div class="fairy-size"><div class="fairy-mirror"><div class="fairy-art" aria-hidden="true">
            <img class="fairy-layer fairy-body" src="assets/fairy.png" alt="" draggable="false">
            <img class="fairy-layer fairy-wing" src="assets/fairy.png" alt="" draggable="false">
          </div></div></div>
        </div>
      </div>
    </div>`;
  scene.inert = true;
  document.body.append(scene);
  const selection = new FlowerSelection();
  const fairy = new SelectionFairy(scene);
  const options = scene.querySelector(".flower-options");
  let leaving = false;
  scene.addEventListener("fairy:twirl-complete", async () => {
    if (!selection.ready || leaving) return;
    leaving = true;
    scene.inert = true;
    const { showScreenThree } = await import("./screen-three.js?v=awakened-world-1");
    await showScreenThree(scene, [...selection.selected]);
  });
  for (const flower of flowers) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flower-option";
    button.setAttribute("aria-label", flower.name);
    button.setAttribute("aria-pressed", "false");
    button.dataset.flower = flower.name;
    button.style.cssText = `left:${flower.x}px;top:${flower.y}px;width:${flower.w}px;height:${flower.h}px;`;
    button.innerHTML = `<span class="flower-circle" aria-hidden="true"></span><img src="assets/screen-two/${flower.name.toLowerCase()}.png" alt="" draggable="false"><span class="flower-name" style="left:${flower.labelX - flower.x}px;top:${flower.labelY - flower.y}px">${flower.name}</span>`;
    button.addEventListener("click", () => {
      if (fairy.twirlAnimation) return;
      selection.toggle(flower.name);
      for (const option of options.children) {
        const selected = selection.selected.has(option.dataset.flower);
        option.setAttribute("aria-pressed", String(selected));
        option.setAttribute(
          "aria-disabled",
          String(selection.ready && !selected),
        );
      }
      fairy.figure.setAttribute("aria-disabled", String(!selection.ready));
      scene
        .querySelector(".selection-dialogue")
        .setAttribute("aria-hidden", String(!selection.ready));
    });
    options.append(button);
  }
  let down = null,
    lastTap = null;
  fairy.figure.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button > 0) return;
    down = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    };
    fairy.figure.setPointerCapture(event.pointerId);
  });
  fairy.figure.addEventListener("pointerup", (event) => {
    if (!down || event.pointerId !== down.id) return;
    const tap = down;
    down = null;
    if (fairy.figure.hasPointerCapture(event.pointerId))
      fairy.figure.releasePointerCapture(event.pointerId);
    const now = performance.now();
    if (
      !selection.ready ||
      now - tap.time > 500 ||
      Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 16
    ) {
      lastTap = null;
      return;
    }
    if (
      lastTap &&
      now - lastTap.time < 400 &&
      Math.hypot(tap.x - lastTap.x, tap.y - lastTap.y) < 32
    ) {
      lastTap = null;
      fairy.twirl();
    } else lastTap = { ...tap, time: now };
  });
  fairy.figure.addEventListener("pointercancel", () => {
    down = null;
    lastTap = null;
  });
  fairy.figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (selection.ready) fairy.twirl();
    }
  });
  const resize = () => {
    const width = scene.clientWidth,
      height = scene.clientHeight;
    const scale = Math.min(width / 1440, height / 812);
    const x = (width - 1440 * scale) / 2,
      y = (height - 812 * scale) / 2;
    scene.querySelector(".selection-stage").style.transform =
      `translate(${x}px,${y}px) scale(${scale})`;
    scene.style.setProperty("--selection-light-x", `${x + 1060 * scale}px`);
    scene.style.setProperty("--selection-light-y", `${y + 300 * scale}px`);
    scene.style.setProperty("--selection-light-radius", `${340 * scale}px`);
  };
  addEventListener("resize", resize);
  resize();
  await Promise.all(
    [...scene.querySelectorAll("img")].map((img) =>
      img.decode().catch(() => {}),
    ),
  );
  previous.inert = true;
  const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 120
    : 1000;
  await Promise.all([
    scene.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished,
    previous.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished,
  ]);
  previous.hidden = true;
  scene.inert = false;
}
