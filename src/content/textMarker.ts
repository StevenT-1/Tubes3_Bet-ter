import type { MatchAlgorithm, MatchSource } from "../algorithms/types";
import type { ScanSettings } from "../shared/messages";
import type { TextNodeScan } from "./domScanner";

export const TEXT_MARK_CLASS = "better-judol-mark";
export const TEXT_TOOLTIP_CLASS = "better-judol-tooltip";

const HIGHLIGHT_CLASS = "better-judol-highlight";
const BLUR_CLASS = "better-judol-blur";
const TEXT_VALUE_CLASS = "better-judol-mark-text";
const STYLE_ID = "better-judol-highlight-style";
const MAX_MARKED_NODES = 350;
const TOOLTIP_MARGIN_PX = 10;
const TOOLTIP_OFFSET_PX = 14;

type MatchRange = {
  start: number;
  end: number;
  annotations: TextMatchAnnotation[];
};

export type TextMatchAnnotation = {
  start: number;
  end: number;
  keyword: string;
  matchedText: string;
  algorithm: MatchAlgorithm;
  source: MatchSource;
  count: number;
  executionTimeMs: number;
};

let activeTooltip: HTMLElement | null = null;

export function markTextMatches(
  textNodes: TextNodeScan[],
  annotations: TextMatchAnnotation[],
  settings: ScanSettings,
): void {
  injectTextMarkStyle();

  let markedNodeCount = 0;
  let textOffset = 0;

  for (const entry of textNodes) {
    if (markedNodeCount >= MAX_MARKED_NODES) {
      break;
    }

    const nodeStart = textOffset;
    textOffset += entry.text.length + 1;

    if (!entry.node.isConnected) {
      continue;
    }

    const ranges = findRangesForNode(annotations, nodeStart, entry.text.length);

    if (ranges.length === 0) {
      continue;
    }

    replaceTextNodeWithMarks(entry.node, entry.text, ranges, settings);
    markedNodeCount += 1;
  }
}

export function clearTextMarks(): void {
  hideTooltip();

  for (const mark of document.querySelectorAll(`.${TEXT_MARK_CLASS}`)) {
    const parent = mark.parentNode;

    if (!parent) {
      continue;
    }

    const originalText =
      mark instanceof HTMLElement
        ? mark.dataset.originalText ?? mark.textContent ?? ""
        : mark.textContent ?? "";
    parent.replaceChild(document.createTextNode(originalText), mark);
    parent.normalize();
  }
}

function findRangesForNode(
  annotations: TextMatchAnnotation[],
  nodeStart: number,
  nodeLength: number,
): MatchRange[] {
  const nodeEnd = nodeStart + nodeLength;
  const ranges = annotations
    .map((annotation) => annotationToRange(annotation, nodeStart, nodeEnd))
    .filter((range): range is MatchRange => Boolean(range))
    .sort((first, second) => first.start - second.start || second.end - first.end);

  const mergedRanges: MatchRange[] = [];

  for (const range of ranges) {
    const lastRange = mergedRanges[mergedRanges.length - 1];

    if (!lastRange || range.start >= lastRange.end) {
      mergedRanges.push(range);
      continue;
    }

    if (range.end > lastRange.end) {
      lastRange.end = range.end;
    }

    lastRange.annotations.push(...range.annotations);
  }

  return mergedRanges;
}

function annotationToRange(
  annotation: TextMatchAnnotation,
  nodeStart: number,
  nodeEnd: number,
): MatchRange | null {
  if (annotation.end <= nodeStart || annotation.start >= nodeEnd) {
    return null;
  }

  return {
    start: Math.max(annotation.start, nodeStart) - nodeStart,
    end: Math.min(annotation.end, nodeEnd) - nodeStart,
    annotations: [annotation],
  };
}

function replaceTextNodeWithMarks(
  node: Text,
  text: string,
  ranges: MatchRange[],
  settings: ScanSettings,
): void {
  const parent = node.parentNode;

  if (!parent) {
    return;
  }

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      fragment.append(document.createTextNode(text.slice(cursor, range.start)));
    }

    const mark = document.createElement("span");
    const matchedText = text.slice(range.start, range.end);
    mark.className = [
      TEXT_MARK_CLASS,
      settings.highlight ? HIGHLIGHT_CLASS : "",
      settings.blurText ? BLUR_CLASS : "",
    ]
      .filter(Boolean)
      .join(" ");
    mark.dataset.originalText = matchedText;
    mark.dataset.judolHighlight = "true";
    mark.dataset.judolTooltip = formatTooltipAnnotations(range.annotations);
    mark.append(createMarkedText(matchedText));
    connectTooltip(mark);

    fragment.append(mark);
    cursor = range.end;
  }

  if (cursor < text.length) {
    fragment.append(document.createTextNode(text.slice(cursor)));
  }

  parent.replaceChild(fragment, node);
}

