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
      "/404/assets/runner-icons.svg",
      "/404/assets/fox-endless-light.png",
      "/LICENSE.txt",
      "/404/LICENSE.txt",
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
      "/README_DE.md",
      "/assets/icons.svg",
      "/assets/LUCIDE-LICENSE.txt",
    ])
      assert.equal((await fetch(origin + path)).status, 404, path);
    assert.equal((await fetch(origin, { method: "POST" })).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("the original game is MIT-licensed to Felix Henry and includes the attribution condition", async () => {
  const metadata = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(metadata.license, "MIT");
  const license = await readFile(new URL("../LICENSE.txt", import.meta.url), "utf8");
  assert.match(license, /^MIT License\s+Copyright \(c\) \d{4} Felix Henry/);
  assert.ok(
    license.includes("The above copyright notice and this permission notice shall be included"),
  );
  assert.ok(license.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
});

test("game controls use six self-contained original geometric symbols", async () => {
  const icons = await readFile(new URL("../assets/runner-icons.svg", import.meta.url), "utf8");
  const symbols = [...icons.matchAll(/<symbol id="([^"]+)" viewBox="0 0 24 24">/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(symbols, ["play", "pause", "rotate-ccw", "arrow-up", "arrow-down", "x"]);
  assert.doesNotMatch(icons, /<(?:use|image|script)\b|\bhref\s*=/);
  const markup = await readFile(new URL("../runner-game/markup.html", import.meta.url), "utf8");
  const references = [...markup.matchAll(/<use href="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(references.length, 6);
  for (const href of references) {
    const [file, id] = href.split("#");
    assert.equal(file, "/404/assets/runner-icons.svg");
    assert.ok(symbols.includes(id));
  }
  await assert.rejects(readFile(new URL("../assets/LUCIDE-LICENSE.txt", import.meta.url)), {
    code: "ENOENT",
  });
});
