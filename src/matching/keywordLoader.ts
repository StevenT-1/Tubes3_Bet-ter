let keywordCache: string[] | null = null;

export async function loadKeywords(): Promise<string[]> {
  if (keywordCache !== null) {
    return keywordCache;
  }

  const keywordUrl = chrome.runtime.getURL("keywords/keyword.txt");
  const response = await fetch(keywordUrl);

  if (!response.ok) {
    throw new Error(`Failed to load keywords (${response.status}).`);
  }

  keywordCache = parseKeywords(await response.text());
  return keywordCache;
}

export function parseKeywords(rawText: string): string[] {
  const keywords: string[] = [];
  const seenKeywords = new Set<string>();

  for (const line of rawText.split(/\r?\n/)) {
    const keyword = line.trim();

    if (!keyword) {
      continue;
    }

    const normalizedKeyword = keyword.toLowerCase();

    if (seenKeywords.has(normalizedKeyword)) {
      continue;
    }

    seenKeywords.add(normalizedKeyword);
    keywords.push(keyword);
  }

  return keywords;
}
