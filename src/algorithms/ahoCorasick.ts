import { MatchResult, MatchSource, matchResultGenerator, AlgorithmResult, algorithmResultGenerator } from './types';

type AhoCorasickNode = {
    children: Map<string, number>;
    fail: number;
    outputs: number[];
}

function nodeGenerator(): AhoCorasickNode
{
    return {
        children: new Map<string, number>(),
        fail: 0,
        outputs: []
    }
}

function buildAutomaton(keywords: string[]): AhoCorasickNode[]
{
    let trie: AhoCorasickNode[] = [nodeGenerator()];
    let keywordIdx = 0;

    for (keywordIdx = 0; keywordIdx < keywords.length; keywordIdx++)
    {
        let keyword = keywords[keywordIdx];

        if (keyword.length == 0)
        {
            continue;
        }

        let currentNode = 0;
        let charIdx = 0;
        for (charIdx = 0; charIdx < keyword.length; charIdx++)
        {
            let currentChar = keyword[charIdx];
            let nextNode = trie[currentNode].children.get(currentChar);

            if (nextNode === undefined)
            {
                nextNode = trie.length;
                trie[currentNode].children.set(currentChar, nextNode);
                trie.push(nodeGenerator());
            }

            currentNode = nextNode;
        }

        trie[currentNode].outputs.push(keywordIdx);
    }

    let queue: number[] = [];
    trie[0].children.forEach((childNode: number) => {
        trie[childNode].fail = 0;
        queue.push(childNode);
    });

    let queueIdx = 0;
    while (queueIdx < queue.length)
    {
        let currentNode = queue[queueIdx];
        ++queueIdx;

        trie[currentNode].children.forEach((nextNode: number, currentChar: string) => {
            let failNode = trie[currentNode].fail;

            while (failNode != 0 && trie[failNode].children.get(currentChar) === undefined)
            {
                failNode = trie[failNode].fail;
            }

            let failNextNode = trie[failNode].children.get(currentChar);
            if (failNextNode !== undefined && failNextNode != nextNode)
            {
                trie[nextNode].fail = failNextNode;
            }
            else
            {
                trie[nextNode].fail = 0;
            }

            trie[nextNode].outputs = trie[nextNode].outputs.concat(trie[trie[nextNode].fail].outputs);
            queue.push(nextNode);
        });
    }

    return trie;
}

export function searchAhoCorasick (
    keywords: string[],
    text: string,
    sourceType: MatchSource,
    caseInsensitive: boolean
): AlgorithmResult
{
    let start = performance.now();
    let finRes: MatchResult[] = [];
    let comparisonCount = 0;

    let sText: string = text;
    let cKeywords: string[] = keywords.slice();
    if (caseInsensitive)
    {
        sText = sText.toLowerCase();
        cKeywords = keywords.map((keyword: string): string => keyword.toLowerCase());
    }

    let trie = buildAutomaton(cKeywords);
    let matchesByKeyword: number[][] = [];
    let keyIdx = 0;
    for (keyIdx = 0; keyIdx < cKeywords.length; keyIdx++)
    {
        matchesByKeyword.push([]);
    }

    let currentNode = 0;
    let tIdx = 0;
    let tl = sText.length;

    while (tIdx < tl)
    {
        let currentChar = sText[tIdx];

        while (currentNode != 0 && trie[currentNode].children.get(currentChar) === undefined)
        {
            currentNode = trie[currentNode].fail;
            ++comparisonCount;
        }

        ++comparisonCount;
        let nextNode = trie[currentNode].children.get(currentChar);
        if (nextNode !== undefined)
        {
            currentNode = nextNode;
        }
        else
        {
            currentNode = 0;
        }

        for (let matchedKeywordIdx of trie[currentNode].outputs)
        {
            let keyl = cKeywords[matchedKeywordIdx].length;
            matchesByKeyword[matchedKeywordIdx].push(tIdx - keyl + 1);
        }

        ++tIdx;
    }

    for (keyIdx = 0; keyIdx < cKeywords.length; keyIdx++)
    {
        let keyl = cKeywords[keyIdx].length;
        for (let r of matchesByKeyword[keyIdx])
        {
            finRes.push
            (
                matchResultGenerator
                (
                    cKeywords[keyIdx],
                    text.slice(r, r + keyl),
                    r,
                    r + keyl - 1
                )
            )
        }
    }

    let end = performance.now();
    let algoRes: AlgorithmResult = (
        algorithmResultGenerator
        (
            finRes,
            end - start,
            comparisonCount,
            "Aho-Corasick",
            sourceType
        )
    )
    return algoRes;
}
