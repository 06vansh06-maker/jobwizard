import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Search, Sparkles, FileText, Send, Inbox, User, Settings, Bot, Bookmark,
  ChevronsLeft, ChevronsRight, Menu, X, Zap, Bell, LogOut, CheckCircle2, AlertCircle, Info,
  HelpCircle, ChevronRight, ChevronDown, ChevronLeft, Building2, Briefcase,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { JOBS } from '../data/mock';
import { cn } from '../lib/cn';
import { Modal, CompareTray, CompareModal } from './app-ui';

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Ctrl K', action: 'Open global command palette' },
  { keys: 'G then D', action: 'Go to Dashboard' },
  { keys: 'G then J', action: 'Go to Job Search' },
  { keys: 'G then A', action: 'Go to Applications' },
  { keys: 'G then R', action: 'Go to Recruiter Responses' },
  { keys: 'Esc', action: 'Close modal, drawer or menu' },
];

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="space-y-1">
        {SHORTCUTS.map((s) => (
          <div key={s.keys} className="flex items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]">
            <span className="text-[14px] text-[#475569]">{s.action}</span>
            <kbd className="shrink-0 rounded-[7px] border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-bold text-[#0F172A]">{s.keys}</kbd>
          </div>
        ))}
      </div>
      <p className="mt-3 px-3 text-[12px] text-[#94A3B8]">Sequences: press G, release, then press the second key within a second.</p>
    </Modal>
  );
}

