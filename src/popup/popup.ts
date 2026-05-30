import {
  BETTER_CLEAR_MESSAGE,
  BETTER_SCAN_MESSAGE,
  BETTER_SETTINGS_KEY,
  DEFAULT_SCAN_SETTINGS,
  type AlgorithmResultSummary,
  type ClearResponse,
  type ScanResponse,
  type ScanSettings,
  type StatisticChartRow,
} from "../shared/messages";

type Palette = {
  primaryButton: string;
  dangerButton: string;
  toggleOn: string;
  toggleOff: string;
  toggleThumb: string;
  thresholdBackground: string;
  glitchRed: string;
  glitchCyan: string;
  glitchWhite: string;
  particleColors: string[];
};

type ParticleEmitterConfig = {
  count: number;
  sizeMin: number;
  sizeMax: number;
  durationMin: number;
  durationMax: number;
  driftMin: number;
  driftMax: number;
  idleDriftXMin: number;
  idleDriftXMax: number;
  idleDriftYMin: number;
  idleDriftYMax: number;
  edgeOffset: number;
  className?: string;
  shapes?: string[];
  colors?: string[];
};

type SoundConfig = {
  src: string;
  volume: number;
};

type ButtonVariant = "primary" | "danger";
type ButtonSize = "normal" | "small";

type GlitchButtonConfig = {
  label: string;
  variant: ButtonVariant;
  size?: ButtonSize;
  sound?: SoundConfig;
  disabled?: boolean;
};

type GlitchFrame = {
  image: string;
  font: string;
  fontSize: string;
  letterSpacing: string;
  textY: string;
};

type PopupState = {
  status: string;
  currentPage: string;
  loadedKeywordCount: number;
  matchedKeywordCount: number;
  totalMatches: number;
  totalExecutionTimeMs: number;
  matchRows: AlgorithmResultSummary[];
  statistics: StatisticChartRow[];
  warnings: string[];
  settings: ScanSettings;
  isMuted: boolean;
  isScanning: boolean;
};

type SettingRow =
  | {
      label: string;
      key:
        | "highlight"
        | "blurText"
        | "ocr"
        | "runRabinKarp"
        | "runAhoCorasick"
        | "sound";
      kind: "toggle";
      checked: boolean;
    }
  | {
      label: string;
      kind: "threshold";
      value: number;
    };

const BETTER_AUDIO_MUTED_KEY = "better.detector.audioMuted";
const POPUP_HEIGHT_RATIO = 0.75;
const POPUP_BACKGROUND_WIDTH = 734;
const POPUP_BACKGROUND_HEIGHT = 1194;
const POPUP_MAX_HEIGHT = 600;
const POPUP_FALLBACK_VIEWPORT_HEIGHT = 800;
const DEFAULT_AUDIO_MUTED = true;
const TOGGLE_RESCAN_DELAY_MS = 700;
const PALETTE_CYAN = "#39c2ef";
const PALETTE_PINK = "#f9169c";
const PALETTE_WHITE = "#ffffff";

const COLOR_PALETTE: Palette = {
  primaryButton: PALETTE_CYAN,
  dangerButton: PALETTE_PINK,
  toggleOn: "#16aee5",
  toggleOff: "#cfcfd2",
  toggleThumb: PALETTE_WHITE,
  thresholdBackground: "#dedfe1",
  glitchRed: PALETTE_PINK,
  glitchCyan: PALETTE_CYAN,
  glitchWhite: PALETTE_WHITE,
  particleColors: [PALETTE_CYAN, PALETTE_PINK, PALETTE_WHITE],
};

const STAT_BAR_ANIMATION_MS = 1000;
const SOUND_CONFIG = {
  rescan: { src: "sound/2.wav", volume: 0.8 },
  clear: { src: "sound/1.wav", volume: 0.8 },
  statistic: { src: "sound/9.wav", volume: 0.8 },
  statisticRow: { src: "sound/7.wav", volume: 0.6 },
  close: { src: "sound/8.wav", volume: 0.8 },
  toggle: { src: "sound/6.wav", volume: 0.65 },
  hoverStart: { src: "sound/3.wav", volume: 0.75 },
  hoverLoop: { src: "sound/4.wav", volume: 0.5 },
} satisfies Record<string, SoundConfig>;

const DEFAULT_BUTTON_SOUND = SOUND_CONFIG.clear;
const DEFAULT_PARTICLE_SHAPES = ["x", "+", "o"];
const BUTTON_HOVER_PARTICLES: ParticleEmitterConfig = {
  count: 3,
  sizeMin: 20,
  sizeMax: 40,
  durationMin: 1000,
  durationMax: 2400,
  driftMin: 18,
  driftMax: 50,
  idleDriftXMin: -50,
  idleDriftXMax: 50,
  idleDriftYMin: -32,
  idleDriftYMax: 32,
  edgeOffset: 8,
};
const STAT_HOVER_PARTICLES: ParticleEmitterConfig = {
  count: 2,
  sizeMin: 30,
  sizeMax: 44,
  durationMin: 650,
  durationMax: 1500,
  driftMin: 16,
  driftMax: 44,
  idleDriftXMin: -14,
  idleDriftXMax: 14,
  idleDriftYMin: -14,
  idleDriftYMax: 14,
  edgeOffset: 8,
  className: "stat-chart-particle",
};
const CLICK_BURST_PARTICLES: ParticleEmitterConfig = {
  count: 30,
  sizeMin: 40,
  sizeMax: 52,
  durationMin: 450,
  durationMax: 1000,
  driftMin: 10,
  driftMax: 30,
  idleDriftXMin: -40,
  idleDriftXMax: 40,
  idleDriftYMin: -30,
  idleDriftYMax: 30,
  edgeOffset: 10,
  className: "click-burst-particle",
};

