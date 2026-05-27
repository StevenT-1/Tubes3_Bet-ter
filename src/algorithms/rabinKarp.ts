const BASE = 31;
const MOD = 1_000_000_007;

import type { MatchResult, AlgorithmResult } from "./types";

export function runRabinKarp(text: string, keywords: string[]): AlgorithmResult {
    let allMatchedWords: MatchResult[] = [];
    let comparisonCount = 0;
    const startTime = performance.now();
    for (const keyword of keywords) {
        let currentResult = searchKeyword(text, keyword);
        allMatchedWords.push(...currentResult.matches);
        comparisonCount += currentResult.comparisonCount;
    }
    const endTime = performance.now();
    return {
        matches: allMatchedWords,
        executionTimeMs: endTime - startTime,
        comparisonCount,
        algorithm: "Rabin-Karp",
        source: "dom-text"
    };
}

function searchKeyword(text:string, keyword: string): {matches: MatchResult[], comparisonCount: number} {
    let matchedWords: MatchResult[] = [];

    if (keyword.length == 0 || keyword.length > text.length) {
        return {matches: matchedWords, comparisonCount: 0};
    }

    const keywordHashValue = computeHash(keyword, 0, keyword.length);
    let substrHashValue = computeHash(text, 0, keyword.length);

    let comparisonCount = 0;
    for (let i = 0; i <= text.length - keyword.length; i++) {
        if (i > 0) {
            substrHashValue = rollHash(substrHashValue, keyword.length, text.charCodeAt(i-1), text.charCodeAt(i-1 + keyword.length))
        }
        console.log({
            i,
            window: text.slice(i, i + keyword.length),
            substrHashValue,
            keywordHashValue,
            recomputedHash: computeHash(text, i, i + keyword.length)
        });

        if (substrHashValue == keywordHashValue) {
            //Do brute force match if hash value is the same
            let currentComparisonCount = 0;
            let isMatch = true;
            for (let j = 0; j < keyword.length; j++) {
                currentComparisonCount++;
                if (text.charAt(i + j) != keyword.charAt(j)) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                matchedWords.push({
                    keyword,
                    matchedText: text.slice(i, i + keyword.length),
                    startIndex: i,
                    endIndex: (i + keyword.length)
                })
                comparisonCount += currentComparisonCount;
            }

        }
    }

    return {matches: matchedWords, comparisonCount};
}

//inclusive start and exclusive end: [start, end)
function computeHash(s: string, start: number, end: number): number {
    let hashValue: number = 0;
    for (let i = start; i < end; i++) {
        hashValue = (hashValue * BASE + s.charCodeAt(i)) % MOD;
    }
    return hashValue;
}

function computePowerWithLimit(base: number, power: number, limit: number): number {
    let result = 1;
    for (let i = 0; i < power; i++) {
        result = (result * base) % limit;
    }
    return result;
}

function rollHash(hashValue: number, length: number, oldCharCode: number, newCharCode: number) {
    const reducedHashValue = (hashValue - oldCharCode * computePowerWithLimit(BASE, length-1, MOD)) % MOD
    const normHashValue = (reducedHashValue + MOD) % MOD;

    return (normHashValue * BASE + newCharCode) % MOD;
}

