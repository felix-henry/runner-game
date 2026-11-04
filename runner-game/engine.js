// Original, DOM-independent game rules shared by Fox Run and Dino Run.
globalThis.FelixRunner = class {
  static ground = 168;
  static height = 200;
  static playerX = 40;
  static goal = 5000;
  static coastDuration = 0.9;
  static endingDuration = 3.2;
  static revivalDuration = 1.2;
  static emergenceDuration = 2.4;
  static warmupDuration = 6;
  static birdProfiles = {
    high: { kind: "bird", width: 44, height: 32, elevation: 64 },
  };

  static paceAt(points) {
    if (points <= 5000) return 1 + (Math.max(0, points) / 5000) * 0.75;
    return Math.min(2.25, 1.75 + (points - 5000) / 10000);
  }

  constructor(width = 600, random = Math.random, character = FelixRunnerCharacter) {
    this.character = character;
    this.goal = FelixRunner.goal;
    this.width = Math.max(240, width);
    this.random = random;
    this.best = 0;
    this.reset();
  }

  get baseSpeed() {
    return Math.min(290, 210 + (this.width - 240) * 0.25);
  }

  get pace() {
    const target = FelixRunner.paceAt(this.score);
    if (this.mode !== "endless") return target;
    const progress = Math.min(1, this.endlessTime / FelixRunner.warmupDuration);
    return 1.5 + (target - 1.5) * progress;
  }

  get speed() {
    return this.baseSpeed * this.pace;
  }

  get simulationPace() {
    const pace = this.pace;
    if (this.character.id !== "dino" || pace < 1.75 || this.phase !== "running") return pace;
    const enter = Math.min(this.width, FelixRunner.playerX + this.baseSpeed * 1.05);
    const leave = FelixRunner.playerX - 16;
    let focus = 0;
    for (const obstacle of this.obstacles) {
      if (obstacle.kind !== "meteor") continue;
      const approach = (enter - obstacle.x) / (this.baseSpeed * 0.25);
      const passed = 1 + (obstacle.x + obstacle.width - leave) / (this.baseSpeed * 0.2);
      focus = Math.max(focus, Math.min(1, approach, passed));
    }
    // Ease the whole simulation, preserving jump paths and pixel collision timing.
    const eased = focus * focus * (3 - 2 * focus);
    return pace + (1.25 - pace) * eased;
  }

  get score() {
    const points = Math.floor(this.distance / 12);
    return this.mode === "goal" ? Math.min(this.goal, points) : points;
  }

  get phase() {
    return this.state === "paused" ? this.resumeState : this.state;
  }

  get animating() {
    return ["running", "coasting", "ending", "reviving", "emerging"].includes(this.state);
  }

  get coastProgress() {
    return Math.min(1, this.coastTime / FelixRunner.coastDuration);
  }

  get finishRemaining() {
    if (this.phase === "coasting")
      return (
        (this.coastSpeed * FelixRunner.coastDuration * Math.pow(1 - this.coastProgress, 3)) / 3
      );
    return (
      Math.max(0, this.goal * 12 - this.distance) +
      (this.baseSpeed * FelixRunner.paceAt(this.goal) * FelixRunner.coastDuration) / 3
    );
  }

  get sequenceProgress() {
    const duration =
      this.phase === "reviving"
        ? FelixRunner.revivalDuration
        : this.phase === "emerging"
          ? FelixRunner.emergenceDuration
          : FelixRunner.endingDuration;
    return Math.min(1, this.sequenceTime / duration);
  }

  get crouched() {
    return this.duckHeld && this.player.altitude === 0;
  }

  get playerBounds() {
    const rows = this.character.art[this.playerPose];
    return FelixRunnerSprites.frame(
      rows,
      FelixRunner.playerX - 16,
      FelixRunner.ground - this.player.altitude - rows.length * 2,
    );
  }

  get playerPose() {
    if (this.crashPose) return this.crashPose;
    if (this.crouched) return "duck";
    if (this.player.altitude > 0) return "airborne";
    return "run" + (Math.floor((this.distance + this.coastDistance) / 16) % 2);
  }

  obstacleBounds(obstacle) {
    const pose = FelixRunnerSprites.obstaclePose(obstacle, this.elapsed);
    return FelixRunnerSprites.frame(
      FelixRunnerSprites.art[pose],
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height,
    );
  }

  reset(mode = "goal") {
    this.mode = mode;
    this.state = "ready";
    this.resumeState = "running";
    this.sequenceTime = 0;
    this.coastTime = 0;
    this.coastDistance = 0;
    this.coastSpeed = 0;
    this.coastPace = 1;
    this.endlessTime = 0;
    this.elapsed = 0;
    this.distance = mode === "endless" ? FelixRunner.goal * 12 : 0;
    this.player = { altitude: 0, velocity: 0 };
    this.jumpsUsed = 0;
    this.duckHeld = false;
    this.obstacles = [];
    this.untilObstacle = 1.1;
    this.obstacleCount = 0;
    this.crashPose = null;
  }

  start() {
    if (this.state === "crashed") this.reset();
    if (this.state === "ready") this.state = "running";
    else if (this.state === "paused") this.state = this.resumeState;
  }

  startEndless() {
    if (this.state !== "complete") return;
    const coastDistance = this.coastDistance;
    this.reset("endless");
    this.coastDistance = coastDistance;
    this.best = Math.max(this.best, this.score);
    this.state = this.character.id === "dino" ? "reviving" : "emerging";
  }

  finishSequence() {
    if (this.state === "coasting") {
      this.coastDistance += this.finishRemaining;
      this.coastTime = FelixRunner.coastDuration;
      this.player = { altitude: 0, velocity: 0 };
      this.jumpsUsed = 0;
      this.state = "ending";
    }
    if (this.state === "ending") {
      this.sequenceTime = FelixRunner.endingDuration;
      this.state = "complete";
    } else if (["reviving", "emerging"].includes(this.state)) {
      this.sequenceTime = 0;
      this.state = "running";
    }
  }

  pause() {
    if (!this.animating) return;
    this.resumeState = this.state;
    this.state = "paused";
    this.duck(false);
    this.releaseJump();
  }

  jump() {
    if (this.state !== "running" || this.duckHeld) return;
    if (this.player.altitude === 0) this.jumpsUsed = 0;
    if (this.jumpsUsed >= (this.character.maxJumps ?? 1)) return;
    this.jumpsUsed++;
    this.player.velocity = this.jumpsUsed === 2 ? 460 : 450;
    // Mark takeoff before the next frame; the input layer handles fresh presses.
    this.player.altitude = Math.max(0.01, this.player.altitude);
  }

  releaseJump() {
    const limit = this.jumpsUsed === 2 ? 460 : 410;
    if (this.player.velocity > limit) this.player.velocity = limit;
  }

  duck(held) {
    this.duckHeld = held && this.state === "running";
    if (this.duckHeld && this.player.altitude > 0)
      this.player.velocity = Math.min(this.player.velocity, -430);
  }

  resize(width) {
    const previousSpeed = this.speed;
    this.width = Math.max(240, width);
    for (const obstacle of this.obstacles)
      obstacle.x =
        FelixRunner.playerX + ((obstacle.x - FelixRunner.playerX) * this.speed) / previousSpeed;
  }

  spawnObstacle() {
    if (this.mode === "goal") {
      const widest = Math.max(
        36,
        this.character.lowObstacle?.width ?? 0,
        this.character.highObstacle?.width ?? FelixRunner.birdProfiles.high.width,
        this.character.meteorObstacle?.width ?? 0,
      );
      const runway = this.baseSpeed * 1.8;
      if (this.goal * 12 - this.distance <= this.width + 28 + widest + 10 + runway) {
        this.untilObstacle = Infinity;
        return false;
      }
    }
    const pattern = this.character.obstaclePattern ?? ["rock", "low", "rock", "high", "rock"];
    const type = pattern[this.obstacleCount++ % pattern.length];
    const profile =
      type === "low"
        ? this.character.lowObstacle
        : type === "high"
          ? (this.character.highObstacle ?? FelixRunner.birdProfiles.high)
          : type === "meteor" && this.score >= 250
            ? this.character.meteorObstacle
            : null;
    const height = profile?.height ?? 25 + Math.floor(this.random() * 9);
    this.obstacles.push({
      kind: profile?.kind ?? "rock",
      x: this.width + 28,
      y: profile?.fallSpeed ? -height : FelixRunner.ground - (profile?.elevation ?? height),
      width: profile?.width ?? 27 + Math.floor(this.random() * 10),
      height,
      fallSpeed: profile?.fallSpeed ?? 0,
    });
    this.untilObstacle =
      this.character.maxJumps === 2 ? 1.8 + this.random() * 0.45 : 1.45 + this.random() * 0.55;
    return true;
  }

  advancePlayer(seconds) {
    if (this.player.altitude <= 0) return;
    this.player.velocity -= 1800 * seconds;
    this.player.altitude = Math.max(0, this.player.altitude + this.player.velocity * seconds);
    if (this.player.altitude === 0) {
      this.player.velocity = 0;
      this.jumpsUsed = 0;
    }
  }

  coast(seconds) {
    const previous = this.coastProgress;
    this.coastTime = Math.min(FelixRunner.coastDuration, this.coastTime + seconds);
    const current = this.coastProgress;
    const movement =
      (this.coastSpeed *
        FelixRunner.coastDuration *
        (Math.pow(1 - previous, 3) - Math.pow(1 - current, 3))) /
      3;
    this.coastDistance += movement;
    const steps = Math.ceil(seconds * this.coastPace * 120);
    for (let step = 0; step < steps; step++) this.advancePlayer((seconds * this.coastPace) / steps);
    this.elapsed += seconds * this.coastPace;
    if (this.coastProgress >= 1 && this.player.altitude === 0) {
      this.state = "ending";
      this.sequenceTime = 0;
    }
  }

  tick(seconds) {
    if (!this.animating || !Number.isFinite(seconds) || seconds <= 0) return;
    if (this.state === "coasting") {
      this.coast(Math.min(seconds, 0.05));
      return;
    }
    if (this.state !== "running") {
      this.sequenceTime += Math.min(seconds, 0.05);
      if (this.sequenceProgress >= 1) this.finishSequence();
      return;
    }
    // Bound long frames and substep collisions so a stalled tab cannot skip an obstacle.
    let remaining = Math.min(seconds, 0.05);
    while (remaining > 0.000001 && this.state === "running") {
      const pace = this.simulationPace;
      const step = Math.min(
        remaining,
        1 / (120 * pace),
        1 /
          (pace *
            Math.max(
              this.baseSpeed,
              Math.abs(this.player.velocity),
              this.character.meteorObstacle?.fallSpeed ?? 0,
            )),
      );
      const gameStep = step * pace;
      remaining -= step;
      if (this.mode === "endless") this.endlessTime += step;
      this.elapsed += gameStep;
      const movement = this.baseSpeed * gameStep;
      this.distance += movement;
      this.advancePlayer(gameStep);
      this.untilObstacle -= gameStep;
      if (this.untilObstacle <= 0) this.spawnObstacle();
      const player = this.playerBounds;
      for (const obstacle of this.obstacles) {
        obstacle.x -= movement;
        if (obstacle.fallSpeed)
          obstacle.y = Math.min(
            FelixRunner.ground - obstacle.height,
            obstacle.y + obstacle.fallSpeed * gameStep,
          );
        if (FelixRunnerSprites.overlaps(player, this.obstacleBounds(obstacle))) {
          this.crashPose = this.playerPose;
          this.state = "crashed";
          this.duckHeld = false;
          break;
        }
      }
      this.obstacles = this.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);
      if (
        this.state === "running" &&
        this.mode === "goal" &&
        this.distance >= this.goal * 12 &&
        this.obstacles.length === 0
      ) {
        this.coastDistance = this.distance - this.goal * 12;
        this.distance = this.goal * 12;
        this.coastSpeed = this.speed;
        this.coastPace = this.pace;
        this.coastTime = 0;
        this.state = "coasting";
        this.releaseJump();
        this.duck(false);
      }
    }
    this.best = Math.max(this.best, this.score);
  }
};
