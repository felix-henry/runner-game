(() => {
  const game = document.querySelector("#dino-game");
  if (!game) return;
  const stage = game.querySelector("#dino-runner");
  const canvas = game.querySelector("#dino-canvas");
  const status = game.querySelector("#dino-status");
  const score = game.querySelector("#dino-score");
  const highScore = game.querySelector("#dino-highscore");
  const characterSwitch = game.querySelector("#dino-character-switch");
  const characterOptions = characterSwitch.querySelectorAll("input");
  let character = FelixRunnerCharacter;
  let highScoreKey = character.highScoreKey;
  const toggle = game.querySelector("#dino-toggle");
  const restart = game.querySelector("#dino-restart");
  const jump = game.querySelector("#dino-jump");
  const duck = game.querySelector("#dino-duck");
  const result = game.querySelector("#dino-result");
  const resultTitle = game.querySelector("#dino-result-title");
  const resultDetail = game.querySelector("#dino-result-detail");
  const endless = game.querySelector("#dino-endless");
  const help = document.querySelector("#dino-help");
  const guide = document.querySelector("#runner-guide");
  const guideClose = guide.querySelector("#runner-guide-close");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const playbackIcon = toggle.querySelector("use");
  const iconFile = playbackIcon.getAttribute("href").split("#")[0];
  let runner;
  let scene;
  let state = "loading";
  let hasStarted = false;
  let frameId = 0;
  let lastFrame = 0;
  let savedBest = 0;
  let stagePointer = null;
  let touchDuckTimer = 0;
  let touchDuckUntil = 0;
  const jumpInputs = new Set();
  const duckInputs = new Set();
  const bestScores = new Map();
  game.hidden = false;

  function updateCharacter() {
    characterSwitch.dataset.character = character.id;
    for (const option of characterOptions) option.checked = option.value === character.id;
    game.querySelector("#dino-title").setAttribute("aria-label", character.title);
    stage.setAttribute(
      "aria-label",
      character.label +
        "-Spiel: Leertaste oder Pfeil nach oben zum Springen, Pfeil nach unten zum Ducken, Escape zum Pausieren. Bei Touch nach oben wischen zum Springen, nach unten zum Ducken." +
        (character.maxJumps === 2
          ? " Erneut drücken, tippen oder nach oben wischen für den Doppelsprung."
          : ""),
    );
    jump.setAttribute(
      "aria-label",
      character.maxJumps === 2 ? "Springen und Doppelsprung" : "Springen",
    );
    jump.dataset.tooltip = character.maxJumps === 2 ? "Springen / Doppelsprung" : "Springen";
    canvas.setAttribute("aria-label", character.description);
  }

  function selectCharacter(id) {
    if (
      runner?.animating ||
      state === "loading" ||
      state === "error" ||
      !Object.hasOwn(FelixRunnerCharacters, id) ||
      id === character.id
    ) {
      updateCharacter();
      return;
    }
    pause();
    saveBest();
    bestScores.set(character.id, runner.best);
    character = FelixRunnerCharacters[id];
    highScoreKey = character.highScoreKey;
    runner = new FelixRunner(stage.clientWidth, Math.random, character);
    savedBest = readBest();
    runner.best = Math.max(savedBest, bestScores.get(character.id) || 0);
    scene = new FelixRunnerScene(canvas, character);
    scene.setTheme(document.documentElement.dataset.theme === "dark");
    hasStarted = false;
    lastFrame = 0;
    updateCharacter();
    setState("ready");
    resize();
  }

  function readBest() {
    try {
      const value = localStorage.getItem(highScoreKey);
      const number = Number(value);
      return typeof value === "string" &&
        /^(0|[1-9]\d{0,15})$/.test(value) &&
        Number.isSafeInteger(number)
        ? number
        : 0;
    } catch {
      return 0;
    }
  }

  function saveBest() {
    if (!runner || runner.best <= savedBest) return;
    try {
      const stored = readBest();
      runner.best = Math.max(runner.best, stored);
      if (runner.best > stored) localStorage.setItem(highScoreKey, String(runner.best));
      savedBest = runner.best;
    } catch {
      // Keep playing with an in-memory record when browser storage is unavailable.
    }
  }

  function setState(next) {
    state = next;
    game.dataset.state = next;
    const running = next === "running";
    const cinematic = ["coasting", "ending", "reviving", "emerging"].includes(next);
    const active = running || cinematic;
    const complete = next === "complete";
    const goalText = (runner?.goal ?? FelixRunner.goal).toLocaleString("de-DE");
    result.hidden = !complete;
    // Move focus before disabling the active control so its blur cannot pause a cinematic.
    if (complete && game.contains(document.activeElement))
      resultTitle.focus({ preventScroll: true });
    else if (cinematic && [jump, duck].includes(document.activeElement))
      stage.focus({ preventScroll: true });
    if (!running) releaseInputs();
    const unavailable = next === "loading" || next === "error";
    help.disabled = unavailable;
    help.parentElement.hidden = unavailable;
    characterSwitch.disabled = active || unavailable;
    const labels = {
      ready: "Starten",
      running: "Pause",
      paused: "Fortsetzen",
      crashed: "Nochmal",
      coasting: "Pause",
      ending: "Pause",
      reviving: "Pause",
      emerging: "Pause",
      complete: "Starten",
      loading: "Starten",
      error: "Starten",
    };
    toggle.querySelector("span").textContent = labels[next];
    playbackIcon.setAttribute(
      "href",
      iconFile + "#" + (active ? "pause" : next === "crashed" ? "rotate-ccw" : "play"),
    );
    toggle.disabled = unavailable || complete;
    restart.disabled = unavailable || !hasStarted;
    jump.disabled =
      unavailable || complete || cinematic || (next === "paused" && runner.phase !== "running");
    duck.disabled = !running;
    duck.setAttribute("aria-pressed", "false");
    status.textContent = {
      ready: "Bereit",
      running: runner?.mode === "endless" ? "Endless" : "Läuft",
      paused: "Pausiert",
      crashed: "Game over · " + (runner?.score || 0) + " Punkte",
      coasting: "Am Ziel",
      ending: character.id === "fox" ? "Ab nach Hause" : "Meteorit im Anflug",
      reviving: "Der Dino kehrt zurück",
      emerging: "Raus aus dem Fuchsbau",
      complete: "Ziel erreicht · " + goalText + " Punkte",
      loading: "Lädt …",
      error: "Spiel nicht verfügbar",
    }[next];
    endless.disabled = !complete;
    if (complete) {
      resultDetail.textContent =
        character.id === "fox"
          ? goalText + " Punkte. Dein Fuchs ist zu Hause."
          : goalText + " Punkte. Ein Meteorit hat den Dino erwischt.";
    }
    canvas.setAttribute(
      "aria-label",
      complete
        ? character.id === "fox"
          ? "Der Fuchs ist in seinem Fuchsbau verschwunden."
          : "Der Meteorit hat den Dino getroffen."
        : next === "coasting"
          ? "Der " + character.label + " bremst auf der freien Zielgeraden ab."
          : next === "reviving"
            ? "Der Dino wird wiederbelebt."
            : next === "emerging"
              ? "Der Fuchs läuft auf der anderen Seite des Baumes aus seinem Bau."
              : character.description,
    );
  }

  function draw() {
    if (!runner || !scene) return;
    scene.draw(runner);
    const value = String(runner.score).padStart(5, "0");
    if (score.textContent !== value) score.textContent = value;
    const best = String(runner.best).padStart(5, "0");
    if (highScore.textContent !== best) highScore.textContent = best;
  }

  function updateColors() {
    scene.setTheme(document.documentElement.dataset.theme === "dark");
    draw();
    if (guide.open) updateGuide();
  }

  function updateGuide() {
    const dark = document.documentElement.dataset.theme === "dark";
    for (const label of guide.querySelectorAll("[data-runner-goal]"))
      label.textContent = runner.goal.toLocaleString("de-DE");
    for (const image of guide.querySelectorAll("[data-guide-image]")) {
      const source = dark ? image.dataset.guideDark : image.dataset.guideLight;
      if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    }
  }

  function resize() {
    const width = Math.max(240, Math.round(stage.clientWidth));
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    if (width !== runner.width || canvas.width !== Math.round(width * ratio)) pause();
    runner.resize(width);
    scene.resize(width);
    draw();
  }

  function animate(time) {
    runner.tick(lastFrame ? (time - lastFrame) / 1000 : 0);
    if (reducedMotion?.matches) runner.finishSequence();
    lastFrame = time;
    if (runner.state !== state) {
      setState(runner.state);
      if (["coasting", "ending", "complete", "crashed"].includes(state)) saveBest();
    }
    draw();
    if (runner.animating) frameId = requestAnimationFrame(animate);
    else frameId = 0;
  }

  function releaseInputs() {
    finishStagePointer(null, true);
    cancelTouchDuck();
    jumpInputs.clear();
    duckInputs.clear();
    runner?.releaseJump();
    runner?.duck(false);
    jump.dataset.pressed = "false";
    duck.setAttribute("aria-pressed", "false");
  }

  function pause() {
    releaseInputs();
    if (!runner?.animating) return;
    cancelAnimationFrame(frameId);
    frameId = 0;
    runner.pause();
    saveBest();
    setState("paused");
    draw();
  }

  function start() {
    if (!runner || runner.animating || ["complete", "error", "loading"].includes(state)) return;
    runner.start();
    play();
  }

  function play() {
    if (!runner.animating) return;
    hasStarted = true;
    stage.focus({ preventScroll: true });
    setState(runner.state);
    lastFrame = 0;
    frameId = requestAnimationFrame(animate);
  }

  function beginJump(source) {
    start();
    if (state !== "running" || jumpInputs.has(source)) return;
    jumpInputs.add(source);
    jump.dataset.pressed = "true";
    runner?.holdJump();
  }
  function endJump(source) {
    jumpInputs.delete(source);
    jump.dataset.pressed = String(jumpInputs.size > 0);
    if (!jumpInputs.size) runner?.releaseJump();
  }
  function beginDuck(source) {
    if (state !== "running") return;
    duckInputs.add(source);
    runner.duck(true);
    duck.setAttribute("aria-pressed", "true");
  }
  function endDuck(source) {
    duckInputs.delete(source);
    const held = state === "running" && duckInputs.size > 0;
    runner?.duck(held);
    duck.setAttribute("aria-pressed", String(held));
  }

  function cancelTouchDuck() {
    clearTimeout(touchDuckTimer);
    touchDuckTimer = 0;
    touchDuckUntil = 0;
    endDuck("touch:stage");
  }

  function touchJump() {
    cancelTouchDuck();
    start();
    if (state === "running") runner.jump();
  }

  function moveStagePointer(event) {
    const pointer = stagePointer;
    if (!pointer || pointer.type !== "touch" || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) pointer.moved = true;
    if (pointer.action || Math.abs(dy) < 24 || Math.abs(dy) < Math.abs(dx) * 1.25) return;
    event.preventDefault();
    pointer.action = dy < 0 ? "jump" : "duck";
    if (pointer.action === "jump") touchJump();
    else {
      cancelTouchDuck();
      start();
      if (state !== "running") return;
      touchDuckUntil = performance.now() + 400 / runner.simulationPace;
      beginDuck("touch:stage");
    }
  }

  function finishStagePointer(event, cancelled) {
    const pointer = stagePointer;
    if (!pointer || (event && pointer.id !== event.pointerId)) return;
    stagePointer = null;
    if (stage.hasPointerCapture(pointer.id)) stage.releasePointerCapture(pointer.id);
    if (pointer.type !== "touch") endJump("pointer:stage");
    else if (cancelled) cancelTouchDuck();
    else if (pointer.action === "duck") {
      const remaining = Math.max(0, touchDuckUntil - performance.now());
      if (remaining) touchDuckTimer = setTimeout(cancelTouchDuck, remaining);
      else cancelTouchDuck();
    } else if (!pointer.action && !pointer.moved) touchJump();
  }

  function bindHold(button, down, up, pulseLength) {
    const pointerSource = "pointer:" + button.id;
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || button.disabled) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      down(pointerSource);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(type, () => up(pointerSource));
    button.addEventListener("keydown", (event) => {
      if (!["Space", "Enter"].includes(event.code)) return;
      event.preventDefault();
      if (!event.repeat) down(event.code);
    });
    button.addEventListener("keyup", (event) => {
      if (["Space", "Enter"].includes(event.code)) {
        event.preventDefault();
        up(event.code);
      }
    });
    button.addEventListener("click", (event) => {
      if (event.detail === 0 && !button.disabled) {
        const source = "activation:" + button.id;
        up(source);
        down(source);
        setTimeout(() => up(source), pulseLength);
      }
    });
  }

  try {
    runner = new FelixRunner(stage.clientWidth, Math.random, character);
    savedBest = readBest();
    runner.best = savedBest;
    scene = new FelixRunnerScene(canvas, character);
    scene.setTheme(document.documentElement.dataset.theme === "dark");
    resize();
    updateCharacter();
    setState("ready");
    game.setAttribute("aria-busy", "false");
    characterSwitch.addEventListener("change", (event) => selectCharacter(event.target.value));
    // Keep playfield focus until click so a pause-induced reflow cannot move the pressed link.
    help.addEventListener("pointerdown", (event) => {
      if (event.button === 0) event.preventDefault();
    });
    help.addEventListener("click", () => {
      if (guide.open || help.disabled) return;
      pause();
      updateGuide();
      guide.showModal();
    });
    guideClose.addEventListener("click", () => guide.close());
    guide.addEventListener("close", () => help.focus({ preventScroll: true }));
    let backdropPress = false;
    guide.addEventListener("pointerdown", (event) => {
      const bounds = guide.getBoundingClientRect();
      backdropPress =
        event.target === guide &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom);
    });
    guide.addEventListener("click", (event) => {
      if (backdropPress && event.target === guide) guide.close();
      backdropPress = false;
    });
    guide.addEventListener("pointercancel", () => {
      backdropPress = false;
    });
    characterSwitch.addEventListener("pointerdown", (event) => {
      if (characterSwitch.disabled) event.preventDefault();
    });
    // Keep game focus for controls without carrying a keyboard ring into pointer play.
    game.addEventListener(
      "pointerdown",
      () => {
        stage.dataset.pointerFocus = "";
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Tab") delete stage.dataset.pointerFocus;
      },
      true,
    );
    toggle.addEventListener("click", () => (runner.animating ? pause() : start()));
    endless.addEventListener("click", () => {
      if (state !== "complete") return;
      releaseInputs();
      runner.startEndless();
      play();
    });
    restart.addEventListener("click", () => {
      pause();
      runner.reset();
      setState("ready");
      start();
    });
    bindHold(jump, beginJump, endJump, 160);
    bindHold(duck, beginDuck, endDuck, 350);
    stage.addEventListener("keydown", (event) => {
      if (!["Space", "ArrowUp", "ArrowDown", "Escape"].includes(event.code)) return;
      event.preventDefault();
      if (event.repeat) return;
      if (event.code === "Escape") pause();
      else if (event.code === "ArrowDown") beginDuck("ArrowDown");
      else beginJump(event.code);
    });
    game.addEventListener("keyup", (event) => {
      if (["Space", "ArrowUp", "Enter"].includes(event.code)) {
        event.preventDefault();
        endJump(event.code);
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        endDuck("ArrowDown");
      }
    });
    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.pointerType === "touch" && !event.isPrimary) {
        finishStagePointer(null, true);
        return;
      }
      if (stagePointer) return;
      event.preventDefault();
      stagePointer = {
        id: event.pointerId,
        type: event.pointerType,
        x: event.clientX,
        y: event.clientY,
        moved: false,
        action: null,
      };
      stage.setPointerCapture(event.pointerId);
      if (event.pointerType !== "touch") beginJump("pointer:stage");
    });
    stage.addEventListener("pointermove", moveStagePointer);
    stage.addEventListener("pointerup", (event) => {
      moveStagePointer(event);
      finishStagePointer(event, false);
    });
    for (const type of ["pointercancel", "lostpointercapture"])
      stage.addEventListener(type, (event) => finishStagePointer(event, true));
    game.addEventListener("focusout", (event) => {
      if (!game.contains(event.relatedTarget)) pause();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
    });
    window.addEventListener("blur", pause);
    window.addEventListener("pagehide", () => {
      pause();
      saveBest();
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== highScoreKey) return;
      const stored = readBest();
      savedBest = Math.max(savedBest, stored);
      runner.best = Math.max(runner.best, stored);
      draw();
    });
    window.addEventListener("themechange", updateColors);
    window.addEventListener("resize", resize);
    new ResizeObserver(resize).observe(stage);
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pause();
    }).observe(game);
    stage.dataset.swipeControls = "";
  } catch {
    cancelAnimationFrame(frameId);
    game.setAttribute("aria-busy", "false");
    setState("error");
  }
})();
