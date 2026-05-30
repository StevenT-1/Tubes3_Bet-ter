# Manual Contract Checks

Run automated tests with:

```sh
npm test
```

Run the extension build with:

```sh
npm run build
```

Load `dist/` in `chrome://extensions`, then reload the test page after reloading the extension.

## Fixtures

- `test/fixtures/pages/dom-text.html`: exact keyword detection for `slot gacor maxwin`.
- `test/fixtures/pages/regex-cases.html`: future regex contract for `<word><number>` cases such as `SLOT99`, `MAXWIN234`, `IF2211`, `CS401`, and `HTTP404`.
- `test/fixtures/pages/exact-regex-overlap.html`: exact `gacor` and future regex `gacor99` should be separate detections.
- `test/fixtures/pages/fuzzy-cases.html`: future weighted fuzzy contract for `H0KI`, `sl0t`, `sloot`, `1sl0t`, and `s1ot99`.
- `test/fixtures/pages/ocr-image.html`: OCR should read the PNG image text even though the alt text is neutral.

## Expected UI Behavior

- OCR off: text scan, highlight, blur, and clear should remain fast.
- Rabin-Karp off: only KMP rows are expected for exact matching.
- Rabin-Karp on: Rabin-Karp rows may appear for comparison, but total detections should still use the primary KMP exact result.
- OCR on: the popup should finish with either `Scan complete` or `Scan complete with warnings`; it should not stay on `Scanning...`.
- Marked text tooltip should show keyword, algorithm/source, occurrence count, and execution time.

BM, Regex, and Weighted Levenshtein/Fuzzy are teammate-owned future work in this branch. These fixtures document the contract without making those missing algorithms fail automated tests.
