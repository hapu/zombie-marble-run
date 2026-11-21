import assert from "node:assert/strict";
import {
  abilityStateBoostUntil,
  abilityStateShieldUntil,
  abilityStateTarget,
  resetAbilityState,
  updateAbilityTarget,
  useAbility,
} from "../src/combat.js";

const target = {
  team: 0,
  zombie: false,
  fin: false,
  gone: false,
  hp: 3,
  rb: {
    linvel: () => ({ x: 1, y: 0 }),
    setLinvel: () => {},
  },
};
const race = { simT: 5, marbles: [target] };

updateAbilityTarget(race);
useAbility(race, "boost");
useAbility(race, "shield");
useAbility(race, "heal");
assert.equal(target.hp, 5);

target.hp = 3;
race.simT = 0;
resetAbilityState();
assert.equal(abilityStateTarget(), null, "race reset should clear the ability target");
assert.equal(abilityStateBoostUntil(), 0, "race reset should clear the boost timer");
assert.equal(abilityStateShieldUntil(), 0, "race reset should clear the shield timer");

updateAbilityTarget(race);
useAbility(race, "boost");
useAbility(race, "shield");
useAbility(race, "heal");
assert.equal(abilityStateTarget(), target);
assert.equal(abilityStateBoostUntil(), 3, "boost should be ready again for the new race");
assert.equal(abilityStateShieldUntil(), 4.5, "shield should be ready again for the new race");
assert.equal(target.hp, 5, "heal should be ready again for the new race");

resetAbilityState();
console.log("ok    ability state resets between races");
