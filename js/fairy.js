/** Screen-independent character behavior. Artwork and dialogue share one position. */
export class Fairy {
  constructor(scene) {
    this.scene = scene;
    this.rig = scene.querySelector("#fairy-position");
    this.figure = scene.querySelector("#fairy-turn");
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.position = { x: 0, y: 0 };
    this.scale = 1;
    this.twirlAnimation = null;
    this.resize = this.resize.bind(this);
    addEventListener("resize", this.resize);
    this.resize();
  }

  resize() {
    const { width, height } = this.scene.getBoundingClientRect();
    this.bounds = { width, height };
    if (width / height < 1) {
      this.scale = Math.min((width - 28) / 541, (height - 48) / 516, 1);
      this.position = {
        x: (width - 541 * this.scale) / 2,
        y: (height - 516 * this.scale) / 2,
      };
    } else {
      this.scale = Math.min(width / 1440, height / 811);
      this.position = {
        x: (width - 1440 * this.scale) / 2 + 450 * this.scale,
        y: (height - 811 * this.scale) / 2 + 148 * this.scale,
      };
    }
    this.paint();
  }

  paint() {
    this.rig.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) scale(${this.scale})`;
    this.scene.style.setProperty(
      "--light-x",
      `${this.position.x + 180 * this.scale}px`,
    );
    this.scene.style.setProperty(
      "--light-y",
      `${this.position.y + 290 * this.scale}px`,
    );
    this.scene.style.setProperty("--light-radius", `${420 * this.scale}px`);
  }

  async twirl() {
    if (this.twirlAnimation) return;
    this.position = { ...this.position };
    this.scene.dataset.state = "twirling";
    const frames = this.motion.matches
      ? [{ opacity: 1 }, { opacity: 0.72 }, { opacity: 1 }]
      : [
          {
            transform:
              "perspective(1000px) rotateY(0deg) rotateZ(0deg) translateY(0)",
          },
          {
            transform:
              "perspective(1000px) rotateY(160deg) rotateZ(-5deg) translateY(-15px)",
            offset: 0.45,
          },
          {
            transform:
              "perspective(1000px) rotateY(360deg) rotateZ(0deg) translateY(0)",
          },
        ];
    this.twirlAnimation = this.figure.animate(frames, {
      duration: this.motion.matches ? 260 : 1350,
      easing: "cubic-bezier(.35,0,.25,1)",
    });
    try {
      await this.twirlAnimation.finished;
    } catch {
      /* An unmounted screen may cancel the pose. */
    }
    this.twirlAnimation = null;
    this.scene.dataset.state = "idle";
    // An extension point only: Screen 1 intentionally has no transition listener.
    this.scene.dispatchEvent(new CustomEvent("fairy:twirl-complete"));
  }

  destroy() {
    removeEventListener("resize", this.resize);
    this.twirlAnimation?.cancel();
  }
}
