'use client';

import { ReactNode, ReactElement, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Suspense
        fallback={
          <aside className="w-64 bg-white border-r border-slate-100 shadow-md flex-shrink-0" />
        }
      >
        <Sidebar />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// ─── Icons (w-4 h-4) ──────────────────────────────────────────────────────────
const icons: Record<string, ReactElement> = {
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  upload: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  compare: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  compare2: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  time: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trends: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  shopping: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  wallet: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  package: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="pt-5 pb-1.5 px-1">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] whitespace-nowrap">
          {label}
        </p>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────
interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  onClick: (href: string) => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={() => onClick(href)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 group ${
        active
          ? 'bg-slate-900 text-white font-semibold shadow-sm'
          : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <span
        className={`flex-shrink-0 transition-colors ${
          active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-500'
        }`}
      >
        {icons[icon]}
      </span>
      <span className="text-left leading-snug">{label}</span>
    </button>
  );
}

// ─── Sidebar inner (uses hooks that require Suspense) ─────────────────────────
function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLElement>(null);
  const SCROLL_KEY = 'sidebar_scroll';

  // Restore and persist scroll position across navigations
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) nav.scrollTop = Number(saved);
    const onScroll = () =>
      sessionStorage.setItem(SCROLL_KEY, String(nav.scrollTop));
    nav.addEventListener('scroll', onScroll, { passive: true });
    return () => nav.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (href: string) => router.push(href);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Determine whether a nav href matches the current route
  const isActive = (href: string): boolean => {
    const qIdx = href.indexOf('?');
    const hrefPath = qIdx >= 0 ? href.slice(0, qIdx) : href;
    const hrefQuery = qIdx >= 0 ? href.slice(qIdx + 1) : '';

    if (hrefPath !== pathname) return false;
    if (!hrefQuery) return true;

    // Has query params — every param in href must match current searchParams
    const hrefParams = new URLSearchParams(hrefQuery);
    for (const [k, v] of hrefParams.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-md flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-lg leading-none">N</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Noa&apos;s Café</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        ref={navRef as React.RefObject<HTMLElement>}
        className="flex-1 overflow-y-auto py-3 px-3 sidebar-nav"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
      >
        <div className="space-y-0.5">
          <NavItem href="/" icon="home" label="Dashboard" active={isActive('/')} onClick={navigate} />
          <NavItem href="/upload" icon="upload" label="Upload Data" active={isActive('/upload')} onClick={navigate} />
          <NavItem href="/settings" icon="settings" label="Settings" active={isActive('/settings')} onClick={navigate} />

          <SectionHeader label="Analytics" />
          <NavItem href="/sales-performance" icon="chart" label="Sales Performance" active={isActive('/sales-performance')} onClick={navigate} />
          <NavItem href="/product-performance" icon="star" label="Product Performance" active={isActive('/product-performance')} onClick={navigate} />
          <NavItem href="/time-demand" icon="time" label="Time-Based Demand" active={isActive('/time-demand')} onClick={navigate} />
          <NavItem href="/trends" icon="trends" label="Trends & Patterns" active={isActive('/trends')} onClick={navigate} />

          <SectionHeader label="Store Insights" />
          <NavItem href="/site-comparison" icon="compare" label="Store Performance" active={isActive('/site-comparison')} onClick={navigate} />
          <NavItem href="/comparison" icon="compare2" label="Store Comparison" active={isActive('/comparison')} onClick={navigate} />

          <SectionHeader label="Purchasing" />
          <NavItem href="/purchasing" icon="shopping" label="Booker Spend" active={isActive('/purchasing')} onClick={navigate} />
          <NavItem href="/buying-spend" icon="wallet" label="Buying & Spend" active={isActive('/buying-spend')} onClick={navigate} />
          <NavItem href="/packaging" icon="package" label="Packaging" active={isActive('/packaging')} onClick={navigate} />
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group"
        >
          <svg
            className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

