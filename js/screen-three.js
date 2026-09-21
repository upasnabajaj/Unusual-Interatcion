import { AwakeningSession, flowerColours } from "./stones.js";
import { MagicEffects } from "./magic-effects.js";

const BG = "assets/screen-three/six-stone-environment.png";
const centre = (f) => ({ x: f.x + 86, y: f.y + 139 });
const ease = (p) => p * p * (3 - 2 * p);
export async function showScreenThree(previous, selected) {
  const session = new AwakeningSession([...selected]),
    stones = session.stones;
  const scene = document.createElement("main");
  scene.id = "screen-three";
  scene.dataset.state = "exploring";
  scene.setAttribute("aria-label", "Explore the dark ruins with the fairy");
  scene.inert = true;
  scene.innerHTML = `<div class="exploration-world">
    <img class="exploration-background dormant-room" src="${BG}" alt="" draggable="false">
    <img class="exploration-background torch-room" src="${BG}" alt="" draggable="false">
    <div class="stone-lights"></div><div class="exploration-stones"></div><div class="exploration-fairies"></div>
    <div class="birth-orb" aria-hidden="true"></div>
    <div class="exploration-dialogue"><img src="assets/screen-three/dialogue.svg" alt=""><p>Stay close.<br>I’ll light the way.</p></div>
  </div><canvas class="magic-canvas" aria-hidden="true"></canvas>`;
  document.body.append(scene);
  const world = scene.querySelector(".exploration-world"),
    bubble = scene.querySelector(".exploration-dialogue"),
    orb = scene.querySelector(".birth-orb");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const effects = new MagicEffects(
    scene.querySelector(".magic-canvas"),
    reduced,
  );
  const fairies = [];
  let active,
    scale = 1,
    drag = null,
    lastTime = 0,
    hold = 0,
    holdStone = -1,
    bubbleGone = false,
    finalEnergy = 0,
    emission = 0;
  const sync = () => {
    scene.dataset.state = session.phase;
  };
  const animate = (ms, update) =>
    new Promise((resolve) => {
      let start;
      const duration = reduced ? Math.min(ms, 900) : ms;
      function tick(t) {
        start ??= t;
        const p = Math.min(1, (t - start) / duration);
        update(p);
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
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
  function createFairy(x, y, materialising = false) {
    const el = document.createElement("div"),
      id = fairies.length;
    el.className = "explorer";
    el.setAttribute("role", "button");
    el.tabIndex = materialising ? -1 : 0;
    el.setAttribute(
      "aria-label",
      "Drag the fairy to carry her light; arrow keys move her",
    );
    el.innerHTML = `<div class="fairy-pose"><div class="explorer-scale"><div class="fairy-art" aria-hidden="true"><img class="fairy-layer fairy-body" src="assets/fairy.png" alt="" draggable="false"><img class="fairy-layer fairy-wing" src="assets/fairy.png" alt="" draggable="false"></div></div></div><svg class="tint-definitions" aria-hidden="true"><filter id="fairy-tint-${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>`;
    scene.querySelector(".exploration-fairies").append(el);
    const f = {
      el,
      x,
      y,
      target: { x, y },
      colour: "#f5f5ff",
      id,
      resting: false,
    };
    fairies.push(f);
    el.querySelector(".explorer-scale").style.filter = `url(#fairy-tint-${id})`;
    if (materialising) {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
    }
    el.addEventListener("pointerdown", (event) => {
      if (
        f !== active ||
        session.phase !== "exploring" ||
        !event.isPrimary ||
        event.button > 0
      )
        return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: f.x,
        startY: f.y,
      };
      el.setPointerCapture(event.pointerId);
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", (event) => {
      if (
        f !== active ||
        !drag ||
        drag.id !== event.pointerId ||
        session.phase !== "exploring"
      )
        return;
      const dx = (event.clientX - drag.x) / scale,
        dy = (event.clientY - drag.y) / scale;
      if (Math.hypot(dx, dy) > 3) hideDialogue();
      f.target.x = Math.max(0, Math.min(1301, drag.startX + dx));
      f.target.y = Math.max(0, Math.min(568, drag.startY + dy));
    });
    const release = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      el.classList.remove("dragging");
      if (el.hasPointerCapture(event.pointerId))
        el.releasePointerCapture(event.pointerId);
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("keydown", (event) => {
      if (f !== active || session.phase !== "exploring") return;
      const delta = {
        ArrowLeft: [-32, 0],
        ArrowRight: [32, 0],
        ArrowUp: [0, -32],
        ArrowDown: [0, 32],
      }[event.key];
      if (delta) {
        event.preventDefault();
        hideDialogue();
        f.target.x = Math.max(0, Math.min(1301, f.target.x + delta[0]));
        f.target.y = Math.max(0, Math.min(568, f.target.y + delta[1]));
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const p = centre(f);
        const index = stones.findIndex(
          (s) => !s.awakened && Math.hypot(s.x - p.x, s.y - p.y) < 90,
        );
        if (index >= 0) activate(index);
      }
    });
    return f;
  }
  active = createFairy(155, 77);
  const stoneElements = stones.map((stone, index) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "exploration-stone";
    el.disabled = true;
    el.setAttribute(
      "aria-label",
      stone.flower ? "Faint engraving" : `Stone ${stone.number}`,
    );
    const colour = stone.flower ? flowerColours[stone.flower] : "#efe9d9";
    stone.colour = colour;
    el.style.cssText = `left:${stone.x - stone.w / 2}px;top:${stone.y - stone.h / 2}px;width:${stone.w}px;height:${stone.h}px;--stone-angle:${stone.angle}deg;--flower-colour:${colour};--charge:0;`;
    if (stone.flower) {
      const src = `assets/screen-two/${stone.flower.toLowerCase()}.png`;
      el.innerHTML = `<span class="stone-mark"><img class="stone-engraving" src="${src}" alt="" draggable="false"><span class="engraving-energy" style="--engraving:url('${src}')"></span></span>`;
    } else
      el.innerHTML = `<span class="stone-number" aria-hidden="true">${stone.number}</span>`;
    el.addEventListener("click", () => activate(index));
    scene.querySelector(".exploration-stones").append(el);
    const spill = document.createElement("img");
    spill.src = BG;
    spill.alt = "";
    spill.className = "exploration-background stone-spill";
    spill.style.cssText = `--spill-x:${stone.x}px;--spill-y:${stone.y + 30}px;--spill-w:${stone.w * 1.1}px;`;
    scene.querySelector(".stone-lights").append(spill);
    const halo = document.createElement("div");
    halo.className = "stone-ground-light";
    halo.style.cssText = `left:${stone.x - stone.w}px;top:${stone.y - 40}px;width:${stone.w * 2}px;height:180px;--flower-colour:${colour};`;
    scene.querySelector(".stone-lights").append(halo);
    stone.spill = spill;
    stone.halo = halo;
    return el;
  });
  function tint(f, colour, amount) {
    const rgb = colour.match(/[0-9a-f]{2}/gi).map((n) => parseInt(n, 16) / 255);
    const [r, g, b] = rgb.map((v) => 1 + (v - 1) * amount);
    f.el
      .querySelector("feColorMatrix")
      .setAttribute(
        "values",
        `${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 1 0`,
      );
    f.el.style.setProperty("--fairy-colour", colour);
    f.el.style.setProperty("--colour-strength", String(amount));
  }
  function position(f) {
    f.el.style.transform = `translate(${f.x}px,${f.y}px)`;
  }
  async function move(f, x, y, duration = 1800) {
    const sx = f.x,
      sy = f.y;
    await animate(duration, (p) => {
      const t = ease(p);
      f.x = sx + (x - sx) * t;
      f.y = sy + (y - sy) * t;
      position(f);
    });
    f.target = { x: f.x, y: f.y };
  }
  async function activate(index) {
    if (session.phase !== "exploring") return;
    const stone = stones[index];
    if (stone.awakened) return;
    const p = centre(active);
    if (!stone.flower) {
      if (session.awakenNormal(index, p)) {
        stoneElements[index].classList.add("awakened");
        stoneElements[index].setAttribute(
          "aria-label",
          `Awakened stone ${stone.number}`,
        );
        effects.emit(stone.x, stone.y, stone.colour, 7, 0.4);
      }
      return;
    }
    // A nearby stone click carries her onto it; a drag-and-hold does the same.
    if (!session.beginFlower(index, p)) return;
    sync();
    hideDialogue();
    drag = null;
    hold = 0;
    active.el.classList.remove("dragging");
    const f = active;
    await move(f, stone.x - 86, stone.y - 139, 950);
    await animate(3400, (t) => {
      stone.charge = t;
      stoneElements[index].style.setProperty("--charge", String(t));
      if (Math.random() < 0.35 && !reduced)
        effects.emit(
          stone.x + Math.cos(t * 6.283) * stone.w * 0.25,
          stone.y + Math.sin(t * 6.283) * stone.h * 0.25,
          stone.colour,
          1,
          0.2,
        );
    });
    session.completeFlower();
    sync();
    stoneElements[index].classList.add("awakened");
    stoneElements[index].setAttribute(
      "aria-label",
      `Awakened ${stone.flower} engraving`,
    );
    const dest = centre(f);
    await animate(1100, (t) => {
      const x = stone.x + (dest.x - stone.x) * t + Math.sin(t * Math.PI) * 24,
        y = stone.y + (dest.y - 36 - stone.y) * t;
      orb.style.cssText = `opacity:${Math.sin(t * Math.PI)};left:${x}px;top:${y}px;--orb-colour:${stone.colour};`;
      effects.emit(x, y, stone.colour, reduced ? 0 : 2, 0.3);
    });
    orb.style.opacity = "0";
    const pose = f.el.querySelector(".fairy-pose");
    const spin = pose.animate(
      reduced
        ? [{ opacity: 1 }, { opacity: 0.7 }, { opacity: 1 }]
        : [
            { transform: "perspective(900px) rotateY(0deg) translateY(0)" },
            {
              transform: "perspective(900px) rotateY(180deg) translateY(-18px)",
              offset: 0.5,
            },
            { transform: "perspective(900px) rotateY(360deg) translateY(0)" },
          ],
      { duration: reduced ? 650 : 1800, easing: "cubic-bezier(.35,0,.25,1)" },
    );
    await Promise.all([
      spin.finished,
      animate(1800, (t) => tint(f, stone.colour, t)),
    ]);
    f.colour = stone.colour;
    f.resting = true;
    f.el.classList.add("resting");
    f.el.tabIndex = -1;
    f.el.setAttribute("aria-label", `${stone.flower} fairy`);
    session.completeTransformation();
    sync();
    await move(
      f,
      stone.x + stone.w * 0.38 - 69,
      Math.max(15, stone.y - 249),
      1700,
    );
    if (session.phase === "birthing") await birth(f);
    else await finale();
  }
  async function birth(parent) {
    const start = centre(parent),
      tx = Math.max(
        170,
        Math.min(1170, start.x + (start.x > 750 ? -220 : 220)),
      ),
      ty = Math.max(170, start.y - 100);
    orb.style.setProperty("--orb-colour", "#faf7ff");
    await animate(2600, (t) => {
      const p = ease(t),
        x = start.x + (tx - start.x) * p,
        y = start.y + (ty - start.y) * p - Math.sin(t * Math.PI) * 45;
      orb.style.left = `${x}px`;
      orb.style.top = `${y}px`;
      orb.style.opacity = String(Math.min(1, t * 4));
      orb.style.transform = `translate(-50%,-50%) scale(${0.5 + t * 0.8})`;
      if (!reduced) effects.emit(x, y, "#eee6ff", 1, 0.25);
    });
    const next = createFairy(tx - 86, ty - 139, true);
    await animate(1800, (t) => {
      next.el.style.opacity = String(t);
      next.el.querySelector(".fairy-pose").style.transform =
        `scale(${0.2 + 0.8 * ease(t)})`;
      orb.style.opacity = String(1 - t);
      orb.style.transform = `translate(-50%,-50%) scale(${1.3 + t * 4})`;
      position(next);
    });
    orb.style.opacity = "0";
    next.el.style.pointerEvents = "";
    next.el.tabIndex = 0;
    next.el.querySelector(".fairy-pose").style.transform = "";
    active = next;
    session.completeBirth();
    sync();
  }
  function orbit(angle, index) {
    return {
      x: 720 + Math.cos(angle) * 505 - 69 + index * 25,
      y: 470 + Math.sin(angle) * 158 - 139 - index * 19,
    };
  }
  async function finale() {
    effects.colours = fairies.map((f) => f.colour);
    const p = centre(active);
    effects.burst(p.x, p.y, effects.colours);
    await Promise.all(
      fairies.map((f, i) => {
        f.resting = false;
        const point = orbit(-Math.PI / 2, i);
        return move(f, point.x, point.y, 2400);
      }),
    );
    session.startFinale();
    sync();
    for (let round = 0; round < 3; round++) {
      await animate(12500, (t) => {
        finalEnergy = round + t;
        const angle = -Math.PI / 2 + t * Math.PI * 2;
        fairies.forEach((f, i) => {
          const point = orbit(angle, i);
          f.x = point.x;
          f.y = point.y;
          position(f);
        });
        if (round === 2) {
          stones.forEach((s, i) => {
            s.awakened = true;
            stoneElements[i].classList.add("awakened");
          });
          effects.veil = Math.max(0, (t - 0.3) / 0.7);
        }
      });
      session.completeRound();
      scene.dataset.completedRounds = String(session.roundsCompleted);
    }
    effects.veil = 1;
    sync();
    // Future artwork can listen here; the current sequence remains behind the living veil.
    scene.dispatchEvent(
      new CustomEvent("screen-three:veil-ready", {
        detail: { flowers: session.owners.map((o) => o.flower) },
      }),
    );
  }
  function paint() {
    for (const f of fairies) position(f);
    const p = centre(active);
    world.style.setProperty("--torch-x", `${p.x}px`);
    world.style.setProperty("--torch-y", `${p.y}px`);
    stones.forEach((stone, i) => {
      const d = Math.hypot(stone.x - p.x, stone.y - p.y);
      const ambient = stone.awakened ? 0.85 : 0.008;
      stoneElements[i].style.setProperty(
        "--stone-light",
        String(Math.max(ambient, (1 - d / 230) * 0.7)),
      );
      stoneElements[i].disabled =
        session.phase !== "exploring" || d > 190 || stone.awakened;
      const energy = stone.awakened ? 0.6 : stone.charge * 0.5;
      stone.spill.style.opacity = String(
        Math.min(
          1,
          energy + (session.phase === "finale" ? finalEnergy * 0.13 : 0),
        ),
      );
      stone.halo.style.opacity = String(
        Math.min(0.5, energy * 0.4 + finalEnergy * 0.07),
      );
      stoneElements[i].style.setProperty("--final-energy", String(finalEnergy));
    });
  }
  const resize = () => {
    scale = Math.min(scene.clientWidth / 1440, scene.clientHeight / 811);
    effects.canvas.width = scene.clientWidth;
    effects.canvas.height = scene.clientHeight;
    effects.stage = {
      scale,
      x: (scene.clientWidth - 1440 * scale) / 2,
      y: (scene.clientHeight - 811 * scale) / 2,
    };
    world.style.transform = `translate(${(scene.clientWidth - 1440 * scale) / 2}px,${(scene.clientHeight - 811 * scale) / 2}px) scale(${scale})`;
    paint();
  };
  addEventListener("resize", resize);
  resize();
  function frame(time) {
    const dt = Math.min(64, time - (lastTime || time));
    lastTime = time;
    if (session.phase === "exploring") {
      const follow = reduced ? 1 : 1 - Math.exp(-dt / 48);
      active.x += (active.target.x - active.x) * follow;
      active.y += (active.target.y - active.y) * follow;
      const p = centre(active),
        index = stones.findIndex(
          (s) => !s.awakened && Math.hypot(s.x - p.x, s.y - p.y) < 48,
        );
      if (index >= 0) {
        if (holdStone !== index) {
          holdStone = index;
          hold = 0;
        }
        hold += dt;
        if (hold > (stones[index].flower ? 950 : 500)) activate(index);
      } else {
        hold = 0;
        holdStone = -1;
      }
    }
    emission += dt;
    if (session.phase === "finale" && emission > 45) {
      emission = 0;
      fairies.forEach((f) => {
        const p = centre(f);
        effects.emit(
          p.x,
          p.y,
          f.colour,
          reduced ? 1 : 2 + Math.floor(finalEnergy * 3),
          0.4 + finalEnergy * 0.3,
        );
      });
    }
    paint();
    effects.draw(dt / 1000, time / 1000);
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
