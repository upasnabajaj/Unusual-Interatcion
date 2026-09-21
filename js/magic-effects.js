/** Bounded canvas particles. No effects are emitted during ordinary exploration. */
export class MagicEffects {
  constructor(canvas, reduced) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    canvas.width = 1440;
    canvas.height = 811;
    this.reduced = reduced;
    this.particles = [];
    this.veil = 0;
    this.pulse = null;
    this.colours = ["#fff8e8"];
  }
  emit(x, y, colour, count = 1, strength = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= 1000) this.particles.shift();
      const angle = Math.random() * Math.PI * 2,
        speed = (8 + Math.random() * 27) * strength;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 9,
        life: 0,
        max: 1.3 + Math.random() * 1.8,
        r: 0.6 + Math.random() * 1.5,
        colour,
      });
    }
  }
  burst(x, y, colours) {
    this.pulse = { x, y, age: 0 };
    for (const colour of colours)
      this.emit(x, y, colour, this.reduced ? 8 : 45, 2.2);
  }
  draw(dt, time) {
    const c = this.ctx;
    const width = this.canvas.width,
      height = this.canvas.height;
    c.clearRect(0, 0, width, height);
    c.save();
    const stage = this.stage || { x: 0, y: 0, scale: 1 };
    c.translate(stage.x, stage.y);
    c.scale(stage.scale, stage.scale);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.max) {
        this.particles.splice(i, 1);
        continue;
      }
      if (!this.reduced) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      c.globalAlpha = Math.sin((Math.PI * p.life) / p.max) * 0.75;
      c.fillStyle = p.colour;
      c.shadowColor = p.colour;
      c.shadowBlur = 7;
      c.beginPath();
      c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c.fill();
    }
    c.shadowBlur = 0;
    c.globalAlpha = 1;
    if (this.pulse) {
      this.pulse.age += dt;
      if (this.pulse.age > 2.5) this.pulse = null;
      else {
        const p = this.pulse;
        c.globalAlpha = (1 - p.age / 2.5) * 0.55;
        c.strokeStyle = "#f8e9f8";
        c.lineWidth = 1.6;
        c.beginPath();
        c.ellipse(p.x, p.y, 20 + p.age * 170, 10 + p.age * 65, 0, 0, 7);
        c.stroke();
        c.globalAlpha = 1;
      }
    }
    c.restore();
    if (this.veil > 0) {
      // The final veil lives above the room. It does not change room brightness.
      const amount = this.veil;
      c.globalAlpha = amount * 0.97;
      c.fillStyle = "#e9e2ef";
      c.fillRect(0, 0, width, height);
      c.globalAlpha = 1;
      const count = Math.floor(150 + amount * 950);
      for (let i = 0; i < count; i++) {
        const x = ((((Math.sin(i * 73.13) * 43758.54) % 1) + 1) % 1) * width;
        const y =
          (((((Math.sin(i * 21.71) * 15937.12) % 1) + 1) % 1) * height -
            time * (this.reduced ? 0 : 4 + (i % 7)) +
            height * 100) %
          height;
        c.globalAlpha = amount * (0.35 + 0.3 * Math.sin(time * 0.65 + i));
        c.fillStyle =
          i % 3 === 0 ? "#fffdf4" : this.colours[i % this.colours.length];
        c.shadowColor = c.fillStyle;
        c.shadowBlur = 8;
        c.beginPath();
        c.arc(x, y, 1.2 + (i % 4), 0, 7);
        c.fill();
      }
      c.shadowBlur = 0;
      c.globalAlpha = 1;
    }
  }
}
