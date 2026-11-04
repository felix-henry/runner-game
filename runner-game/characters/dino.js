// Original Dino artwork, available alongside the fox through the character switch.
(() => {
  const body = [
    ".....................oooooo...",
    "....................ohhhhhoo..",
    "...................ohbbbhhbdo.",
    "...................ohbbhweldo.",
    "...................ohbbbdbebo.",
    "...................obdblllllo.",
    "...................obddloooo..",
    "..................ohbllo......",
    ".............p...ohbbllo......",
    ".........p..sso.ohbbllo.......",
    "........psossodohbbllo........",
    "......oohhhbhhbbtbllo........",
    "o....ohbbtbbtllbbdddo........",
    "oo..ohbbtbbllllbddbbco.......",
    "ohooohtbbtlllllbddcoo.........",
    "ohhbbtbbbdlllllbddo...........",
    ".ohbbtbbtddddddbddo...........",
    "..ohbbtbbbdddddddo............",
    "...ooobdddddbdddo.............",
    "......oodddddbdo..............",
  ];
  const feet = [
    [
      ".........ohbooobdo............",
      ".........ohbo.obdo............",
      "........ohbco..obco...........",
      "........ooco...ooco...........",
    ],
    [
      ".........ohbo.obdo............",
      ".........ohbo..obdco..........",
      ".........ohbco..ooco..........",
      ".........ooco................",
    ],
    [
      ".........ohbooobdo............",
      "..........ohbobdco............",
      "...........ocoooco............",
      "..............................",
    ],
  ];
  const character = {
    id: "dino",
    title: "Dino Run",
    label: "Dino",
    description:
      "Spielfeld mit laufendem Dino, kleinen Landsauriern, Flugsauriern, Felsen und fallenden Meteoren",
    highScoreKey: "felixhenry-dino-highscore",
    maxJumps: 2,
    lowObstacle: { kind: "landDino", width: 42, height: 30, elevation: 30 },
    highObstacle: { kind: "pterosaur", width: 80, height: 88, elevation: 124 },
    meteorObstacle: { kind: "meteor", width: 36, height: 64, fallSpeed: 240 },
    obstaclePattern: ["rock", "low", "rock", "high", "meteor", "low", "high"],
    art: {
      run0: [...body, ...feet[0]],
      run1: [...body, ...feet[1]],
      airborne: [...body, ...feet[2]],
      duck: [
        "..............................",
        ".........p.p.........oooooo...",
        "o.......ssoss.......ohhhhhoo..",
        "oh....oohhhbhhooooohbhwelbddo.",
        "oho.oohbbtbbtbbtbbtbbdbebdddo.",
        "ohhoohbbtbbtllbbbbdbblllllllo.",
        ".ohbtbbtbbtblllllbddddcooooo..",
        "..oobtbdbbbddddddbdddo........",
        "....oodddddbddbddddoo.........",
        ".......ohbdoooobddo...........",
        ".......ohbco..obdco...........",
        ".......ooco...ooco............",
      ],
    },
    palette(dark) {
      return {
        o: "#1e4242",
        b: dark ? "#58b98e" : "#3c9f7b",
        d: "#276b60",
        l: dark ? "#eddfb5" : "#d9d6a4",
        h: dark ? "#a0dbb3" : "#86c79e",
        t: dark ? "#3c9577" : "#2f8269",
        s: "#9aaf83",
        p: "#e4d596",
        w: "#fff9e8",
        e: "#172d2b",
        c: "#f5e4bb",
      };
    },
  };
  (globalThis.FelixRunnerCharacters ??= {}).dino = character;
  globalThis.FelixRunnerCharacter ??= character;
})();
