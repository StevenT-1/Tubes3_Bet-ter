const MIN_OCR_IMAGE_WIDTH = 80;
const MIN_OCR_IMAGE_HEIGHT = 40;
const OCR_IMAGE_BLUR_CLASS = "better-judol-ocr-blur";
const OCR_IMAGE_STYLE_ID = "better-judol-ocr-style";
const RASTER_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export type ImageCandidate = {
  element: HTMLImageElement;
  src: string;
  altText: string;
};

export function collectImageCandidates(root: HTMLElement | null = document.body): ImageCandidate[] {
  if (!root) {
    return [];
  }

  const candidates: ImageCandidate[] = [];
  const images = root.querySelectorAll("img");

  for (const image of images) {
    if (!isImageCandidate(image)) {
      continue;
    }

    candidates.push({
      element: image,
      src: image.currentSrc || image.src,
      altText: image.alt.trim(),
    });
  }

  return candidates;
}

export function blurOcrImages(images: HTMLImageElement[]): void {
  if (images.length === 0) {
    return;
  }

  injectOcrImageStyle();

  for (const image of images) {
    if (image.isConnected) {
      image.classList.add(OCR_IMAGE_BLUR_CLASS);
    }
  }
}

export function clearOcrImageMarks(): void {
  for (const image of document.querySelectorAll(`.${OCR_IMAGE_BLUR_CLASS}`)) {
    image.classList.remove(OCR_IMAGE_BLUR_CLASS);
  }
}

function isImageCandidate(image: HTMLImageElement): boolean {
  const src = image.currentSrc || image.src;

  if (!image.isConnected || !src.trim()) {
    return false;
  }

  if (isSmallImage(image)) {
    return false;
  }

  return isVisibleImage(image) && isLikelyReadableRasterImage(src);
}

function isSmallImage(image: HTMLImageElement): boolean {
  const width = image.naturalWidth || image.clientWidth;
  const height = image.naturalHeight || image.clientHeight;

  if (width === 0 && height === 0) {
    return false;
  }

  return width < MIN_OCR_IMAGE_WIDTH || height < MIN_OCR_IMAGE_HEIGHT;
}

function isVisibleImage(image: HTMLImageElement): boolean {
  const style = window.getComputedStyle(image);

  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }

  const box = image.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}

function isLikelyReadableRasterImage(src: string): boolean {
  if (src.startsWith("data:image/svg+xml")) {
    return false;
  }

  if (src.startsWith("data:image/")) {
    return (
      src.startsWith("data:image/png") ||
      src.startsWith("data:image/jpeg") ||
      src.startsWith("data:image/jpg") ||
      src.startsWith("data:image/webp")
    );
  }

  if (src.startsWith("blob:")) {
    return true;
  }

  try {
    const extension = new URL(src, window.location.href).pathname
      .toLowerCase()
      .match(/\.[a-z0-9]+$/)?.[0];

    if (!extension) {
      return true;
    }

    return RASTER_IMAGE_EXTENSIONS.has(extension);
  } catch {
    return false;
  }
}

function injectOcrImageStyle(): void {
  if (document.getElementById(OCR_IMAGE_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = OCR_IMAGE_STYLE_ID;
  style.textContent = `
    .${OCR_IMAGE_BLUR_CLASS} {
      filter: blur(5px) !important;
      transition: filter 140ms ease !important;
    }

    .${OCR_IMAGE_BLUR_CLASS}:hover {
      filter: blur(0) !important;
    }
  `;
  document.documentElement.append(style);
}
