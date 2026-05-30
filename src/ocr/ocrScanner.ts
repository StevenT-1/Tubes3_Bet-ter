import type { AlgorithmResult } from "../algorithms/types";
import {
  runTextAlgorithms,
  type TextAlgorithmOptions,
} from "../matching/textScanEngine";
import {
  BETTER_OCR_REQUEST,
  BETTER_OCR_RESPONSE,
  type OcrImageRequest,
  type OcrResponseMessage,
} from "../shared/messages";
import {
  collectImageCandidates,
  type ImageCandidate,
} from "./imageScanner";

const OCR_TIMEOUT_MS = 20_000;
const OCR_TIMEOUT_WARNING = "OCR timed out after 20 seconds.";

export type OcrScanResult = {
  algorithmResults: AlgorithmResult[];
  warnings: string[];
  detectedImages: HTMLImageElement[];
};

export async function scanImagesWithOcr(
  keywords: string[],
  algorithmOptions: TextAlgorithmOptions,
): Promise<OcrScanResult> {
  const warnings: string[] = [];
  const detectedImages: HTMLImageElement[] = [];
  const imageResults: AlgorithmResult[] = [];
  let failedImageCount = 0;
  const candidates = collectImageCandidates(document.body);

  if (candidates.length === 0) {
    return { algorithmResults: [], warnings, detectedImages };
  }

  const imageById = new Map<string, ImageCandidate>();
  const imageRequests = candidates.map((candidate, index) => {
    const id = `ocr-image-${index}`;
    imageById.set(id, candidate);

    return {
      id,
      src: candidate.src,
      altText: candidate.altText,
    };
  });

  try {
    const response = await requestOcrText(imageRequests);

    if (!response.ok) {
      return {
        algorithmResults: [],
        warnings: uniqueWarnings([response.error, ...(response.warnings ?? [])]),
        detectedImages: [],
      };
    }

    warnings.push(...uniqueWarnings(response.warnings));

    for (const result of response.results) {
      if (result.warning) {
        failedImageCount += 1;
      }

      if (!result.text.trim()) {
        continue;
      }

      const algorithmResults = runTextAlgorithms(
        result.text,
        keywords,
        "image-ocr",
        true,
        algorithmOptions,
      );
      imageResults.push(...algorithmResults);

      const candidate = imageById.get(result.id);
      if (candidate && algorithmResults.some((entry) => entry.matches.length > 0)) {
        detectedImages.push(candidate.element);
      }
    }

    if (failedImageCount > 0) {
      warnings.push(`OCR failed for ${failedImageCount} image(s).`);
    }
  } catch (error) {
    if (isOcrTimeoutError(error)) {
      return {
        algorithmResults: [],
        warnings: [OCR_TIMEOUT_WARNING],
        detectedImages: [],
      };
    }

    return {
      algorithmResults: [],
      warnings: [`OCR scan failed: ${friendlyError(error)}`],
      detectedImages: [],
    };
  }

  return {
    algorithmResults: combineAlgorithmResults(imageResults),
    warnings,
    detectedImages,
  };
}

async function requestOcrText(images: OcrImageRequest[]): Promise<OcrResponseMessage> {
  const response = (await withTimeout(
    chrome.runtime.sendMessage({
      type: BETTER_OCR_REQUEST,
      target: "background",
      images,
    }),
    OCR_TIMEOUT_MS,
  )) as OcrResponseMessage | undefined;

  if (!response || typeof response.ok !== "boolean") {
    return {
      type: BETTER_OCR_RESPONSE,
      ok: false,
      error: "OCR handler returned an invalid response.",
      warnings: ["OCR handler returned an invalid response."],
    };
  }

  return response;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new OcrTimeoutError());
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

class OcrTimeoutError extends Error {
  constructor() {
    super(OCR_TIMEOUT_WARNING);
    this.name = "OcrTimeoutError";
  }
}

function isOcrTimeoutError(error: unknown): error is OcrTimeoutError {
  return error instanceof OcrTimeoutError;
}

function combineAlgorithmResults(results: AlgorithmResult[]): AlgorithmResult[] {
  const combined = new Map<string, AlgorithmResult>();

  for (const result of results) {
    const key = `${result.algorithm}:${result.source}`;
    const existing = combined.get(key);

    if (!existing) {
      combined.set(key, { ...result, matches: [...result.matches] });
      continue;
    }

    existing.matches.push(...result.matches);
    existing.executionTimeMs += result.executionTimeMs;
    existing.comparisonCount += result.comparisonCount;
  }

  return [...combined.values()];
}

function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function uniqueWarnings(warnings: string[]): string[] {
  return [...new Set(warnings.filter((warning) => warning.trim().length > 0))];
}
