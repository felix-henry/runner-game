import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("README images and relative documentation links resolve within the standalone project", async () => {
  const references = [
    ...[...readme.matchAll(/(?:src|srcset|href)="([^"]+)"/g)].map((match) => match[1]),
    ...[...readme.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((match) => match[1]),
  ].filter((path) => !/^(?:https?:|#)/.test(path));
  assert.ok(references.includes("LICENSE.txt"));
  for (const path of references) {
    assert.ok(!path.startsWith("/") && !path.split("/").includes(".."), path);
    await access(new URL("../" + path, import.meta.url));
  }
  for (const anchor of ["lokal-spielen", "spielanleitung"])
    assert.ok(readme.includes('href="#' + anchor + '"'));
  assert.equal((readme.match(/<details>/g) || []).length, 3);
  assert.equal((readme.match(/<\/details>/g) || []).length, 3);
});

test("README previews contain original PNG scenes in responsive light and dark variants", async () => {
  for (const theme of ["light", "dark"])
    for (const character of ["fox", "dino"]) {
      const name = `docs/readme-${character}-${theme}.png`;
      assert.ok(readme.includes(name));
      const bytes = await readFile(new URL("../" + name, import.meta.url));
      assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(bytes.readUInt32BE(16), 720);
      assert.equal(bytes.readUInt32BE(20), 460);
      assert.ok(bytes.length < 100000, "documentation images stay small");
    }
});
