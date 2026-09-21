// Coordinates share a 1440 × 900 stage. Every round has 12 mixed points.
export const rounds = [
  {
    color: "#efb2c7",
    name: "rose",
    home: [400, 650],
    points: [
      [290, 290],
      [570, 240],
      [880, 305],
      [1090, 235],
      [380, 470],
      [720, 400],
      [1010, 490],
      [230, 640],
      [610, 600],
      [890, 670],
      [1190, 630],
      [740, 760],
    ],
    correct: [1, 4, 9],
    kind: 0,
  },
  {
    color: "#a8cfc4",
    name: "lotus",
    home: [720, 690],
    points: [
      [310, 245],
      [655, 290],
      [930, 210],
      [1160, 365],
      [460, 390],
      [810, 450],
      [235, 520],
      [1090, 610],
      [535, 635],
      [760, 715],
      [990, 760],
      [350, 740],
    ],
    correct: [0, 5, 7, 11],
    kind: 1,
  },
  {
    color: "#d1bce9",
    name: "dahlia",
    home: [1040, 650],
    points: [
      [270, 310],
      [510, 220],
      [795, 280],
      [1070, 230],
      [380, 500],
      [650, 425],
      [945, 470],
      [1170, 530],
      [245, 680],
      [570, 690],
      [820, 640],
      [1080, 760],
    ],
    correct: [1, 3, 4, 8, 10],
    kind: 2,
  },
];
export function glyphPoints(kind, cx, cy, scale = 1) {
  const p = [];
  for (let i = 0; i <= 720; i++) {
    const t = (i / 720) * Math.PI * 2;
    let r;
    if (kind === 0) r = 76 + 34 * Math.cos(5 * t);
    else if (kind === 1) r = 105 * Math.cos(3 * t);
    else r = 84 + 26 * Math.cos(8 * t);
    p.push([cx + Math.cos(t) * r * scale, cy + Math.sin(t) * r * 0.62 * scale]);
  }
  return p;
}
export const pathString = (p) =>
  "M" + p.map((v) => v.map((n) => n.toFixed(2)).join(",")).join(" L");
export function discoveryPath(round) {
  const p = [];
  const anchors = round.correct.map((i) => round.points[i]);
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i],
      b = anchors[(i + 1) % anchors.length];
    for (let j = 0; j < 90; j++) {
      const t = j / 90;
      const bend = Math.sin(t * Math.PI) * 65;
      p.push([
        a[0] + (b[0] - a[0]) * t + Math.sin(i * 2) * bend,
        a[1] + (b[1] - a[1]) * t - bend,
      ]);
    }
  }
  p.push(anchors[0]);
  return p;
}
