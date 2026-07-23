"use client";

import { useState } from "react";

import { Skeleton } from "@/shared";
import type { NotificationItem } from "@dobbit/shared";

type Props = {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
};

const SEVERITY_DOT: Record<string, string> = {
  INFO: "bg-info",
  WARNING: "bg-warning",
  CRITICAL: "bg-destructive",
};

export const NotificationCenter = ({ notifications, unreadCount, onMarkAsRead, isLoading }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className='relative'>
      <button
        onClick={() => setOpen((v) => !v)}
        className='relative rounded-full p-2 transition-colors hover:bg-accent'
        aria-label='알림 센터'
      >
        <span className='text-xl'>🔔</span>
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-foreground'>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />
          <div className='absolute right-0 z-50 mt-2 flex max-h-96 w-80 flex-col rounded-lg border bg-popover shadow-xl'>
            <div className='border-b px-4 py-3 text-sm font-semibold text-popover-foreground'>
              알림 {unreadCount > 0 && <span className='text-destructive'>({unreadCount})</span>}
            </div>
            <div className='flex-1 overflow-y-auto'>
              {isLoading ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='border-b px-4 py-3 last:border-b-0'>
                      <div className='flex items-start gap-2'>
                        <Skeleton className='mt-1.5 h-2 w-2 shrink-0 rounded-full' />
                        <div className='min-w-0 flex-1 space-y-2'>
                          <Skeleton className='h-4 w-32' />
                          <Skeleton className='h-3 w-40' />
                          <Skeleton className='h-2 w-24' />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : notifications.length === 0 ? (
                <div className='p-4 text-center text-sm text-muted-foreground'>알림이 없습니다.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`cursor-pointer border-b px-4 py-3 last:border-b-0 hover:bg-accent ${!n.readAt ? "bg-info/10" : ""}`}
                    onClick={() => {
                      if (!n.readAt) onMarkAsRead(n.id);
                    }}
                  >
                    <div className='flex items-start gap-2'>
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[n.severity] ?? SEVERITY_DOT["INFO"]}`}
                      />
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium text-popover-foreground'>{n.title}</p>
                        <p className='mt-0.5 line-clamp-2 text-xs text-muted-foreground'>{n.message}</p>
                        <p className='mt-1 text-[10px] text-muted-foreground'>
                          {new Date(n.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
