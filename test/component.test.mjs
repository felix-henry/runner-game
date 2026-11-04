import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { Script } from "node:vm";

test("the shared template has unique neutral IDs and directly resolvable relative assets", async () => {
  const markup = await readFile(new URL("../runner-game/markup.html", import.meta.url), "utf8");
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(id.startsWith("runner-"), id);
  for (const match of markup.matchAll(/\baria-(?:labelledby|controls)="([^"]+)"/g))
    for (const id of match[1].split(/\s+/)) assert.ok(ids.includes(id), id);
  for (const match of markup.matchAll(/\bclass="([^"]+)"/g))
    assert.doesNotMatch(match[1], /(?:^|\s)dino-/);

  const references = [
    ...markup.matchAll(/\b(?:src|href|data-guide-light|data-guide-dark)="([^"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(references.length > 6);
  for (const reference of references) {
    assert.ok(reference.startsWith("assets/"), reference);
    assert.ok(!reference.split("/").includes(".."), reference);
    await access(new URL("../" + reference.split("#")[0], import.meta.url));
  }
});

test("both characters jump without held-state bookkeeping or obsolete flight metadata", async () => {
  const context = {};
  for (const file of ["characters/fox.js", "characters/dino.js", "sprites.js", "engine.js"])
    new Script(
      await readFile(new URL("../runner-game/" + file, import.meta.url), "utf8"),
    ).runInNewContext(context);
  const Runner = context.FelixRunner;
  for (const character of Object.values(context.FelixRunnerCharacters)) {
    const game = new Runner(600, () => 0.5, character);
    assert.equal(Object.hasOwn(game, "jumpHeld"), false);
    assert.equal(game.holdJump, undefined);
    assert.equal(character.highScoreKey, `felixhenry-${character.id}-highscore`);
    game.start();
    game.untilObstacle = Infinity;
    game.jump();
    assert.ok(game.player.velocity > 0);
    for (let frame = 0; frame < 240; frame++) game.tick(1 / 120);
    assert.equal(game.player.altitude, 0, "one input cannot cause automatic follow-up jumps");
    assert.equal(game.jumpsUsed, 0);
    game.jump();
    assert.ok(game.player.velocity > 0, "a fresh press starts the next jump");
    game.distance = 3000 * 12;
    for (let index = 0; index < 7; index++) game.spawnObstacle();
    assert.ok(game.obstacles.some((obstacle) => obstacle.kind === "rock"));
    assert.ok(
      game.obstacles.some(
        (obstacle) => obstacle.kind === (character.id === "fox" ? "bird" : "pterosaur"),
      ),
    );
    for (const obstacle of game.obstacles) assert.equal(Object.hasOwn(obstacle, "flight"), false);
  }
});