const GLITCH_NORMAL_FRAME: GlitchFrame = {
  image: "none",
  font: '"Century Gothic", "Arial Rounded MT Bold", Arial, sans-serif',
  fontSize: "18px",
  letterSpacing: "0",
  textY: "-1px",
};

const GLITCH_FRAMES: GlitchFrame[] = [
  {
    image: "withoutFont/Group 14.png",
    font: '"Caesar Dressing", cursive',
    fontSize: "20px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 15.png",
    font: '"Caveat Brush", cursive',
    fontSize: "24px",
    letterSpacing: "0",
    textY: "-2px",
  },
  {
    image: "withoutFont/Group 16.png",
    font: '"Chakra Petch", sans-serif',
    fontSize: "19px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 17.png",
    font: '"Chokokutai", system-ui',
    fontSize: "17px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 18.png",
    font: '"Comic Neue", cursive',
    fontSize: "23px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 19.png",
    font: '"Cute Font", cursive',
    fontSize: "30px",
    letterSpacing: "0",
    textY: "-3px",
  },
  {
    image: "withoutFont/Group 20.png",
    font: '"Berlin Sans FB", "Arial Rounded MT Bold", Arial, sans-serif',
    fontSize: "21px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 21.png",
    font: '"Butcherman", fantasy',
    fontSize: "20px",
    letterSpacing: "0",
    textY: "-1px",
  },
  {
    image: "withoutFont/Group 22.png",
    font: '"Bruno Ace SC", sans-serif',
    fontSize: "17px",
    letterSpacing: "0",
    textY: "-1px",
  },
];

const PALETTE_VARIABLES: Array<
  [Exclude<keyof Palette, "particleColors">, string]
> = [
  ["primaryButton", "--color-primary"],
  ["dangerButton", "--color-danger"],
  ["toggleOn", "--color-toggle-on"],
  ["toggleOff", "--color-toggle-off"],
  ["toggleThumb", "--color-toggle-thumb"],
  ["thresholdBackground", "--color-threshold-bg"],
  ["glitchRed", "--color-glitch-red"],
  ["glitchCyan", "--color-glitch-cyan"],
  ["glitchWhite", "--color-glitch-white"],
];

const appState: PopupState = {
  status: "Preparing detector...",
  currentPage: "No active page",
  loadedKeywordCount: 0,
  matchedKeywordCount: 0,
  totalMatches: 0,
  totalExecutionTimeMs: 0,
  matchRows: [],
  statistics: [],
  warnings: [],
  settings: { ...DEFAULT_SCAN_SETTINGS },
  isMuted: DEFAULT_AUDIO_MUTED,
  isScanning: false,
};

const glitchControllers: GlitchButtonController[] = [];
const statisticRowInteractionCleanups: Array<() => void> = [];
const audioCache = new Map<string, HTMLAudioElement>();
const audioElements = new Set<HTMLAudioElement>();
const audioContext = createResumeAudioContext();
let activeStatisticBackdrop: HTMLElement | null = null;
let activeStatisticPopup: HTMLElement | null = null;
let activeStatisticDetailBackdrop: HTMLElement | null = null;
let activeStatisticDetailPopup: HTMLElement | null = null;
let scheduledScanTimer: number | null = null;

class GlitchButtonController {
  private readonly button: HTMLButtonElement;
  private readonly particleField: HTMLElement;
  private readonly clickSound: HTMLAudioElement;
  private readonly hoverSound: HoverSoundController;
  private glitchTimer: number | null = null;
  private isHovering = false;
  private currentFrame: GlitchFrame = GLITCH_NORMAL_FRAME;

  constructor(button: HTMLButtonElement) {
    const particleField = button.querySelector<HTMLElement>(".particle-field");

    if (!particleField) {
      throw new Error("Glitch button needs a particle field.");
    }

    this.button = button;
    this.particleField = particleField;
    this.clickSound = createAudio(readButtonSound(button));
    this.hoverSound = new HoverSoundController(
      SOUND_CONFIG.hoverStart,
      SOUND_CONFIG.hoverLoop,
    );
    this.handleHoverStart = this.handleHoverStart.bind(this);
    this.handleHoverEnd = this.handleHoverEnd.bind(this);
    this.startGlitch = this.startGlitch.bind(this);
    this.stopGlitch = this.stopGlitch.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  connect(): void {
    this.button.addEventListener("click", this.handleClick);
    this.button.addEventListener("mouseenter", this.handleHoverStart);
    this.button.addEventListener("mouseleave", this.handleHoverEnd);
    this.button.addEventListener("focus", this.startGlitch);
    this.button.addEventListener("blur", this.resetInteraction);
  }

  resetInteraction = (): void => {
    this.isHovering = false;
    this.stopGlitch();
    this.hoverSound.stop();
  };

  private handleHoverStart(): void {
    if (this.button.disabled) return;

    this.isHovering = true;
    this.startGlitch();
    this.hoverSound.start(() => this.isHovering);
  }

  private handleHoverEnd(): void {
    this.resetInteraction();
  }

  private handleClick(): void {
    if (this.button.disabled) return;

    playAudioElement(this.clickSound);
    emitParticles(this.particleField, CLICK_BURST_PARTICLES);
    this.playClickFlash();
  }

  private playClickFlash(): void {
    this.button.classList.remove("is-click-lit");
    void this.button.offsetWidth;
    this.button.classList.add("is-click-lit");
  }

  private startGlitch(): void {
    if (this.glitchTimer || this.button.disabled) return;

    this.button.classList.add("is-glitching");
    this.runGlitchTick();
  }

  private stopGlitch(): void {
    if (this.glitchTimer) {
      window.clearTimeout(this.glitchTimer);
    }

    this.glitchTimer = null;
    this.button.classList.remove("is-glitching");
    this.setFrame(GLITCH_NORMAL_FRAME);
    this.button.removeAttribute("style");
  }

  private setFrame(frame: GlitchFrame): void {
    const backgroundImage =
      frame.image === "none" ? "none" : `url("${frame.image}")`;

    this.currentFrame = frame;
    this.button.style.setProperty("--button-bg-image", backgroundImage);
    this.button.style.setProperty("--button-font", frame.font);
    this.button.style.setProperty("--button-font-size", frame.fontSize);
    this.button.style.setProperty(
      "--button-letter-spacing",
      frame.letterSpacing,
    );
    this.button.style.setProperty("--button-text-y", frame.textY);
  }

  private runGlitchTick(): void {
    this.setFrame(this.pickRandomFrame());
    scrambleGlitchSlices(this.button);
    emitParticles(this.particleField, BUTTON_HOVER_PARTICLES);

    this.glitchTimer = window.setTimeout(
      () => this.runGlitchTick(),
      randomBetween(22, 88),
    );
  }

  private pickRandomFrame(): GlitchFrame {
    let nextFrame = GLITCH_FRAMES[randomBetween(0, GLITCH_FRAMES.length - 1)];

    while (nextFrame === this.currentFrame) {
      nextFrame = GLITCH_FRAMES[randomBetween(0, GLITCH_FRAMES.length - 1)];
    }

    return nextFrame;
  }
}

class HoverSoundController {
  private readonly startSound: HTMLAudioElement;
  private readonly loopSound: HTMLAudioElement;

