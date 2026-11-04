import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));
const code = [
  "runner-game/characters/fox.js",
  "runner-game/characters/dino.js",
  "runner-game/sprites.js",
  "runner-game/engine.js",
  "runner-game/scene.js",
  "runner-game/game.js",
  "runner-game/runner.css",
];
const types = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

export async function createDemoServer() {
  const template = await readFile(new URL("runner-game/markup.html", import.meta.url), "utf8");
  const index = await readFile(new URL("index.html", import.meta.url), "utf8");
  if (index.split("<!-- runner-game -->").length !== 2) throw new Error("Missing unique game slot");
  const html = index.replace("<!-- runner-game -->", template);
  const files = new Map();
  for (const file of ["demo.js", "demo.css", "LICENSE.txt", ...code]) files.set("/" + file, file);
  for (const file of [...code, "LICENSE.txt"]) files.set("/404/" + file, file);
  for (const file of await readdir(new URL("assets/", import.meta.url), { withFileTypes: true })) {
    if (!file.isFile() || ![".png", ".svg"].includes(extname(file.name))) continue;
    const path = "assets/" + file.name;
    files.set("/" + path, path);
    files.set("/404/" + path, path);
  }
  return createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    try {
      const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (["/", "/index.html"].includes(path)) {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(request.method === "HEAD" ? undefined : html);
      } else if (files.has(path)) {
        const file = files.get(path);
        const contents = await readFile(resolve(root, file));
        response.writeHead(200, { "Content-Type": types[extname(file)] });
        response.end(request.method === "HEAD" ? undefined : contents);
      } else if (path === "/favicon.ico") {
        response.writeHead(204);
        response.end();
      } else {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(request.method === "HEAD" ? undefined : "Not found");
      }
    } catch {
      response.writeHead(400);
      response.end();
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const port = Number(process.env.PORT || 8233);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  const server = await createDemoServer();
  server.listen(port, "127.0.0.1", () => console.log(`Fox / Dino Run: http://127.0.0.1:${port}`));
}
