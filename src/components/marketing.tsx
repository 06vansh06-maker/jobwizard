import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Bell, Building2, Check, ChevronLeft, ChevronRight, CircleCheck,
  Clock, Briefcase, FileText, Mail, MapPin, Menu, TrendingUp, X, Zap,
  Linkedin, Twitter, Github,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { scoreLabel } from './ui';

/* ------------------------------- HERO JOBS -------------------------------- */
export const HERO_JOBS = [
  { title: 'Frontend Developer', company: 'TechNova', location: 'Remote', type: 'Full-time', salary: '$120k – $145k', score: 9.2, skills: ['React', 'TypeScript', 'JavaScript', 'CSS'], logo: 'T', logoBg: 'bg-indigo-50 text-indigo-600' },
  { title: 'Senior Software Engineer', company: 'CloudCore', location: 'San Francisco, CA', type: 'Hybrid', salary: '$155k – $185k', score: 8.8, skills: ['Python', 'APIs', 'System Design', 'AWS'], logo: 'C', logoBg: 'bg-cyan-50 text-cyan-700' },
  { title: 'AI Engineer', company: 'NeuralLabs', location: 'Remote', type: 'Full-time', salary: '$145k – $175k', score: 9.5, skills: ['Python', 'Machine Learning', 'LLMs', 'PyTorch'], logo: 'N', logoBg: 'bg-violet-50 text-violet-700' },
  { title: 'Backend Developer', company: 'DevStack', location: 'Austin, TX', type: 'On-site', salary: '$130k – $160k', score: 8.9, skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'], logo: 'D', logoBg: 'bg-slate-100 text-slate-700' },
];

/* --------------------------- interactive job card -------------------------- */
export function InteractiveJobCard({ compact }: { compact?: boolean }) {
  const { login } = useApp();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + HERO_JOBS.length) % HERO_JOBS.length);
  }, [index]);

  const next = useCallback(() => { setDirection(1); setIndex((i) => (i + 1) % HERO_JOBS.length); }, []);
  const prev = useCallback(() => { setDirection(-1); setIndex((i) => (i - 1 + HERO_JOBS.length) % HERO_JOBS.length); }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => { setDirection(1); setIndex((i) => (i + 1) % HERO_JOBS.length); }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  const job = HERO_JOBS[index];
  const handleGetStarted = () => { login(); navigate('/app/dashboard'); };

  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Recommended for you</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={prev} aria-label="Previous job recommendation" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={next} aria-label="Next job recommendation" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative min-h-[312px] px-5 py-5 sm:min-h-[296px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, x: 18 * direction }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 * direction }} transition={{ duration: 0.28, ease: 'easeOut' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[18px] font-bold ${job.logoBg}`} aria-hidden="true">{job.logo}</div>
                <div className="min-w-0">
                  <h3 className="truncate text-[20px] font-semibold leading-tight text-[#0F172A]">{job.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px] text-[#64748B]">
                    <span className="font-medium text-[#334155]">{job.company}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">•</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[20px] font-bold leading-none text-[#0F172A]">{job.score.toFixed(1)} <span className="text-[14px] font-semibold text-[#64748B]">/ 10</span></div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-semibold text-[#16A34A]">
                  <CircleCheck className="h-3.5 w-3.5" />{scoreLabel(job.score)}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]" role="progressbar" aria-valuenow={job.score} aria-valuemin={0} aria-valuemax={10} aria-label={`Match score ${job.score} out of 10`}>
                <motion.div key={`bar-${index}`} initial={{ width: 0 }} animate={{ width: `${job.score * 10}%` }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }} className="h-full rounded-full bg-[#16A34A]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B]">{job.type} • {job.salary}</span>
                <span className="font-semibold text-[#16A34A]">{Math.round(job.score * 10)}% match</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Matched skills</p>
              <div className="mt-2 flex min-h-[68px] flex-wrap content-start gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#334155]">
                    <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} />{skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {!compact && (
        <div className="border-t border-[#F1F5F9] px-5 py-4">
          <div className="flex gap-3">
            <button type="button" onClick={handleGetStarted} className="flex-1 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">Apply in 1-click</button>
            <button type="button" onClick={next} aria-label="Show next recommended job" className="rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold text-[#0F172A] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">Save</button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-label="Job recommendations">
            {HERO_JOBS.map((j, i) => (
              <button key={j.title} type="button" role="tab" aria-selected={i === index} aria-label={`Show ${j.title} at ${j.company}`} onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[#4F46E5]' : 'w-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1]'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- navbar --------------------------------- */
export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const linkCls = (path: string) =>
    `transition-colors hover:text-[#0F172A] ${location.pathname === path ? 'text-[#0F172A] font-semibold' : ''}`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="JobWizard home">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#4F46E5]"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span>
          <span className="text-[20px] font-bold tracking-tight text-[#0F172A]">JobWizard</span>
        </Link>
        <nav className="hidden items-center gap-9 text-[15px] font-medium text-[#475569] lg:flex" aria-label="Primary">
          <Link to="/features" className={linkCls('/features')}>Features</Link>
          <Link to="/how-it-works" className={linkCls('/how-it-works')}>How It Works</Link>
          <Link to="/about" className={linkCls('/about')}>About</Link>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="rounded-[9px] px-4 py-2.5 text-[15px] font-semibold text-[#334155] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]">Log In</Link>
          <Link to="/login" className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#3730A3]">Get Started</Link>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#E2E8F0] bg-white text-[#0F172A] lg:hidden"
          onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#E2E8F0] bg-white lg:hidden">
            <nav className="space-y-1 px-6 py-4" aria-label="Mobile">
              {[['Features', '/features'], ['How It Works', '/how-it-works'], ['About', '/about']].map(([label, href]) => (
                <Link key={label} to={href} onClick={() => setMobileOpen(false)} className="block rounded-[9px] px-3 py-3 text-[16px] font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]">{label}</Link>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-3 text-center text-[15px] font-semibold text-[#0F172A]">Log In</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full rounded-[9px] bg-[#4F46E5] px-4 py-3 text-center text-[15px] font-semibold text-white">Get Started</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* --------------------------------- footer --------------------------------- */
export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#4F46E5]"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span>
              <span className="text-[20px] font-bold tracking-tight text-[#0F172A]">JobWizard</span>
            </div>
            <p className="mt-4 max-w-[300px] text-[15px] leading-[1.6] text-[#64748B]">Your AI-powered job search assistant. Find, match, apply and get noticed.</p>
            <div className="mt-5 flex gap-2">
              {[{ icon: Linkedin, label: 'LinkedIn' }, { icon: Twitter, label: 'Twitter' }, { icon: Github, label: 'GitHub' }].map((s) => (
                <span key={s.label} aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[#E2E8F0] text-[#64748B]"><s.icon className="h-4 w-4" /></span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0F172A]">Product</p>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[#64748B]">
              <li><Link to="/features" className="hover:text-[#0F172A]">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#0F172A]">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-[#0F172A]">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0F172A]">Company</p>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[#64748B]">
              <li><Link to="/about" className="hover:text-[#0F172A]">About</Link></li>
              <li><Link to="/about" className="hover:text-[#0F172A]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0F172A]">Legal</p>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[#64748B]">
              <li><span>Privacy</span></li>
              <li><span>Terms</span></li>
              <li><span>Security</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#F1F5F9] pt-6 text-[14px] text-[#94A3B8] sm:flex-row">
          <span>© 2026 JobWizard. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5"><CircleCheck className="h-4 w-4 text-[#16A34A]" />Your data stays private</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

/* Shared hero dashboard chrome used on landing */
export function HeroDashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_40px_rgba(15,23,42,0.1)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
          <span className="ml-3 hidden text-[13px] font-semibold text-[#475569] sm:block">JobWizard Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-semibold text-[#16A34A] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />Live
          </span>
          <span className="relative"><Bell className="h-[18px] w-[18px] text-[#64748B]" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">3</span>
          </span>
        </div>
      </div>
      <div className="space-y-4 bg-white p-4 sm:p-5">
        <InteractiveJobCard />
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, label: 'Applied', value: '14', sub: '+3 this week' },
            { icon: Mail, label: 'Outreach sent', value: '22', sub: '68% open rate' },
            { icon: TrendingUp, label: 'Responses', value: '7', sub: '2 new today' },
          ].map((s) => (
            <div key={s.label} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-1.5 text-[#64748B]"><s.icon className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold uppercase tracking-[0.06em]">{s.label}</span></div>
              <div className="mt-1 text-[20px] font-bold leading-none text-[#0F172A]">{s.value}</div>
              <div className="mt-1 truncate text-[12px] text-[#64748B]">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinalCta() {
  const { login } = useApp();
  const navigate = useNavigate();
  const go = () => { login(); navigate('/app/dashboard'); };
  return (
    <section className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="relative overflow-hidden rounded-[22px] bg-[#0F172A] px-6 py-16 text-center sm:px-12 lg:py-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-[#4F46E5]/25 blur-[100px]" />
            <div className="absolute -bottom-28 right-10 h-48 w-72 rounded-full bg-[#06B6D4]/15 blur-[90px]" />
          </div>
          <div className="relative">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#93C5FD]">Get started</p>
            <h2 className="mx-auto mt-3 max-w-[560px] text-[32px] font-bold leading-[1.1] tracking-tight text-white sm:text-[40px]">Stop searching. Start applying smarter.</h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-[1.6] text-slate-300 sm:text-[18px]">Let JobWizard handle the repetitive parts of your job search.</p>
            <button onClick={go} className="mt-8 inline-flex items-center gap-2 rounded-[9px] bg-[#4F46E5] px-8 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#6366F1]">
              Get Started<ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-[13px] text-slate-400">Free to start • No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Building2, Clock, Briefcase };
