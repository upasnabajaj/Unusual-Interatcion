export function createFairy(index) {
  const el = document.createElement("button");
  el.className = "fairy";
  el.setAttribute(
    "aria-label",
    index
      ? "Drag the fairy to explore"
      : "Fairy. Double-click, double-tap, or press Enter to awaken",
  );
  el.innerHTML = `<svg viewBox="0 0 100 140" aria-hidden="true"><defs><linearGradient id="wing${index}" x2="1" y2="1"><stop stop-color="currentColor" stop-opacity=".75"/><stop offset="1" stop-color="currentColor" stop-opacity=".03"/></linearGradient></defs><g class="figure"><g fill="url(#wing${index})" stroke="currentColor" stroke-width=".45"><g class="wing-left"><path d="M49 58C28 14 -4 7 7 38C12 58 32 65 49 58Z"/><path d="M47 60C19 48 10 73 21 90C34 84 43 72 47 60Z"/><path d="M46 56Q21 27 12 25M43 61Q26 67 23 82" fill="none" opacity=".4"/></g><g class="wing-right"><path d="M51 58C72 14 104 7 93 38C88 58 68 65 51 58Z"/><path d="M53 60C81 48 90 73 79 90C66 84 57 72 53 60Z"/><path d="M54 56Q79 27 88 25M57 61Q74 67 77 82" fill="none" opacity=".4"/></g></g><g fill="currentColor"><path d="M46 42Q38 35 44 28Q49 23 54 29L56 37L51 44Z"/><path d="M47 43Q43 51 45 59L40 82Q52 90 65 82L55 59L52 43Z"/><path d="M45 49Q35 57 28 54L23 49L24 55Q35 65 47 55ZM54 49Q60 58 70 48L75 45L72 51Q63 65 52 55Z"/><path d="M44 83Q44 101 37 113L31 117L39 116Q51 102 51 85ZM53 84Q57 101 64 108L72 108L67 111Q55 105 49 89Z"/></g><path d="M44 30Q39 40 43 48Q36 42 39 32Q41 20 52 25Q60 28 56 38Q54 25 44 30Z" fill="currentColor" opacity=".8"/><path d="M45 59Q38 79 32 87Q52 95 71 87Q59 77 54 59" fill="currentColor" opacity=".18"/></g></svg>`;
  el.addEventListener("animationend", (event) => {
    if (event.animationName === "twirl") el.classList.remove("twirl");
  });
  document.querySelector("#fairies").append(el);
  return { el, x: 720, y: 435, color: "#f2f6ff", index };
}
export function positionFairy(f) {
  f.el.style.left = `${f.x / 14.4}%`;
  f.el.style.top = `${f.y / 9}%`;
  f.el.style.color = f.color;
  f.el.style.filter = `drop-shadow(0 0 10px ${f.color}88)`;
}
export function twirl(f) {
  f.el.classList.remove("twirl");
  void f.el.offsetWidth;
  f.el.classList.add("twirl");
}