  constructor(startConfig: SoundConfig, loopConfig: SoundConfig) {
    this.startSound = createAudio(startConfig);
    this.loopSound = createAudio(loopConfig, { loop: true });
  }

  start(shouldLoop: () => boolean): void {
    this.stop();
    playAudioElement(this.startSound);

    if (shouldLoop()) {
      this.playLoop();
    }
  }

  stop(): void {
    this.startSound.onended = null;
    this.startSound.pause();
    this.startSound.currentTime = 0;
    this.loopSound.pause();
    this.loopSound.currentTime = 0;
  }

  private playLoop(): void {
    if (!this.loopSound.paused) return;

    playAudioElement(this.loopSound);
  }
}

function createAudio(
  config: SoundConfig,
  options: { loop?: boolean } = {},
): HTMLAudioElement {
  const audio = document.createElement("audio");
  audio.preload = "none";
  audio.src = config.src;
  audio.volume = toAudioVolume(config.volume, 1);
  audio.loop = Boolean(options.loop);
  audioElements.add(audio);
  return audio;
}

function playOneShot(config: SoundConfig): void {
  const audio = getCachedAudio(config);
  playAudioElement(audio);
}

function getCachedAudio(config: SoundConfig): HTMLAudioElement {
  const cacheKey = `${config.src}:${toAudioVolume(config.volume, 1)}`;
  let audio = audioCache.get(cacheKey);

  if (!audio) {
    audio = createAudio(config);
    audioCache.set(cacheKey, audio);
  }

  return audio;
}

function createResumeAudioContext(): AudioContext | null {
  const AudioContextConstructor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  try {
    return new AudioContextConstructor();
  } catch {
    return null;
  }
}

async function resumeAudio(): Promise<void> {
  if (audioContext?.state === "suspended") {
    await audioContext.resume();
  }
}

function playAudioElement(audio: HTMLAudioElement): void {
  if (appState.isMuted) {
    return;
  }

  void resumeAudio()
    .then(() => {
      audio.currentTime = 0;
      return audio.play();
    })
    .catch(() => undefined);
}

function stopAllAudio(): void {
  for (const audio of audioElements) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function readButtonSound(button: HTMLElement): SoundConfig {
  return {
    src: button.dataset.soundSrc ?? DEFAULT_BUTTON_SOUND.src,
    volume: toAudioVolume(
      button.dataset.soundVolume,
      DEFAULT_BUTTON_SOUND.volume,
    ),
  };
}

function scrambleGlitchSlices(target: HTMLElement): void {
  const sliceHeight = randomBetween(12, 40);
  const sliceTop = randomBetween(0, 100 - sliceHeight);
  const sliceBottom = 100 - sliceTop - sliceHeight;

  target.style.setProperty("--slice-top", `${sliceTop}%`);
  target.style.setProperty("--slice-bottom", `${sliceBottom}%`);
  target.style.setProperty("--red-x", `${randomBetween(-50, 50)}px`);
  target.style.setProperty("--red-y", `${randomBetween(-15, 15)}px`);
  target.style.setProperty("--cyan-x", `${randomBetween(-30, 30)}px`);
  target.style.setProperty("--cyan-y", `${randomBetween(-15, 15)}px`);
  target.style.setProperty(
    "--red-opacity",
    String(randomBetween(35, 95) / 100),
  );
  target.style.setProperty(
    "--cyan-opacity",
    String(randomBetween(35, 95) / 100),
  );
  target.style.setProperty("--shake-speed", `${randomBetween(70, 180)}ms`);
  target.style.setProperty("--scan-speed", `${randomBetween(90, 260)}ms`);
}

function clearGlitchSliceProperties(target: HTMLElement): void {
  for (const cssVariable of [
    "--slice-top",
    "--slice-bottom",
    "--red-x",
    "--red-y",
    "--cyan-x",
    "--cyan-y",
    "--red-opacity",
    "--cyan-opacity",
    "--shake-speed",
    "--scan-speed",
  ]) {
    target.style.removeProperty(cssVariable);
  }
}

function emitParticles(
  particleField: HTMLElement,
  config: ParticleEmitterConfig,
): void {
  for (let index = 0; index < config.count; index += 1) {
    createParticle(particleField, config);
  }
}

function createParticle(
  particleField: HTMLElement,
  config: ParticleEmitterConfig,
): void {
  const particle = document.createElement("span");
  const edge = randomBetween(0, 3);
  const shapes = config.shapes ?? DEFAULT_PARTICLE_SHAPES;
  const colors = config.colors ?? COLOR_PALETTE.particleColors;
  const duration = randomBetween(config.durationMin, config.durationMax);
  const size = randomBetween(config.sizeMin, config.sizeMax);
  let x = randomBetween(0, 100);
  let y = randomBetween(0, 100);
  let driftX = randomBetween(config.idleDriftXMin, config.idleDriftXMax);
  let driftY = randomBetween(config.idleDriftYMin, config.idleDriftYMax);

  if (edge === 0) {
    y = randomBetween(-config.edgeOffset, config.edgeOffset);
    driftY = -randomBetween(config.driftMin, config.driftMax);
  } else if (edge === 1) {
    x = randomBetween(100 - config.edgeOffset, 100 + config.edgeOffset);
    driftX = randomBetween(config.driftMin, config.driftMax);
  } else if (edge === 2) {
    y = randomBetween(100 - config.edgeOffset, 100 + config.edgeOffset);
    driftY = randomBetween(config.driftMin, config.driftMax);
  } else {
    x = randomBetween(-config.edgeOffset, config.edgeOffset);
    driftX = -randomBetween(config.driftMin, config.driftMax);
  }

  particle.className = ["glitch-particle", config.className ?? ""]
    .filter(Boolean)
    .join(" ");
  particle.textContent = shapes[randomBetween(0, shapes.length - 1)];
  particle.style.setProperty("--particle-x", `${x}%`);
  particle.style.setProperty("--particle-y", `${y}%`);
  particle.style.setProperty("--particle-size", `${size}px`);
  particle.style.setProperty(
    "--particle-color",
    colors[randomBetween(0, colors.length - 1)],
  );
  particle.style.setProperty("--particle-drift-x", `${driftX}px`);
  particle.style.setProperty("--particle-drift-y", `${driftY}px`);
  particle.style.setProperty(
    "--particle-rotate",
    `${randomBetween(-35, 35)}deg`,
  );
  particle.style.setProperty("--particle-duration", `${duration}ms`);

  particleField.append(particle);
  window.setTimeout(() => particle.remove(), duration);
}

function createClickParticleField(className = ""): HTMLSpanElement {
  const particleField = document.createElement("span");
  particleField.className = ["click-particle-field", className]
    .filter(Boolean)
    .join(" ");
  particleField.setAttribute("aria-hidden", "true");
  return particleField;
}

function toAudioVolume(
  value: string | number | undefined,
  fallback: number,
): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, parsedValue));
}

