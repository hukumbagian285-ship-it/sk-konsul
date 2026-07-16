import { useRef, useState, useCallback } from "react";
import { Page } from "react-pdf";
import type { SkComment } from "@/lib/types";

interface AnnotatedPageProps {
  pageNumber: number;
  comments: SkComment[];
  annotationMode: boolean;
  selectedPosition: { x: number; y: number; w: number; h: number } | null;
  scale: number;
  onSelectPosition: (pos: { page: number; x: number; y: number; w: number; h: number }) => void;
  onCommentClick: (commentId: string) => void;
  onPageRendered?: (page: number) => void;
}

const WARNA_MAP: Record<string, string> = {
  merah: "bg-red-500/30 border-red-500",
  kuning: "bg-yellow-500/30 border-yellow-500",
  hijau: "bg-green-500/30 border-green-500",
};

export default function AnnotatedPage({
  pageNumber,
  comments,
  annotationMode,
  selectedPosition,
  scale,
  onSelectPosition,
  onCommentClick,
  onPageRendered,
}: AnnotatedPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const savedHighlights = comments.filter((c) => c.halaman === pageNumber && c.pos_x != null);

  const getPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    if (!annotationMode) return;
    const pos = getPos(e.clientX, e.clientY);
    setDragStart(pos);
    setDragEnd(pos);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragStart) return;
    setDragEnd(getPos(e.clientX, e.clientY));
  }

  function handleMouseUp() {
    if (!dragStart || !dragEnd) return;
    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const w = Math.abs(dragEnd.x - dragStart.x);
    const h = Math.abs(dragEnd.y - dragStart.y);
    setDragStart(null);
    setDragEnd(null);
    if (w < 1 && h < 1) return;
    onSelectPosition({ page: pageNumber, x, y, w, h });
  }

  const dragPreview = dragStart && dragEnd
    ? {
        left: Math.min(dragStart.x, dragEnd.x),
        top: Math.min(dragStart.y, dragEnd.y),
        width: Math.abs(dragEnd.x - dragStart.x),
        height: Math.abs(dragEnd.y - dragStart.y),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ cursor: annotationMode ? "crosshair" : "default" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} onRenderSuccess={() => onPageRendered?.(pageNumber)} />

      {savedHighlights.map((c) => (
        <div
          key={c.id}
          className={`absolute cursor-pointer rounded border ${WARNA_MAP[c.warna ?? "kuning"]}`}
          style={{
            left: `${c.pos_x}%`,
            top: `${c.pos_y}%`,
            width: `${c.lebar ?? 5}%`,
            height: `${c.tinggi ?? 3}%`,
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onCommentClick(c.id);
          }}
        />
      ))}

      {selectedPosition && (
        <div
          className="absolute rounded border border-yellow-500 bg-yellow-500/20"
          style={{
            left: `${selectedPosition.x}%`,
            top: `${selectedPosition.y}%`,
            width: `${selectedPosition.w}%`,
            height: `${selectedPosition.h}%`,
          }}
        />
      )}

      {dragPreview && (
        <div
          className="absolute rounded border border-dashed border-yellow-500 bg-yellow-500/10"
          style={{
            left: `${dragPreview.left}%`,
            top: `${dragPreview.top}%`,
            width: `${dragPreview.width}%`,
            height: `${dragPreview.height}%`,
          }}
        />
      )}
    </div>
  );
}
