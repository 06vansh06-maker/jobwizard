import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Menu,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { scoreLabel } from './ui';

/* ------------------------------------------------------------------ */
/*  Cinematic background: dark office at night, subject right of frame  */
/*  Remote Unsplash photo (moody late-night desk work, city bokeh).     */
/*  Base color + gradients guarantee premium look even if image fails.  */
/* ------------------------------------------------------------------ */
const HERO_BG_URL =
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2400&auto=format&fit=crop';

const CINEMATIC_JOBS = [
  {
    title: 'Frontend Developer',
    company: 'TechNova',
    score: 9.2,
    skills: ['React', 'TypeScript', 'JavaScript'],
  },
  {
    title: 'AI Engineer',
    company: 'NeuralLabs',
    score: 9.5,
    skills: ['Python', 'Machine Learning', 'LLMs'],
  },
  {
    title: 'Backend Developer',
    company: 'DevStack',
    score: 8.9,
    skills: ['Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    title: 'Senior Software Engineer',
    company: 'CloudCore',
    score: 8.8,
    skills: ['Python', 'APIs', 'System Design'],
  },
];

/* ------------------------- rotating product card ------------------------- */
function CinematicJobCard() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % CINEMATIC_JOBS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % CINEMATIC_JOBS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  const job = CINEMATIC_JOBS[index];

  return (
    <div
      className="w-full max-w-[380px] rounded-[18px] border border-white/50 bg-white/[0.96] shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* card top bar */}
      <div className="flex items-center justify-between border-b border-[#EDF1F7] px-5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4F46E5]">
          <Sparkles className="h-3 w-3" />
          AI Match
        </span>
        <button
          type="button"
          onClick={next}
          aria-label="Show next job match"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* animated body — fixed min-height keeps surrounding layout stable */}
      <div className="min-h-[232px] px-5 py-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 16 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 * direction }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-[20px] font-semibold leading-tight text-[#0F172A]">
                  {job.title}
                </h3>
                <p className="mt-0.5 text-[14px] text-[#64748B]">{job.company}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[22px] font-bold leading-none text-[#0F172A]">
                  {job.score.toFixed(1)}{' '}
                  <span className="text-[14px] font-semibold text-[#64748B]">/ 10</span>
                </p>
                <p className="mt-1 text-[12px] font-semibold text-[#16A34A]">
                  {scoreLabel(job.score)}
                </p>
              </div>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6EBF2]"
              role="progressbar"
              aria-valuenow={job.score}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-label={`Match score ${job.score} out of 10`}
            >
              <motion.div
                key={`bar-${index}`}
                initial={{ width: 0 }}
                animate={{ width: `${job.score * 10}%` }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
                className="h-full rounded-full bg-[#4F46E5]"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-[8px] bg-[#F1F5F9] px-3 py-1.5 text-[13px] font-medium text-[#334155]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dots */}
      <div
        className="flex items-center justify-center gap-1.5 border-t border-[#EDF1F7] px-5 py-3.5"
        role="tablist"
        aria-label="Job matches"
      >
        {CINEMATIC_JOBS.map((j, i) => (
          <button
            key={j.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${j.title} at ${j.company}`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-[#4F46E5]' : 'w-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- hero ---------------------------------- */
export default function CinematicHero() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const start = () => {
    login();
    navigate('/app/dashboard');
  };

  return (
    <section className="relative overflow-hidden bg-[#04070F] text-white">
      {/* ------- cinematic backdrop ------- */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={HERO_BG_URL}
          alt=""
          loading="eager"
          referrerPolicy="no-referrer"
          className="jw-kenburns h-full w-full object-cover object-[68%_center]"
        />
        {/* readability: dark from left, revealing subject on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#04070F] via-[#060C1E]/92 to-[#0A1330]/25" />
        {/* top legibility for nav + bottom fade into metrics */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#04070F]/70 via-transparent to-[#04070F]/90" />
        {/* subtle brand lighting — restrained, not neon */}
        <div className="absolute -left-32 top-1/3 h-[440px] w-[440px] rounded-full bg-[#4F46E5]/20 blur-[140px]" />
        <div className="absolute right-[8%] top-[16%] h-56 w-56 rounded-full bg-[#06B6D4]/10 blur-[110px]" />
        {/* vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_220px_rgba(0,0,0,0.6)]" />
      </div>

      {/* ------- transparent navbar ------- */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="JobWizard home">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#4F46E5]">
              <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[20px] font-bold tracking-tight text-white">JobWizard</span>
          </Link>

          <nav
            className="hidden items-center gap-9 text-[15px] font-medium text-white/70 lg:flex"
            aria-label="Primary"
          >
            <Link to="/features" className="transition-colors hover:text-white">
              Features
            </Link>
            <Link to="/how-it-works" className="transition-colors hover:text-white">
              How It Works
            </Link>
            <a href="#why" className="transition-colors hover:text-white">
              Why JobWizard
            </a>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="rounded-[9px] px-4 py-2.5 text-[15px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              Log In
            </Link>
            <Link
              to="/login"
              className="rounded-[9px] bg-white px-5 py-2.5 text-[15px] font-semibold text-[#0B1226] transition-colors hover:bg-[#E0E7FF]"
            >
              Get Started
            </Link>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-white/20 bg-white/5 text-white backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-4 overflow-hidden rounded-[14px] border border-white/10 bg-[#0A1122]/95 backdrop-blur-md lg:hidden"
            >
              <nav className="space-y-1 p-4" aria-label="Mobile">
                <Link
                  to="/features"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-[9px] px-3 py-3 text-[16px] font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Features
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-[9px] px-3 py-3 text-[16px] font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  How It Works
                </Link>
                <a
                  href="#why"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-[9px] px-3 py-3 text-[16px] font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Why JobWizard
                </a>
                <div className="flex flex-col gap-2 pt-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-[9px] border border-white/20 px-4 py-3 text-center text-[15px] font-semibold text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-[9px] bg-white px-4 py-3 text-center text-[15px] font-semibold text-[#0B1226]"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ------- hero content ------- */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-14 pt-36 sm:pt-40 lg:min-h-[92svh] lg:grid-cols-[1.02fr_0.98fr] lg:pb-20 lg:pt-44">
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-[620px]"
        >
          <p className="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" aria-hidden="true" />
            AI-Powered Job Search
          </p>

          <h1 className="mt-6 text-[52px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[72px] lg:text-[84px]">
            <span className="block text-white">Your job search.</span>
            <span className="block text-white/65">On autopilot.</span>
          </h1>

          <p className="mt-6 max-w-[480px] text-[16px] leading-[1.65] text-white/70 sm:text-[18px]">
            Find relevant jobs, match them with AI, apply faster, and reach recruiters — all
            from one place.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={start}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-7 py-4 text-[16px] font-semibold text-[#0B1226] transition-colors hover:bg-[#E0E7FF]"
            >
              Start Your Job Search
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-[10px] border border-white/25 px-7 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* floating product UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative">
            <div className="jw-float">
              <CinematicJobCard />
            </div>

            {/* secondary status card — desktop/tablet only */}
            <div className="jw-float-delayed absolute -bottom-8 -left-10 hidden sm:block">
              <div className="flex items-center gap-3 rounded-[14px] border border-white/15 bg-[#0B1322]/75 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A]">
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-white">Application submitted</p>
                  <p className="text-[12px] text-white/60">TechNova • just now</p>
                </div>
              </div>
            </div>

            {/* matched-count pill */}
            <div className="absolute -top-5 right-4 hidden rounded-full border border-white/15 bg-[#0B1322]/75 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg backdrop-blur-md sm:block">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
              3 new jobs matched
            </div>
          </div>
        </motion.div>
      </div>

      {/* ------- bottom metrics ------- */}
      <div className="relative z-10 border-t border-white/10 bg-black/25 backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-3 px-6 py-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[20px] font-bold text-white">20+</span>
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/55">
              Jobs analyzed
            </span>
          </div>
          <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2.5">
            <span className="text-[20px] font-bold text-white">5/day</span>
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/55">
              Applications automated
            </span>
          </div>
          <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-2.5">
            <span className="text-[20px] font-bold text-white">AI</span>
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/55">
              Match scoring
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