function applyColorPalette(palette: Palette): void {
  for (const [paletteKey, cssVariable] of PALETTE_VARIABLES) {
    document.documentElement.style.setProperty(
      cssVariable,
      palette[paletteKey],
    );
  }
}

function applyStatisticAnimationConfig(): void {
  document.documentElement.style.setProperty(
    "--stat-bar-animation-duration",
    `${STAT_BAR_ANIMATION_MS}ms`,
  );
}

function applyPopupDimensions(): void {
  const viewportHeight =
    window.screen.availHeight ||
    window.screen.height ||
    POPUP_FALLBACK_VIEWPORT_HEIGHT;
  const popupHeight = Math.round(
    Math.min(viewportHeight * POPUP_HEIGHT_RATIO, POPUP_MAX_HEIGHT),
  );
  const popupWidth = Math.round(
    popupHeight * (POPUP_BACKGROUND_WIDTH / POPUP_BACKGROUND_HEIGHT),
  );

  document.documentElement.style.setProperty(
    "--popup-height",
    `${popupHeight}px`,
  );
  document.documentElement.style.setProperty(
    "--popup-width",
    `${popupWidth}px`,
  );
}

function preloadGlitchFrames(): void {
  for (const frame of GLITCH_FRAMES) {
    const preloadedImage = new Image();
    preloadedImage.src = frame.image;
  }
}

function getAppRoot(): HTMLElement {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("App root was not found.");
  }

  return app;
}

function schedulePopupViewportFit(): void {
  applyPopupDimensions();
}

function renderApp(): void {
  renderMainView();
}

function renderMainView(): void {
  const app = getAppRoot();
  closeStatisticPopup();
  resetAllButtonInteractions();
  glitchControllers.length = 0;

  const content = document.createElement("div");
  content.className = "popup-content";
  content.append(
    createBrand(),
    createStatusBlock(),
    createActionRow(),
    createSummarySection(),
    createMatchesSection(),
    createStatisticRow(),
    createSettingsSection(),
  );
  app.replaceChildren(content);

  for (const button of app.querySelectorAll<HTMLButtonElement>(
    ".glitch-button",
  )) {
    const controller = new GlitchButtonController(button);
    controller.connect();
    glitchControllers.push(controller);
  }

  schedulePopupViewportFit();
}

function renderStatisticChartView(): void {
  resetAllButtonInteractions();
  closeStatisticPopup();
  showStatisticPopup(
    [
      createStatisticHeader("STATISTIC", closeStatisticPopup),
      createStatisticChart(),
    ],
    "stat-popup--chart",
  );
}

function renderStatisticDetailView(row: StatisticChartRow): void {
  resetAllButtonInteractions();
  showStatisticPopup(
    [
      createStatisticHeader(row.keyword, closeStatisticDetailPopup),
      createStatisticDetailTable(row),
    ],
    "stat-popup--detail",
  );
}

function showStatisticPopup(
  content: HTMLElement[],
  modifierClass: string,
): void {
  const app = getAppRoot();
  const backdrop = document.createElement("div");
  const popup = document.createElement("section");

  backdrop.className = `stat-popup-backdrop ${modifierClass}-backdrop`;
  popup.className = `stat-popup ${modifierClass}`;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "false");
  popup.append(...content);

  if (modifierClass === "stat-popup--detail") {
    closeStatisticDetailPopup();
    activeStatisticDetailBackdrop = backdrop;
    activeStatisticDetailPopup = popup;
  } else {
    activeStatisticBackdrop = backdrop;
    activeStatisticPopup = popup;
  }

  app.append(backdrop, popup);
  schedulePopupViewportFit();
}