const NAV = [
  { section: 'MAIN' },
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/jobs', label: 'Job Search', icon: Search },
  { to: '/app/recommended', label: 'Recommended', icon: Sparkles },
  { section: 'APPLICATIONS' },
  { to: '/app/applications', label: 'Applications', icon: FileText, badge: 'apps' },
  { to: '/app/saved', label: 'Saved Jobs', icon: Bookmark },
  { section: 'OUTREACH' },
  { to: '/app/outreach', label: 'Cold Outreach', icon: Send },
  { to: '/app/responses', label: 'Recruiter Responses', icon: Inbox, badge: 'responses' },
  { section: 'AUTOMATION' },
  { to: '/app/automation', label: 'Automation Center', icon: Bot },
  { section: 'ACCOUNT' },
  { to: '/app/profile', label: 'Resume & Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

function CollapsedTip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-[8px] bg-[#0F172A] px-2.5 py-1.5 text-[13px] font-medium text-white opacity-0 shadow-lg transition-all delay-[120ms] duration-200 group-hover:translate-x-0 group-hover:opacity-100">
      {label}
    </span>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { profile, logout, applications, unreadResponseCount, automation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setUserMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [userMenuOpen]);

  const analyzedToday = automation.find((s) => s.id === 'discovery')?.usage ?? 24;

  const badgeFor = (key?: string) => {
    if (key === 'apps' && applications.length > 0) return String(applications.length);
    if (key === 'responses' && unreadResponseCount > 0) return String(unreadResponseCount);
    return null;
  };

  return (
    <div className="flex h-full flex-col">
      {/* logo — wordmark fades into icon on collapse */}
      <div className={cn('flex h-[68px] items-center gap-2.5 border-b border-[#E2E8F0] px-5 transition-all duration-300', collapsed && 'justify-center px-2')}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#4F46E5] transition-transform duration-300">
          <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </span>
        <span className={cn('whitespace-nowrap text-[18px] font-bold tracking-tight text-[#0F172A] transition-all duration-300',
          collapsed ? 'w-0 -translate-x-2 overflow-hidden opacity-0' : 'translate-x-0 opacity-100')}>
          JobWizard
        </span>
      </div>

      {/* nav */}
      <nav className={cn('flex-1 overflow-y-auto px-3 py-4 transition-all duration-300', collapsed && 'px-2')} aria-label="Application">
        {NAV.map((item, i) => {
          if ('section' in item) {
            const label = (item as { section: string }).section;
            return (
              <div key={i} className="px-1 pt-4 first:pt-0" aria-hidden={collapsed}>
                <p className={cn('whitespace-nowrap px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] transition-all duration-300',
                  collapsed ? 'max-h-0 -translate-x-2 overflow-hidden opacity-0' : 'max-h-6 translate-x-0 pb-1.5 opacity-100')}>
                  {label}
                </p>
                <div className={cn('rounded-full bg-[#E2E8F0] transition-all duration-300',
                  collapsed ? 'mx-2 my-2.5 h-px opacity-100' : 'h-0 opacity-0')} />
              </div>
            );
          }
          const nav = item as { to: string; label: string; icon: typeof Search; badge?: string };
          const active = location.pathname === nav.to || (nav.to === '/app/dashboard' && location.pathname === '/app');
          const badge = badgeFor(nav.badge);
          return (
            <div key={nav.to} className="group relative">
              <NavLink
                to={nav.to}
                onClick={onNavigate}
                className={cn(
                  'mb-0.5 flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[14px] font-medium transition-colors duration-200',
                  collapsed && 'justify-center px-0',
                  active ? 'bg-[#EEF2FF] font-semibold text-[#4F46E5]' : 'text-[#475569] hover:bg-[#EEF2FF]/70 hover:text-[#0F172A]'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="jw-sidebar-active"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#4F46E5]"
                  />
                )}
                <nav.icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105" />
                <span className={cn('min-w-0 flex-1 truncate whitespace-nowrap transition-all duration-300',
                  collapsed ? 'w-0 -translate-x-2 overflow-hidden opacity-0' : 'translate-x-0 opacity-100 group-hover:translate-x-0.5')}>
                  {nav.label}
                </span>
                {!collapsed && badge && (
                  <span className={cn('flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-all duration-300',
                    nav.badge === 'responses' ? 'jw-badge-pulse bg-[#DC2626] text-white' : 'bg-[#E2E8F0] text-[#475569]')}>
                    {badge}
                  </span>
                )}
                {collapsed && badge && (
                  <span className="jw-badge-pulse absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">{badge}</span>
                )}
              </NavLink>
              {collapsed && <CollapsedTip label={nav.label} />}
            </div>
          );
        })}
      </nav>

      {/* AI agent status */}
      <div className="px-3 pb-1">
        {collapsed ? (
          <div className="group relative flex justify-center py-1">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#4F46E5]">
              <Zap className="h-[18px] w-[18px]" />
              <span className="jw-dot-soft absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            </span>
            <CollapsedTip label={`AI Agent Active — ${analyzedToday} jobs analyzed today`} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-all duration-300">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#0F172A]">
              <Zap className="h-3.5 w-3.5 text-[#4F46E5]" />AI AGENT
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A]">
              <span className="jw-dot-soft h-1.5 w-1.5 rounded-full bg-[#16A34A]" />Active
            </p>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{analyzedToday} jobs analyzed today</p>
          </div>
        )}
      </div>

      {/* user profile + dropdown */}
      <div className="space-y-2 border-t border-[#E2E8F0] p-3">
        <div className="relative">
          {!collapsed ? (
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-expanded={userMenuOpen}
              aria-label="Open profile menu"
              className="group/user flex w-full items-center gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition-colors hover:bg-[#EEF2FF]/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[14px] font-bold text-white">V</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-[#0F172A]">{profile.firstName || 'Vansh'}</span>
                <span className="flex items-center gap-1 text-[12px] font-medium text-[#16A34A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />Active
                </span>
              </span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#94A3B8] transition-all duration-200 group-hover/user:text-[#4F46E5]',
                'opacity-0 group-hover/user:opacity-100', userMenuOpen && 'rotate-180 opacity-100')} />
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-label="Open profile menu"
                title="Vansh — Active"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F46E5] text-[14px] font-bold text-white transition-transform hover:scale-105"
              >
                V
              </button>
            </div>
          )}

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <button aria-label="Close profile menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn('absolute z-50 overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-xl',
                    collapsed ? 'bottom-0 left-full ml-3 w-[200px]' : 'bottom-full left-0 right-0 mb-2')}
                  role="menu"
                >
                  {[
                    { label: 'Profile', to: '/app/profile', icon: User },
                    { label: 'Settings', to: '/app/settings', icon: Settings },
                  ].map((l) => (
                    <button
                      key={l.label}
                      role="menuitem"
                      onClick={() => { setUserMenuOpen(false); onNavigate?.(); navigate(l.to); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    >
                      <l.icon className="h-4 w-4 text-[#94A3B8]" />{l.label}
                    </button>
                  ))}
                  <button
                    role="menuitem"
                    onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                    className="flex w-full items-center gap-2.5 border-t border-[#F1F5F9] px-4 py-2.5 text-left text-[14px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                  >
                    <LogOut className="h-4 w-4" />Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { SidebarContent };

/* ------------------------- command palette ------------------------- */
const APP_PAGES = [
  { label: 'Dashboard', to: '/app/dashboard', hint: 'Overview & stats' },
  { label: 'Job Search', to: '/app/jobs', hint: 'Find opportunities' },
  { label: 'Recommended', to: '/app/recommended', hint: 'AI matches' },
  { label: 'Applications', to: '/app/applications', hint: 'Tracker' },
  { label: 'Cold Outreach', to: '/app/outreach', hint: 'Recruiters' },
  { label: 'Recruiter Responses', to: '/app/responses', hint: 'Inbox' },
  { label: 'Automation Center', to: '/app/automation', hint: 'AI agents' },
  { label: 'Resume & Profile', to: '/app/profile', hint: 'Your profile' },
  { label: 'Settings', to: '/app/settings', hint: 'Preferences' },
];

const PALETTE_ACTIONS = [
  { label: 'Find Jobs', to: '/app/jobs', hint: 'Search opportunities' },
  { label: 'Save Job', to: '/app/saved', hint: 'View shortlist' },
  { label: 'Apply', to: '/app/jobs', hint: 'Browse roles to apply' },
  { label: 'Create Outreach', to: '/app/outreach', hint: 'Write to a recruiter' },
  { label: 'Update Profile', to: '/app/profile', hint: 'Edit career details' },
  { label: 'Upload Resume', to: '/app/profile?focus=resume', hint: 'Replace resume file' },
  { label: 'Open Automation Center', to: '/app/automation', hint: 'Manage agents' },
  { label: 'Review Application Queue', to: '/app/applications', hint: 'Queued roles' },
  { label: 'Compose outreach email', to: '/app/outreach', hint: 'Write to a recruiter' },
  { label: 'Review applications', to: '/app/applications', hint: 'Open tracker' },
  { label: 'Complete profile', to: '/app/profile', hint: 'Boost matches' },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { applications, recruiters } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = APP_PAGES
      .filter((p) => !q || p.label.toLowerCase().includes(q))
      .map((p) => ({ kind: 'Page', title: p.label, sub: p.hint, to: p.to, icon: ChevronRight }));
    const actions = PALETTE_ACTIONS
      .filter((p) => q && p.label.toLowerCase().includes(q))
      .map((p) => ({ kind: 'Action', title: p.label, sub: p.hint, to: p.to, icon: Zap }));
    const jobs = (!q ? JOBS.slice(0, 3) : JOBS.filter((j) =>
      `${j.title} ${j.company} ${j.skills.join(' ')}`.toLowerCase().includes(q)).slice(0, 5))
      .map((j) => ({ kind: 'Job', title: j.title, sub: `${j.company} • ${j.matchScore.toFixed(1)}/10`, to: `/app/jobs?highlight=${j.id}`, icon: Briefcase }));
    const apps = applications
      .filter((a) => !q || `${a.title} ${a.company}`.toLowerCase().includes(q)).slice(0, 4)
      .map((a) => ({ kind: 'Application', title: a.title, sub: `${a.company} • ${a.status}`, to: '/app/applications', icon: FileText }));
    const recs = recruiters
      .filter((r) => !q || `${r.name} ${r.company}`.toLowerCase().includes(q)).slice(0, 4)
      .map((r) => ({ kind: 'Recruiter', title: r.name, sub: `${r.company} • ${r.status}`, to: '/app/outreach', icon: Building2 }));
    return [...pages, ...actions, ...jobs, ...apps, ...recs].slice(0, 14);
  }, [query, applications, recruiters]);

  useEffect(() => setCursor(0), [query]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] px-4 py-3.5">
              <Search className="h-[18px] w-[18px] shrink-0 text-[#64748B]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
                  if (e.key === 'Enter' && results[cursor]) go(results[cursor].to);
                  if (e.key === 'Escape') onClose();
                }}
                placeholder="Search jobs, companies, applications, recruiters, pages…"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#94A3B8]"
                aria-label="Search"
              />
              <kbd className="hidden shrink-0 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-semibold text-[#64748B] sm:block">ESC</kbd>
            </div>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-[14px] text-[#64748B]">No results for “{query}”. Try a job title, company or skill.</p>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.kind}-${r.title}-${i}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(r.to)}
                  className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${i === cursor ? 'bg-[#EEF2FF]' : 'hover:bg-[#F8FAFC]'}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors ${i === cursor ? 'bg-[#4F46E5] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    <r.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[#0F172A]">{r.title}</span>
                    <span className="block truncate text-[12px] text-[#64748B]">{r.sub}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">{r.kind}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-[#F1F5F9] px-4 py-2.5 text-[12px] text-[#94A3B8]">
              <span><kbd className="font-semibold">↑↓</kbd> navigate</span>
              <span><kbd className="font-semibold">↵</kbd> open</span>
              <span className="ml-auto hidden sm:block"><kbd className="font-semibold">Ctrl K</kbd> toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------- layout ------------------------------- */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('jw_sidebar_collapsed') === '1'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { paletteOpen, setPaletteOpen } = useApp();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { toasts, dismissToast, confirmState, closeConfirm, notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead, profile, logout, pushToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try { localStorage.setItem('jw_sidebar_collapsed', collapsed ? '1' : '0'); } catch { /* noop */ }
  }, [collapsed]);

  /* Ctrl+K palette */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen]);

  /* Escape closes drawer + dropdowns */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setNotifOpen(false);
        setHelpOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* G-key navigation sequences: G then D/J/A/R */
  const pendingG = useRef(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() === 'g') {
        pendingG.current = true;
        clearTimeout(t);
        t = setTimeout(() => { pendingG.current = false; }, 900);
        return;
      }
      if (pendingG.current) {
        const map: Record<string, string> = { d: '/app/dashboard', j: '/app/jobs', a: '/app/applications', r: '/app/responses' };
        const to = map[e.key.toLowerCase()];
        pendingG.current = false;
        if (to) navigate(to);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [navigate]);

  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes('automation')) return 'Automation Center';
    if (p.includes('/app/saved')) return 'Saved Jobs';
    if (p.includes('jobs') && !p.includes('recommended')) return 'Job Search';
    if (p.includes('recommended')) return 'Recommended Jobs';
    if (p.includes('applications')) return 'Applications';
    if (p.includes('outreach')) return 'Cold Outreach';
    if (p.includes('responses')) return 'Recruiter Responses';
    if (p.includes('profile')) return 'Resume & Profile';
    if (p.includes('settings')) return 'Settings';
    return 'Dashboard';
  })();

  const openNotif = (id: string, link: string) => {
    markNotificationRead(id);
    setNotifOpen(false);
    navigate(link);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <aside className={cn('relative hidden shrink-0 border-r border-[#E2E8F0] bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] md:block', collapsed ? 'w-[72px]' : 'w-[260px]')}>
        <SidebarContent collapsed={collapsed} />
        {/* edge toggle — top-right of the sidebar */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-[14px] top-[54px] z-20 flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-[#4F46E5] hover:text-[#4F46E5]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-[#0F172A]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-full w-[270px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Navigation menu">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-white transition-colors hover:bg-[#F8FAFC]">
                <X className="h-4 w-4" />
              </button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-[#E2E8F0] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[#E2E8F0] text-[#64748B] transition-all hover:-translate-y-px hover:text-[#4F46E5] md:flex">
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
            {/* global search trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden min-w-0 max-w-[380px] flex-1 items-center gap-2.5 rounded-[9px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-left text-[14px] text-[#94A3B8] transition-colors hover:border-[#C7D2FE] sm:flex"
              aria-label="Open global search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">Search jobs, companies, people…</span>
              <kbd className="hidden shrink-0 rounded-[6px] border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B] lg:block">Ctrl K</kbd>
            </button>
            <button onClick={() => setPaletteOpen(true)} aria-label="Open global search" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-[#E2E8F0] transition-colors hover:border-[#4F46E5] sm:hidden">
              <Search className="h-[18px] w-[18px] text-[#64748B]" />
            </button>
            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-[16px] font-semibold text-[#0F172A]">{pageTitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* help */}
            <div className="relative">
              <button onClick={() => { setHelpOpen((v) => !v); setNotifOpen(false); setUserOpen(false); }} aria-label="Help" aria-expanded={helpOpen}
                className="hidden h-10 w-10 items-center justify-center rounded-[9px] border border-[#E2E8F0] text-[#64748B] transition-all hover:-translate-y-px hover:text-[#0F172A] sm:flex">
                <HelpCircle className="h-[18px] w-[18px]" />
              </button>
              {helpOpen && (
                <>
                  <button aria-label="Close help" className="fixed inset-0 z-40 cursor-default" onClick={() => setHelpOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-50 mt-2 w-[280px] rounded-[14px] border border-[#E2E8F0] bg-white p-4 shadow-xl"
                  >
                    <p className="text-[14px] font-semibold">Keyboard shortcuts</p>
                    <div className="mt-3 space-y-2 text-[13px] text-[#475569]">
                      <p className="flex justify-between"><span>Global search</span><kbd className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 font-semibold">Ctrl K</kbd></p>
                      <p className="flex justify-between"><span>Go to Dashboard / Jobs</span><kbd className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 font-semibold">G D / G J</kbd></p>
                      <p className="flex justify-between"><span>Applications / Responses</span><kbd className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 font-semibold">G A / G R</kbd></p>
                      <p className="flex justify-between"><span>Close dialogs</span><kbd className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 font-semibold">Esc</kbd></p>
                    </div>
                    <button
                      onClick={() => { setHelpOpen(false); setShortcutsOpen(true); }}
                      className="mt-3 w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      View all shortcuts
                    </button>
                    <button
                      onClick={() => { setHelpOpen(false); pushToast({ title: 'Support request noted', description: 'We reply within one business day.', kind: 'info' }); }}
                      className="mt-4 w-full rounded-[9px] bg-[#0F172A] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]"
                    >
                      Contact support
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            {/* notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen((v) => !v); setHelpOpen(false); setUserOpen(false); }} aria-label="Notifications" aria-expanded={notifOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#E2E8F0] text-[#64748B] transition-all hover:-translate-y-px hover:text-[#0F172A]">
                <Bell className="h-[18px] w-[18px]" />
                {unreadNotifications > 0 && (
                  <span className="jw-badge-pulse absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[11px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <button aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
                      <p className="text-[14px] font-semibold">Notifications</p>
                      <button onClick={markAllNotificationsRead} className="text-[13px] font-semibold text-[#4F46E5] hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-8 text-center text-[14px] text-[#64748B]">You&apos;re all caught up.</p>
                      )}
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => openNotif(n.id, n.link)}
                          className={`flex w-full items-start gap-3 border-b border-[#F8FAFC] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#F8FAFC] ${n.read ? '' : 'bg-[#EEF2FF]/40'}`}
                        >
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-[#E2E8F0]' : 'bg-[#4F46E5]'}`} />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-[#0F172A]">{n.title}</span>
                            <span className="block truncate text-[13px] text-[#64748B]">{n.body}</span>
                            <span className="block text-[12px] text-[#94A3B8]">{n.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* user menu */}
            <div className="relative">
              <button onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); setHelpOpen(false); }} aria-label="User menu" aria-expanded={userOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5] text-[14px] font-bold text-white transition-transform duration-200 hover:scale-105">
                V
              </button>
              {userOpen && (
                <>
                  <button aria-label="Close user menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setUserOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-50 mt-2 w-[240px] overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-xl"
                  >
                    <div className="border-b border-[#F1F5F9] px-4 py-3">
                      <p className="truncate text-[14px] font-semibold">{profile.name || 'Vansh'}</p>
                      <p className="truncate text-[13px] text-[#64748B]">{profile.email}</p>
                    </div>
                    {[
                      { label: 'Profile', to: '/app/profile' },
                      { label: 'Settings', to: '/app/settings' },
                      { label: 'Help', to: '__shortcuts' },
                    ].map((l) => (
                      <button key={l.label} onClick={() => { setUserOpen(false); if (l.to === '__shortcuts') setShortcutsOpen(true); else navigate(l.to); }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]">
                        {l.label}<ChevronRight className="h-4 w-4 text-[#CBD5E1]" />
                      </button>
                    ))}
                    <button onClick={() => { setUserOpen(false); logout(); navigate('/'); }}
                      className="flex w-full items-center gap-2 border-t border-[#F1F5F9] px-4 py-2.5 text-left text-[14px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]">
                      <LogOut className="h-4 w-4" />Log out
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <CompareTray />
      <CompareModal />

      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[calc(100%-40px)] max-w-[360px] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.12)]">
              {t.kind === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" /> : t.kind === 'error' ? <AlertCircle className="h-5 w-5 shrink-0 text-[#DC2626]" /> : <Info className="h-5 w-5 shrink-0 text-[#4F46E5]" />}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0F172A]">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] text-[#64748B]">{t.description}</p>}
              </div>
              <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="text-[#94A3B8] transition-colors hover:text-[#0F172A]"><X className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={closeConfirm} className="absolute inset-0 bg-[#0F172A]" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.25 }}
              className="relative w-full max-w-[400px] rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-2xl">
              <h3 className="text-[18px] font-semibold text-[#0F172A]">{confirmState.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{confirmState.description}</p>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={closeConfirm} className="rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]">Cancel</button>
                <button onClick={() => { confirmState.onConfirm(); closeConfirm(); }} className="rounded-[9px] bg-[#DC2626] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
                  {confirmState.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Right-side drawer — full-screen on mobile */
export function Drawer({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${wide ? 'sm:max-w-[560px]' : 'sm:max-w-[440px]'}`}
            role="dialog" aria-modal="true" aria-label={title}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <h3 className="text-[18px] font-semibold text-[#0F172A]">{title}</h3>
              <button onClick={onClose} aria-label="Close panel" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
