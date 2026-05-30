import { TEXT_MARK_CLASS, TEXT_TOOLTIP_CLASS } from "./textMarker";

const MAX_TEXT_NODES_TO_SCAN = 2500;

const BLOCKED_TEXT_SELECTOR = [
  "script",
  "style",
  "noscript",
  "textarea",
  "input",
  "select",
  "option",
  '[contenteditable="true"]',
  `.${TEXT_MARK_CLASS}`,
  `.${TEXT_TOOLTIP_CLASS}`,
].join(", ");

export type TextNodeScan = {
  node: Text;
  text: string;
};

export function collectTextNodes(root: HTMLElement | null): TextNodeScan[] {
  if (!root) {
    return [];
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // TreeWalker asks this function about every text node it finds. Keeping the
    // filter here prevents scanning scripts, form fields, hidden text, and our
    // own marked spans.
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

  if (parent.closest(BLOCKED_TEXT_SELECTOR)) {
    return false;
  }

  const style = window.getComputedStyle(parent);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) !== 0
  );
}

export function reachedTextNodeLimit(nodes: TextNodeScan[]): boolean {
  return nodes.length >= MAX_TEXT_NODES_TO_SCAN;
}
