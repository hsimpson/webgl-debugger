let _canvas: HTMLCanvasElement;
let _context: CanvasRenderingContext2D;

function _createCanvasAndContext(): void {
  if (!_canvas) {
    _canvas = document.createElement('canvas');
  }

  if (!_context) {
    _context = _canvas.getContext('2d');
  }
}

export function getImageDataFromHTMLImage(element: HTMLImageElement): ImageData {
  _createCanvasAndContext();

  _canvas.width = element.naturalWidth;
  _canvas.height = element.naturalHeight;

  _context.drawImage(element, 0, 0);
  return _context.getImageData(0, 0, element.naturalWidth, element.naturalHeight);
}

export function getImageDataFromImageBitmap(imageBitmap: ImageBitmap): ImageData {
  _createCanvasAndContext();

  _canvas.width = imageBitmap.width;
  _canvas.height = imageBitmap.height;

  _context.drawImage(imageBitmap, 0, 0);
  return _context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
}

export function getImageDataFromCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): ImageData {
  const context = canvas.getContext('2d');
  return context.getImageData(0, 0, canvas.width, canvas.height);
}
