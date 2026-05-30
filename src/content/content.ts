import {
  BETTER_CLEAR_MESSAGE,
  BETTER_SCAN_MESSAGE,
  type ClearResponse,
  type ExtensionMessage,
  type ScanResponse,
} from "../shared/messages";
import { scanPage } from "./pageScanner";
import { clearTextMarks } from "./textMarker";

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ScanResponse | ClearResponse) => void,
  ) => {
    if (message.type === BETTER_SCAN_MESSAGE) {
      void scanPage(message.settings)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            ok: false,
            error: friendlyError(error),
            url: window.location.href,
            title: document.title,
          });
        });
      return true;
    }

    if (message.type === BETTER_CLEAR_MESSAGE) {
      try {
        clearTextMarks();
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({ ok: false, error: friendlyError(error) });
      }
    }

    return false;
  },
);

function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
