import assert from "node:assert/strict";
import { FlowerSelection } from "../js/selection.js";
const choice = new FlowerSelection();
assert.equal(choice.ready, false);
choice.toggle("Lotus");
choice.toggle("Rose");
assert.equal(choice.ready, false);
choice.toggle("Jasmine");
assert.equal(choice.ready, true);
choice.toggle("Daisy");
assert.deepEqual([...choice.selected], ["Lotus", "Rose", "Jasmine"]);
choice.toggle("Rose");
assert.equal(choice.ready, false);
choice.toggle("Daisy");
assert.equal(choice.ready, true);
assert.deepEqual([...choice.selected], ["Lotus", "Jasmine", "Daisy"]);
console.log(
  "PASS: exactly three, fourth rejected, deselection and replacement",
);
