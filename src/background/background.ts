import {
  BETTER_OCR_EXECUTE_REQUEST,
  BETTER_OCR_REQUEST,
  BETTER_OCR_RESPONSE,
  type OcrRequestMessage,
  type OcrResponseMessage,
} from "../shared/messages";

const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
const OCR_TIMEOUT_MS = 20_000;
const OCR_TIMEOUT_WARNING = "OCR timed out after 20 seconds.";
let creatingOffscreenDocument: Promise<void> | null = null;

// The service worker forwards content OCR requests to the offscreen OCR page.
chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: OcrResponseMessage) => void,
  ) => {
    if (!isOcrRequestMessage(message)) {
      return false;
    }

    void runOcrInOffscreenDocument(message)
      .then(sendResponse)
      .catch((error) => {
        const errorMessage = friendlyError(error);
        sendResponse(
          createOcrErrorResponse(
            errorMessage === OCR_TIMEOUT_WARNING
              ? OCR_TIMEOUT_WARNING
              : `OCR unavailable: ${errorMessage}`,
          ),
        );
      });

    return true;
  },
);

async function runOcrInOffscreenDocument(
  message: OcrRequestMessage,
): Promise<OcrResponseMessage> {
  await ensureOffscreenDocument();

  const response = await sendOcrExecuteRequest(message);

  if (!isOcrResponseMessage(response)) {
    return createOcrErrorResponse("OCR worker returned an invalid response.");
  }

  return response;
}

async function sendOcrExecuteRequest(
  message: OcrRequestMessage,
): Promise<OcrResponseMessage | undefined> {
  const executeMessage = {
    type: BETTER_OCR_EXECUTE_REQUEST,
    target: "offscreen",
    images: message.images,
  };

  try {
    return (await withTimeout(
      chrome.runtime.sendMessage(executeMessage),
      OCR_TIMEOUT_MS,
    )) as OcrResponseMessage | undefined;
  } catch (error) {
    await delay(150);
    return (await withTimeout(
      chrome.runtime.sendMessage(executeMessage),
      OCR_TIMEOUT_MS,
    )) as OcrResponseMessage | undefined;
  }
}

async function ensureOffscreenDocument(): Promise<void> {
  if (!chrome.offscreen) {
    throw new Error("Chrome offscreen documents are not available.");
  }

  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen
      .createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: "Run local Tesseract OCR from an extension-origin page.",
      })
      .finally(() => {
        creatingOffscreenDocument = null;
      });
  }

  await creatingOffscreenDocument;
}

function createOcrErrorResponse(error: string): OcrResponseMessage {
  return {
    type: BETTER_OCR_RESPONSE,
    ok: false,
    error,
    warnings: [error],
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(OCR_TIMEOUT_WARNING));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

async function delay(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function isOcrRequestMessage(message: unknown): message is OcrRequestMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<OcrRequestMessage>;
  return (
    candidate.type === BETTER_OCR_REQUEST &&
    candidate.target === "background" &&
    Array.isArray(candidate.images)
  );
}

function isOcrResponseMessage(message: unknown): message is OcrResponseMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<OcrResponseMessage>;
  return candidate.type === BETTER_OCR_RESPONSE && typeof candidate.ok === "boolean";
}

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
