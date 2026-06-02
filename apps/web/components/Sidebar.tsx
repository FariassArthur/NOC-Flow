'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@noc/api-client';
import NotificationBell from './NotificationBell';

const defaultNavItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/occurrences',
    label: 'Ocorrências',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/reports',
    label: 'Relatórios',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/occurrences/new',
    label: 'Nova Ocorrência',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Perfil',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [width, setWidth] = useState(72);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const dragStartX = useRef(0);
  const startWidth = useRef(72);

  useEffect(() => {
    authAPI.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const navItems = [
    ...defaultNavItems,
    ...(isAdmin ? [{
      href: '/dashboard/admin/users',
      label: 'Admin',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    }] : []),
  ];

  const isExpanded = width > 100;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startWidth.current = sidebarRef.current?.offsetWidth || 72;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      setWidth(Math.max(72, Math.min(240, startWidth.current + delta)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const toggleSidebar = useCallback(() => {
    setWidth(prev => (prev > 100 ? 72 : 220));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width }}
      className={`relative m-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/40 rounded-2xl flex flex-col overflow-hidden transition-all duration-200 select-none ${
        isDragging
          ? 'shadow-[0_0_60px_rgba(249,115,22,0.15)] border-accent-500/30'
          : 'shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.08)]'
      }`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent-500/[0.03] to-transparent pointer-events-none" />

      <div className="p-5 flex items-center justify-center border-b border-slate-700/30 relative z-10">
        {isExpanded ? (
          <Link href="/dashboard" className="text-xl font-bold text-white whitespace-nowrap">
            <span className="text-accent-500">Projeto</span>NOC
          </Link>
        ) : (
          <Link href="/dashboard" className="text-xl font-bold text-accent-500 tracking-tighter">
            N
          </Link>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20 shadow-[0_0_12px_rgba(249,115,22,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <span className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -right-1 -top-1 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                )}
              </span>
              {isExpanded && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-2 border-t border-slate-700/30 relative z-10 space-y-1">
        <div className="flex items-center justify-center">
          <NotificationBell isExpanded={isExpanded} />
          {isExpanded && (
            <span className="text-sm text-slate-400 ml-3">Notificações</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isExpanded && <span>Sair</span>}
        </button>
      </div>

      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={toggleSidebar}
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-16 flex items-center justify-center cursor-col-resize group z-20"
      >
        <div className="w-1 h-12 bg-slate-600/40 hover:bg-accent-500/60 rounded-full transition-all duration-200 group-hover:h-14 group-hover:w-1.5 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
      </div>
    </aside>
  );
}
