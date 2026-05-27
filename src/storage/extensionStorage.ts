const BLUR_ENABLED_KEY = "blurEnabled";


export async function getBlurEnabled(): Promise<boolean> {
    const result = await chrome.storage.local.get({
        [BLUR_ENABLED_KEY]: false
    });

    const value = result[BLUR_ENABLED_KEY];

    if (typeof value === "boolean") {
        return value;
    }

    return false;
}

export async function setBlurEnabled(enabled:boolean): Promise<void> {
    await chrome.storage.local.set({
        [BLUR_ENABLED_KEY]: enabled
    });
}


