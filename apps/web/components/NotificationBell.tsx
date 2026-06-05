'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { notificationAPI } from '@noc/api-client';
import type { Notification } from '@noc/shared';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

const typeColors: Record<string, string> = {
  new_occurrence: 'bg-accent-500',
  status_change: 'bg-blue-500',
  assignment: 'bg-purple-500',
  comment: 'bg-emerald-500',
};

const typeIcons: Record<string, React.ReactNode> = {
  new_occurrence: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  status_change: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  assignment: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  comment: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
};

export default function NotificationBell({ isExpanded }: { isExpanded: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [notifList, unreadData] = await Promise.all([
        notificationAPI.list(),
        notificationAPI.unreadCount(),
      ]);
      setNotifications(notifList);
      setUnread(unreadData.count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socketUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:3001';
    const socket: Socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('notification', (data: Notification) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      if (!data.read) setUnread((prev) => prev + 1);
    });

    socket.on('connect_error', () => {});

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationAPI.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 ${
            isExpanded ? 'left-0' : 'left-0'
          }`}
          style={{ width: '360px', maxHeight: '480px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
            <h3 className="text-sm font-semibold text-white">Notificações</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-accent-500 hover:text-accent-400 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id?.toString()}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-700/20 transition-colors ${
                    notif.read
                      ? 'opacity-60'
                      : 'bg-accent-500/5 hover:bg-accent-500/10'
                  }`}
                  onClick={() => !notif.read && handleMarkRead(notif._id as string)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                      typeColors[notif.type] || 'bg-slate-600'
                    }`}
                  >
                    {typeIcons[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.relatedOccurrence && (
                      <Link
                        href={`/dashboard/occurrences/${notif.relatedOccurrence}`}
                        className="text-xs text-accent-500 hover:text-accent-400 mt-1 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver ocorrência →
                      </Link>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-accent-500 shrink-0 mt-2 shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
