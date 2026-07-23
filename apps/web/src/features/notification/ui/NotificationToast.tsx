"use client";
import type { ToastItem } from "../model";

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "border-info bg-info/10 text-info",
  WARNING: "border-warning bg-warning/10 text-warning",
  CRITICAL: "border-destructive bg-destructive/10 text-destructive",
};

const SEVERITY_ICON: Record<string, string> = {
  INFO: "ℹ️",
  WARNING: "⚠️",
  CRITICAL: "🚨",
};

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export const NotificationToast = ({ toasts, onDismiss }: Props) => {
  if (toasts.length === 0) return null;

  return (
    <div className='fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2 rounded border-l-4 p-3 shadow-md ${SEVERITY_STYLES[toast.severity] ?? SEVERITY_STYLES["INFO"]}`}
        >
          <span className='text-lg'>{SEVERITY_ICON[toast.severity]}</span>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold'>{toast.title}</p>
            <p className='mt-0.5 line-clamp-2 text-xs'>{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className='ml-1 text-xs text-current opacity-60 hover:opacity-100'
            aria-label='닫기'
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
