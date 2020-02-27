let _canvas: HTMLCanvasElement;
let _context: CanvasRenderingContext2D;

export function getImageDataFromHTMLImage(element: HTMLImageElement): ImageData {
  if (!_canvas) {
    _canvas = document.createElement('canvas');
  }

  if (!_context) {
    _context = _canvas.getContext('2d');
  }

  _canvas.width = element.naturalWidth;
  _canvas.height = element.naturalHeight;

  _context.drawImage(element, 0, 0);
  return _context.getImageData(0, 0, element.naturalWidth, element.naturalHeight);
}

export function getImageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const context = canvas.getContext('2d');
  return context.getImageData(0, 0, canvas.width, canvas.height);
}