function createMarkedText(text: string): HTMLElement {
  const textElement = document.createElement("span");
  textElement.className = TEXT_VALUE_CLASS;
  textElement.textContent = text;
  return textElement;
}

function formatTooltipAnnotations(annotations: TextMatchAnnotation[]): string {
  const lines = ["Detected:"];

  for (const annotation of annotations) {
    lines.push(
      `- Keyword: ${annotation.keyword}`,
      `  Matched text: ${annotation.matchedText}`,
      `  Algorithm/source: ${annotation.algorithm} / ${formatSource(annotation.source)}`,
      `  Occurrences: ${annotation.count}`,
      `  Execution time: ${formatMs(annotation.executionTimeMs)}`,
    );
  }

  return lines.join("\n");
}

function formatSource(source: MatchSource): string {
  return source === "dom-text" ? "DOM Text" : "Image OCR";
}

function formatMs(value: number): string {
  if (!Number.isFinite(value)) {
    return "0 ms";
  }

  return value < 10 ? `${value.toFixed(2)} ms` : `${Math.round(value)} ms`;
}

function connectTooltip(mark: HTMLElement): void {
  mark.addEventListener("mouseenter", (event) => {
    showTooltip(mark, event);
  });
  mark.addEventListener("mousemove", positionTooltip);
  mark.addEventListener("mouseleave", hideTooltip);
}

function showTooltip(mark: HTMLElement, event: MouseEvent): void {
  hideTooltip();

  const tooltipText = mark.dataset.judolTooltip;

  if (!tooltipText) {
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.className = TEXT_TOOLTIP_CLASS;
  tooltip.textContent = tooltipText;
  tooltip.setAttribute("role", "tooltip");
  document.documentElement.append(tooltip);
  activeTooltip = tooltip;
  positionTooltip(event);
}

function positionTooltip(event: MouseEvent): void {
  if (!activeTooltip) {
    return;
  }

  const tooltip = activeTooltip;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const rect = tooltip.getBoundingClientRect();
  let left = event.clientX + TOOLTIP_OFFSET_PX;
  let top = event.clientY + TOOLTIP_OFFSET_PX;

  if (left + rect.width + TOOLTIP_MARGIN_PX > viewportWidth) {
    left = event.clientX - rect.width - TOOLTIP_OFFSET_PX;
  }

  if (top + rect.height + TOOLTIP_MARGIN_PX > viewportHeight) {
    top = event.clientY - rect.height - TOOLTIP_OFFSET_PX;
  }

  const maxLeft = Math.max(
    TOOLTIP_MARGIN_PX,
    viewportWidth - rect.width - TOOLTIP_MARGIN_PX,
  );
  const maxTop = Math.max(
    TOOLTIP_MARGIN_PX,
    viewportHeight - rect.height - TOOLTIP_MARGIN_PX,
  );

  tooltip.style.left = `${Math.min(Math.max(TOOLTIP_MARGIN_PX, left), maxLeft)}px`;
  tooltip.style.top = `${Math.min(Math.max(TOOLTIP_MARGIN_PX, top), maxTop)}px`;
}

function hideTooltip(): void {
  activeTooltip?.remove();
  activeTooltip = null;
}

function injectTextMarkStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${TEXT_MARK_CLASS} {
      position: relative !important;
      display: inline !important;
    }

    .${TEXT_MARK_CLASS}.${HIGHLIGHT_CLASS} .${TEXT_VALUE_CLASS} {
      background: rgba(57, 194, 239, 0.36) !important;
      border-bottom: 2px solid #f9169c !important;
      border-radius: 2px !important;
      box-shadow: 0 0 0 1px rgba(249, 22, 156, 0.16) !important;
      color: inherit !important;
    }

    .${TEXT_MARK_CLASS}.${BLUR_CLASS} .${TEXT_VALUE_CLASS} {
      filter: blur(4px) saturate(0.85) !important;
      text-shadow: 0 0 8px currentColor !important;
      transition: filter 140ms ease !important;
      user-select: none !important;
    }

    .${TEXT_TOOLTIP_CLASS} {
      position: fixed !important;
      z-index: 2147483647 !important;
      max-width: min(360px, 80vw) !important;
      padding: 6px 8px !important;
      border: 1px solid rgba(57, 194, 239, 0.75) !important;
      border-radius: 4px !important;
      background: rgba(11, 11, 13, 0.94) !important;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28) !important;
      color: #ffffff !important;
      font: 12px/1.35 Arial, sans-serif !important;
      white-space: pre-line !important;
      pointer-events: none !important;
    }
  `;
  document.documentElement.append(style);
}