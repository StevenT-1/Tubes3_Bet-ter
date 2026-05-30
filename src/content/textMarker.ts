import { searchKMP } from "../algorithms/kmp";
import type { MatchResult } from "../algorithms/types";
import type { ScanSettings } from "../shared/messages";
import type { TextNodeScan } from "./domScanner";

export const TEXT_MARK_CLASS = "better-judol-mark";

const HIGHLIGHT_CLASS = "better-judol-highlight";
const BLUR_CLASS = "better-judol-blur";
const STYLE_ID = "better-judol-highlight-style";
const MAX_MARKED_NODES = 350;

type MatchRange = {
  start: number;
  end: number;
};

export function markTextMatches(
  textNodes: TextNodeScan[],
  keywords: string[],
  settings: ScanSettings,
): void {
  injectTextMarkStyle();

  let markedNodeCount = 0;

  for (const entry of textNodes) {
    if (markedNodeCount >= MAX_MARKED_NODES) {
      break;
    }

    if (!entry.node.isConnected) {
      continue;
    }

    const ranges = findRangesInText(entry.text, keywords);

    if (ranges.length === 0) {
      continue;
    }

    replaceTextNodeWithMarks(entry.node, entry.text, ranges, settings);
    markedNodeCount += 1;
  }
}

export function clearTextMarks(): void {
  for (const mark of document.querySelectorAll(`.${TEXT_MARK_CLASS}`)) {
    const parent = mark.parentNode;

    if (!parent) {
      continue;
    }

    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function findRangesInText(text: string, keywords: string[]): MatchRange[] {
  const result = searchKMP(keywords, text, "dom-text", true);
  const ranges = result.matches
    .map((match) => matchToRange(match))
    .filter((range): range is MatchRange => Boolean(range))
    .sort((first, second) => first.start - second.start || second.end - first.end);
  const mergedRanges: MatchRange[] = [];

  for (const range of ranges) {
    const lastRange = mergedRanges[mergedRanges.length - 1];

    if (!lastRange || range.start >= lastRange.end) {
      mergedRanges.push(range);
    } else if (range.end > lastRange.end) {
      lastRange.end = range.end;
    }
  }

  return mergedRanges;
}

function matchToRange(match: MatchResult): MatchRange | null {
  if (
    typeof match.startIndex !== "number" ||
    typeof match.endIndex !== "number" ||
    match.endIndex < match.startIndex
  ) {
    return null;
  }

  return {
    start: match.startIndex,
    end: match.endIndex + 1,
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
    mark.className = [
      TEXT_MARK_CLASS,
      settings.highlight ? HIGHLIGHT_CLASS : "",
      settings.blurText ? BLUR_CLASS : "",
    ]
      .filter(Boolean)
      .join(" ");
    mark.textContent = text.slice(range.start, range.end);
    fragment.append(mark);
    cursor = range.end;
  }

  if (cursor < text.length) {
    fragment.append(document.createTextNode(text.slice(cursor)));
  }

  parent.replaceChild(fragment, node);
}

function injectTextMarkStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      background: rgba(57, 194, 239, 0.36) !important;
      border-bottom: 2px solid #f9169c !important;
      border-radius: 2px !important;
      box-shadow: 0 0 0 1px rgba(249, 22, 156, 0.16) !important;
      color: inherit !important;
    }

    .${TEXT_MARK_CLASS}.${BLUR_CLASS} {
      filter: blur(3px) !important;
      transition: filter 140ms ease !important;
    }

    .${TEXT_MARK_CLASS}.${BLUR_CLASS}:hover {
      filter: blur(0) !important;
    }
  `;
  document.documentElement.append(style);
}
