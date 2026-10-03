import { useEffect, useRef, useState } from 'preact/hooks';
import {
  CANVAS_SIZE,
  HALF_FACTOR,
  NORMALIZED_BOX_SIZE,
  INK_STROKE_WIDTH,
  DRAWING_STROKE_WIDTH,
  GUIDE_STROKE_WIDTH,
  GRID_LINE_WIDTH,
  GRID_DASH_LEN,
  GUIDE_DASH_LEN
} from '../constants';
import { Point, Stroke } from '../types';

interface WritingCanvasProps {
  readonly mode: 'freeform' | 'kanji';
  readonly targetStrokes?: readonly Stroke[];
  readonly completedStrokeIndices?: readonly number[];
  readonly freeformStrokes?: readonly Stroke[];
  readonly showGuide?: boolean;
  readonly onStrokeFinished: (
    points: readonly Point[],
    width: number,
    height: number
  ) => void;
}

const drawGrid = (ctx: CanvasRenderingContext2D, size: number): void => {
  const half = size * HALF_FACTOR;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = GRID_LINE_WIDTH;
  ctx.strokeRect(0, 0, size, size);

  ctx.beginPath();
  ctx.setLineDash([GRID_DASH_LEN, GRID_DASH_LEN]);
  ctx.moveTo(half, 0);
  ctx.lineTo(half, size);
  ctx.moveTo(0, half);
  ctx.lineTo(size, half);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawStrokePath = (
  ctx: CanvasRenderingContext2D,
  stroke: readonly Point[],
  scale: number,
  color: string,
  lineWidth: number,
  isDashed = false
): void => {
  if (stroke.length === 0) {
    return;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (isDashed) {
    ctx.setLineDash([GUIDE_DASH_LEN, GUIDE_DASH_LEN]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.moveTo(
    (stroke[0].x / NORMALIZED_BOX_SIZE) * scale,
    (stroke[0].y / NORMALIZED_BOX_SIZE) * scale
  );
  stroke.slice(1).forEach((pt) => {
    ctx.lineTo(
      (pt.x / NORMALIZED_BOX_SIZE) * scale,
      (pt.y / NORMALIZED_BOX_SIZE) * scale
    );
  });
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawActiveStroke = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[]
): void => {
  if (points.length === 0) {
    return;
  }
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = DRAWING_STROKE_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
  ctx.stroke();
};

const renderCanvasContent = (
  ctx: CanvasRenderingContext2D,
  mode: 'freeform' | 'kanji',
  targetStrokes: readonly Stroke[],
  completedStrokeIndices: readonly number[],
  freeformStrokes: readonly Stroke[],
  showGuide: boolean,
  currentPoints: readonly Point[]
): void => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid(ctx, CANVAS_SIZE);

  if (mode === 'kanji') {
    if (showGuide) {
      targetStrokes.forEach((stroke, idx) => {
        if (!completedStrokeIndices.includes(idx)) {
          drawStrokePath(
            ctx,
            stroke,
            CANVAS_SIZE,
            '#475569',
            GUIDE_STROKE_WIDTH,
            true
          );
        }
      });
    }

    completedStrokeIndices.forEach((idx) => {
      const stroke = targetStrokes[idx];
      if (stroke) {
        drawStrokePath(
          ctx,
          stroke,
          CANVAS_SIZE,
          '#f8fafc',
          INK_STROKE_WIDTH,
          false
        );
      }
    });
  } else {
    freeformStrokes.forEach((stroke) => {
      drawStrokePath(
        ctx,
        stroke,
        CANVAS_SIZE,
        '#f8fafc',
        INK_STROKE_WIDTH,
        false
      );
    });
  }

  drawActiveStroke(ctx, currentPoints);
};

const extractPoint = (e: PointerEvent, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const safeSetPointerCapture = (
  canvas: HTMLCanvasElement | null,
  id: number
): void => {
  if (!canvas) return;
  try {
    canvas.setPointerCapture(id);
  } catch {
    // Ignored if capture is unavailable
  }
};

const safeReleasePointerCapture = (
  canvas: HTMLCanvasElement | null,
  id?: number
): void => {
  if (!canvas || id === undefined) return;
  try {
    if (canvas.hasPointerCapture(id)) {
      canvas.releasePointerCapture(id);
    }
  } catch {
    // Ignored
  }
};

const useCanvasDrawing = (
  canvasRef: { readonly current: HTMLCanvasElement | null },
  onStrokeFinished: (pts: readonly Point[], w: number, h: number) => void
) => {
  const [currentPoints, setCurrentPoints] = useState<readonly Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const onDown = (e: PointerEvent) => {
    safeSetPointerCapture(canvasRef.current, e.pointerId);
    setIsDrawing(true);
    setCurrentPoints([extractPoint(e, canvasRef.current!)]);
  };

  const onMove = (e: PointerEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    setCurrentPoints((prev) => [...prev, extractPoint(e, canvasRef.current!)]);
  };

  const onUp = (e?: PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    safeReleasePointerCapture(canvasRef.current, e?.pointerId);
    if (currentPoints.length > 0) {
      onStrokeFinished(currentPoints, CANVAS_SIZE, CANVAS_SIZE);
    }
    setCurrentPoints([]);
  };

  return { currentPoints, onDown, onMove, onUp };
};

export const WritingCanvas = ({
  mode,
  targetStrokes = [],
  completedStrokeIndices = [],
  freeformStrokes = [],
  showGuide = false,
  onStrokeFinished
}: WritingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentPoints, onDown, onMove, onUp } = useCanvasDrawing(
    canvasRef,
    onStrokeFinished
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderCanvasContent(
      ctx,
      mode,
      targetStrokes,
      completedStrokeIndices,
      freeformStrokes,
      showGuide,
      currentPoints
    );
  }, [
    mode,
    targetStrokes,
    completedStrokeIndices,
    freeformStrokes,
    showGuide,
    currentPoints
  ]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="writing-canvas"
        aria-label="Stylus handwriting practice canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      />
    </div>
  );
};
