import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Target,
  MousePointerClick,
  Mail,
  MessageCircle,
  TrendingUp,
  UserRound,
  FileText,
  Zap,
  Bell,
  ShieldCheck,
  Check,
  Loader2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { scoreLabel } from './ui';

/* ============================ shared primitives ============================ */

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

/* Icon system: 24px lucide in rounded square, indigo on hover */
export function FeatureIcon({
  icon: Icon,
  dark,
  withSpark,
}: {
  icon: typeof Search;
  dark?: boolean;
  withSpark?: boolean;
}) {
  return (
    <span
      className={cn(
        'relative flex h-12 w-12 items-center justify-center rounded-[14px] transition-all duration-200',
        dark
          ? 'bg-white/10 text-indigo-300 group-hover:bg-[#4F46E5] group-hover:text-white'
          : 'bg-[#F1F5F9] text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)]'
      )}
    >
      <Icon className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" strokeWidth={1.8} />
      {withSpark && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#06B6D4] text-white">
          <Sparkles className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}

/* Subtle floating status pill — real UI component look */
export function FloatPill({
  icon: Icon,
  children,
  dark,
  className,
  delayed,
  dot,
}: {
  icon?: typeof Search;
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  delayed?: boolean;
  dot?: string;
}) {
  const IconCmp = Icon;
  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold shadow-lg backdrop-blur-md md:inline-flex',
        delayed ? 'jw-float-delayed' : 'jw-float',
        dark
          ? 'border-white/15 bg-white/10 text-white'
          : 'border-[#E2E8F0] bg-white/90 text-[#334155]',
        className
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      ) : IconCmp ? (
        <IconCmp className="h-3.5 w-3.5 text-[#4F46E5]" />
      ) : null}
      {children}
    </span>
  );
}

/* Count-up number when scrolled into view */
export function AnimatedScore({
  value,
  decimals = 1,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
    </span>
  );
}

/* Progress bar that animates on viewport entry */
export function AnimatedBar({
  pct,
  className,
  barClass,
  dark,
}: {
  pct: number;
  className?: string;
  barClass?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        'h-2 overflow-hidden rounded-full',
        dark ? 'bg-white/10' : 'bg-[#E6EBF2]',
        className
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
        className={cn('h-full rounded-full bg-[#16A34A]', barClass)}
      />
    </div>
  );
}

/* ============================ bento mini visuals =========================== */

function DiscoveryVisual() {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2.5">
        <span className="relative">
          <Search className="h-4 w-4 text-[#4F46E5]" />
          <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
        </span>
        <span className="text-[14px] text-[#334155]">AI engineer, remote…</span>
      </div>
      {/* scanning beam */}
      <div className="jw-scan-beam pointer-events-none absolute inset-x-4 h-10 rounded-full bg-gradient-to-b from-transparent via-[#4F46E5]/15 to-transparent" aria-hidden="true" />
      <div className="mt-3 space-y-2">
        {['AI Engineer • NeuralLabs', 'ML Engineer • Vectorly', 'Product Engineer • NeuralLabs'].map((row) => (
          <div key={row} className="flex items-center justify-between rounded-[9px] border border-[#E2E8F0] bg-white px-3 py-2">
            <span className="truncate text-[13px] font-medium text-[#334155]">{row}</span>
            <span className="ml-2 shrink-0 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">9+</span>
          </div>
        ))}
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-3 py-1.5 text-[12px] font-semibold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
        Searching… 24 relevant jobs found
      </p>
    </div>
  );
}