function closeStatisticPopup(): void {
  closeStatisticDetailPopup();
  clearStatisticRowInteractions();
  activeStatisticBackdrop?.remove();
  activeStatisticPopup?.remove();
  activeStatisticBackdrop = null;
  activeStatisticPopup = null;
  schedulePopupViewportFit();
}

function closeStatisticDetailPopup(): void {
  activeStatisticDetailBackdrop?.remove();
  activeStatisticDetailPopup?.remove();
  activeStatisticDetailBackdrop = null;
  activeStatisticDetailPopup = null;
  schedulePopupViewportFit();
}

function stopStatisticRowInteractions(): void {
  for (const stopInteraction of statisticRowInteractionCleanups) {
    stopInteraction();
  }
}

function clearStatisticRowInteractions(): void {
  stopStatisticRowInteractions();
  statisticRowInteractionCleanups.length = 0;
}

function resetAllButtonInteractions(): void {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }

  for (const controller of glitchControllers) {
    controller.resetInteraction();
  }

  stopStatisticRowInteractions();
}

function createBrand(): HTMLElement {
  const brand = document.createElement("div");
  const image = document.createElement("img");
  brand.className = "brand";
  image.src = "Title/Title.png";
  image.alt = "BET-TER";
  image.addEventListener("load", schedulePopupViewportFit, { once: true });
  image.addEventListener("error", schedulePopupViewportFit, { once: true });
  brand.append(image);
  return brand;
}

function createStatusBlock(): HTMLElement {
  const statusBlock = document.createElement("section");
  statusBlock.className = "status-block";
  statusBlock.append(
    createStatusLine("Status:", appState.status),
    createStatusLine("Current page:", appState.currentPage),
  );

  if (appState.warnings.length > 0) {
    statusBlock.append(createStatusLine("Note:", appState.warnings[0]));
  }

  return statusBlock;
}

function createStatusLine(label: string, value: string): HTMLElement {
  const row = document.createElement("div");
  const labelElement = document.createElement("strong");
  const valueElement = document.createElement("span");
  row.className = "status-line";
  labelElement.textContent = label;
  valueElement.className = "status-value";
  valueElement.textContent = value;
  valueElement.title = value;
  row.append(labelElement, valueElement);
  return row;
}

function createActionRow(): HTMLElement {
  const row = document.createElement("div");
  row.className = "action-row";

  const rescanButton = createGlitchButton({
    label: appState.isScanning ? "Scanning" : "Rescan",
    variant: "primary",
    sound: SOUND_CONFIG.rescan,
    disabled: appState.isScanning,
  });
  rescanButton.addEventListener("click", () => {
    void scanActiveTab();
  });

  const clearButton = createGlitchButton({
    label: "Clear",
    variant: "danger",
    sound: SOUND_CONFIG.clear,
  });
  clearButton.addEventListener("click", () => {
    void clearActiveTab();
  });

  row.append(rescanButton, clearButton);
  return row;
}

function createSummarySection(): HTMLElement {
  const list = document.createElement("div");
  list.className = "summary-list";

  for (const item of [
    `Total keywords found: ${appState.matchedKeywordCount}`,
    `Total matches: ${appState.totalMatches}`,
    `Execution total: ${formatMs(appState.totalExecutionTimeMs)}`,
  ]) {
    const row = document.createElement("div");
    row.textContent = item;
    list.append(row);
  }

  return createSection("Summary", list);
}

function createMatchesSection(): HTMLElement {
  if (appState.matchRows.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = appState.isScanning
      ? "Scanning current page..."
      : "No scan result yet.";
    return createSection("Matches", empty);
  }

  const grid = document.createElement("div");
  grid.className = "matches-grid";

  for (const row of appState.matchRows) {
    grid.append(
      createTextSpan(`${row.algorithm} / ${formatMatchSource(row.source)}`),
      createTextSpan(`${row.matches} matches`),
      createTextSpan(formatMs(row.executionTimeMs)),
    );
  }

  return createSection("Matches", grid);
}

function createStatisticRow(): HTMLElement {
  const row = document.createElement("div");
  const button = createGlitchButton({
    label: "Statistic",
    variant: "primary",
    size: "small",
    sound: SOUND_CONFIG.statistic,
  });
  row.className = "statistic-row";
  button.addEventListener("click", () => {
    if (activeStatisticPopup) return;

    window.setTimeout(renderStatisticChartView, 90);
  });
  row.append(button);
  return row;
}

function createStatisticHeader(
  title: string,
  onClose: () => void,
): HTMLElement {
  const header = document.createElement("header");
  const heading = document.createElement("h1");
  const closeButton = document.createElement("button");
  const particleField = createClickParticleField("close-particle-field");

  header.className = "stat-screen-header";
  heading.className = "stat-screen-title";
  heading.textContent = title;
  closeButton.className = "stat-screen-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close statistic view");
  closeButton.textContent = "\u00d7";
  closeButton.append(particleField);
  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    emitParticles(particleField, CLICK_BURST_PARTICLES);
    playOneShot(SOUND_CONFIG.close);
    window.setTimeout(onClose, 120);
  });

  header.append(heading, closeButton);
  return header;
}

