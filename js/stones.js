export const flowerColours = {
  Lotus: "#b693f4",
  Rose: "#f4cf6d",
  Jasmine: "#f2a8bc",
  Daisy: "#91bfff",
  Tulip: "#9bd99a",
  Lily: "#f5ad91",
};
export const stonePositions = [
  { x: 465, y: 443, w: 158, h: 66, angle: 8 },
  { x: 714, y: 419, w: 152, h: 68, angle: 0 },
  { x: 990, y: 443, w: 162, h: 70, angle: -10 },
  { x: 371, y: 579, w: 208, h: 84, angle: 2 },
  { x: 714, y: 630, w: 213, h: 90, angle: 0 },
  { x: 1090, y: 576, w: 207, h: 90, angle: -4 },
];
export function createStones(selected, random = Math.random) {
  if (
    selected.length !== 3 ||
    new Set(selected).size !== 3 ||
    selected.some((n) => !flowerColours[n])
  )
    throw new Error("Three distinct selected flowers are required");
  const slots = Array.from({ length: 6 }, (_, i) => i);
  for (let i = 5; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return stonePositions.map((position, i) => ({
    ...position,
    number: i + 1,
    flower: selected[slots.indexOf(i)] ?? null,
    discovered: false,
    awakened: false,
    charge: 0,
  }));
}
export function discoverStone(stone, light) {
  if (Math.hypot(stone.x - light.x, stone.y - light.y) > 190) return false;
  stone.discovered = true;
  return true;
}

/** Session state, independent of animation and DOM. Assignments never change. */
export class AwakeningSession {
  constructor(selected, random = Math.random) {
    this.stones = createStones(selected, random);
    this.selectionOrder = [...selected];
    this.phase = "exploring";
    this.owners = [];
    this.activeFairy = 0;
    this.currentStone = null;
    this.roundsCompleted = 0;
  }
  isTarget(stone) {
    return (
      this.phase === "exploring" &&
      !stone.awakened &&
      stone.flower === this.selectionOrder[this.activeFairy]
    );
  }
  awakenNormal(index, light) {
    const stone = this.stones[index];
    if (
      this.phase !== "finale" ||
      !stone ||
      stone.flower ||
      stone.awakened ||
      !discoverStone(stone, light)
    )
      return false;
    stone.awakened = true;
    return true;
  }
  beginFlower(index, light) {
    const stone = this.stones[index];
    if (
      this.phase !== "exploring" ||
      this.owners.length >= 3 ||
      !stone?.flower ||
      !this.isTarget(stone) ||
      stone.awakened ||
      !discoverStone(stone, light)
    )
      return false;
    this.phase = "charging";
    this.currentStone = index;
    return true;
  }
  completeFlower() {
    if (this.phase !== "charging") return false;
    const stone = this.stones[this.currentStone];
    stone.charge = 1;
    stone.awakened = true;
    this.phase = "transferring";
    return true;
  }
  completeTransformation() {
    if (this.phase !== "transferring") return false;
    this.owners.push({
      fairy: this.activeFairy,
      stone: this.currentStone,
      flower: this.stones[this.currentStone].flower,
    });
    this.phase = this.owners.length === 3 ? "gathering" : "birthing";
    return true;
  }
  completeBirth() {
    if (this.phase !== "birthing" || this.owners.length >= 3) return false;
    this.activeFairy = this.owners.length;
    this.currentStone = null;
    this.phase = "exploring";
    return true;
  }
  startFinale() {
    if (this.phase !== "gathering" || this.owners.length !== 3) return false;
    this.phase = "finale";
    return true;
  }
  revealWorld() {
    if (this.phase !== "veiled") return false;
    this.phase = "awakened";
    return true;
  }
  completeRound() {
    if (this.phase !== "finale" || this.roundsCompleted >= 3) return false;
    this.roundsCompleted++;
    if (this.roundsCompleted === 3) this.phase = "veiled";
    return true;
  }
}
