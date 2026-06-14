"use client";

import { useEffect, useState } from "react";

import { authToken } from "@/shared";

import { usePrivateSocket } from "@/features/auth";
import {
  NotificationCenter,
  NotificationToast,
  SlackIntegrationSettings,
  useMarkAsRead,
  useNotificationToast,
  useNotifications,
} from "@/features/notification";

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const notificationsQuery = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const { socket, isConnected } = usePrivateSocket(token ?? undefined);
  const { toasts, dismiss } = useNotificationToast(socket);
  const notifications = notificationsQuery.data?.items ?? [];
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  useEffect(() => {
    setToken(authToken.get());
  }, []);

  return (
    <main className='min-h-screen bg-gray-50 px-4 py-6 text-gray-950 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-5xl'>
        <header className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5'>
          <div>
            <h1 className='text-2xl font-semibold tracking-normal'>Dobbit</h1>
            <p className='mt-1 text-sm text-gray-500'>실시간 리스크 알림 {isConnected ? "연결됨" : "대기 중"}</p>
          </div>
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
            isLoading={notificationsQuery.isLoading}
          />
        </header>

        <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_360px]'>
          <section className='rounded-lg border border-gray-200 bg-white p-5'>
            <h2 className='text-base font-semibold text-gray-900'>최근 알림</h2>
            <div className='mt-4 divide-y divide-gray-100'>
              {notifications.length === 0 ? (
                <p className='py-8 text-sm text-gray-500'>표시할 알림이 없습니다.</p>
              ) : (
                notifications.slice(0, 6).map((notification) => (
                  <button
                    key={notification.id}
                    type='button'
                    onClick={() => {
                      if (!notification.readAt) markAsReadMutation.mutate(notification.id);
                    }}
                    className='block w-full py-3 text-left'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium text-gray-900'>{notification.title}</p>
                        <p className='mt-1 line-clamp-2 text-sm text-gray-500'>{notification.message}</p>
                      </div>
                      {!notification.readAt && <span className='mt-1 h-2 w-2 rounded-full bg-red-500' />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <aside className='rounded-lg border border-gray-200 bg-white p-5'>
            <SlackIntegrationSettings />
          </aside>
        </div>
      </div>
      <NotificationToast toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
