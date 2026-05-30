import * as Model from "./levenshteinModel";
import { AlgorithmResult, MatchResult, MatchSource, matchResultGenerator, algorithmResultGenerator } from "./types";

const FUZZY_DISTANCE_DIVISOR = 4;

function containsChar(group: string[], target: string): boolean {
    for (let i = 0; i < group.length; i++) {
        if (group[i] === target) {
            return true;
        }
    }

    return false;
}

function createFixedCostModel(): Model.CostModel {
    const substitutionCosts = new Map<Model.PairKey, number>();
    const insertionCosts = new Map<string, number>();
    const deletionCosts = new Map<string, number>();

    const DEFAULT_SUBSTITUTION_COST = 1.0;
    const DEFAULT_INSERTION_COST = 1.0;
    const DEFAULT_DELETION_COST = 1.0;

    const LATIN_CASE_COST = 0.15;
    const GREEK_CASE_COST = 0.15;
    const ACCENT_DIFFERENCE_COST = 0.2;
    const VISUALLY_SIMILAR_COST = 0.3;
    const SYMBOL_SIMILAR_COST = 0.4;
    const ADJACENT_DIGIT_COST = 0.75;

    const SYMBOL_INSERT_DELETE_COST = 0.7;
    const WHITESPACE_INSERT_DELETE_COST = 0.3;
    const DIGIT_INSERT_DELETE_COST = 0.9;
    const LETTER_INSERT_DELETE_COST = 1.0;

    const allCharacters = new Set<string>([
    ...Model.LATIN_LOWER,
    ...Model.LATIN_UPPER,
    ...Model.GREEK_LOWER,
    ...Model.GREEK_UPPER,
    ...Model.DIGITS,
    ...Model.SYMBOLS,
    ...Model.WHITESPACE,
    ]);

    for (const char of allCharacters) {
        if (containsChar(Model.WHITESPACE, char)) {
            insertionCosts.set(char, WHITESPACE_INSERT_DELETE_COST);
            deletionCosts.set(char, WHITESPACE_INSERT_DELETE_COST);
        } else if (containsChar(Model.SYMBOLS, char)) {
            insertionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
            deletionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
        } else if (containsChar(Model.DIGITS, char)) {
            insertionCosts.set(char, DIGIT_INSERT_DELETE_COST);
            deletionCosts.set(char, DIGIT_INSERT_DELETE_COST);
        } else {
            insertionCosts.set(char, LETTER_INSERT_DELETE_COST);
            deletionCosts.set(char, LETTER_INSERT_DELETE_COST);
        }
    }

    // Substitusi huruf latin besar-kecil
    for (let i = 0; i < Model.LATIN_LOWER.length; i++) {
    Model.addSubstitution(
        substitutionCosts,
        Model.LATIN_LOWER[i],
        Model.LATIN_UPPER[i],
        LATIN_CASE_COST,
        true
        );
    }

    // Substituis huruf yunani besar kecil
    for (let i = 0; i < Model.GREEK_LOWER.length; i++) {
    Model.addSubstitution(
        substitutionCosts,
        Model.GREEK_LOWER[i],
        Model.GREEK_UPPER[i],
        GREEK_CASE_COST,
        true
        );
    }

    // Sigma yunani
    Model.addSubstitution(substitutionCosts, "σ", "ς", GREEK_CASE_COST, true);
    Model.addSubstitution(substitutionCosts, "Σ", "ς", GREEK_CASE_COST, true);

    // Aksen latin
    const accentGroups: string[][] = [
        ["a", "A", "á", "Á", "à", "À", "â", "Â", "ä", "Ä", "ã", "Ã", "å", "Å"],
        ["e", "E", "é", "É", "è", "È", "ê", "Ê", "ë", "Ë"],
        ["i", "I", "í", "Í", "ì", "Ì", "î", "Î", "ï", "Ï"],
        ["o", "O", "ó", "Ó", "ò", "Ò", "ô", "Ô", "ö", "Ö", "õ", "Õ"],
        ["u", "U", "ú", "Ú", "ù", "Ù", "û", "Û", "ü", "Ü"],
        ["c", "C", "ç", "Ç"],
        ["n", "N", "ñ", "Ñ"],
        ["y", "Y", "ý", "Ý", "ÿ"],
    ];

    for (const group of accentGroups) {
        for (const char of group) {
            allCharacters.add(char);
            insertionCosts.set(char, LETTER_INSERT_DELETE_COST);
            deletionCosts.set(char, LETTER_INSERT_DELETE_COST);
        }

        Model.addGroupSubstitution(substitutionCosts, group, ACCENT_DIFFERENCE_COST);
    }

    // Grup dengan bentuk visual yang mirip
    const visualGroups: string[][] = [
        ["o", "O", "0", "ο", "Ο"],
        ["i", "I", "l", "1", "|"],
        ["s", "S", "5", "$"],
        ["a", "A", "4", "@"],
        ["e", "E", "3"],
        ["b", "B", "8"],
        ["g", "G", "9"],
        ["t", "T", "7", "+"],
        ["x", "X", "*"],
        ["z", "Z", "2"],
        ["q", "Q", "9"],
        ["p", "P", "ρ", "Ρ"],
        ["v", "V", "ν", "Ν"],
        ["u", "U", "μ", "Μ"],
        ["y", "Y", "γ", "Υ"],
        ["h", "H", "η", "Η"],
    ];

    for (const group of visualGroups) {
        Model.addGroupSubstitution(substitutionCosts, group, VISUALLY_SIMILAR_COST);
    }

    // Grup simbol yang mirip
    const symbolGroups: string[][] = [
        ["-", "_", "–", "—"],
        ["'", "`", "‘", "’"],
        ['"', "“", "”"],
        [".", ",", ":", ";"],
        ["(", "[", "{", "<"],
        [")", "]", "}", ">"],
        ["/", "\\", "|"],
        ["!", "¡"],
        ["?", "¿"],
    ];

    for (const group of symbolGroups) {
        for (const char of group) {
        allCharacters.add(char);
        insertionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
        deletionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
        }

        Model.addGroupSubstitution(substitutionCosts, group, SYMBOL_SIMILAR_COST);
    }

    // Grup dengan substitusi angka
    for (let i = 0; i < Model.DIGITS.length - 1; i++) {
        Model.addSubstitution(
            substitutionCosts,
            Model.DIGITS[i],
            Model.DIGITS[i + 1],
            ADJACENT_DIGIT_COST,
            true
        );
    }

function substitutionCost(from: string, to: string): number {
    if (from === to) {
    return 0.0;
}

return (
        substitutionCosts.get(Model.makePairKey(from, to)) ??
        DEFAULT_SUBSTITUTION_COST
    );
}

function insertionCost(char: string): number {
    return insertionCosts.get(char) ?? DEFAULT_INSERTION_COST;
}

function deletionCost(char: string): number {
    return deletionCosts.get(char) ?? DEFAULT_DELETION_COST;
}

    return {
        substitutionCost,
        insertionCost,
        deletionCost,
    };
}

