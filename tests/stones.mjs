import assert from "node:assert/strict";
import { createStones, discoverStone, AwakeningSession } from "../js/stones.js";
const flowers = ["Lotus", "Rose", "Jasmine", "Daisy", "Tulip", "Lily"];
for (let a = 0; a < 6; a++)
  for (let b = a + 1; b < 6; b++)
    for (let c = b + 1; c < 6; c++) {
      const selected = [flowers[a], flowers[b], flowers[c]],
        stones = createStones(selected);
      assert.equal(stones.length, 6);
      assert.equal(stones.filter((s) => !s.flower).length, 3);
      assert.deepEqual(
        stones
          .filter((s) => s.flower)
          .map((s) => s.flower)
          .sort(),
        selected.sort(),
      );
      assert.ok(stones.every((s) => !s.discovered));
      for (const stone of stones) {
        assert.equal(discoverStone(stone, { x: -1000, y: -1000 }), false);
        assert.equal(stone.discovered, false);
        assert.equal(discoverStone(stone, { x: stone.x, y: stone.y }), true);
        assert.equal(stone.discovered, true);
      }
    }
assert.throws(() => createStones(["Rose", "Rose", "Lily"]));
console.log(
  "PASS: all 20 three-flower combinations, six dormant stones, three empty, light-gated discovery",
);

for (let trial = 0; trial < 40; trial++) {
  const selectedOrder = [
    ["Lotus", "Rose", "Lily"],
    ["Rose", "Lily", "Lotus"],
    ["Lily", "Lotus", "Rose"],
  ][trial % 3];
  const session = new AwakeningSession(selectedOrder);
  const mapping = session.stones.map((s) => s.flower);
  assert.equal(session.startFinale(), false);
  for (const [i, s] of session.stones.entries())
    if (!s.flower) {
      assert.equal(session.awakenNormal(i, s), false);
      assert.equal(session.awakenNormal(i, s), false);
    }
  const order = session.selectionOrder.map((name) =>
    session.stones.findIndex((s) => s.flower === name),
  );
  for (const [n, i] of order.entries()) {
    const s = session.stones[i];
    assert.equal(
      session.stones.filter((stone) => session.isTarget(stone)).length,
      1,
    );
    for (const other of order.filter((j) => j !== i))
      assert.equal(session.beginFlower(other, session.stones[other]), false);

    assert.equal(session.beginFlower(i, { x: -1000, y: -1000 }), false);
    assert.equal(session.beginFlower(i, s), true);
    assert.equal(session.beginFlower(i, s), false);
    assert.equal(session.completeTransformation(), false);
    assert.equal(session.completeFlower(), true);
    assert.equal(session.completeFlower(), false);
    assert.equal(session.completeTransformation(), true);
    assert.equal(session.completeTransformation(), false);
    assert.equal(session.stones.filter((s) => session.isTarget(s)).length, 0);
    assert.equal(session.owners[n].flower, s.flower);
    assert.equal(session.owners[n].fairy, n);
    assert.equal(session.completeBirth(), n < 2);
  }
  assert.equal(session.startFinale(), true);
  for (const [i, s] of session.stones.entries())
    if (!s.flower) assert.equal(session.awakenNormal(i, s), true);
  for (let n = 0; n < 3; n++) assert.equal(session.completeRound(), true);
  assert.equal(session.completeRound(), false);
  assert.equal(session.completeBirth(), false);
  assert.equal(session.phase, "veiled");
  assert.equal(session.revealWorld(), true);
  assert.equal(session.phase, "awakened");
  assert.equal(session.revealWorld(), false);
  assert.deepEqual(
    session.stones.map((s) => s.flower),
    mapping,
  );
  assert.ok(session.stones.every((s) => s.awakened));
}
console.log(
  "PASS: stable assignment, selection-order ownership, activation locks, three fairies, exactly three rounds, permanent finale stones and interactive awakened state",
);
