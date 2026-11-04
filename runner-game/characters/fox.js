// Original fox artwork; the shared runner owns movement, rendering and controls.
(() => {
  const body = [
    "......................o...o.....",
    "......................oo.oo.....",
    "......................opopo.....",
    ".....................ohblbho....",
    ".....................obbbbbho...",
    ".oooo................obbwebbo...",
    "ollwho..............ohbbbbbbho..",
    "olwlbho.............obbbllllbhhn",
    ".olbbbo.....oooooooohbbbllllllnn",
    ".osbbbho..oohhhhhhhhbbbllllloo..",
    "..obbbbhoohhbbbbhhbbbbblllllo...",
    "..osbbbbhhbbbbbbbssbbblllllo....",
    "...ossbbbbbssssssssbbblllo......",
    "....oosssbsddddddddsbblllo......",
    "......ooosddddddddddbbso........",
    ".........osbboooosbbsbo.........",
  ];
  const feet = [
    [
      "..........osso...osso...........",
      ".........osso....osso...........",
      "........onno......onno..........",
      "........oooo......oooo..........",
    ],
    [
      ".........osso.....osso..........",
      "..........osso...osso...........",
      "...........onno.onno............",
      "...........oooo.oooo............",
    ],
    [
      "..........ossoooossso...........",
      "...........onnnonnso............",
      "............ooooooo.............",
      "................................",
    ],
  ];
  const duck = [
    "......................o...o.....",
    "......................opopo.....",
    ".oooo...............oohhhhhho...",
    "ollwho....oooooooooohhbbwebbo...",
    "olwlbho.oohhhhhhhhhhbbbbbbbbhhn.",
    ".osbbbhoohbbsssssssbbbbbllllllnn",
    "..ossbbhhbssdddddddsbbbllllloo..",
    "...oobssssddddddddddbbbllllo....",
    "......ooonnnooooooosssbooo......",
    "........oooo......oooo..........",
  ];
  function bowPose(drop) {
    const rows = Array.from({ length: 20 }, () => Array(32).fill("."));
    body.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (x < 20 && pixel !== ".") rows[y][x] = pixel;
        if (y < 10 && x >= 20 && pixel !== "." && y + drop < 16)
          rows[y + drop][x] = pixel === "l" && (y >= 9 || (y >= 7 && x < 26)) ? "b" : pixel;
      });
    });
    for (let y = 10; y < 16; y++) {
      for (let x = 20; x < 24; x++) {
        const pixel = body[y][x];
        if (rows[y][x] === "." && pixel && pixel !== ".") rows[y][x] = pixel === "l" ? "b" : pixel;
      }
    }
    feet[0].forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel !== ".") rows[16 + y][x] = pixel;
      });
    });
    return rows.map((row) => row.join(""));
  }
  function crawlPose(index) {
    const rows = Array.from({ length: 20 }, () => Array(32).fill("."));
    duck.slice(1, 9).forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel !== ".") rows[11 + y][x] = pixel;
      });
    });
    const paws = [
      [8, 18],
      [9, 19],
      [10, 17],
      [9, 18],
    ][index];
    for (const x of paws) {
      rows[18][x] = "n";
      rows[19][x] = "o";
      rows[19][x + 1] = "o";
      rows[19][x + 2] = "o";
    }
    return rows.map((row) => row.join(""));
  }
  const character = {
    id: "fox",
    title: "Fox Run",
    label: "Fuchs",
    description: "Spielfeld mit laufendem Fuchs, Igeln, Felsen und fliegenden Vögeln",
    highScoreKey: "felixhenry-fox-highscore",
    lowObstacle: { kind: "hedgehog", width: 32, height: 22, elevation: 22 },
    art: {
      run0: [...body, ...feet[0]],
      run1: [...body, ...feet[1]],
      airborne: [...body, ...feet[2]],
      walk0: [...body, ...feet[0]],
      walk1: [
        ...body,
        "..........osso...osso...........",
        "...........osso.osso............",
        "............onnonno.............",
        "............ooooooo.............",
      ],
      walk2: [
        ...body,
        "..........osso...osso...........",
        "..........osso....osso..........",
        ".........onno......onno.........",
        ".........oooo......oooo.........",
      ],
      walk3: [...body, ...feet[1]],
      bow2: bowPose(2),
      bow4: bowPose(4),
      bow6: bowPose(6),
      crawl0: crawlPose(0),
      crawl1: crawlPose(1),
      crawl2: crawlPose(2),
      crawl3: crawlPose(3),
      duck,
    },
    palette(dark) {
      return {
        o: "#382e2b",
        b: dark ? "#f09b55" : "#d87537",
        d: "#9d4b31",
        l: "#fff0d5",
        e: "#241e20",
        h: dark ? "#ffd08d" : "#efa359",
        s: dark ? "#cf753a" : "#bb5c2d",
        p: dark ? "#e2a087" : "#cf8b74",
        w: "#fff9ec",
        n: "#241e20",
      };
    },
  };
  (globalThis.FelixRunnerCharacters ??= {}).fox = character;
  globalThis.FelixRunnerCharacter ??= character;
})();