export function tokenizeGraphemes(text: string): string[] {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme",
    });

        return Array.from(segmenter.segment(text), part => part.segment);
    }

    return Array.from(text);
}

const FIXED_COST_MODEL = createFixedCostModel();

export function weightedLevenshtein(
    source: string,
    target: string,
    unicodeForm: Model.UnicodeForm = "NFC"
): number {
    const normalization = unicodeForm;

    const s = tokenizeGraphemes(source.normalize(normalization));
    const t = tokenizeGraphemes(target.normalize(normalization));

    const n = s.length;
    const m = t.length;

    const costModel = FIXED_COST_MODEL;

    let previous = new Array<number>(m + 1).fill(0);
    let current = new Array<number>(m + 1).fill(0);

    for (let j = 1; j <= m; j++) {
        previous[j] = previous[j - 1] + costModel.insertionCost(t[j - 1]);
    }

    for (let i = 1; i <= n; i++) {
        current[0] = previous[0] + costModel.deletionCost(s[i - 1]);

        for (let j = 1; j <= m; j++) {
            const deleteCost = previous[j] + costModel.deletionCost(s[i - 1]);
            const insertCost = current[j - 1] + costModel.insertionCost(t[j - 1]);
            const substituteCost = previous[j - 1] + costModel.substitutionCost(s[i - 1], t[j - 1]);

            current[j] = Math.min(deleteCost, insertCost, substituteCost);
        }

        [previous, current] = [current, previous];
    }

    return previous[m];
}

