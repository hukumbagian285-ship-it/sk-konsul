import * as React from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let addToast: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "info") {
  addToast?.(message, type);
}

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const COLORS = {
  success: "border-l-emerald-500 bg-emerald-50 text-emerald-800",
  error: "border-l-red-500 bg-red-50 text-red-800",
  info: "border-l-blue-500 bg-blue-50 text-blue-800",
};

export default function ToastContainer() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    addToast = (message, type) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { addToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-4 md:right-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-lg border-l-4 px-4 py-3 text-sm shadow-lg animate-in slide-in-from-right ${COLORS[t.type]}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}