function createStatisticChart(): HTMLElement {
  const chart = document.createElement("div");
  chart.className = "stat-chart";

  if (appState.statistics.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No detected keywords for this page.";
    chart.append(empty);
    return chart;
  }

  const maxValue = Math.max(...appState.statistics.map((row) => row.value), 1);

  for (const row of appState.statistics) {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const barTrack = document.createElement("span");
    const barFill = document.createElement("span");
    const particleField = document.createElement("span");
    const value = document.createElement("span");
    const barWidth = Math.max(18, (row.value / maxValue) * 100);

    button.className = "stat-chart-row";
    button.type = "button";
    button.setAttribute("aria-label", row.keyword);
    label.className = "stat-chart-label";
    label.textContent = row.keyword;
    label.title = row.keyword;
    barTrack.className = "stat-chart-track";
    barTrack.style.setProperty("--stat-bar-width", `${barWidth}%`);
    barFill.className = "stat-chart-fill";
    barFill.style.setProperty("--stat-bar-width", `${barWidth}%`);
    barFill.dataset.value = "0";
    particleField.className = "stat-particle-field";
    particleField.setAttribute("aria-hidden", "true");
    value.className = "stat-chart-value";
    value.textContent = "0";

    const stopStatisticGlitch = connectStatisticRowGlitch(
      button,
      particleField,
    );
    statisticRowInteractionCleanups.push(stopStatisticGlitch);

    barFill.append(value);
    barTrack.append(barFill, particleField);
    button.append(label, barTrack);
    button.addEventListener("click", (event) => {
      if (activeStatisticDetailPopup) return;

      event.stopPropagation();
      emitParticles(particleField, CLICK_BURST_PARTICLES);
      stopStatisticGlitch();
      playOneShot(SOUND_CONFIG.statisticRow);
      window.setTimeout(() => renderStatisticDetailView(row), 70);
    });
    chart.append(button);
    animateStatisticValue(value, barFill, row.value);
  }

  return chart;
}

function animateStatisticValue(
  valueElement: HTMLElement,
  barFill: HTMLElement,
  targetValue: number,
): void {
  const startTime = performance.now();
  const duration = Math.max(1, STAT_BAR_ANIMATION_MS);

  const setValue = (nextValue: number): void => {
    const textValue = String(nextValue);
    valueElement.textContent = textValue;
    barFill.dataset.value = textValue;
  };

  setValue(0);

  const tick = (timestamp: number): void => {
    if (!valueElement.isConnected || !barFill.isConnected) return;

    const progress = Math.min((timestamp - startTime) / duration, 1);
    setValue(Math.round(targetValue * progress));

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
}

function connectStatisticRowGlitch(
  button: HTMLButtonElement,
  particleField: HTMLElement,
): () => void {
  let glitchTimer: number | null = null;
  let isHovering = false;
  const hoverSound = new HoverSoundController(
    SOUND_CONFIG.hoverStart,
    SOUND_CONFIG.hoverLoop,
  );

  const runGlitch = (): void => {
    scrambleGlitchSlices(button);
    emitParticles(particleField, STAT_HOVER_PARTICLES);
    glitchTimer = window.setTimeout(runGlitch, randomBetween(28, 92));
  };

  const stopGlitch = (): void => {
    if (glitchTimer) {
      window.clearTimeout(glitchTimer);
    }

    isHovering = false;
    glitchTimer = null;
    button.classList.remove("is-stat-bar-glitching");
    clearGlitchSliceProperties(button);
    hoverSound.stop();
  };

  button.addEventListener("mouseenter", () => {
    if (glitchTimer) return;

    isHovering = true;
    button.classList.add("is-stat-bar-glitching");
    hoverSound.start(() => isHovering);
    runGlitch();
  });
  button.addEventListener("mouseleave", stopGlitch);
  button.addEventListener("blur", stopGlitch);

  return stopGlitch;
}

function createStatisticDetailTable(row: StatisticChartRow): HTMLElement {
  const table = document.createElement("div");
  table.className = "stat-detail-table";

  for (const detail of row.details) {
    table.append(
      createDetailCell(detail.source),
      createDetailCell(detail.type),
      createDetailCell(String(detail.count)),
    );
  }

  return table;
}

function createDetailCell(text: string): HTMLSpanElement {
  const cell = document.createElement("span");
  cell.textContent = text;
  cell.title = text;
  return cell;
}

function createSettingsSection(): HTMLElement {
  const list = document.createElement("div");
  list.className = "settings-list";

  for (const setting of getSettingsRows()) {
    const row = document.createElement("div");
    const label = document.createElement("span");
    row.className = "setting-row";
    label.className = "setting-label";
    label.textContent = setting.label;
    row.append(label);

    if (setting.kind === "toggle") {
      row.append(createToggle(setting));
    } else {
      row.append(createThreshold(setting.value));
    }

    list.append(row);
  }

  return createSection("Settings", list);
}

function getSettingsRows(): SettingRow[] {
  return [
    {
      label: "Highlight:",
      kind: "toggle",
      key: "highlight",
      checked: appState.settings.highlight,
    },
    {
      label: "Blurred text",
      kind: "toggle",
      key: "blurText",
      checked: appState.settings.blurText,
    },
    {
      label: "OCR image detection",
      kind: "toggle",
      key: "ocr",
      checked: appState.settings.ocr,
    },
    {
      label: "Rabin-Karp comparison",
      kind: "toggle",
      key: "runRabinKarp",
      checked: appState.settings.runRabinKarp,
    },
    {
      label: "Aho-Corasick",
      kind: "toggle",
      key: "runAhoCorasick",
      checked: appState.settings.runAhoCorasick,
    },
    {
      label: "Fuzzy threshold",
      kind: "threshold",
      value: appState.settings.fuzzyThreshold,
    },
    {
      label: "Sound",
      kind: "toggle",
      key: "sound",
      checked: !appState.isMuted,
    },
  ];
}

function createSection(title: string, content: HTMLElement): HTMLElement {
  const section = document.createElement("section");
  const heading = document.createElement("h2");
  section.className = "content-section";
  heading.className = "section-title";
  heading.textContent = title;
  section.append(heading, content);
  return section;
}

function createGlitchButton(config: GlitchButtonConfig): HTMLButtonElement {
  const button = document.createElement("button");
  const size = config.size ?? "normal";
  button.type = "button";
  button.className = [
    "glitch-button",
    `glitch-button--${config.variant}`,
    size === "small" ? "glitch-button--small" : "",
  ]
    .filter(Boolean)
    .join(" ");
  button.disabled = Boolean(config.disabled);
  button.setAttribute("aria-label", config.label);
  button.dataset.soundSrc = config.sound?.src ?? DEFAULT_BUTTON_SOUND.src;
  button.dataset.soundVolume = String(
    config.sound?.volume ?? DEFAULT_BUTTON_SOUND.volume,
  );

  const stack = document.createElement("span");
  stack.className = "glitch-stack";
  stack.setAttribute("aria-hidden", "true");

  for (const layerName of ["base", "red", "cyan"]) {
    const layer = document.createElement("span");
    layer.className = `glitch-layer glitch-layer-${layerName}`;
    layer.dataset.label = config.label;
    stack.append(layer);
  }

  const particleField = document.createElement("span");
  particleField.className = "particle-field";
  particleField.setAttribute("aria-hidden", "true");

  button.append(stack, particleField);
  return button;
}

function createToggle(
  setting: Extract<SettingRow, { kind: "toggle" }>,
): HTMLElement {
  const wrapper = document.createElement("label");
  const toggleSound = createAudio(SOUND_CONFIG.toggle);
  const particleField = createClickParticleField("toggle-particle-field");
  wrapper.className = "toggle";
  wrapper.setAttribute("aria-label", setting.label);

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = setting.checked;
  input.addEventListener("change", () => {
    if (setting.key === "sound") {
      appState.isMuted = !input.checked;

      if (appState.isMuted) {
        resetAllButtonInteractions();
        stopAllAudio();
      }

      emitParticles(particleField, CLICK_BURST_PARTICLES);
      playAudioElement(toggleSound);
      void saveAudioMuted(appState.isMuted);
      return;
    }

    appState.settings = {
      ...appState.settings,
      [setting.key]: input.checked,
    };
    emitParticles(particleField, CLICK_BURST_PARTICLES);
    playAudioElement(toggleSound);
    void saveSettings(appState.settings);
    scheduleScan();
  });

  const track = document.createElement("span");
  track.className = "toggle-track";

  wrapper.append(input, track, particleField);
  return wrapper;
}

function createThreshold(value: number): HTMLElement {
  const threshold = document.createElement("input");
  threshold.className = "threshold-pill";
  threshold.type = "number";
  threshold.min = "0.5";
  threshold.max = "0.95";
  threshold.step = "0.05";
  threshold.value = value.toFixed(2);
  threshold.setAttribute("aria-label", "Fuzzy threshold");
  threshold.addEventListener("change", () => {
    const nextThreshold = clampFuzzyThreshold(Number(threshold.value));
    threshold.value = nextThreshold.toFixed(2);
    appState.settings = {
      ...appState.settings,
      fuzzyThreshold: nextThreshold,
    };
    void saveSettings(appState.settings);
    scheduleScan();
  });
  return threshold;
}

function clampFuzzyThreshold(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SCAN_SETTINGS.fuzzyThreshold;
  }

  return Math.min(0.95, Math.max(0.5, value));
}

