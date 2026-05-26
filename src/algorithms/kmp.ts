import { MatchResult, MatchSource } from './types';

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
    keyword: string,
    text: string,
    sourceType: MatchSource,
    searchMode: boolean
)
{
    ;
}