// Original pixel artwork, cached as small Canvas sprites; no external game assets.
globalThis.FelixRunnerScene = class {
  static impactAt = 0.62;

  constructor(canvas, character = FelixRunnerCharacter) {
    this.character = character;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    if (!this.context) throw new Error("Canvas unavailable");
    this.art = {
      ...FelixRunnerSprites.art,
      ...character.art,
    };
  }

  makeSprite(mask, palette) {
    const sprite = document.createElement("canvas");
    sprite.width = mask.width;
    sprite.height = mask.height;
    const ctx = sprite.getContext("2d");
    mask.pixels.forEach((pixel, index) => {
      if (!pixel) return;
      ctx.fillStyle = palette[String.fromCharCode(pixel)];
      ctx.fillRect(index % mask.width, Math.floor(index / mask.width), 1, 1);
    });
    return sprite;
  }

  setTheme(dark) {
    this.colors = dark
      ? {
          sky: "#192d35",
          ridge: "#2b454d",
          hills: "#375957",
          cloud: "#3b535c",
          undergrowth: "#49716b",
          moss: "#a0c9a3",
          edge: "#567e70",
          ground: "#29433f",
          soil: "#203534",
          pebble: "#46625b",
          shine: "#6e9381",
          shadow: "#152a2b",
        }
      : {
          sky: "#e8f1f4",
          ridge: "#b8cdd0",
          hills: "#91b0a7",
          cloud: "#ffffff",
          undergrowth: "#789b8a",
          moss: "#648875",
          edge: "#aac5a0",
          ground: "#c9d5bd",
          soil: "#b6c7ac",
          pebble: "#92aa91",
          shine: "#e6ecd8",
          shadow: "#73938a",
        };
    this.ruinColors = dark
      ? {
          sky: "#28252b",
          ridge: "#3c363b",
          hills: "#54474a",
          cloud: "#4e454a",
          undergrowth: "#302c2e",
          moss: "#8a7974",
          edge: "#65534f",
          ground: "#493d3a",
          soil: "#322e2e",
          pebble: "#776963",
          shine: "#aa8f7a",
          shadow: "#211f25",
        }
      : {
          sky: "#bdb4ab",
          ridge: "#998c86",
          hills: "#7e706d",
          cloud: "#a09690",
          undergrowth: "#544b49",
          moss: "#77635a",
          edge: "#988072",
          ground: "#aa9580",
          soil: "#8b776c",
          pebble: "#6b5c55",
          shine: "#c8b5a1",
          shadow: "#574a46",
        };
    this.forestColors = dark
      ? {
          sky: "#1e3534",
          distant: "#2f4b49",
          canopy: "#294e3b",
          leaves: "#3c6345",
          bark: "#655646",
          barkLight: "#8b7859",
          fern: "#6c8b54",
          ground: "#48483a",
          soil: "#32382f",
          moss: "#8fa36b",
          litter: "#b49a65",
        }
      : {
          sky: "#d2ddc7",
          distant: "#9eb7a7",
          canopy: "#72936c",
          leaves: "#557b55",
          bark: "#8a765d",
          barkLight: "#b29a71",
          fern: "#6c925a",
          ground: "#a4a486",
          soil: "#858b72",
          moss: "#6b8550",
          litter: "#c1a36b",
        };
    const player = this.character.palette(dark);
    const hedgehog = {
      o: "#43382e",
      b: "#937647",
      s: dark ? "#dec69d" : "#cfb58a",
      l: "#e8c69a",
      d: "#6f5842",
      e: "#241e20",
      h: dark ? "#f1dfb3" : "#ead3a3",
      w: "#fff3d6",
      p: "#c78e76",
      n: "#25221f",
    };
    const palettes = {
      impactMeteor: { h: "#c6b495", m: "#8a8176", r: "#f2a052", d: "#554d49", o: "#302c30" },
      meteor: { h: "#b9b1a0", m: "#89877d", r: "#e98846", d: "#595755", o: "#353a3c" },
      rock: { o: "#536566", h: "#c0c9bc", m: "#8eaaa0", d: "#718780" },
      birdHigh: {
        o: "#344b57",
        b: dark ? "#a3c0d3" : "#668998",
        l: "#dce9e4",
        d: "#4c6b76",
        w: "#fff4cf",
        h: dark ? "#c3d9e3" : "#98b9c8",
        e: "#14252b",
        k: "#ce9a50",
      },
      cloud: { w: this.colors.cloud },
      hedgehog,
      landDino: {
        o: "#454332",
        b: dark ? "#baa967" : "#9b914b",
        s: "#a28756",
        l: "#e9d5a3",
        d: "#71613e",
        h: "#dccc8b",
        t: "#827444",
        p: "#e6cc8e",
        w: "#fff4d9",
        e: "#252d29",
        n: "#554436",
        c: "#f0e2c1",
      },
      pterosaur: {
        o: "#4d3b3d",
        b: dark ? "#d79a7f" : "#b17b65",
        l: "#efcead",
        d: "#8c5d52",
        r: dark ? "#ba816b" : "#ad715d",
        h: "#e9b18a",
        w: "#fff6dd",
        e: "#292629",
        k: "#ccaa70",
        c: "#d5b67f",
        n: "#795144",
      },
    };
    const sootPalettes = {
      player: {
        ...player,
        o: "#343635",
        b: dark ? "#779584" : "#607c6b",
        d: "#41423d",
        l: "#bcb29d",
        h: dark ? "#b7bbae" : "#a0a99a",
        t: "#595049",
        s: "#777266",
        p: "#c4b59b",
        c: "#d5c7ac",
      },
      landDino: {
        ...palettes.landDino,
        o: "#3e3936",
        b: dark ? "#a69875" : "#8d8160",
        s: "#776f62",
        l: "#c6baa4",
        d: "#48433e",
        h: "#c9bca0",
        t: "#5b5149",
        p: "#bba68a",
        n: "#3e3630",
        c: "#d4c9b2",
      },
      pterosaur: {
        ...palettes.pterosaur,
        o: "#453c3b",
        b: dark ? "#b29a86" : "#987e6c",
        l: "#cfc5b3",
        d: "#4f4542",
        r: dark ? "#95867e" : "#807168",
        h: "#bfb09c",
        k: "#b4a184",
        c: "#b8a78d",
        n: "#51433b",
      },
    };
    this.sprites = Object.fromEntries(
      Object.keys(this.art).map((name) => {
        const family = name.replace(/\d+$/, "");
        return [
          name,
          {
            palette: palettes[family] ?? player,
            sootPalette:
              this.character.id === "dino"
                ? (sootPalettes[family] ??
                  (Object.hasOwn(this.character.art, name) ? sootPalettes.player : undefined))
                : undefined,
            images: new Map(),
          },
        ];
      }),
    );
  }

  resize(width) {
    this.ratio = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(width * this.ratio);
    this.canvas.height = Math.round(FelixRunner.height * this.ratio);
  }

  rect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(Math.round(x), Math.round(y), width, height);
  }

  sprite(name, x, y, width, height) {
    const frame = FelixRunnerSprites.frame(this.art[name], x, y, width, height);
    const sprite = this.sprites[name];
    const sooty = this.sooty && sprite.sootPalette;
    const key = frame.width + "x" + frame.height + (sooty ? ":soot" : "");
    if (!sprite.images.has(key))
      sprite.images.set(
        key,
        this.makeSprite(frame.mask, sooty ? sprite.sootPalette : sprite.palette),
      );
    this.context.drawImage(sprite.images.get(key), frame.x, frame.y);
  }

  color(name, damage) {
    if (damage <= 0) return this.colors[name];
    if (damage >= 1) return this.ruinColors[name];
    const from = parseInt(this.colors[name].slice(1), 16);
    const to = parseInt(this.ruinColors[name].slice(1), 16);
    const channels = [16, 8, 0].map((shift) => {
      const start = (from >> shift) & 255;
      return Math.round(start + (((to >> shift) & 255) - start) * damage);
    });
    return "rgb(" + channels.join(",") + ")";
  }

  impact(game) {
    if (game.character.id !== "dino" || !["ending", "complete"].includes(game.phase)) return null;
    const progress = game.sequenceProgress;
    const fall = Math.max(0, Math.min(1, (progress - 0.03) / (FelixRunnerScene.impactAt - 0.03)));
    const travel = Math.pow(fall, 3.2);
    const size = Math.round(6 + 76 * Math.pow(fall, 2.4));
    const impactX = game.playerBounds.x + game.playerBounds.width * 0.6;
    const startX = Math.min(game.width - 20, Math.max(impactX + 100, game.width * 0.76));
    const height = Math.round(size * 0.82);
    const x = startX + (impactX - startX) * travel;
    const y = 16 + (FelixRunner.ground - height / 2 - 16) * travel;
    const burst = Math.max(0, Math.min(1, (progress - FelixRunnerScene.impactAt) / 0.38));
    const reach = Math.max(impactX, game.width - impactX) + 80;
    const radius = reach * Math.pow(Math.min(1, burst / 0.79), 0.75);
    return { fall, size, height, x, y, startX, impactX, burst, radius };
  }

  damageAt(game, x) {
    if (game.character.id !== "dino") return 0;
    if (game.mode === "endless") return 1;
    const impact = this.impact(game);
    if (!impact || impact.burst <= 0) return 0;
    const amount = Math.max(0, Math.min(1, (impact.radius - Math.abs(x - impact.impactX)) / 60));
    return amount * amount * (3 - 2 * amount);
  }

  ridge(game, speed, heights, layer, baseline) {
    const period = heights.length * 12;
    const offset = (Math.floor((this.sceneryDistance(game) * speed) / 2) * 2) % period;
    for (let x = -period - offset; x < game.width; x += period) {
      heights.forEach((height, index) => {
        const left = x + index * 12;
        const damage = this.damageAt(game, left + 6);
        const collapsed = Math.max(
          2,
          Math.round(height * (1 - damage * 0.6) - (index % 4 === 1 ? damage * 9 : 0)),
        );
        this.rect(left, baseline - collapsed, 12, collapsed + 40, this.color(layer, damage));
      });
    }
  }

  scenery(game) {
    const damage = this.damage(game);
    const c = (this.environment = Object.fromEntries(
      Object.keys(this.colors).map((name) => [name, this.color(name, damage)]),
    ));
    const width = game.width;
    const distance = this.sceneryDistance(game);
    this.rect(0, 0, width, 200, c.sky);
    for (let i = 0; i < 4; i++) {
      const span = width + 150;
      const x = ((((i * 183 + 42 - distance * 0.06) % span) + span) % span) - 50;
      this.cloud(game, x, 26 + (i % 3) * 17);
    }
    this.ridge(
      game,
      0.12,
      [20, 20, 28, 28, 34, 42, 48, 48, 46, 38, 28, 20, 12, 12, 16, 24, 28, 22, 16, 12],
      "ridge",
      124,
    );
    this.ridge(
      game,
      0.24,
      [8, 12, 18, 20, 20, 18, 12, 10, 6, 6, 12, 16, 24, 28, 28, 26, 18, 10, 6, 6, 8, 12],
      "hills",
      146,
    );
    for (let i = 0; i < 9; i++) {
      const span = width + 80;
      const x = ((((i * 83 - distance * 0.42) % span) + span) % span) - 30;
      const height = 8 + (i % 3) * 4;
      const local = this.damageAt(game, x);
      const vegetation = this.color("undergrowth", local);
      if (local > 0.45) {
        this.rect(x, 163 - height, 4, height + 5, c.undergrowth);
        this.rect(x - 5, 158 - height, 6, 3, c.undergrowth);
        this.rect(x + 3, 161 - height, 7, 3, c.undergrowth);
        this.rect(x + 8, 155 - height, 3, 8, c.undergrowth);
        this.rect(x - 2, 163 - height, 3, 2, c.shine);
        continue;
      }
      this.rect(x, 162 - height, 2, height, vegetation);
      for (let leaf = 0; leaf < 3; leaf++) {
        this.rect(x - 6 + leaf, 154 - leaf * 4, 6, 2, vegetation);
        this.rect(x + 2, 152 - leaf * 4, 5 - leaf, 2, vegetation);
      }
    }
    const ground = FelixRunner.ground;
    for (let x = 0; x < width; x += 24) {
      const local = this.damageAt(game, x + 12);
      this.rect(x, ground, 24, 32, this.color("ground", local));
      this.rect(x, ground, 24, 2, this.color("moss", local));
      this.rect(x, ground + 2, 24, 3, this.color("edge", local));
      this.rect(x, ground + 22, 24, 10, this.color("soil", local));
    }
    const offset = (Math.floor(distance / 2) * 2) % 96;
    for (let x = -96 - offset; x < width; x += 96) {
      this.rect(x + 9, ground + 9, 6, 2, c.pebble);
      this.rect(x + 41, ground + 14, 8, 2, c.shine);
      this.rect(x + 66, ground + 7, 4, 2, c.soil);
      this.rect(x + 80, ground + 25, 8, 2, c.pebble);
      this.rect(x + 31, ground + 22, 4, 3, c.ground);
      this.rect(x + 11, ground - 2, 2, 3, c.moss);
      this.rect(x + 13, ground - 4, 2, 4, c.moss);
      if (this.damageAt(game, x + 48) > 0.5) {
        for (let step = 0; step < 5; step++)
          this.rect(x + 51 + step * 3, ground + step * 4, 3, 5, c.shadow);
        this.rect(x + 7, ground + 6, 14, 5, c.shadow);
        this.rect(x + 10, ground + 7, 6, 2, "#d17b4b");
        this.rect(x + 76, ground + 1, 3, 2, "#eeae66");
      }
    }
    this.forest(game);
  }

  forestBlend(game) {
    if (game.character.id !== "fox" || game.mode !== "endless") return 0;
    if (game.phase !== "emerging") return 1;
    const progress = Math.max(0, Math.min(1, (game.sequenceProgress - 0.12) / 0.76));
    return progress * progress * (3 - 2 * progress);
  }

  forest(game) {
    const blend = this.forestBlend(game);
    if (blend <= 0) return;
    const layer = (this.forestLayer ??= document.createElement("canvas"));
    const ratio = this.ratio ?? 1;
    const width = Math.round(game.width * ratio);
    const height = Math.round(FelixRunner.height * ratio);
    if (layer.width !== width || layer.height !== height) {
      layer.width = width;
      layer.height = height;
    }
    const background = layer.getContext("2d");
    if (!background) return;
    background.setTransform(ratio, 0, 0, ratio, 0, 0);
    background.imageSmoothingEnabled = false;
    const context = this.context;
    // Composite the complete forest once so overlapping trees keep the same fade opacity.
    this.context = background;
    try {
      this.drawForest(game);
    } finally {
      this.context = context;
    }
    context.save();
    context.globalAlpha *= blend;
    context.drawImage(layer, 0, 0, game.width, FelixRunner.height);
    context.restore();
  }

  drawForest(game) {
    const c = this.forestColors;
    const ground = FelixRunner.ground;
    const distance = this.sceneryDistance(game);
    this.rect(0, 0, game.width, ground, c.sky);
    this.rect(0, ground - 35, game.width, 35, c.distant);
    for (const [spacing, speed, trunk, color] of [
      [54, 0.1, 5, c.distant],
      [108, 0.25, 9, c.canopy],
      [182, 0.46, 15, c.bark],
    ]) {
      const offset = Math.floor(distance * speed);
      const first = Math.floor(offset / spacing) - 1;
      const last = Math.ceil((offset + game.width) / spacing) + 1;
      for (let index = first; index <= last; index++) {
        const x = index * spacing - offset;
        const lean = ((index % 3) - 1) * 4;
        this.rect(x + lean, 0, trunk, ground - 12, color);
        this.rect(x, ground - 72, trunk + 2, 60, color);
        for (const side of [-1, 1]) {
          for (let branch = 0; branch < 4; branch++)
            this.rect(x + side * branch * 6, 37 + (index % 3) * 12 - branch * 5, trunk, 9, color);
        }
        if (trunk === 15) {
          for (let mark = 0; mark < 6; mark++)
            this.rect(x + 3 + (mark % 2) * 5, 52 + mark * 16, 3, 8, c.barkLight);
          this.rect(x - 6, ground - 17, trunk + 12, 5, c.bark);
        }
        const crown = 14 + (index % 4) * 7;
        this.rect(x - spacing * 0.45, 0, spacing * 0.9, crown, trunk === 5 ? c.distant : c.canopy);
        this.rect(x - spacing * 0.3, crown, spacing * 0.55, 7, trunk === 5 ? c.distant : c.leaves);
      }
    }
    const fernOffset = Math.floor(distance * 0.65);
    for (
      let index = Math.floor(fernOffset / 47) - 1;
      index < (fernOffset + game.width) / 47 + 1;
      index++
    ) {
      const x = index * 47 - fernOffset;
      this.rect(x, ground - 20, 2, 20, c.fern);
      for (let leaf = 0; leaf < 3; leaf++) {
        this.rect(x - 9 + leaf * 2, ground - 8 - leaf * 5, 8 - leaf, 2, c.fern);
        this.rect(x + 2, ground - 10 - leaf * 4, 8 - leaf * 2, 2, c.leaves);
      }
    }
    this.rect(0, ground, game.width, 32, c.ground);
    this.rect(0, ground, game.width, 3, c.moss);
    this.rect(0, ground + 23, game.width, 9, c.soil);
    const offset = Math.floor(distance) % 86;
    for (let x = -86 - offset; x < game.width; x += 86) {
      this.rect(x + 8, ground + 10, 6, 2, c.soil);
      this.rect(x + 24, ground + 6, 4, 2, c.litter);
      this.rect(x + 52, ground + 16, 7, 2, c.litter);
      this.rect(x + 67, ground + 25, 9, 3, c.ground);
      this.rect(x + 34, ground - 2, 5, 3, c.moss);
    }
  }

  damage(game) {
    if (game.character.id !== "dino") return 0;
    if (game.mode === "endless") return 1;
    if (["ending", "complete"].includes(game.phase))
      return Math.max(0, Math.min(1, (game.sequenceProgress - FelixRunnerScene.impactAt) / 0.3));
    return 0;
  }

  cloud(game, x, y) {
    const ctx = this.context;
    const damage = this.damageAt(game, x + 24);
    const impact = this.impact(game);
    if (damage > 0) {
      const push = (Math.sign(x + 24 - (impact?.impactX ?? game.width / 2)) || 1) * damage * 35;
      this.smoke(x + push, y - damage * 10, 0.8, this.color("cloud", damage), 3 + damage);
      return;
    }
    let split = 0;
    if (impact) {
      const depth = (y + 6 - 16) / (FelixRunner.ground - 50);
      const crossing = Math.pow(Math.max(0, depth), 1 / 3.2);
      const pathX = impact.startX + (impact.impactX - impact.startX) * depth;
      split =
        Math.max(0, Math.min(1, (impact.fall - crossing + 0.09) / 0.2)) *
        Math.max(0, 1 - Math.abs(x + 24 - pathX) / 100);
    }
    if (split <= 0) {
      this.sprite("cloud", x, y);
      return;
    }
    const separation = split * 48;
    for (const side of [-1, 1]) {
      const left = x + side * separation;
      ctx.save();
      ctx.globalAlpha = 1 - split * 0.35;
      ctx.beginPath();
      ctx.rect(left + (side < 0 ? 0 : 24), y - 15, 24, 48);
      ctx.clip();
      this.sprite("cloud", left, y - split * 6);
      ctx.restore();
    }
  }

  smoke(x, y, scale, color, stretch = 1) {
    [12, 22, 30, 32, 28, 24, 18].forEach((width, row) => {
      this.rect(
        x - (width * scale * stretch) / 2,
        y + row * 5 * scale,
        width * scale * stretch,
        6 * scale,
        color,
      );
    });
  }

  meteor(x, y, width, height) {
    const ctx = this.context;
    ctx.save();
    for (let i = 10; i > 0; i--) {
      const along = i / 10;
      const size = Math.max(2, Math.round(width * (0.36 * (1 - along) + 0.04)));
      const cx = x + width * 0.65 + along * width * 0.8;
      const cy = y + height * 0.1 - along * height * 1.2;
      ctx.globalAlpha = 0.9 * (1 - along);
      this.rect(cx - size / 2, cy - size / 2, size, size, "#c27648");
      this.rect(cx - size / 4, cy - size / 2, Math.max(2, size / 2), size, "#f3c379");
    }
    ctx.restore();
    this.sprite("meteor", x, y, width, height);
  }

  incomingMeteor(impact) {
    const ctx = this.context;
    const dx = impact.startX - impact.impactX;
    const dy = 16 - FelixRunner.ground;
    const length = Math.hypot(dx, dy);
    const trail = 12 + 100 * impact.fall * impact.fall;
    ctx.save();
    for (let i = 18; i > 0; i--) {
      const along = i / 18;
      const size = Math.max(1, Math.round(impact.size * (1 - along) * 0.6));
      const x = impact.x + (dx / length) * trail * along;
      const y = impact.y + (dy / length) * trail * along;
      ctx.globalAlpha = (1 - along) * 0.85;
      this.rect(x - size / 2, y - size / 2, size, size, "#a35b40");
      this.rect(
        x - size / 4,
        y - size / 4,
        Math.max(1, size / 2),
        Math.max(1, size / 2),
        "#f5b96b",
      );
    }
    ctx.restore();
    this.sprite(
      "impactMeteor",
      impact.x - impact.size / 2,
      impact.y - impact.height / 2,
      impact.size,
      impact.height,
    );
  }

  impactBlast(impact) {
    const ctx = this.context;
    const ground = FelixRunner.ground;
    const { burst, radius, impactX } = impact;
    const c = this.environment;
    this.crater(impactX);
    this.sprite("impactMeteor", impactX - 25, ground - 26, 50, 34);
    if (burst >= 1) return;
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - burst);
    // A stepped pressure ring travels along the track, with dust at its leading edges.
    const segments = Math.max(32, Math.ceil(radius * 2));
    for (let step = 0; step < segments; step++) {
      const angle = (step / segments) * Math.PI * 2;
      this.rect(
        impactX + Math.cos(angle) * radius,
        ground + 3 + Math.sin(angle) * (6 + radius * 0.12),
        4,
        2,
        "#e9c59a",
      );
    }
    for (const side of [-1, 1]) {
      const x = impactX + side * radius;
      this.smoke(x, ground - 15 - burst * 35, 0.4 + burst * 1.1, c.cloud);
      this.smoke(x - side * 12, ground - 12 - burst * 16, 0.4 + burst * 0.8, c.shine);
    }
    ctx.restore();
    const plume = Math.min(1, burst * 5);
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - burst) * 2.5);
    this.smoke(impactX, ground - 20 - plume * 70, 0.4 + plume * 2, c.hills);
    this.smoke(impactX - 20 * plume, ground - 12 - plume * 46, 0.4 + plume * 1.3, c.cloud);
    this.smoke(impactX + 26 * plume, ground - 12 - plume * 30, 0.3 + plume, c.cloud);
    ctx.restore();
    if (burst < 0.3) {
      ctx.save();
      ctx.globalAlpha = 1 - burst / 0.3;
      this.smoke(impactX, ground - 18 - plume * 30, 0.3 + plume * 1.2, "#e69a54");
      this.smoke(impactX, ground - 10 - plume * 20, 0.2 + plume * 0.7, "#ffe0a0");
      ctx.restore();
    }
    for (let i = 0; i < 28; i++) {
      const dx = (i - 13.5) * burst * 19;
      const dy = -5 - (120 + (i % 5) * 18) * burst + 200 * burst * burst;
      if (ground + dy > ground + 8) continue;
      this.rect(
        impactX + dx,
        ground + dy,
        2 + (i % 4),
        2 + (i % 3),
        i % 5 === 0 ? "#e99958" : c.pebble,
      );
    }
  }

  obstacle(obstacle, elapsed) {
    if (obstacle.kind === "meteor") {
      this.meteor(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      return;
    }
    this.sprite(
      FelixRunnerSprites.obstaclePose(obstacle, elapsed),
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height,
    );
  }

  denLayout(game) {
    const frame = game.playerBounds;
    const tree = Math.round(Math.min(game.width - 76, game.width * 0.67));
    const entrance = tree - 34;
    const exit = tree + 34;
    const start = exit - frame.width;
    const travel = (game.baseSpeed * 1.5 * FelixRunner.emergenceDuration) / 2;
    return { tree, entrance, exit, start, travel, pan: start + travel - frame.x };
  }

  foxExit(game, progress) {
    const layout = this.denLayout(game);
    const eased = progress * progress * (3 - 2 * progress);
    const x = layout.start + (game.playerBounds.x - layout.start) * eased;
    const travel = layout.travel * progress * progress;
    return { x, travel, camera: layout.start + travel - x };
  }

  sceneryDistance(game) {
    if (game.character.id !== "fox" || game.mode !== "endless")
      return game.distance + game.coastDistance;
    const camera =
      game.phase === "emerging"
        ? this.foxExit(game, game.sequenceProgress).camera
        : this.denLayout(game).pan;
    return game.goal * 12 + game.coastDistance + camera + (game.distance - FelixRunner.goal * 12);
  }

  den(x) {
    const ground = FelixRunner.ground;
    const c = this.colors;
    const dark = c.sky === "#192d35";
    const bark = dark ? "#705740" : "#876646";
    const shade = dark ? "#493f33" : "#654c37";
    const light = dark ? "#9e8258" : "#b28e5f";
    const leaf = dark ? "#4a7958" : "#60865c";
    const leafShade = dark ? "#304e40" : "#456748";
    const leafLight = dark ? "#71975d" : "#8ba56b";
    [14, 16, 18, 20, 24, 28, 34].forEach((width, row) => {
      const bend = [-7, -5, -2, 1, 2, 0, -1][row];
      const left = x + bend - width / 2;
      this.rect(left, ground - 105 + row * 14, width, 16, shade);
      this.rect(left + 3, ground - 105 + row * 14, width - 6, 16, bark);
      this.rect(left + 4, ground - 103 + row * 14, 3, 9, light);
    });
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        this.rect(x + side * (10 + i * 6) - 6, ground - 85 - i * 6, 12, 13, bark);
        this.rect(x + side * (12 + i * 6) - 2, ground - 84 - i * 6, 3, 8, light);
      }
    }
    for (const [dx, y, scale] of [
      [-43, 35, 1],
      [-16, 8, 1.1],
      [24, 16, 1.2],
      [48, 42, 0.9],
      [-9, 43, 1.3],
      [24, 57, 0.85],
    ]) {
      [16, 32, 44, 52, 48, 36, 20].forEach((width, row) => {
        const left = x + dx - (width * scale) / 2;
        this.rect(left, y + row * 6 * scale, width * scale, 8 * scale, leafShade);
        if (row > 0 && row < 6)
          this.rect(left + 4 * scale, y + row * 6 * scale, (width - 8) * scale, 8 * scale, leaf);
      });
      this.rect(x + dx - 13 * scale, y + 9 * scale, 12 * scale, 5 * scale, leafLight);
      this.rect(x + dx - 18 * scale, y + 14 * scale, 19 * scale, 5 * scale, leafLight);
      this.rect(x + dx + 7 * scale, y + 25 * scale, 8 * scale, 3 * scale, leafLight);
    }
    for (let i = 0; i < 4; i++) {
      this.rect(x - 7 + (i % 2) * 9, ground - 70 + i * 12, 2, 7, shade);
    }
    [1, 3, 5, 8, 11, 15, 18, 20, 18, 15, 11, 8, 5, 2].forEach((height, index) => {
      const left = x - 56 + index * 8;
      this.rect(left, ground - height, 8, height, dark ? "#65553f" : "#8b7553");
      this.rect(left, ground - height, 8, 3, c.moss);
      if (height > 9) this.rect(left + 2, ground - height + 6, 3, 4, shade);
    });
    for (const side of [-1, 1]) {
      const mouth = x + side * 34;
      [14, 22, 30, 34, 36, 38].forEach((width, row) => {
        this.rect(mouth - width / 2, ground - 22 + row * 4, width, 5, bark);
      });
      this.rect(mouth - 8, ground - 23, 11, 3, c.moss);
      [8, 16, 22, 26, 28].forEach((width, row) => {
        this.rect(mouth - width / 2, ground - 18 + row * 4, width, 5, shade);
      });
      [6, 12, 18, 22].forEach((width, row) => {
        this.rect(mouth - width / 2, ground - 14 + row * 4, width, 5, "#17221b");
      });
      this.rect(mouth - 9, ground - 8, 18, 10, "#101b17");
      for (let root = 0; root < 4; root++) {
        this.rect(x + side * (5 + root * 5) - 4, ground - 28 + root * 7, 8, 10, bark);
        this.rect(x + side * (5 + root * 5) - 2, ground - 26 + root * 7, 2, 6, light);
      }
    }
    this.rect(x - 66, ground - 1, 15, 3, c.moss);
    this.rect(x + 50, ground - 1, 18, 3, c.moss);
  }

  denRims(x) {
    const ctx = this.context;
    const ground = FelixRunner.ground;
    for (const side of [-1, 1]) {
      const mouth = x + side * 34;
      ctx.save();
      ctx.globalAlpha = 0.32;
      this.rect(mouth - 2, ground - 14, 12, 17, "#101b17");
      ctx.restore();
      this.rect(mouth - 16, ground + 1, 32, 3, this.colors.soil);
      this.rect(mouth - 17, ground - 2, 7, 4, this.colors.moss);
      this.rect(mouth + 10, ground - 1, 8, 3, this.colors.moss);
      this.rect(mouth - 9, ground + 2, 4, 2, "#9b825c");
      this.rect(mouth + 15, ground - 1, 3, 2, "#aa8959");
    }
  }

  foxPassage(game) {
    const frame = game.playerBounds;
    const layout = this.denLayout(game);
    const progress = game.sequenceProgress;
    if (game.phase === "emerging") {
      const exit = this.foxExit(game, progress);
      const step = Math.floor(exit.travel / 6) % 4;
      let pose = "walk" + step;
      if (exit.travel < frame.width * 0.85) pose = "crawl" + step;
      else if (exit.travel < frame.width + 8) pose = "bow6";
      else if (exit.travel < frame.width + 22) pose = "bow4";
      else if (exit.travel < frame.width + 36) pose = "bow2";
      if (progress > 0.98) pose = game.playerPose;
      const lift = Math.min(1, exit.travel / (frame.width + 12));
      return { ...exit, pose, depth: 10 * (1 - lift * lift * (3 - 2 * lift)), stance: "exit" };
    }
    const readyX = layout.entrance - frame.width - 4;
    const approachEnd = 0.18 + 0.18 * Math.min(1, Math.max(0, readyX - frame.x) / 250);
    const sniffEnd = approachEnd + 0.18;
    const walk = Math.max(0, Math.min(1, progress / approachEnd));
    let x = frame.x + (readyX - frame.x) * walk * walk * (3 - 2 * walk);
    let pose = "walk" + (Math.floor((x - frame.x) / 9) % 4);
    let stance = "walk";
    let depth = 0;
    if (progress >= approachEnd && progress < sniffEnd) {
      const sniff = (progress - approachEnd) / (sniffEnd - approachEnd);
      pose = "bow" + (2 + Math.min(2, Math.floor(sniff * 3)) * 2);
      stance = "sniff";
    } else if (progress >= sniffEnd) {
      const crawl = Math.min(1, (progress - sniffEnd) / (0.93 - sniffEnd));
      x = readyX + (layout.entrance + 14 - readyX) * crawl;
      pose = crawl < 0.12 ? "bow6" : "crawl" + (Math.floor((x - readyX) / 6) % 4);
      depth = 12 * crawl * crawl * (3 - 2 * crawl);
      stance = "crawl";
    }
    return { x, pose, depth, camera: 0, travel: x - frame.x, stance };
  }

  foxSequence(game) {
    const ctx = this.context;
    const progress = game.sequenceProgress;
    const frame = game.playerBounds;
    const layout = this.denLayout(game);
    const exiting = game.phase === "emerging";
    const motion = this.foxPassage(game);
    const { x, camera, pose, depth } = motion;
    const altitude = exiting ? 0 : game.player.altitude * Math.max(0, 1 - progress / 0.12);
    const walking = pose.startsWith("walk");
    const settle = exiting ? Math.min(1, (1 - progress) * 6) : 1;
    const bob = walking ? Math.round(Math.sin((motion.travel / 18) * Math.PI) * 0.6 * settle) : 0;
    this.den(layout.tree - camera);
    // The root bank hides the body progressively; only the low mouth reveals the tunnel.
    ctx.save();
    ctx.beginPath();
    const gate = (exiting ? layout.exit : layout.entrance) - camera;
    ctx.rect(exiting ? gate : 0, 0, exiting ? game.width - gate : gate, FelixRunner.ground + 1);
    ctx.rect(gate, FelixRunner.ground - 16, 12, 20);
    ctx.clip();
    ctx.globalAlpha = Math.max(0, 1 - depth / 30);
    this.rect(x + 12, FelixRunner.ground - 1, 36, 2, this.colors.shadow);
    ctx.globalAlpha = 1;
    this.sprite(
      pose,
      x,
      FelixRunner.ground - frame.height + depth - altitude + bob,
      frame.width,
      frame.height,
    );
    ctx.restore();
    this.denRims(layout.tree - camera);
  }

  crater(x) {
    const ground = FelixRunner.ground;
    const c = this.environment ?? this.colors;
    this.rect(x - 39, ground - 2, 78, 5, c.soil);
    this.rect(x - 31, ground, 62, 5, c.shadow);
    this.rect(x - 20, ground + 4, 40, 3, c.ground);
    for (const [dx, dy, w] of [
      [-30, -4, 7],
      [21, -5, 9],
      [-39, 1, 5],
      [35, 2, 5],
    ])
      this.rect(x + dx, ground + dy, w, 3, c.pebble);
  }

  sequence(game) {
    const ctx = this.context;
    const progress = game.sequenceProgress;
    const ground = FelixRunner.ground;
    const frame = game.playerBounds;
    if (game.character.id === "fox") {
      this.foxSequence(game);
      return;
    }
    if (game.phase === "reviving") {
      const x = frame.x + frame.width * 0.6;
      this.crater(x);
      ctx.save();
      ctx.globalAlpha = progress;
      this.sprite("run0", frame.x, ground - frame.height + (1 - progress) * 10);
      for (let i = 0; i < 5; i++) {
        const dx = (i - 2) * 14;
        const dy = -14 - (i % 2) * 20 - progress * 20;
        this.rect(x + dx, ground + dy, 2, 5, "#edf8cf");
        this.rect(x + dx - 2, ground + dy + 2, 6, 1, "#edf8cf");
      }
      ctx.restore();
      return;
    }
    const altitude = game.player.altitude * Math.max(0, 1 - progress / 0.15);
    const impact = this.impact(game);
    if (progress < FelixRunnerScene.impactAt) {
      this.sprite("run0", frame.x, ground - frame.height - altitude);
      this.incomingMeteor(impact);
    } else this.impactBlast(impact);
  }

  draw(game) {
    const ctx = this.context;
    this.sooty = game.character.id === "dino" && game.mode === "endless";
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.imageSmoothingEnabled = false;
    this.rect(
      0,
      0,
      game.width,
      FelixRunner.height,
      this.damage(game) > 0 ? this.ruinColors.sky : this.colors.sky,
    );
    ctx.save();
    if (
      game.character.id === "dino" &&
      game.phase === "ending" &&
      game.sequenceProgress >= FelixRunnerScene.impactAt
    ) {
      const strength =
        Math.max(0, 1 - (game.sequenceProgress - FelixRunnerScene.impactAt) / 0.2) * 2;
      ctx.translate(
        Math.round(Math.sin(game.sequenceTime * 40) * strength),
        Math.round(Math.cos(game.sequenceTime * 32) * strength),
      );
    }
    this.scenery(game);
    if (
      game.character.id === "fox" &&
      game.mode === "goal" &&
      ["running", "coasting"].includes(game.phase)
    ) {
      const tree = this.denLayout(game).tree + game.finishRemaining;
      if (tree - 80 < game.width) {
        this.den(tree);
        this.denRims(tree);
      }
    }
    if (["ending", "complete", "reviving", "emerging"].includes(game.phase)) {
      this.sequence(game);
      ctx.restore();
      return;
    }
    if (game.state === "ready") {
      this.obstacle({ kind: "rock", x: game.width * 0.84, y: 138, width: 32, height: 30 }, 0);
      if (game.character.meteorObstacle)
        this.obstacle({ ...game.character.meteorObstacle, x: game.width * 0.47, y: 24 }, 0);
      for (const [profile, position] of [
        [game.character.lowObstacle, 0.42],
        [game.character.highObstacle ?? FelixRunner.birdProfiles.high, 0.66],
      ]) {
        this.obstacle(
          {
            ...profile,
            x: game.width * position,
            y: FelixRunner.ground - profile.elevation,
          },
          0,
        );
      }
    }
    game.obstacles.forEach((obstacle) => this.obstacle(obstacle, game.elapsed));
    const x = FelixRunner.playerX - 16;
    this.rect(x + 12, FelixRunner.ground - 1, 36, 2, this.environment.shadow);
    const frame = game.playerBounds;
    this.sprite(game.playerPose, frame.x, frame.y, frame.width, frame.height);
    ctx.restore();
  }
};