function MatchingVisual() {
  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-[#0F172A]">Frontend Developer</p>
          <p className="text-[13px] text-[#64748B]">TechNova • Remote</p>
        </div>
        <div className="text-right">
          <p className="text-[44px] font-extrabold leading-none tracking-tight text-[#0F172A]">
            <AnimatedScore value={9.2} />
            <span className="text-[18px] font-semibold text-[#64748B]"> / 10</span>
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#16A34A]">{scoreLabel(9.2)}</p>
        </div>
      </div>
      <AnimatedBar pct={92} className="mt-4 h-2.5" />
      <div className="mt-4 flex flex-wrap gap-2">
        {['React', 'TypeScript', 'Experience', 'Remote'].map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#334155]">
            <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApplyVisual() {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setSubmitted((v) => !v), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex h-[44px] items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.p
              key="sub"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-[14px] font-semibold text-[#16A34A]"
            >
              <Check className="h-4 w-4" strokeWidth={3} /> Submitted
            </motion.p>
          ) : (
            <motion.p
              key="prep"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2 rounded-full bg-[#FFFBEB] px-4 py-2 text-[14px] font-semibold text-[#B45309]"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 space-y-1.5 text-[13px] text-[#475569]">
        {['Resume attached', 'Fields completed'].map((t) => (
          <p key={t} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} /> {t}
          </p>
        ))}
      </div>
    </div>
  );
}

function OutreachVisual() {
  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3.5">
        <p className="truncate text-[13px] text-[#334155]"><span className="font-semibold text-[#64748B]">To: </span>Sarah Miller</p>
        <p className="mt-1 truncate text-[13px] text-[#334155]"><span className="font-semibold text-[#64748B]">Subject: </span>Quick intro — full-stack engineer</p>
        <div className="mt-2.5 space-y-1.5" aria-hidden="true">
          <div className="h-2 w-full rounded bg-[#E8EDF5]" />
          <div className="h-2 w-11/12 rounded bg-[#E8EDF5]" />
          <div className="h-2 w-2/3 rounded bg-[#E8EDF5]" />
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] bg-[#4F46E5] px-3 py-1.5 text-[12px] font-semibold text-white">
          <Send className="h-3 w-3" /> Send
        </span>
      </div>
    </div>
  );
}

function ResponsesVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4"
    >
      <div className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F0] bg-white p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#4F46E5]">SM</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">Sarah • CloudCore</p>
          <p className="truncate text-[12px] text-[#64748B]">Free for a chat Thursday?</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">Interested</span>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-[#64748B]">
        <Bell className="h-3.5 w-3.5 text-[#4F46E5]" /> AI classified • reply suggested
      </p>
    </motion.div>
  );
}

/* ============================== bento section ============================== */

const BENTO_CARDS = [
  {
    n: '01', label: 'AI JOB DISCOVERY', icon: Search, spark: true,
    title: 'Find relevant opportunities from multiple sources.',
    desc: 'Fresh roles pulled daily, deduped and pre-filtered to your preferences.',
    span: 'lg:col-span-2', Visual: DiscoveryVisual,
  },
  {
    n: '02', label: 'AI MATCHING', icon: Target, spark: false,
    title: 'Understand why each opportunity matches your profile.',
    desc: 'Transparent 0–10 scoring across skills, experience, location and preferences.',
    span: 'lg:col-span-4', Visual: MatchingVisual, large: true,
  },
  {
    n: '03', label: 'ONE-CLICK APPLY', icon: MousePointerClick, spark: false,
    title: 'Automate repetitive application steps.',
    desc: 'Profile auto-fill with a tracked timeline per role.',
    span: 'lg:col-span-2', Visual: ApplyVisual,
  },
  {
    n: '04', label: 'COLD OUTREACH', icon: Mail, spark: false,
    title: 'Generate personalized recruiter emails.',
    desc: 'Tailored drafts you review, edit and send.',
    span: 'lg:col-span-2', Visual: OutreachVisual,
  },
  {
    n: '05', label: 'RECRUITER RESPONSES', icon: MessageCircle, spark: false,
    title: 'Detect and organize recruiter responses.',
    desc: 'AI-classified inbox with suggested follow-ups.',
    span: 'lg:col-span-2', Visual: ResponsesVisual,
  },
];

