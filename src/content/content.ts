import { searchKMP } from "../algorithms/kmp";
import type { AlgorithmResult, MatchResult } from "../algorithms/types";
import type {
  ClearResponse,
  ExtensionMessage,
  ScanResponse,
  ScanSettings,
  ScanSuccessResponse,
  StatisticChartRow,
  StatisticDetailRow,
} from "../shared/messages";

const BETTER_SCAN_MESSAGE = "BETTER_SCAN";
const BETTER_CLEAR_MESSAGE = "BETTER_CLEAR";
const DEFAULT_SCAN_SETTINGS: ScanSettings = {
  highlight: true,
  blurText: false,
  ocr: true,
  fuzzyThreshold: 0.7,
};
const HIGHLIGHT_CLASS = "better-judol-highlight";
const BLUR_CLASS = "better-judol-blur";
const STYLE_ID = "better-judol-highlight-style";
const MAX_TEXT_NODES_TO_SCAN = 2500;
const MAX_HIGHLIGHTED_NODES = 350;

type TextNodeScan = {
  node: Text;
  text: string;
};

type MatchRange = {
  start: number;
  end: number;
};

let keywordCache: string[] | null = null;

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ScanResponse | ClearResponse) => void,
  ) => {
    if (message.type === BETTER_SCAN_MESSAGE) {
      void scanPage(message.settings)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            ok: false,
            error: friendlyError(error),
            url: window.location.href,
            title: document.title,
          });
        });
      return true;
    }

    if (message.type === BETTER_CLEAR_MESSAGE) {
      try {
        clearHighlights();
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({ ok: false, error: friendlyError(error) });
      }
    }

    return false;
  },
);

async function scanPage(settings: ScanSettings): Promise<ScanResponse> {
  const normalizedSettings = normalizeSettings(settings);
  const warnings: string[] = [];
  const keywords = await loadKeywords();
  const textNodes = collectTextNodes(document.body);

  if (textNodes.length >= MAX_TEXT_NODES_TO_SCAN) {
    warnings.push("Large page detected; scan limited to visible text.");
  }

  clearHighlights();

  const scanText = textNodes.map((entry) => entry.text).join("\n");
  const kmpResult = searchKMP(keywords, scanText, "dom-text", true);
  const algorithms = [kmpResult];
  const statistics = buildStatistics(algorithms);

  if (normalizedSettings.highlight || normalizedSettings.blurText) {
    highlightMatches(textNodes, keywords, normalizedSettings);
  }

  if (normalizedSettings.ocr) {
    warnings.push("OCR image detection is enabled in the UI but not implemented yet.");
  }

  return {
    ok: true,
    url: window.location.href,
    title: document.title,
    scannedAt: Date.now(),
    loadedKeywordCount: keywords.length,
    matchedKeywordCount: statistics.length,
    totalMatches: countTotalMatches(algorithms),
    totalExecutionTimeMs: sumExecutionTime(algorithms),
    algorithms: algorithms.map((result) => ({
      algorithm: result.algorithm,
      source: result.source,
      matches: result.matches.length,
      executionTimeMs: result.executionTimeMs,
      comparisonCount: result.comparisonCount,
    })),
    statistics,
    warnings,
  } satisfies ScanSuccessResponse;
}

async function loadKeywords(): Promise<string[]> {
  if (keywordCache) {
    return keywordCache;
  }

  const keywordUrl = chrome.runtime.getURL("keywords/keyword.txt");
  const response = await fetch(keywordUrl);

  if (!response.ok) {
    throw new Error(`Failed to load keywords (${response.status}).`);
  }

  const keywordText = await response.text();
  keywordCache = keywordText
    .split(/\r?\n/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return keywordCache;
}

function collectTextNodes(root: HTMLElement | null): TextNodeScan[] {
  if (!root) {
    return [];
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node instanceof Text) || !node.nodeValue?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      if (!isScannableTextNode(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: TextNodeScan[] = [];

  while (nodes.length < MAX_TEXT_NODES_TO_SCAN) {
    const node = walker.nextNode();

    if (!node) break;

    nodes.push({
      node: node as Text,
      text: node.textContent ?? "",
    });
  }

  return nodes;
}

function isScannableTextNode(node: Text): boolean {
  const parent = node.parentElement;

  if (!parent) {
    return false;
  }

  if (
    parent.closest(
      `script, style, noscript, textarea, input, select, option, [contenteditable="true"], .${HIGHLIGHT_CLASS}`,
    )
  ) {
    return false;
  }

  const style = window.getComputedStyle(parent);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) !== 0
  );
}

function highlightMatches(
  textNodes: TextNodeScan[],
  keywords: string[],
  settings: ScanSettings,
): void {
  injectHighlightStyle();

  let highlightedNodeCount = 0;

  for (const entry of textNodes) {
    if (!entry.node.isConnected || highlightedNodeCount >= MAX_HIGHLIGHTED_NODES) {
      break;
    }

    const ranges = findRangesInText(entry.text, keywords);

    if (ranges.length === 0) {
      continue;
    }

    replaceTextNodeWithHighlights(entry.node, entry.text, ranges, settings);
    highlightedNodeCount += 1;
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

function replaceTextNodeWithHighlights(
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
      HIGHLIGHT_CLASS,
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

function clearHighlights(): void {
  for (const mark of document.querySelectorAll(`.${HIGHLIGHT_CLASS}`)) {
    const parent = mark.parentNode;

    if (!parent) {
      continue;
    }

    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function injectHighlightStyle(): void {
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

    .${HIGHLIGHT_CLASS}.${BLUR_CLASS} {
      filter: blur(3px) !important;
      transition: filter 140ms ease !important;
    }

    .${HIGHLIGHT_CLASS}.${BLUR_CLASS}:hover {
      filter: blur(0) !important;
    }
  `;
  document.documentElement.append(style);
}

function buildStatistics(results: AlgorithmResult[]): StatisticChartRow[] {
  const byKeyword = new Map<string, StatisticDetailRow[]>();

  for (const result of results) {
    const matchCounts = new Map<string, number>();

    for (const match of result.matches) {
      const keyword = match.keyword;
      matchCounts.set(keyword, (matchCounts.get(keyword) ?? 0) + 1);
    }

    for (const [keyword, count] of matchCounts) {
      const details = byKeyword.get(keyword) ?? [];
      details.push({
        source: result.algorithm,
        type: result.source === "dom-text" ? "Text" : "OCR",
        count,
      });
      byKeyword.set(keyword, details);
    }
  }

  return [...byKeyword.entries()]
    .map(([keyword, details]) => ({
      keyword,
      value: details.reduce((total, detail) => total + detail.count, 0),
      details,
    }))
    .sort((first, second) => second.value - first.value || first.keyword.localeCompare(second.keyword))
    .slice(0, 24);
}

function countTotalMatches(results: AlgorithmResult[]): number {
  return results.reduce((total, result) => total + result.matches.length, 0);
}

function sumExecutionTime(results: AlgorithmResult[]): number {
  return results.reduce((total, result) => total + result.executionTimeMs, 0);
}

function normalizeSettings(settings: Partial<ScanSettings> | undefined): ScanSettings {
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
    fuzzyThreshold:
      typeof settings?.fuzzyThreshold === "number"
        ? Math.min(1, Math.max(0, settings.fuzzyThreshold))
        : DEFAULT_SCAN_SETTINGS.fuzzyThreshold,
  };
}

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
