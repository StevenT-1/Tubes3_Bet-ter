import * as Model from "./levenshteinModel";

export function createFixedCostModel(): Model.CostModel {
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
        if (Model.WHITESPACE.includes(char)) {
            insertionCosts.set(char, WHITESPACE_INSERT_DELETE_COST);
            deletionCosts.set(char, WHITESPACE_INSERT_DELETE_COST);
        } else if (Model.SYMBOLS.includes(char)) {
            insertionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
            deletionCosts.set(char, SYMBOL_INSERT_DELETE_COST);
        } else if (Model.DIGITS.includes(char)) {
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