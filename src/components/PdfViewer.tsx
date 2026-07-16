import { useState, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, PenBox } from "lucide-react";
import type { SkComment } from "@/lib/types";
import AnnotatedPage from "./AnnotatedPage";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  driveFileId: string;
  comments: SkComment[];
  annotationMode: boolean;
  onToggleAnnotation: () => void;
  selectedPosition: { page: number; x: number; y: number; w: number; h: number } | null;
  onSelectPosition: (pos: { page: number; x: number; y: number; w: number; h: number }) => void;
  onCommentClick: (commentId: string) => void;
  onPageChange?: (page: number) => void;
}

export default function PdfViewer({
  driveFileId,
  comments,
  annotationMode,
  onToggleAnnotation,
  selectedPosition,
  onSelectPosition,
  onCommentClick,
  onPageChange,
}: PdfViewerProps) {
  const url = `/api/gpdf?id=${driveFileId}`;
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<number, number>>({});

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const pendingScroll = useRef<number | null>(null);

  function goToPage(page: number) {
    const p = Math.max(1, Math.min(page, numPages));
    scrollPositions.current[pageNumber] = scrollRef.current?.scrollTop ?? 0;
    setPageNumber(p);
    onPageChange?.(p);
    pendingScroll.current = p;
  }

  function handlePageRendered(page: number) {
    if (pendingScroll.current === page) {
      pendingScroll.current = null;
      scrollRef.current?.scrollTo(0, scrollPositions.current[page] ?? 0);
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="mb-2 flex flex-shrink-0 items-center gap-2 self-center">
        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="rounded p-1 hover:bg-muted" title="Perkecil">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(2, s + 0.25))} className="rounded p-1 hover:bg-muted" title="Perbesar">
          <ZoomIn size={16} />
        </button>
        <span className="mx-1 text-muted-foreground/30">|</span>
        <button
          onClick={onToggleAnnotation}
          className={`rounded p-1 ${annotationMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          title={annotationMode ? "Tutup mode komentar" : "Mode komentar"}
        >
          <PenBox size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="relative flex-1 min-h-0 w-full overflow-auto rounded-md border border-border">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        )}
        <Document file={url} onLoadSuccess={onLoadSuccess} onLoadError={() => setLoading(false)}>
          <AnnotatedPage
            pageNumber={pageNumber}
            comments={comments}
            annotationMode={annotationMode}
            selectedPosition={selectedPosition?.page === pageNumber ? selectedPosition : null}
            scale={scale}
            onSelectPosition={onSelectPosition}
            onCommentClick={onCommentClick}
            onPageRendered={handlePageRendered}
          />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="mt-2 flex flex-shrink-0 items-center gap-2 self-center">
          <button onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="rounded p-1 hover:bg-muted disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-muted-foreground">
            Halaman {pageNumber} dari {numPages}
          </span>
          <button onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages} className="rounded p-1 hover:bg-muted disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
