import {
    AlgorithmResult,
    MatchResult,
    MatchSource,
    algorithmResultGenerator,
    matchResultGenerator,
} from "./types";

function buildLongestPrefixSuffix(keyword: string): number[] {
    const table = new Array<number>(keyword.length).fill(0);
    let prefixLength = 0;
    let index = 1;

    while (index < keyword.length) {
        if (keyword[index] === keyword[prefixLength]) {
            prefixLength += 1;
            table[index] = prefixLength;
            index += 1;
            continue;
        }

        if (prefixLength > 0) {
            prefixLength = table[prefixLength - 1];
            continue;
        }

        table[index] = 0;
        index += 1;
    }

    return table;
}

export function searchKMP(
    keywords: string[],
    text: string,
    sourceType: MatchSource,
    caseInsensitive: boolean,
): AlgorithmResult {
    const start = performance.now();
    const matches: MatchResult[] = [];
    let comparisonCount = 0;
    const searchableText = caseInsensitive ? text.toLowerCase() : text;

    for (const keyword of keywords) {
        if (keyword.length === 0) {
            continue;
        }

        const searchableKeyword = caseInsensitive ? keyword.toLowerCase() : keyword;
        const keywordLength = searchableKeyword.length;
        const longestPrefixSuffix = buildLongestPrefixSuffix(searchableKeyword);
        let textIndex = 0;
        let keywordIndex = 0;

        while (textIndex < searchableText.length) {
            comparisonCount += 1;

            if (searchableKeyword[keywordIndex] === searchableText[textIndex]) {
                textIndex += 1;
                keywordIndex += 1;

                if (keywordIndex === keywordLength) {
                    const matchStart = textIndex - keywordLength;
                    matches.push(
                        matchResultGenerator(
                            keyword,
                            text.slice(matchStart, textIndex),
                            matchStart,
                            textIndex - 1,
                        ),
                    );
                    keywordIndex = longestPrefixSuffix[keywordIndex - 1];
                }

                continue;
            }

            if (keywordIndex > 0) {
                keywordIndex = longestPrefixSuffix[keywordIndex - 1];
            } else {
                textIndex += 1;
            }
        }
    }

    return algorithmResultGenerator(
        matches,
        performance.now() - start,
        comparisonCount,
        "KMP",
        sourceType,
    );
}