function createTextSpan(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.textContent = text;
  span.title = text;
  return span;
}

function scheduleScan(): void {
  if (scheduledScanTimer !== null) {
    window.clearTimeout(scheduledScanTimer);
  }

  scheduledScanTimer = window.setTimeout(() => {
    scheduledScanTimer = null;

    if (appState.isScanning) {
      scheduleScan();
      return;
    }

    void scanActiveTab();
  }, TOGGLE_RESCAN_DELAY_MS);
}

async function scanActiveTab(): Promise<void> {
  appState.isScanning = true;
  appState.status = "Scanning...";
  appState.warnings = [];
  renderApp();

  try {
    const tab = await getActiveTab();

    if (!tab?.id) {
      throw new Error("No active tab was found.");
    }

    appState.currentPage = formatTabLabel(tab);
    renderApp();

    const response = await sendTabMessage<ScanResponse>(tab.id, {
      type: BETTER_SCAN_MESSAGE,
      settings: appState.settings,
    });

    if (!response.ok) {
      throw new Error(response.error);
    }

    applyScanResponse(response);
  } catch (error) {
    applyScanError(error);
  } finally {
    appState.isScanning = false;
    renderApp();
  }
}

async function clearActiveTab(): Promise<void> {
  try {
    const tab = await getActiveTab();

    if (tab?.id) {
      const response = await sendTabMessage<ClearResponse>(tab.id, {
        type: BETTER_CLEAR_MESSAGE,
      });

      if (!response.ok) {
        throw new Error(response.error ?? "Unable to clear scan results.");
      }

      appState.currentPage = formatTabLabel(tab);
    }

    appState.status = "Cleared";
    appState.loadedKeywordCount = 0;
    appState.matchedKeywordCount = 0;
    appState.totalMatches = 0;
    appState.totalExecutionTimeMs = 0;
    appState.matchRows = [];
    appState.statistics = [];
    appState.warnings = [];
  } catch (error) {
    appState.status = friendlyErrorMessage(error);
  } finally {
    renderApp();
  }
}

function applyScanResponse(response: ScanResponse & { ok: true }): void {
  appState.status =
    response.warnings.length > 0 ? "Scan complete with warnings" : "Scan complete";
  appState.currentPage = response.title || formatUrl(response.url);
  appState.loadedKeywordCount = response.loadedKeywordCount;
  appState.matchedKeywordCount = response.matchedKeywordCount;
  appState.totalMatches = response.totalMatches;
  appState.totalExecutionTimeMs = response.totalExecutionTimeMs;
  appState.matchRows = response.algorithms;
  appState.statistics = response.statistics;
  appState.warnings = response.warnings;
}

