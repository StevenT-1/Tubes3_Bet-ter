let cachedKeywords: string[] | null = null;

export async function loadKeywords(): Promise<string[]> {
    if (cachedKeywords !== null) {
        return cachedKeywords;
    }
    
    const keywordFileUrl = chrome.runtime.getURL("keywords/keyword.txt");
    const response = await fetch(keywordFileUrl);

    if (!response.ok) {
        throw new Error(
            `[keywordLoader] loadKeywords failed to load keyword.txt.\n
            Status: ${response.status}`
        );
    }

    const rawText = await response.text();
    cachedKeywords = parseKeywords(rawText);
    return cachedKeywords;
}

export function parseKeywords(rawText: string): string[] {
    return rawText.split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
}