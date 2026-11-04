import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";
import test from "node:test";

const context = {};
for (const file of ["characters/fox.js", "characters/dino.js", "sprites.js", "engine.js"])
  new Script(
    await readFile(new URL("../runner-game/" + file, import.meta.url), "utf8"),
  ).runInNewContext(context);
const Runner = context.FelixRunner;

for (const character of Object.values(context.FelixRunnerCharacters)) {
  for (const width of [240, 600]) {
    test(`${character.id} at ${width}px follows every speed milestone with no 250-point grace period`, () => {
      const game = new Runner(width, () => 0.5, character);
      for (const [points, expected] of [
        [0, 1],
        [1, 1.00015],
        [250, 1.0375],
        [2500, 1.375],
        [5000, 1.75],
        [6250, 1.875],
        [7500, 2],
        [8750, 2.125],
        [10000, 2.25],
        [20000, 2.25],
      ]) {
        game.mode = points >= 5000 ? "endless" : "goal";
        game.endlessTime = Runner.warmupDuration;
        game.distance = points * 12;
        assert.ok(Math.abs(game.pace - expected) < 1e-12, points + " points");
        assert.equal(game.simulationPace, game.pace, "no nearby meteor means no slowdown");
      }
    });
  }

  test(`${character.id} warms into its current score curve only during active Endless play`, () => {
    const game = new Runner(320, () => 0.5, character);
    game.distance = Runner.goal * 12;
    game.state = "complete";
    game.startEndless();
    assert.equal(game.pace, 1.5);
    game.tick(0.05);
    assert.equal(game.endlessTime, 0);
    game.finishSequence();
    game.untilObstacle = Infinity;
    for (let frame = 0; frame < 3 * 120; frame++) game.tick(1 / 120);
    const expected =
      1.5 + (Runner.paceAt(game.score) - 1.5) * (game.endlessTime / Runner.warmupDuration);
    assert.ok(Math.abs(game.pace - expected) < 1e-12);
    assert.ok(game.pace > 1.5 && game.pace < Runner.paceAt(game.score));
    game.pause();
    const frozen = [game.score, game.pace, game.endlessTime];
    game.tick(0.05);
    assert.deepEqual([game.score, game.pace, game.endlessTime], frozen);
    game.start();
    for (let frame = 0; frame < 4 * 120; frame++) game.tick(1 / 120);
    assert.equal(game.pace, Runner.paceAt(game.score));
    game.state = "crashed";
    game.start();
    assert.equal(game.pace, 1);
    assert.equal(game.score, 0);
    assert.equal(game.endlessTime, 0);
  });
}

test("only Dino's nearby meteors slow the new high-speed curve to 1.25x", () => {
  for (const character of Object.values(context.FelixRunnerCharacters)) {
    const game = new Runner(320, () => 0.5, character);
    game.mode = "endless";
    game.endlessTime = Runner.warmupDuration;
    game.start();
    const meteor = {
      ...context.FelixRunnerCharacters.dino.meteorObstacle,
      x: Runner.playerX + game.baseSpeed * 0.6,
      y: 20,
    };
    game.obstacles = [meteor];
    for (const points of [5000, 7500, 10000, 20000]) {
      game.distance = points * 12;
      assert.equal(game.simulationPace, character.id === "dino" ? 1.25 : Runner.paceAt(points));
    }
    meteor.kind = "pterosaur";
    assert.equal(game.simulationPace, game.pace);
  }
});
