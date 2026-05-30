export type UnicodeForm = "NFC" | "NFD" | "NFKC" | "NFKD";

export type PairKey = string;

export interface WeightedLevenshteinOptions {
    unicodeNormalization?: UnicodeForm;
}

export interface CostModel {
    substitutionCost: (from: string, to: string) => number;
    insertionCost: (char: string) => number;
    deletionCost: (char: string) => number;
}

export const PAIR_SEPARATOR = "\u0000";

export function makePairKey(from: string, to: string): PairKey {
    return `${from}${PAIR_SEPARATOR}${to}`;
}

export function addSubstitution(
    map: Map<PairKey, number>,
    from: string,
    to: string,
    cost: number,
    symmetric = true
): void {
    map.set(makePairKey(from, to), cost);

    if (symmetric) {
        map.set(makePairKey(to, from), cost);
    }
}

export function addGroupSubstitution(
    map: Map<PairKey, number>,
    group: string[],
    cost: number
): void {
    for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
            addSubstitution(map, group[i], group[j], cost, true);
        }
    }
}

export const LATIN_LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");
export const LATIN_UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export const DIGITS = Array.from("0123456789");

export const GREEK_LOWER = Array.from("αβγδεζηθικλμνξοπρστυφχψω");
export const GREEK_UPPER = Array.from("ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ");

export const SYMBOLS = Array.from(
  "!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~"
);

export const WHITESPACE = [" ", "\t", "\n", "\r"];