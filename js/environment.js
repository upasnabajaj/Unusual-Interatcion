const canvas = document.querySelector("#world"),
  ctx = canvas.getContext("2d");
let width, height;
let seed = 87;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const motes = Array.from({ length: 100 }, () => ({
  x: rand() * 1440,
  y: rand() * 900,
  r: rand() * 1.4 + 0.4,
  s: rand() + 0.2,
}));
const plants = Array.from({ length: 110 }, () => ({
  x: rand() * 1440,
  y: 730 + rand() * 190,
  h: 20 + rand() * 110,
  r: rand(),
  side: rand() > 0.5 ? 1 : -1,
}));
export const environment = {
  level: 0,
  gate: 0,
  pulse: 0,
  spread: 0,
  beam: 0,
  colors: [],
  fairies: [],
};
function resize() {
  width = innerWidth;
  height = innerHeight;
  const d = Math.min(devicePixelRatio, 2);
  canvas.width = width * d;
  canvas.height = height * d;
  ctx.setTransform((d * width) / 1440, 0, 0, (d * height) / 900, 0, 0);
}
addEventListener("resize", resize);
resize();
function glow(x, y, r, color, alpha) {
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}
function branch(x, y, len, angle, depth, shade) {
  if (depth === 0) return;
  const nx = x + Math.cos(angle) * len,
    ny = y + Math.sin(angle) * len;
  ctx.strokeStyle = shade;
  ctx.lineWidth = depth * 2.1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + Math.cos(angle + 0.15) * len * 0.6,
    y + Math.sin(angle + 0.15) * len * 0.6,
    nx,
    ny,
  );
  ctx.stroke();
  branch(nx, ny, len * 0.73, angle - 0.35, depth - 1, shade);
  branch(nx, ny, len * 0.66, angle + 0.48, depth - 1, shade);
}
function archPath() {
  ctx.beginPath();
  ctx.moveTo(609, 710);
  ctx.bezierCurveTo(594, 562, 601, 379, 720, 315);
  ctx.bezierCurveTo(839, 379, 846, 562, 831, 710);
  ctx.closePath();
}
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function frame(ms) {
  const t = reducedMotion ? 0 : ms * 0.001,
    e = environment,
    L = e.level;
  ctx.fillStyle = "#03070e";
  ctx.fillRect(0, 0, 1440, 900);
  glow(720, 380, 720, "#23374c", 0.16 + L * 0.08);
  glow(710, 790, 580, "#26443e", L * 0.065);
  // Distant woodland and floor share the same geography throughout.
  for (let i = 0; i < 18; i++) {
    const x = i * 91 + Math.sin(i * 5) * 25;
    ctx.fillStyle = `rgba(30,46,53,${0.1 + L * 0.022})`;
    ctx.beginPath();
    ctx.moveTo(x - 18, 790);
    ctx.quadraticCurveTo(x + 15, 390, x - 10, 0);
    ctx.lineTo(x + 12, 0);
    ctx.quadraticCurveTo(x + 34, 420, x + 29, 790);
    ctx.fill();
  }
  ctx.fillStyle = "#050b10";
  ctx.beginPath();
  ctx.moveTo(0, 790);
  ctx.quadraticCurveTo(370, 705, 720, 752);
  ctx.quadraticCurveTo(1130, 710, 1440, 770);
  ctx.lineTo(1440, 900);
  ctx.lineTo(0, 900);
  ctx.fill();
  if (e.gate > 0) {
    ctx.save();
    archPath();
    ctx.clip();
    ctx.globalAlpha = e.gate;
    const sky = ctx.createLinearGradient(0, 330, 0, 740);
    sky.addColorStop(0, "#d9eee1");
    sky.addColorStop(0.45, "#8db9a2");
    sky.addColorStop(1, "#234e48");
    ctx.fillStyle = sky;
    ctx.fillRect(580, 310, 280, 430);
    glow(724, 421, 180, "#fffbd6", 0.9 * e.gate);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "#417d6880" : "#6c998078";
      ctx.beginPath();
      ctx.ellipse(
        600 + i * 28,
        540 + Math.sin(i * 4) * 36,
        53,
        110,
        Math.sin(i),
        0,
        7,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#9ec8ba";
    ctx.beginPath();
    ctx.moveTo(706, 540);
    ctx.bezierCurveTo(795, 600, 660, 627, 748, 730);
    ctx.lineTo(808, 730);
    ctx.bezierCurveTo(695, 628, 821, 609, 712, 540);
    ctx.fill();
    for (let i = 0; i < 75; i++) {
      const x = 600 + (Math.sin(i * 43) + 1) * 120,
        y = 565 + (Math.cos(i * 13) + 1) * 80;
      ctx.fillStyle = ["#f5d9c4", "#ebc5d6", "#e5edce"][i % 3];
      ctx.beginPath();
      ctx.arc(x, y, 1.7 + Math.sin(i), 0, 7);
      ctx.fill();
    }
    ctx.restore();
    glow(721, 610, 400, "#a4d0ad", e.gate * 0.2);
  }
  // The nearly invisible arch is present even before any magic.
  ctx.save();
  ctx.strokeStyle = `rgba(${e.gate > 0 ? "140,177,141" : "42,57,55"},${0.045 + L * 0.06 + e.gate * 0.5})`;
  ctx.lineWidth = 13;
  archPath();
  ctx.stroke();
  for (let k = 0; k < 2; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const a = Math.PI + (i / 100) * Math.PI,
        x = 720 + Math.cos(a) * (114 + Math.sin(i * 0.5) * 6),
        y = 555 + Math.sin(a) * 237;
      if (i === 0) ctx.moveTo(x, 710);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle =
      e.gate > 0 ? "#768e6388" : `rgba(20,32,30,${0.22 + L * 0.18})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
  branch(45, 910, 235, -1.45, 6, "#02060a");
  branch(1410, 930, 265, -1.72, 6, "#02060a");
  branch(-65, 320, 180, -0.35, 4, "#03080d");
  branch(1500, 270, 190, -2.8, 4, "#03080d");
  for (const p of plants) {
    const sway = Math.sin(t * 0.45 + p.x) * 3;
    ctx.strokeStyle = `rgba(70,104,94,${0.055 + L * 0.04 + e.gate * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(
      p.x + p.side * 15,
      p.y - p.h * 0.5,
      p.x + sway,
      p.y - p.h,
    );
    ctx.stroke();
    for (let j = 1; j < 5; j++) {
      const y = p.y - (p.h * j) / 5,
        x = p.x + Math.sin(j) * 6;
      ctx.fillStyle = `rgba(63,99,86,${0.05 + L * 0.045 + e.gate * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(x + p.side * 8, y, 13, 3, p.side * -0.5, 0, 7);
      ctx.fill();
    }
    if (L > 1 && p.r > 0.72) {
      glow(p.x + sway, p.y - p.h, 14, "#b5cbb7", L * 0.035);
      ctx.fillStyle = `rgba(174,192,167,${L * 0.09})`;
      ctx.beginPath();
      ctx.arc(p.x + sway, p.y - p.h, 2, 0, 7);
      ctx.fill();
    }
  }
  for (let i = 0; i < 3; i++) {
    const x = [400, 720, 1040][i],
      y = [650, 690, 650][i];
    ctx.fillStyle = "#10191c";
    ctx.globalAlpha = 0.28 + L * 0.09;
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 74, 16, 0, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (e.colors[i]) glow(x, y, 130, e.colors[i], 0.07 + e.pulse * 0.1);
  }
  for (const m of motes) {
    const x = m.x + Math.sin(t * m.s * 0.3 + m.y) * 18,
      y = m.y - Math.sin(t * 0.3 + m.x) * 13;
    const a = (0.15 + L * 0.12) * (0.5 + 0.5 * Math.sin(t * m.s + m.x));
    ctx.fillStyle = `rgba(204,218,205,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, m.r, 0, 7);
    ctx.fill();
  }
  for (const f of e.fairies) {
    glow(f.x, f.y + 8, 95, f.color, 0.055);
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = (1 - i / 8) * 0.28;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(
        f.x + Math.sin(t * 1.3 + i * 3) * 18,
        f.y + 40 + i * 8 + Math.sin(t + i) * 5,
        1,
        0,
        7,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (e.spread > 0)
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = e.colors[k];
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.moveTo([400, 720, 1040][k], 680);
        ctx.bezierCurveTo(
          720,
          600,
          100 + j * 290,
          850,
          100 + j * 290,
          900 - e.spread * 500,
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  if (e.beam > 0)
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = e.colors[i];
      ctx.globalAlpha = e.beam * 0.65;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo([400, 720, 1040][i], 650);
      ctx.quadraticCurveTo(720, 600, 720, 330);
      ctx.stroke();
      ctx.globalAlpha = 1;
      glow(720, 335, 120, "#f0f6d6", e.beam * 0.3);
    }
  if (e.gate > 0)
    for (let i = 0; i < 28; i++) {
      const a = Math.PI + (i / 27) * Math.PI,
        x = 720 + Math.cos(a) * 117,
        y = 555 + Math.sin(a) * 237;
      ctx.fillStyle = ["#e5ccbd", "#c7d5b2", "#d8bfd2"][i % 3];
      ctx.globalAlpha = e.gate * 0.8;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.ellipse(
          x + Math.cos(j * 1.256) * 4,
          y + Math.sin(j * 1.256) * 4,
          4,
          2,
          j * 1.256,
          0,
          7,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