export function BentoFeatures() {
  return (
    <section className="relative bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4F46E5]">The platform</p>
            <h2 className="mt-4 text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-[#0F172A] sm:text-[56px]">
              LESS SEARCHING.
              <br />
              <span className="text-[#94A3B8]">MORE OPPORTUNITIES.</span>
            </h2>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.1 }} className="lg:pb-2">
            <p className="max-w-[380px] text-[16px] leading-relaxed text-[#64748B]">
              Five miniature product experiences — not feature bullets. Hover any card to feel the workflow.
            </p>
            <Link to="/features" className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#4F46E5]">
              Explore all features <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="relative mt-12">
          <FloatPill icon={Sparkles} className="absolute -top-5 right-8 z-10">
            92% Match
          </FloatPill>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
            {BENTO_CARDS.map((c, i) => (
              <motion.article
                key={c.n}
                {...fadeUp}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className={cn(
                  'group flex flex-col rounded-[20px] border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(15,23,42,0.1)]',
                  c.span
                )}
              >
                <div className="flex items-center justify-between">
                  <FeatureIcon icon={c.icon} withSpark={c.spark} />
                  <span className="text-[13px] font-bold tracking-[0.08em] text-[#CBD5E1]">{c.n}</span>
                </div>
                <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">{c.label}</p>
                <h3 className={cn('mt-2 font-semibold leading-snug text-[#0F172A]', c.large ? 'text-[22px]' : 'text-[19px]')}>
                  {c.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">{c.desc}</p>
                <div className="mt-5 flex-1">
                  <c.Visual />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================= workflow section ============================ */

const WORKFLOW = [
  { n: '01', k: 'SEARCH', icon: Search, desc: 'Find relevant opportunities.', mini: 'search' },
  { n: '02', k: 'MATCH', icon: Target, desc: 'AI scores each opportunity.', mini: 'match' },
  { n: '03', k: 'APPLY', icon: MousePointerClick, desc: 'Submit applications faster.', mini: 'apply' },
  { n: '04', k: 'CONNECT', icon: Mail, desc: 'Reach recruiters directly.', mini: 'connect' },
  { n: '05', k: 'RESPOND', icon: MessageCircle, desc: 'Track recruiter conversations.', mini: 'respond' },
] as const;

function WorkflowMini({ kind }: { kind: string }) {
  if (kind === 'search')
    return (
      <div className="flex items-center justify-between rounded-[9px] border border-[#E2E8F0] bg-white px-2.5 py-2">
        <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]"><Search className="h-3.5 w-3.5 text-[#4F46E5]" /> AI engineer…</span>
        <span className="rounded-full bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold text-white">24</span>
      </div>
    );
  if (kind === 'match')
    return (
      <div className="rounded-[9px] border border-[#E2E8F0] bg-white px-2.5 py-2">
        <div className="flex items-center justify-between text-[12px]"><span className="font-bold">9.2</span><span className="font-semibold text-[#16A34A]">Excellent</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E6EBF2]"><div className="h-full w-[92%] rounded-full bg-[#16A34A]" /></div>
      </div>
    );
  if (kind === 'apply')
    return (
      <div className="flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-2.5 py-2 text-[12px] font-semibold text-[#16A34A]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Submitted
      </div>
    );
  if (kind === 'connect')
    return (
      <div className="flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-2.5 py-2 text-[12px] font-medium text-[#334155]">
        <Mail className="h-3.5 w-3.5 text-[#4F46E5]" /> Outreach sent
      </div>
    );
  return (
    <div className="flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-2.5 py-2 text-[12px]">
      <MessageCircle className="h-3.5 w-3.5 text-[#4F46E5]" />
      <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">Interested</span>
    </div>
  );
}

export function WorkflowSection() {
  return (
    <section className="border-y border-[#E2E8F0] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.45 }} className="mx-auto max-w-[620px] text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4F46E5]">Workflow</p>
          <h2 className="mt-4 text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-[56px]">
            FROM SEARCH
            <br />
            TO OFFER
          </h2>
          <p className="mt-4 text-[17px] text-[#64748B]">One workflow. Less busywork.</p>
        </motion.div>

        <div className="relative mt-14">
          <FloatPill icon={Zap} dot="bg-[#16A34A]" className="absolute -top-6 right-4 z-10">
            AI Agent Active
          </FloatPill>
          {/* thin connecting line — desktop */}
          <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-[#E2E8F0] lg:block" aria-hidden="true" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
            className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-[#4F46E5] lg:block"
            aria-hidden="true"
          />
          {/* vertical line — mobile */}
          <div className="absolute bottom-4 left-6 top-4 w-px bg-[#E2E8F0] lg:hidden" aria-hidden="true" />

          <div className="grid gap-8 pl-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6 lg:pl-0">
            {WORKFLOW.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative pl-12 lg:pl-0 lg:text-center"
              >
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#4F46E5] shadow-[0_1px_2px_rgba(15,23,42,0.06)] lg:static lg:mx-auto">
                  <s.icon className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" strokeWidth={1.8} />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F172A] text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[#0F172A] lg:mt-5">{s.k}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">{s.desc}</p>
                <div className="mt-3 lg:mx-auto lg:max-w-[190px]">
                  <WorkflowMini kind={s.mini} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ why jobwizard (dark) ========================= */

const WHY_TABS = [
  { n: '01', title: 'Stop searching', headline: 'Discovery, handled.' },
  { n: '02', title: 'Stop guessing', headline: 'Fit, explained.' },
  { n: '03', title: 'Stop repeating', headline: 'Busywork, automated.' },
  { n: '04', title: 'Stay in control', headline: 'Decisions, yours.' },
];

function WhyVisual({ active }: { active: number }) {
  if (active === 0)
    return (
      <div>
        <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Search className="h-5 w-5 text-indigo-300" /> AI Job Discovery
        </p>
        <p className="mt-1 flex items-center gap-2 text-[14px] text-white/60">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#06B6D4]" /> Searching…
        </p>
        <div className="mt-5 space-y-2.5">
          {['AI Engineer • NeuralLabs • 9.5', 'Frontend Developer • TechNova • 9.2', 'Backend Developer • DevStack • 8.9'].map((r, i) => (
            <motion.div
              key={r}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.35 }}
              className="flex items-center justify-between rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px]"
            >
              <span className="font-medium text-white/90">{r}</span>
              <Check className="h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />
            </motion.div>
          ))}
        </div>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#16A34A]/15 px-4 py-2 text-[13px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> 24 relevant jobs found
        </p>
      </div>
    );
  if (active === 1)
    return (
      <div>
        <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Target className="h-5 w-5 text-indigo-300" /> AI Match
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[22px] font-semibold text-white">Frontend Developer</p>
            <p className="text-[14px] text-white/55">TechNova • Remote</p>
          </div>
          <p className="text-[44px] font-extrabold leading-none text-white">
            <AnimatedScore value={9.2} />
            <span className="text-[16px] font-semibold text-white/50"> / 10</span>
          </p>
        </div>
        <AnimatedBar pct={92} dark className="mt-4" />
        <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50">Matching factors</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Experience', 'Remote'].map((f, i) => (
            <motion.span
              key={f}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[13px] font-medium text-white/85"
            >
              <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} /> {f}
            </motion.span>
          ))}
        </div>
      </div>
    );
  if (active === 2)
    return (
      <div>
        <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Zap className="h-5 w-5 text-indigo-300" /> Application automation
        </p>
        <div className="mt-5 space-y-3">
          {['Resume attached', 'Profile completed', 'Fields completed', 'Application ready'].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.12, duration: 0.3 }}
              className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-[14px] font-medium text-white/90">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  return (
    <div>
      <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
        <ShieldCheck className="h-5 w-5 text-indigo-300" /> Application review
      </p>
      <div className="mt-5 rounded-[14px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-[18px] font-semibold text-white">AI Engineer • NeuralLabs</p>
        <p className="mt-0.5 text-[14px] text-white/55">9.5 / 10 • Excellent Match • Remote • $145k–$175k</p>
        <p className="mt-4 rounded-[10px] border border-[#06B6D4]/25 bg-[#06B6D4]/10 px-4 py-3 text-[14px] text-cyan-100">
          Application ready for review. Nothing sends until you approve it.
        </p>
        <div className="mt-4 flex gap-2.5">
          <span className="flex-1 rounded-[9px] border border-white/20 px-4 py-2.5 text-center text-[14px] font-semibold text-white">Review</span>
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#0B1226]">
            Apply <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function WhyJobWizard() {
  const [active, setActive] = useState(1);
  return (
    <section className="bg-[#070A12] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-300">Why JobWizard</p>
          <h2 className="mt-4 max-w-[900px] text-[40px] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-[56px] lg:text-[68px]">
            Your job search shouldn&apos;t feel
            <br />
            like <span className="text-white/50">another full-time job.</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* vertical nav */}
          <div className="flex flex-col gap-2" role="tablist" aria-label="Why JobWizard">
            {WHY_TABS.map((t, i) => {
              const selected = active === i;
              return (
                <button
                  key={t.n}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(i)}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-[14px] border px-5 py-4 text-left transition-all duration-200',
                    selected
                      ? 'border-white/15 bg-white/[0.06]'
                      : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                  )}
                >
                  {selected && <span className="absolute left-0 top-0 h-full w-1 bg-[#4F46E5]" />}
                  <span className={cn('text-[13px] font-bold tracking-wider', selected ? 'text-indigo-300' : 'text-white/35')}>
                    {t.n}
                  </span>
                  <span>
                    <span className={cn('block text-[17px] font-semibold', selected ? 'text-white' : 'text-white/60 group-hover:text-white/85')}>
                      {t.title}
                    </span>
                    <span className={cn('block text-[13px]', selected ? 'text-white/55' : 'text-white/35')}>
                      {t.headline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* dynamic visualization */}
          <div className="relative min-h-[440px] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#4F46E5]/20 blur-[100px]" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                <WhyVisual active={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================= intelligence (dark premium) ===================== */

const DIMENSIONS = [
  { icon: Sparkles, label: 'Skills', pct: 92, note: '7 of 8 matched' },
  { icon: TrendingUp, label: 'Experience', pct: 88, note: '4 yrs • mid-level fit' },
  { icon: Target, label: 'Location', pct: 100, note: 'Remote • preferred' },
  { icon: UserRound, label: 'Job Preferences', pct: 95, note: 'Role • salary • type' },
];

export function IntelligenceSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#070A12] to-[#0C1330] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[640px] -translate-x-1/2 rounded-full bg-[#4F46E5]/20 blur-[130px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.45 }} className="mx-auto max-w-[680px] text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-300">JobWizard Intelligence</p>
          <h2 className="mt-4 text-[40px] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-[56px]">
            AI understands
            <br />
            more than keywords.
          </h2>
          <p className="mt-4 text-[17px] text-white/60">Every score decomposes into dimensions you can inspect.</p>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <FloatPill dark className="absolute -top-5 right-6 z-10 border-white/15">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Recruiter Response Detected
            </span>
          </FloatPill>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-[22px] border border-white/40 bg-white text-[#0F172A] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] p-6 sm:p-7">
              <div>
                <p className="text-[20px] font-semibold">Frontend Developer</p>
                <p className="text-[14px] text-[#64748B]">TechNova • Remote • $120k–$145k</p>
              </div>
              <div className="text-right">
                <p className="text-[34px] font-extrabold leading-none">
                  <AnimatedScore value={9.2} /> <span className="text-[16px] font-semibold text-[#64748B]">/ 10</span>
                </p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-bold text-[#16A34A]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> Excellent Match
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
              {DIMENSIONS.map((d, i) => (
                <motion.div
                  key={d.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-[14px] font-semibold">
                      <d.icon className="h-[18px] w-[18px] text-[#4F46E5]" /> {d.label}
                    </p>
                    <span className="text-[13px] font-bold text-[#0F172A]">{d.pct}%</span>
                  </div>
                  <AnimatedBar pct={d.pct} className="mt-2.5" />
                  <p className="mt-1.5 text-[12px] text-[#64748B]">{d.note}</p>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-7">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">
                <Sparkles className="h-4 w-4" /> Why this is a match
              </p>
              <p className="mt-2.5 max-w-[620px] text-[15px] leading-relaxed text-[#334155]">
                Your React and TypeScript experience covers 7 of 8 required skills, your 4-year
                mid-level background matches the role level, and the remote location plus salary
                band sit inside your stated preferences. Low risk, high fit — worth an application
                this week.
              </p>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-[#64748B]">
                <FileText className="h-4 w-4 text-[#4F46E5]" /> Grounded in your resume • Vansh_Resume_2026.pdf
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