type TextToken = {
    text: string;
    normalizedText: string;
    startIndex: number;
    endIndex: number;
    length: number;
};

const TOKEN_CHARACTER_PATTERN = /[\p{L}\p{N}]/u;
const DIGIT_PATTERN = /\d/u;
const NON_ASCII_PATTERN = /[^\x00-\x7F]/u;
const REPEATED_CHARACTER_PATTERN = /(.)\1/u;

function isTokenCharacter(char: string): boolean {
    return TOKEN_CHARACTER_PATTERN.test(char);
}

function collectCandidateTokens(text: string, caseInsensitive: boolean): TextToken[] {
    const tokens: TextToken[] = [];
    let token = "";
    let tokenStartIndex = 0;

    for (let index = 0; index <= text.length; index += 1) {
        const char = text[index] ?? "";

        if (char && isTokenCharacter(char)) {
            if (token.length === 0) {
                tokenStartIndex = index;
            }

            token += char;
            continue;
        }

        if (token.length === 0) {
            continue;
        }

        tokens.push({
            text: token,
            normalizedText: caseInsensitive ? token.toLowerCase() : token,
            startIndex: tokenStartIndex,
            endIndex: tokenStartIndex + token.length - 1,
            length: tokenizeGraphemes(token).length,
        });
        token = "";
    }

    return tokens;
}

function isCandidateWorthChecking(keyword: string, token: TextToken): boolean {
    if (token.length < 3 || token.normalizedText === keyword) {
        return false;
    }

    const keywordLength = tokenizeGraphemes(keyword).length;
    const lengthDifference = Math.abs(token.length - keywordLength);
    const maxLengthDifference = Math.max(2, Math.ceil(keywordLength * 0.45));

    if (lengthDifference > maxLengthDifference) {
        return false;
    }

    return hasSuspiciousCharacters(token.normalizedText);
}

function hasSuspiciousCharacters(token: string): boolean {
    return (
        DIGIT_PATTERN.test(token) ||
        NON_ASCII_PATTERN.test(token) ||
        REPEATED_CHARACTER_PATTERN.test(token)
    );
}

function isFuzzyMatch(distance: number, token: TextToken): boolean {
    return distance < token.length / FUZZY_DISTANCE_DIVISOR;
}

function getCachedDistance(
    cache: Map<string, number>,
    keyword: string,
    token: string,
): number {
    const cacheKey = `${keyword}\n${token}`;
    const cachedDistance = cache.get(cacheKey);

    if (cachedDistance !== undefined) {
        return cachedDistance;
    }

    const distance = weightedLevenshtein(keyword, token);
    cache.set(cacheKey, distance);
    return distance;
}

export function searchWeightedLevenshtein (
    keywords: string[],
    text: string,
    sourceType: MatchSource,
    caseInsensitive: boolean,
) : AlgorithmResult
{
    const start = performance.now();
    const finRes: MatchResult[] = [];
    const tokens = collectCandidateTokens(text, caseInsensitive);
    const distanceCache = new Map<string, number>();
    const seenMatches = new Set<string>();
    let comparisonCount = 0;

    for (const keyword of keywords) {
        let cKeyword = keyword;
        if (caseInsensitive)
        {
            cKeyword = keyword.toLowerCase();
        }

        if (cKeyword.length === 0) {
            continue;
        }

        for (const token of tokens) {
            if (!isCandidateWorthChecking(cKeyword, token)) {
                continue;
            }

            comparisonCount += 1;
            const distance = getCachedDistance(
                distanceCache,
                cKeyword,
                token.normalizedText,
            );
            if (!isFuzzyMatch(distance, token)) {
                continue;
            }

            const similarity =
                1 - distance / Math.max(cKeyword.length, token.normalizedText.length);

            const matchKey = `${keyword}\n${token.startIndex}\n${token.endIndex}`;
            if (seenMatches.has(matchKey)) {
                continue;
            }

            seenMatches.add(matchKey);
            finRes.push(
                matchResultGenerator(
                    keyword,
                    token.text,
                    token.startIndex,
                    token.endIndex,
                    distance,
                    similarity,
                )
            );
        }
    }

    const end = performance.now();
    const algoRes: AlgorithmResult = (
        algorithmResultGenerator
        (
            finRes,
            end - start,
            comparisonCount,
            "Weighted-Levenshtein",
            sourceType
        )
    )
    return algoRes;
}
