import { MatchResult, MatchSource, matchResultGenerator } from './types';
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
)
{
    let finRes: MatchResult[][] = [];
    let keyword:string;
    let keyCount = 0;
    for (keyword of keywords)
    {
        let start = performance.now();
        let sText: string = text;
        let resIdx: number[] = [];
        if (caseInsensitive)
        {
            keyword.toLowerCase();
            sText.toLowerCase();
        }

        let b: number[] = borderFunction(keyword);
        let tIdx = 0;
        let keyIdx = 1;
        let keyl = keyword.length;
        let tl = sText.length;

        while (tIdx < tl)
        {
            if (keyword[keyIdx] == sText[tIdx])
            {
                if (keyIdx >= keyl - 1)
                {
                    resIdx.push(tIdx - keyl + 1);
                    keyIdx = -1;
                }
                ++keyIdx;
                ++tIdx;
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
                }
            }
        }
        let end = performance.now();

        ++keyCount;
    }
}