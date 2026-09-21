const flowerNames = new Set([
  "Lotus",
  "Rose",
  "Jasmine",
  "Daisy",
  "Tulip",
  "Lily",
]);
// World coordinates follow the Screen 3 artwork; no visible numbering or roles.
export const stonePositions = [
  { x: 465, y: 443, w: 158, h: 66, angle: 8 },
  { x: 714, y: 419, w: 152, h: 68, angle: 0 },
  { x: 990, y: 443, w: 162, h: 70, angle: -10 },
  { x: 371, y: 579, w: 208, h: 84, angle: 2 },
  { x: 714, y: 630, w: 213, h: 90, angle: 0 },
  { x: 1090, y: 576, w: 207, h: 90, angle: -4 },
  { x: 233, y: 469, w: 102, h: 43, angle: 6 },
  { x: 1206, y: 443, w: 98, h: 40, angle: -6 },
];
export function createStones(selected, random = Math.random) {
  if (
    selected.length !== 3 ||
    new Set(selected).size !== 3 ||
    selected.some((n) => !flowerNames.has(n))
  )
    throw new Error("Three distinct selected flowers are required");
  const slots = Array.from({ length: 8 }, (_, i) => i);
  for (let i = 7; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return stonePositions.map((position, i) => ({
    ...position,
    flower: selected[slots.indexOf(i)] ?? null,
    discovered: false,
  }));
}
export function discoverStone(stone, light) {
  if (Math.hypot(stone.x - light.x, stone.y - light.y) > 190) return false;
  stone.discovered = true;
  return true;
}
