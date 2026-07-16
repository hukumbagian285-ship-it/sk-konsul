import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PdfViewer({
  driveFileId,
  onPageChange,
}: {
  driveFileId: string;
  onPageChange?: (page: number) => void;
}) {
  const url = `/api/gpdf?id=${driveFileId}`;
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function goToPage(page: number) {
    const p = Math.max(1, Math.min(page, numPages));
    setPageNumber(p);
    onPageChange?.(p);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="rounded p-1 hover:bg-muted" title="Perkecil">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(2, s + 0.25))} className="rounded p-1 hover:bg-muted" title="Perbesar">
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="relative max-h-[70vh] overflow-auto rounded-md border border-border">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        )}
        <Document file={url} onLoadSuccess={onLoadSuccess} onLoadError={() => setLoading(false)}>
          <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-muted-foreground">
            Halaman {pageNumber} dari {numPages}
          </span>
          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
