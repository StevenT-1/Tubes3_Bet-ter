import { MatchResult, MatchSource, matchResultGenerator, AlgorithmResult, algorithmResultGenerator } from './types';
import {performance} from "perf_hooks"

function borderFunction (keyword: string): number[]
{
    let length = keyword.length;
    let res: number[] = new Array();
    let k = 0;

    for(k = 0; k < length; k++)
    {
        let longestMatch = 0;
        let wlth = 0;
        for (wlth = 0; wlth <= k; wlth++)
        {
            let prefId = 0;
            let suffId = k - wlth;
            let match = true;
            for (prefId = 0, suffId = k - wlth; prefId < wlth; prefId++, suffId++)
            {
                if(keyword[prefId] != keyword[suffId])
                {
                    match = false;
                    break;
                }
            }
            if (match) longestMatch = wlth;
        }

        res[k] = longestMatch;
    }
    return res;
}

export function searchKMP (
    keywords: string[],
    text: string,
    sourceType: MatchSource,
    caseInsensitive: boolean
): AlgorithmResult
{
    let start = performance.now();
    let finRes: MatchResult[] = [];
    let keyword:string;
    let keyCount = 0;
    let comparisonCount = 0;
    for (keyword of keywords)
    {
        let sText: string = text;
        let cKeyword: string = keyword;
        let resIdx: number[] = [];
        if (caseInsensitive)
        {
            cKeyword = keyword.toLowerCase();
            sText = sText.toLowerCase();
        }

        let b: number[] = borderFunction(cKeyword);
        let tIdx = 0;
        let keyIdx = 0;
        let keyl = cKeyword.length;
        let tl = sText.length;

        while (tIdx < tl)
        {
            if (cKeyword[keyIdx] == sText[tIdx])
            {
                if (keyIdx >= keyl - 1)
                {
                    resIdx.push(tIdx - keyl + 1);
                    keyIdx = -1;
                }
                ++keyIdx;
                ++tIdx;
                ++comparisonCount;
            }
            else
            {
                if (keyIdx > 0)
                {
                    keyIdx = b[keyIdx - 1];
                }
                else
                {
                    ++tIdx;
                    ++comparisonCount;
                }
            }
        }

        for (let r of resIdx)
        {
            finRes.push
            (
                matchResultGenerator
                (
                    cKeyword,
                    text.slice(r, r + keyl),
                    r,
                    r + keyl - 1
                )
            )
        }
        ++keyCount;
    }
    let end = performance.now();
    let algoRes: AlgorithmResult = (
        algorithmResultGenerator
        (
            finRes,
            end - start,
            comparisonCount,
            "KMP",
            sourceType
        )
    )
    return algoRes;
}