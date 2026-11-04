// Rendering and collisions share the same cached, nearest-neighbor sprite pixels.
globalThis.FelixRunnerSprites = (() => {
  const hedgehog = [
    "........h.h.....",
    "......hhohohh...",
    ".....hbdbsdsoh..",
    "....hbbbsdbbds..",
    "...osbbsdbsdbso.",
    "..owlopdbsdbbsso",
    ".owlewwobdsbdbso",
    "nwlllllldbbdbbdo",
    "nollllllddddbdo.",
  ];
  const birdBody = [
    "......................",
    "......................",
    "......................",
    "......................",
    "......................",
    "......................",
    "...oooo...............",
    "..obhhbo..............",
    ".kobewbo..............",
    "kkobbbbbboooo.........",
    ".kobbbbhhbbbbboo......",
    "...obblhllbbbbbbbo..oo",
    "....oblllllddbbbboobbo",
    ".....oobdddddddddddbo.",
    ".......oooooooooooo...",
    "......................",
  ];
  const wings = [
    [
      ".............o........",
      "............obo.......",
      "...........obhbo......",
      "..........obhhbo......",
      "..........obhbdo......",
      ".........obhhbdo......",
      ".........obhbddo......",
      ".........obbbddo......",
      ".........obbbddo......",
      "..........obbdo.......",
      "..........oddo........",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
    ],
    [
      "......................",
      "......................",
      "......................",
      "......................",
      ".................oo...",
      "..............ooohbo..",
      "............oobhhbdo..",
      "..........oobhhbddo...",
      ".........obhhbdddo....",
      ".........obbbddoo.....",
      "..........oddoo.......",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
    ],
    [
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
      "......................",
      "..........ooo.........",
      ".........obbbbo.......",
      ".........obhbbdo......",
      "..........obhbbdo.....",
      "...........obhbbdo....",
      "............obhbddo...",
      ".............obdddo...",
      "..............oooo....",
    ],
  ];
  const bird = wings.map((wing) =>
    wing.map((row, y) =>
      [...row].map((pixel, x) => (pixel === "." ? birdBody[y][x] : pixel)).join(""),
    ),
  );
  const landDinoBody = [
    "......c.c...............",
    ".....cshsc..............",
    "....chhhhsco............",
    "....ohbbbhhho...........",
    "..c.ohbbbbhhhho.........",
    "..ccohbbhbhhbhhho.......",
    "nccbbwebbbbbbbbhhho.....",
    "nollbbbbbllbbbbbbhhoo...",
    ".oolbblllllbttbbbbbhhoo.",
    "..oolllllllbbttbbbbbbhho",
    "....oodddddbbtbbbboooo..",
    "......oddboobdddbo......",
  ];
  const pterosaurBody = [
    "........................................",
    "...............c........................",
    "...........ohhcco.......................",
    ".........ochhhhbo.......................",
    "......ckklohwebbo.......................",
    "...ckkllllobbbbbbo......................",
    "kkkkkkknnobbbbbbbo......................",
    "........oobbbblbbbo.....................",
    ".......ooooobllllbbbo...................",
    "............obllllbbbbo.............oo..",
    ".............obllldbbbbbboooooooobbo....",
    "..............ooddddbbbbbbbbbbbbbbo.....",
    "................ooddddddbbbbbbbboo......",
    "..................oooobddddbbboo........",
    "....................nnobboooo...........",
    "....................nn.onno.............",
    "....................oo..oo..............",
  ];
  // A tall, connected wing stays visible above the jump arc in every glide pose.
  const wingEdges = [
    [4, 5],
    [4, 6],
    [4, 8],
    [5, 10],
    [5, 12],
    [6, 14],
    [6, 16],
    [7, 17],
    [7, 18],
    [8, 19],
    [8, 20],
    [9, 21],
    [9, 22],
    [10, 23],
    [10, 23],
    [11, 24],
    [11, 24],
    [12, 25],
    [12, 25],
    [13, 26],
    [13, 26],
    [14, 27],
    [14, 27],
    [15, 28],
    [15, 28],
    [16, 29],
    [16, 29],
    [17, 30],
    [17, 30],
    [18, 30],
    [18, 30],
    [19, 29],
    [19, 28],
    [20, 27],
    [20, 26],
    [20, 25],
  ];
  const pterosaur = [0, 1, 2].map((pose) => {
    const rows = Array.from({ length: 44 }, () => Array(40).fill("."));
    wingEdges.forEach(([left, edge], y) => {
      const right = Math.max(left + 1, edge - Math.round(pose * Math.sin((y / 36) * Math.PI) * 3));
      for (let x = left; x <= right; x++) {
        rows[y][x] =
          x === left || x === right
            ? "o"
            : x === left + 1
              ? "h"
              : (x - left + y) % 9 === 0
                ? "d"
                : "r";
      }
    });
    for (let y = 3; y < 34; y++) {
      const left = 37 - Math.floor((y - 3) * 0.58);
      const right = Math.max(left, 38 - Math.floor((y - 3) * 0.32) - pose);
      for (let x = left; x <= right; x++)
        rows[y][x] = x === left || x === right ? "o" : x === right - 1 ? "h" : "r";
    }
    pterosaurBody.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel !== ".") rows[y + 24][x] = pixel;
      });
    });
    return rows.map((row) => row.join(""));
  });
  const art = {
    impactMeteor: [
      "..........ooooooo...........",
      ".......ooohhhhhhhooo........",
      ".....oohhhhmmmmmhhhhoo......",
      "....ohhhhmmmddmmmhhhhoo.....",
      "...ohhhmmmmmddmmrrmmhho.....",
      "..ohhmmmmddmmdmrrdmmmhho....",
      ".ohhmmmdddddmmrrdddmmmhoo...",
      ".ohmmmddddddmrrddddddmmhho..",
      "ohhmmmdddddmmrddddddddmhho..",
      "ohmmmdddmmmmrrdddmmdddmmho..",
      "ohmmddddmmrrrddddmmdddmmhoo.",
      "ohmddddmmrrdddddddmdddddmho.",
      "ommmdddmmrddddddmmdddddmmho.",
      ".ommdddmmrrddddmrrddddmmho..",
      ".ommddddmmrrddmrrdddddmmho..",
      "..omdddddmrrmmrrddddmmmho...",
      "..ommmmdddmmrrrdddmmmmho....",
      "...ommmmdddmrrdddmmmhho.....",
      "....ommmmmmmrrmmmmmhho......",
      ".....oohmmmmrmmmhhhoo.......",
      ".......oohhhhhhhooo.........",
      "..........oooooo............",
    ],
    meteor: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhmmmhho...",
      "..ohhmmrrmmhho..",
      ".ohmmmrdrmmmho..",
      "ohmmmdrrddmmhho.",
      "ohmmdrdddddmmho.",
      "ohmmrrddddddmho.",
      "ohmdrdddddrrmho.",
      ".omrrddddrrdmho.",
      ".omrddddrrddmho.",
      "..omddrrrddmho..",
      "..ommdrddddmho..",
      "...ommmmmddho...",
      "....oommmhoo....",
      "......oooo......",
    ],
    landDino0: [
      ...landDinoBody,
      "......ohdo..obdo........",
      ".....obcco..obcco.......",
      ".....oooo...oooo........",
      "........................",
    ],
    landDino1: [
      ...landDinoBody,
      ".......ohdoobdo.........",
      ".......obccobcco........",
      ".......oooooooo.........",
      "........................",
    ],
    pterosaur0: pterosaur[0],
    pterosaur1: pterosaur[1],
    pterosaur2: pterosaur[2],
    hedgehog0: [...hedgehog, "..oonnooonnnoo..", "...oo.....oo...."],
    hedgehog1: [...hedgehog, "...oonoonnnoo...", "....oo...oo....."],
    birdHigh0: bird[0],
    birdHigh1: bird[1],
    birdHigh2: bird[2],
    rock: [
      ".......oooo.......",
      ".....oohhhho......",
      "....ohhhhmhho.....",
      "...ohhhhmmmhoo....",
      "..ohhhhmmmmdho....",
      "..ohhhmmmdddhoo...",
      ".ohhhmmmddddddho..",
      ".ohhmmmdddddddho..",
      ".ohmmmddddddddhoo.",
      "ohmmmddddddddddho.",
      "ohmmdddddddddddho.",
      "ohmddddddddddddho.",
      "omdddddddddddddho.",
      "omdddddddddddddho.",
      "oooooooooooooooooo",
    ],
    cloud: [
      ".......wwwww............",
      ".....wwwwwwwww..........",
      "..wwwwwwwwwwwwwwwww.....",
      "wwwwwwwwwwwwwwwwwwwww...",
      ".wwwwwwwwwwwwwwwwwwwww..",
      "....wwwwwwwwwwwwwwwww...",
    ],
  };
  const masks = new WeakMap();

  function mask(
    rows,
    width = Math.max(...rows.map((row) => row.length)) * 2,
    height = rows.length * 2,
  ) {
    let sizes = masks.get(rows);
    if (!sizes) masks.set(rows, (sizes = new Map()));
    const key = width + "x" + height;
    if (sizes.has(key)) return sizes.get(key);
    const sourceWidth = Math.max(...rows.map((row) => row.length));
    const pixels = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const row = rows[Math.floor(((y + 0.5) * rows.length) / height)];
      for (let x = 0; x < width; x++) {
        const pixel = row[Math.floor(((x + 0.5) * sourceWidth) / width)];
        if (pixel && pixel !== ".") pixels[y * width + x] = pixel.charCodeAt(0);
      }
    }
    const result = { width, height, pixels };
    sizes.set(key, result);
    return result;
  }

  function frame(rows, x, y, width, height) {
    const pixels = mask(rows, width, height);
    return {
      x: Math.round(x),
      y: Math.round(y),
      width: pixels.width,
      height: pixels.height,
      mask: pixels,
    };
  }

  function obstaclePose(obstacle, elapsed) {
    if (obstacle.kind === "meteor") return "meteor";
    if (obstacle.kind === "landDino") return "landDino" + (Math.floor(elapsed * 6) % 2);
    if (obstacle.kind === "pterosaur")
      return "pterosaur" + [0, 1, 2, 1][Math.floor(elapsed * 7) % 4];
    if (obstacle.kind === "bird") {
      return "birdHigh" + [0, 1, 2, 1][Math.floor(elapsed * 12) % 4];
    }
    if (obstacle.kind === "hedgehog") return "hedgehog" + (Math.floor(elapsed * 6) % 2);
    return "rock";
  }

  function overlaps(a, b) {
    // Rectangles only reject distant sprites; a hit requires two opaque pixels.
    const left = Math.max(a.x, b.x);
    const top = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    if (left >= right || top >= bottom) return false;
    for (let y = top; y < bottom; y++) {
      const ay = (y - a.y) * a.width;
      const by = (y - b.y) * b.width;
      for (let x = left; x < right; x++)
        if (a.mask.pixels[ay + x - a.x] && b.mask.pixels[by + x - b.x]) return true;
    }
    return false;
  }

  return { art, mask, frame, obstaclePose, overlaps };
})();
