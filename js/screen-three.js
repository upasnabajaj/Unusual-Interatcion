import { createStones, discoverStone } from "./stones.js";

export async function showScreenThree(previous, selected) {
  const stones = createStones([...selected]);
  const scene = document.createElement("main");
  scene.id = "screen-three";
  scene.dataset.state = "exploring";
  scene.setAttribute("aria-label", "Explore the dark ruins with the fairy");
  scene.inert = true;
  scene.innerHTML = `<div class="exploration-world">
    <img class="exploration-background dormant-room" src="assets/screen-three/dormant-environment.png" alt="" draggable="false">
    <img class="exploration-background torch-room" src="assets/screen-three/dormant-environment.png" alt="" draggable="false">
    <div class="exploration-stones"></div>
    <div class="explorer" role="button" tabindex="0" aria-label="Drag the fairy to carry her light; arrow keys move her">
      <div class="explorer-scale"><div class="fairy-art" aria-hidden="true">
        <img class="fairy-layer fairy-body" src="assets/fairy.png" alt="" draggable="false">
        <img class="fairy-layer fairy-wing" src="assets/fairy.png" alt="" draggable="false">
      </div></div>
    </div>
    <div class="exploration-dialogue"><img src="assets/screen-three/dialogue.svg" alt=""><p>Stay close.<br>I’ll light the way.</p></div>
  </div>`;
  document.body.append(scene);
  const world = scene.querySelector(".exploration-world"),
    figure = scene.querySelector(".explorer"),
    bubble = scene.querySelector(".exploration-dialogue");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const position = { x: 155, y: 77 },
    target = { ...position };
  let scale = 1,
    offset = { x: 0, y: 0 },
    drag = null,
    lastTime = 0,
    bubbleGone = false;
  const hideDialogue = () => {
    if (bubbleGone) return;
    bubbleGone = true;
    bubble
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: reduced ? 80 : 550,
        fill: "forwards",
      })
      .finished.then(() => bubble.remove());
  };
  const light = () => ({ x: position.x + 86, y: position.y + 139 });
  const stoneElements = stones.map((stone) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "exploration-stone";
    button.setAttribute("aria-label", "Dormant stone");
    button.disabled = true;
    button.style.cssText = `left:${stone.x - stone.w / 2}px;top:${stone.y - stone.h / 2}px;width:${stone.w}px;height:${stone.h}px;--stone-angle:${stone.angle}deg;`;
    button.addEventListener("click", () => {
      if (!discoverStone(stone, light())) return;
      button.classList.add("discovered");
      button.setAttribute(
        "aria-label",
        stone.flower ? `${stone.flower} engraving` : "Awakened stone",
      );
      if (stone.flower && !button.firstElementChild) {
        const engraving = document.createElement("img");
        engraving.className = "stone-engraving";
        engraving.src = `assets/screen-two/${stone.flower.toLowerCase()}.png`;
        engraving.alt = "";
        engraving.draggable = false;
        button.append(engraving);
      }
    });
    scene.querySelector(".exploration-stones").append(button);
    return button;
  });
  const paint = () => {
    figure.style.transform = `translate(${position.x}px,${position.y}px)`;
    const p = light();
    world.style.setProperty("--torch-x", `${p.x}px`);
    world.style.setProperty("--torch-y", `${p.y}px`);
    stones.forEach((stone, i) => {
      const distance = Math.hypot(stone.x - p.x, stone.y - p.y);
      stoneElements[i].disabled = distance > 190;
      stoneElements[i].style.setProperty(
        "--stone-light",
        String(Math.max(0.035, 1 - distance / 240)),
      );
    });
  };
  const resize = () => {
    scale = Math.min(scene.clientWidth / 1440, scene.clientHeight / 811);
    offset = {
      x: (scene.clientWidth - 1440 * scale) / 2,
      y: (scene.clientHeight - 811 * scale) / 2,
    };
    world.style.transform = `translate(${offset.x}px,${offset.y}px) scale(${scale})`;
    paint();
  };
  addEventListener("resize", resize);
  resize();
  figure.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button > 0) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: position.x,
      startY: position.y,
    };
    figure.setPointerCapture(event.pointerId);
    figure.classList.add("dragging");
  });
  figure.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = (event.clientX - drag.x) / scale,
      dy = (event.clientY - drag.y) / scale;
    if (Math.hypot(dx, dy) > 3) hideDialogue();
    target.x = Math.max(0, Math.min(1301, drag.startX + dx));
    target.y = Math.max(0, Math.min(568, drag.startY + dy));
  });
  const release = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    drag = null;
    figure.classList.remove("dragging");
    if (figure.hasPointerCapture(event.pointerId))
      figure.releasePointerCapture(event.pointerId);
  };
  figure.addEventListener("pointerup", release);
  figure.addEventListener("pointercancel", release);
  figure.addEventListener("keydown", (event) => {
    const delta = {
      ArrowLeft: [-32, 0],
      ArrowRight: [32, 0],
      ArrowUp: [0, -32],
      ArrowDown: [0, 32],
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    hideDialogue();
    target.x = Math.max(0, Math.min(1301, target.x + delta[0]));
    target.y = Math.max(0, Math.min(568, target.y + delta[1]));
  });
  function frame(time) {
    const dt = Math.min(64, time - (lastTime || time));
    lastTime = time;
    const ease = reduced ? 1 : 1 - Math.exp(-dt / 48);
    position.x += (target.x - position.x) * ease;
    position.y += (target.y - position.y) * ease;
    paint();
    requestAnimationFrame(frame);
  }
  await Promise.all(
    [...scene.querySelectorAll("img")].map((img) => img.decode()),
  );
  previous.inert = true;
  const duration = reduced ? 120 : 1100;
  await Promise.all([
    scene.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      fill: "forwards",
      easing: "ease-in-out",
    }).finished,
    previous.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      fill: "forwards",
      easing: "ease-in-out",
    }).finished,
  ]);
  previous.hidden = true;
  scene.inert = false;
  requestAnimationFrame(frame);
}