function applyScanError(error: unknown): void {
  appState.status = friendlyErrorMessage(error);
  appState.loadedKeywordCount = 0;
  appState.matchedKeywordCount = 0;
  appState.totalMatches = 0;
  appState.totalExecutionTimeMs = 0;
  appState.matchRows = [];
  appState.statistics = [];
  appState.warnings = ["Open a regular web page, then try again."];
}

function friendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/No active tab/.test(message)) {
    return "No active page";
  }

  return "Cannot scan this page";
}

function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  if (!hasChromeTabs()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(tabs[0] ?? null);
    });
  });
}

function sendTabMessage<TResponse>(
  tabId: number,
  message: unknown,
): Promise<TResponse> {
  if (!hasChromeTabs()) {
    return Promise.reject(new Error("Chrome extension APIs are unavailable."));
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      message,
      (response: TResponse | undefined) => {
        const error = chrome.runtime.lastError;

        if (error) {
          reject(new Error(error.message));
          return;
        }

        if (response === undefined) {
          reject(new Error("The page did not return a scan response."));
          return;
        }

        resolve(response);
      },
    );
  });
}

function hasChromeTabs(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.tabs?.sendMessage === "function"
  );
}

function formatTabLabel(tab: chrome.tabs.Tab): string {
  return tab.title?.trim() || formatUrl(tab.url ?? "");
}

function formatMatchSource(source: string): string {
  if (source === "dom-text") return "DOM Text";
  if (source === "image-ocr") return "Image OCR";
  return source;
}

function formatUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname || url;
  } catch {
    return url || "Unknown page";
  }
}

function formatMs(value: number): string {
  if (!Number.isFinite(value)) {
    return "0 ms";
  }

  if (value < 10) {
    return `${value.toFixed(1)} ms`;
  }

  return `${Math.round(value)} ms`;
}

function loadSettings(): Promise<ScanSettings> {
  if (typeof chrome === "undefined" || !chrome.storage?.sync) {
    return Promise.resolve({ ...DEFAULT_SCAN_SETTINGS });
  }

  return new Promise((resolve) => {
    chrome.storage.sync.get(BETTER_SETTINGS_KEY, (items) => {
      const storedSettings = items[BETTER_SETTINGS_KEY] as
        | Partial<ScanSettings>
        | undefined;
      resolve(normalizeSettings(storedSettings));
    });
  });
}

function saveSettings(settings: ScanSettings): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.sync) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    chrome.storage.sync.set({ [BETTER_SETTINGS_KEY]: settings }, () => {
      resolve();
    });
  });
}

function loadAudioMuted(): Promise<boolean> {
  if (typeof chrome === "undefined" || !chrome.storage?.sync) {
    return Promise.resolve(DEFAULT_AUDIO_MUTED);
  }

  return new Promise((resolve) => {
    chrome.storage.sync.get(BETTER_AUDIO_MUTED_KEY, (items) => {
      const storedValue = items[BETTER_AUDIO_MUTED_KEY];
      resolve(
        typeof storedValue === "boolean" ? storedValue : DEFAULT_AUDIO_MUTED,
      );
    });
  });
}

function saveAudioMuted(isMuted: boolean): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.sync) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    chrome.storage.sync.set({ [BETTER_AUDIO_MUTED_KEY]: isMuted }, () => {
      resolve();
    });
  });
}

function normalizeSettings(
  settings: Partial<ScanSettings> | undefined,
): ScanSettings {
  return {
    highlight:
      typeof settings?.highlight === "boolean"
        ? settings.highlight
        : DEFAULT_SCAN_SETTINGS.highlight,
    blurText:
      typeof settings?.blurText === "boolean"
        ? settings.blurText
        : DEFAULT_SCAN_SETTINGS.blurText,
    ocr:
      typeof settings?.ocr === "boolean"
        ? settings.ocr
        : DEFAULT_SCAN_SETTINGS.ocr,
    runRabinKarp:
      typeof settings?.runRabinKarp === "boolean"
        ? settings.runRabinKarp
        : DEFAULT_SCAN_SETTINGS.runRabinKarp,
    runAhoCorasick:
      typeof settings?.runAhoCorasick === "boolean"
        ? settings.runAhoCorasick
        : DEFAULT_SCAN_SETTINGS.runAhoCorasick,
    fuzzyThreshold:
      typeof settings?.fuzzyThreshold === "number"
        ? clampFuzzyThreshold(settings.fuzzyThreshold)
        : DEFAULT_SCAN_SETTINGS.fuzzyThreshold,
  };
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function initializePopup(): Promise<void> {
  applyPopupDimensions();
  applyColorPalette(COLOR_PALETTE);
  applyStatisticAnimationConfig();
  preloadGlitchFrames();
  appState.settings = await loadSettings();
  appState.isMuted = await loadAudioMuted();
  renderApp();
  await scanActiveTab();
}

window.addEventListener("blur", resetAllButtonInteractions);
window.addEventListener("pagehide", resetAllButtonInteractions);
window.addEventListener("focus", () => {
  resetAllButtonInteractions();
  void resumeAudio();
});
window.addEventListener("pageshow", () => {
  resetAllButtonInteractions();
  void resumeAudio();
});
window.addEventListener("load", schedulePopupViewportFit);
window.addEventListener("resize", schedulePopupViewportFit);
window.visualViewport?.addEventListener("resize", schedulePopupViewportFit);
void document.fonts?.ready.then(schedulePopupViewportFit);
document.addEventListener(
  "pointerdown",
  (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest(".popup-container, button, label, input")
    ) {
      void resumeAudio();
    }
  },
  true,
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    resetAllButtonInteractions();
  }
});

void initializePopup();
