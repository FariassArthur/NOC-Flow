'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@ccore/api-client';
import NotificationBell from './NotificationBell';

const defaultNavItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/occurrences',
    label: 'Ocorrências',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/reports',
    label: 'Relatórios',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
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
    href: '/dashboard/runbooks',
    label: 'Runbooks',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Perfil',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
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
    authAPI
      .me()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const [adminOpen, setAdminOpen] = useState(false);

  const adminSubItems = [
    { href: '/dashboard/admin/users', label: 'Usuários' },
    { href: '/dashboard/admin/categories', label: 'Categorias' },
    { href: '/dashboard/admin/equipment', label: 'Equipamentos' },
    { href: '/dashboard/admin/services', label: 'Serviços' },
    { href: '/dashboard/admin/escalations', label: 'Escalonamento' },
    { href: '/dashboard/admin/audit', label: 'Auditoria' },
  ];

  const navItems = [
    ...defaultNavItems,
    {
      href: '/dashboard/runbooks/executions',
      label: 'Execuções',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            href: '/dashboard/settings',
            label: 'Configurações',
            icon: (
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
          },
        ]
      : []),
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
    setWidth((prev) => (prev > 100 ? 72 : 220));
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
            CCore
          </Link>
        ) : (
          <Link href="/dashboard" className="text-xl font-bold text-accent-500 tracking-tighter">
            C
          </Link>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isConfig = item.href === '/dashboard/settings' && item.label === 'Configurações';
          if (isConfig && isAdmin) {
            const isAnyAdminActive =
              adminSubItems.some((s) => pathname === s.href) || pathname === '/dashboard/settings';
            return (
              <div key="admin-toggle">
                <div className="flex items-center gap-0 w-full">
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-l-xl text-sm font-medium transition-all duration-200 flex-1 ${
                      isActive
                        ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20 border-r-0'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent border-r-0'
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
                  {isExpanded && (
                    <button
                      onClick={() => setAdminOpen(!adminOpen)}
                      className={`px-2 py-2.5 rounded-r-xl text-sm font-medium transition-all duration-200 border border-l-0 ${
                        isAnyAdminActive
                          ? 'bg-accent-500/10 text-accent-500 border-accent-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border-transparent'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {isExpanded && adminOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-3">
                    {adminSubItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSubActive
                              ? 'text-accent-500 bg-accent-500/10'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
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
          {isExpanded && <span className="text-sm text-slate-400 ml-3">Notificações</span>}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
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
