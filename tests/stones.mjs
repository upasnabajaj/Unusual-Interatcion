import assert from "node:assert/strict";
import { createStones, discoverStone } from "../js/stones.js";
const flowers = ["Lotus", "Rose", "Jasmine", "Daisy", "Tulip", "Lily"];
for (let a = 0; a < 6; a++)
  for (let b = a + 1; b < 6; b++)
    for (let c = b + 1; c < 6; c++) {
      const selected = [flowers[a], flowers[b], flowers[c]],
        stones = createStones(selected);
      assert.equal(stones.length, 8);
      assert.equal(stones.filter((s) => !s.flower).length, 5);
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
  "PASS: all 20 three-flower combinations, eight dormant stones, five empty, light-gated discovery",
);
