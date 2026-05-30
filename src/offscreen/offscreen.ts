import { Buffer as BrowserBuffer } from "buffer";
import {
  BETTER_OCR_EXECUTE_REQUEST,
  BETTER_OCR_RESPONSE,
  type OcrExecuteRequestMessage,
  type OcrImageRequest,
  type OcrImageResponse,
  type OcrResponseMessage,
} from "../shared/messages";

type CreateWorker = typeof import("tesseract.js")["createWorker"];
type TesseractWorker = Awaited<ReturnType<CreateWorker>>;

const globalWithBuffer = globalThis as typeof globalThis & {
  Buffer: typeof BrowserBuffer;
};

globalWithBuffer.Buffer = BrowserBuffer;

// Hidden extension page that owns OCR work so content scripts never create Tesseract workers.
chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: OcrResponseMessage) => void,
  ) => {
    if (!isOcrExecuteRequestMessage(message)) {
      return false;
    }

    void recognizeImages(message.images)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          type: BETTER_OCR_RESPONSE,
          ok: false,
          error: `OCR setup failed: ${friendlyError(error)}`,
          warnings: [`OCR setup failed: ${friendlyError(error)}`],
        });
      });

    return true;
  },
);

async function recognizeImages(images: OcrImageRequest[]): Promise<OcrResponseMessage> {
  const worker = await createLocalOcrWorker();
  const results: OcrImageResponse[] = [];
  const warnings: string[] = [];

  try {
    for (const image of images) {
      try {
        const text = await recognizeImageText(worker, image);
        results.push({ id: image.id, text });
      } catch (error) {
        const warning = `OCR failed for one image: ${friendlyError(error)}`;
        warnings.push(warning);
        results.push({ id: image.id, text: "", warning });
      }
    }
  } finally {
    try {
      await worker.terminate();
    } catch (error) {
      warnings.push(`OCR worker cleanup failed: ${friendlyError(error)}`);
    }
  }

  return {
    type: BETTER_OCR_RESPONSE,
    ok: true,
    results,
    warnings,
  };
}

async function createLocalOcrWorker(): Promise<TesseractWorker> {
  const { createWorker, setLogging } = await import("tesseract.js");
  setLogging(false);

  return createWorker("eng", 1, {
    workerPath: chrome.runtime.getURL("tesseract/worker.min.js"),
    corePath: chrome.runtime.getURL("tesseract/core"),
    langPath: chrome.runtime.getURL("tesseract/lang"),
    workerBlobURL: false,
    cacheMethod: "none",
    gzip: true,
  });
}

async function recognizeImageText(
  worker: TesseractWorker,
  image: OcrImageRequest,
): Promise<string> {
  const result = await worker.recognize(image.src);
  return result.data.text;
}

function isOcrExecuteRequestMessage(
  message: unknown,
): message is OcrExecuteRequestMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<OcrExecuteRequestMessage>;
  return (
    candidate.type === BETTER_OCR_EXECUTE_REQUEST &&
    candidate.target === "offscreen" &&
    Array.isArray(candidate.images)
  );
}

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
