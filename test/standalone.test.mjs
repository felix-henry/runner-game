import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { Script } from "node:vm";
import test from "node:test";
import { createDemoServer } from "../serve.mjs";

const context = {};
for (const file of ["characters/fox.js", "characters/dino.js", "sprites.js", "engine.js"])
  new Script(
    await readFile(new URL("../runner-game/" + file, import.meta.url), "utf8"),
  ).runInNewContext(context);

test("both standalone characters keep the 5000-point goal, distinct records and original pixel masks", () => {
  for (const character of Object.values(context.FelixRunnerCharacters)) {
    const game = new context.FelixRunner(600, () => 0.5, character);
    assert.equal(game.goal, 5000);
    assert.equal(game.state, "ready");
    assert.equal(game.score, 0);
    game.start();
    game.jump();
    game.tick(1 / 60);
    assert.ok(game.player.altitude > 0);
    assert.ok(game.playerBounds.mask.pixels.some(Boolean));
    game.pause();
    const before = game.distance;
    game.tick(0.05);
    assert.equal(game.distance, before);
    assert.equal(character.highScoreKey, `felixhenry-${character.id}-highscore`);
  }
});

test("demo serves only game assets and keeps website pages and Git metadata private", async () => {
  const server = await createDemoServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(origin);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.equal((html.match(/id="dino-game"/g) || []).length, 1);
    assert.ok(html.includes('id="runner-guide"'));
    assert.ok(!html.includes("<!-- runner-game -->"));
    assert.ok(!html.includes("404 / Abseits der Route"));
    for (const path of [
      "/demo.css",
      "/demo.js",
      "/runner-game/runner.css",
      "/runner-game/engine.js",
      "/404/runner-game/game.js",
      "/assets/icons.svg",
      "/404/assets/fox-endless-light.png",
    ])
      assert.equal((await fetch(origin + path)).status, 200, path);
    for (const path of [
      "/404.html",
      "/.git/config",
      "/404/.git/config",
      "/../.git/config",
      "/%5c..%5c.git/config",
      "/package.json",
      "/README.md",
    ])
      assert.equal((await fetch(origin + path)).status, 404, path);
    assert.equal((await fetch(origin, { method: "POST" })).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
