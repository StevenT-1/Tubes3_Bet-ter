export const BETTER_SCAN_MESSAGE = "BETTER_SCAN";
export const BETTER_CLEAR_MESSAGE = "BETTER_CLEAR";
export const BETTER_OCR_REQUEST = "BETTER_OCR_REQUEST";
export const BETTER_OCR_EXECUTE_REQUEST = "BETTER_OCR_EXECUTE_REQUEST";
export const BETTER_OCR_RESPONSE = "BETTER_OCR_RESPONSE";
export const BETTER_SETTINGS_KEY = "better.detector.settings";

export type ScanSettings = {
  highlight: boolean;
  blurText: boolean;
  ocr: boolean;
  runRabinKarp: boolean;
  runAhoCorasick: boolean;
  fuzzyThreshold: number;
};

export type StatisticDetailRow = {
  source: string;
  type: string;
  count: number;
};

export type StatisticChartRow = {
  keyword: string;
  value: number;
  details: StatisticDetailRow[];
};

export type AlgorithmResultSummary = {
  algorithm: string;
  source: string;
  matches: number;
  executionTimeMs: number;
  comparisonCount: number;
};

export type ScanRequestMessage = {
  type: typeof BETTER_SCAN_MESSAGE;
  settings: ScanSettings;
};

export type ClearRequestMessage = {
  type: typeof BETTER_CLEAR_MESSAGE;
};

export type ExtensionMessage = ScanRequestMessage | ClearRequestMessage;

export type OcrImageRequest = {
  id: string;
  src: string;
  altText: string;
};

export type OcrRequestMessage = {
  type: typeof BETTER_OCR_REQUEST;
  target: "background";
  images: OcrImageRequest[];
};

export type OcrExecuteRequestMessage = {
  type: typeof BETTER_OCR_EXECUTE_REQUEST;
  target: "offscreen";
  images: OcrImageRequest[];
};

export type OcrImageResponse = {
  id: string;
  text: string;
  warning?: string;
};

export type OcrResponseMessage =
  | {
      type: typeof BETTER_OCR_RESPONSE;
      ok: true;
      results: OcrImageResponse[];
      warnings: string[];
    }
  | {
      type: typeof BETTER_OCR_RESPONSE;
      ok: false;
      error: string;
      warnings?: string[];
    };

export type ScanSuccessResponse = {
  ok: true;
  url: string;
  title: string;
  scannedAt: number;
  loadedKeywordCount: number;
  matchedKeywordCount: number;
  totalMatches: number;
  totalExecutionTimeMs: number;
  algorithms: AlgorithmResultSummary[];
  statistics: StatisticChartRow[];
  warnings: string[];
};

export type ScanErrorResponse = {
  ok: false;
  error: string;
  url?: string;
  title?: string;
};

export type ScanResponse = ScanSuccessResponse | ScanErrorResponse;

export type ClearResponse = {
  ok: boolean;
  error?: string;
};

export const DEFAULT_SCAN_SETTINGS: ScanSettings = {
  highlight: true,
  blurText: false,
  ocr: false,
  runRabinKarp: false,
  runAhoCorasick: false,
  fuzzyThreshold: 0.7,
};
