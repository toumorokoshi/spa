const SCALE_FACTOR = 2;
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const VIEWBOX_WIDTH_INDEX = 2;
const VIEWBOX_HEIGHT_INDEX = 3;

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const copyMarkdown = async (code: string): Promise<boolean> => {
  const markdown = `\`\`\`mermaid\n${code.trim()}\n\`\`\``;
  return copyText(markdown);
};

export const copySvg = async (svg: string): Promise<boolean> => {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const textBlob = new Blob([svg], { type: 'text/plain' });
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'image/svg+xml': svgBlob
        })
      ]);
      return true;
    }
    return await copyText(svg);
  } catch {
    return await copyText(svg);
  }
};

const parseViewBoxDimensions = (
  svgEl: SVGSVGElement
): { readonly width: number; readonly height: number } | null => {
  const viewBox = svgEl.getAttribute('viewBox');
  if (!viewBox) {
    return null;
  }
  const parts = viewBox.split(/\s+/).map(Number);
  const width = parts[VIEWBOX_WIDTH_INDEX];
  const height = parts[VIEWBOX_HEIGHT_INDEX];
  if (width && height) {
    return { width, height };
  }
  return null;
};

const parseSvgAttrDimensions = (
  svgEl: SVGSVGElement
): { readonly width: number; readonly height: number } => {
  const widthAttr = parseFloat(svgEl.getAttribute('width') || '');
  const heightAttr = parseFloat(svgEl.getAttribute('height') || '');
  return {
    width: widthAttr || DEFAULT_WIDTH,
    height: heightAttr || DEFAULT_HEIGHT
  };
};

const getSvgDimensions = (
  svg: string
): { readonly width: number; readonly height: number } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }
  return parseViewBoxDimensions(svgEl) ?? parseSvgAttrDimensions(svgEl);
};

const renderSvgToCanvas = (
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width * SCALE_FACTOR;
  canvas.height = height * SCALE_FACTOR;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  }
  return canvas;
};

export const svgToPngBlob = (svg: string): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const { width, height } = getSvgDimensions(svg);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = renderSvgToCanvas(img, width, height);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
};

const canWriteImageToClipboard = (): boolean => {
  return (
    typeof ClipboardItem !== 'undefined' && Boolean(navigator.clipboard?.write)
  );
};

export const copyPng = async (svg: string): Promise<boolean> => {
  try {
    if (!canWriteImageToClipboard()) {
      return false;
    }
    const blob = await svgToPngBlob(svg);
    if (!blob) {
      return false;
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    return true;
  } catch {
    return false;
  }
};
