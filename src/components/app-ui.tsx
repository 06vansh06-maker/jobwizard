import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, Check, Eye, Loader2, X, Sparkles, Scale, ListPlus, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { useApp } from '../store/AppContext';
import { JOBS, APPLICATION_SERIES } from '../data/mock';
import { readinessScore, resumeMatch, generateCoverDraft, generateQuestionDraft, generateFollowup, roleQuestion, whyApplyContext } from '../lib/ai';
import { cn } from '../lib/cn';
import { Card, MatchBadge, MatchBar, SkillPill, StatusBadge, EmptyState } from './ui';
import { AreaChart } from './charts';

/* ---------- animated count-up ---------- */
export function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ---------- restrained AI action primitives ---------- */
export function AiButton({ children, onClick, className, disabled }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0F172A] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-50', className)}
    >
      <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
      {children}
    </button>
  );
}

export function AiLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4F46E5]', className)}>
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

export function DemoNote({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] leading-relaxed text-[#94A3B8]', className)}>
      {children ?? 'Demo analysis computed from your saved profile — not a guaranteed prediction.'}
    </p>
  );
}

/* ---------- clickable stat card ---------- */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  to,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  to: string;
}) {
  const navigate = useNavigate();
  const m = value.match(/^([\d.]+)(.*)$/);
  const numeric = m ? parseFloat(m[1]) : NaN;
  const suffix = m ? m[2] : '';
  const animated = useCountUp(Number.isFinite(numeric) ? numeric : 0);
  return (
    <button onClick={() => navigate(to)} className="group text-left">
      <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_10px_28px_rgba(79,70,229,0.12)]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[#4F46E5] transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
            <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-y-px" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-[#CBD5E1] transition-all group-hover:translate-x-0.5 group-hover:text-[#4F46E5]" />
        </div>
        <p className="mt-3 text-[32px] font-bold leading-none tracking-tight">
          {Number.isFinite(numeric) ? animated : value}{Number.isFinite(numeric) ? suffix : ''}
        </p>
        <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">{label}</p>
        <p className="mt-1 text-[13px] text-[#64748B]">
          {delta && <span className="mr-1.5 font-bold text-[#16A34A]">{delta}</span>}
          {sub}
        </p>
      </Card>
    </button>
  );
}

/* ---------- shared job card ---------- */
export function JobCard({
  job,
  onView,
  onApply,
  footer,
  className,
  highlighted,
}: {
  job: Job;
  onView: () => void;
  onApply?: () => void;
  footer?: ReactNode;
  className?: string;
  highlighted?: boolean;
}) {
  const { savedJobIds, toggleSaveJob, appliedJobIds, profile, queueJobIds, toggleQueueJob, compareIds, toggleCompareJob } = useApp();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.has(job.id);
  const queued = queueJobIds.includes(job.id);
  const compared = compareIds.includes(job.id);
  const [applying, setApplying] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const gaps = job.skills.filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase())).slice(0, 2);
  const handleApply = () => {
    if (applied || applying || !onApply) return;
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      onApply();
    }, 450);
  };

  return (
    <Card className={cn(
      'group relative flex flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#C7D2FE] hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]',
      highlighted && 'border-[#4F46E5] shadow-[0_10px_32px_rgba(79,70,229,0.14)]',
      className
    )}>
      {highlighted && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-[#4F46E5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white shadow-md">
          Top match
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF2FF] text-[17px] font-bold text-[#4F46E5]" aria-hidden="true">
            {job.company.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold">{job.title}</p>
            <p className="mt-0.5 truncate text-[14px] text-[#64748B]">
              <span className="font-medium text-[#334155]">{job.company}</span> • {job.location}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#334155]">{job.salary}</p>
          </div>
        </div>
        <MatchBadge score={job.matchScore} compact />
      </div>
      <MatchBar score={job.matchScore} className="mt-3" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => <SkillPill key={s} skill={s} />)}
      </div>
      <p className="mt-3 line-clamp-2 rounded-[10px] bg-[#F8FAFC] px-3 py-2 text-[13px] leading-relaxed text-[#475569]">
        <span className="font-semibold text-[#4F46E5]">Why this fits: </span>
        {(job.whyMatches ?? []).slice(0, 2).join(' · ') || `${job.skills.slice(0, 2).join(', ')} overlap with your profile`}
        {gaps.length > 0 && <span className="text-[#94A3B8]"> · Gaps: {gaps.join(', ')}</span>}
        {' '}
        <button onClick={() => setWhyOpen(true)} className="font-semibold text-[#4F46E5] hover:underline">Why should I apply?</button>
      </p>
      <div className="mt-2.5 flex gap-1.5">
        <button
          onClick={() => toggleQueueJob(job.id)}
          aria-pressed={queued}
          title={queued ? 'Remove from application queue' : 'Add to application queue'}
          className={cn('inline-flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border px-2 py-2 text-[13px] font-semibold transition-colors',
            queued ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
        >
          <ListPlus className="h-4 w-4" />{queued ? 'Queued' : 'Queue'}
        </button>
        <button
          onClick={() => toggleCompareJob(job.id)}
          aria-pressed={compared}
          title={compared ? 'Remove from compare' : 'Add to compare (up to 3)'}
          className={cn('inline-flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border px-2 py-2 text-[13px] font-semibold transition-colors',
            compared ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
        >
          <Scale className="h-4 w-4" />{compared ? `Added (${compareIds.length}/3)` : 'Compare'}
        </button>
      </div>
      {footer}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onView}
          className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-3 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
        >
          <Eye className="h-4 w-4" />View Details
          <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 -translate-x-1 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
        </button>
        <button
          onClick={() => toggleSaveJob(job.id)}
          aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`}
          aria-pressed={saved}
          className={cn(
            'flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[9px] border transition-all hover:-translate-y-px',
            saved ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5] hover:text-[#4F46E5]'
          )}
        >
          {saved ? <BookmarkCheck className="h-[18px] w-[18px]" /> : <Bookmark className="h-[18px] w-[18px] transition-transform duration-200 hover:scale-110" />}
        </button>
        {onApply ? (
          <button
            onClick={handleApply}
            disabled={applied || applying}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-3 py-2.5 text-[14px] font-semibold text-white transition-colors',
              applied ? 'cursor-default bg-[#16A34A]' : applying ? 'cursor-wait bg-[#6366F1]' : 'bg-[#4F46E5] hover:bg-[#3730A3]'
            )}
          >
            {applied ? (<><Check className="h-4 w-4" strokeWidth={3} />Applied</>) : applying ? (<><Loader2 className="h-4 w-4 animate-spin" />Applying…</>) : 'Apply now'}
          </button>
        ) : (
          <ApplyNowButton jobId={job.id} applied={applied} className="flex-1" />
        )}
      </div>
      <WhyApplyModal job={job} open={whyOpen} onClose={() => setWhyOpen(false)} />
    </Card>
  );
}

/* ---------- shared apply-now button: Apply → Applying… → ✓ Applied ---------- */
export function ApplyNowButton({
  jobId,
  applied,
  big,
  onDone,
  className,
}: {
  jobId: string;
  applied: boolean;
  big?: boolean;
  onDone?: () => void;
  className?: string;
}) {
  const { applyToJob } = useApp();
  const [applying, setApplying] = useState(false);
  return (
    <button
      onClick={() => {
        if (applied || applying) return;
        setApplying(true);
        setTimeout(() => {
          setApplying(false);
          applyToJob(jobId);
          onDone?.();
        }, 900);
      }}
      disabled={applied || applying}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[9px] text-[14px] font-semibold text-white transition-colors',
        big ? 'px-4 py-3' : 'px-3 py-2.5',
        applied ? 'cursor-default bg-[#16A34A]' : applying ? 'cursor-wait bg-[#6366F1]' : 'bg-[#4F46E5] hover:bg-[#3730A3]',
        className
      )}
    >
      {applied ? (<><Check className="h-4 w-4" strokeWidth={3} />Applied</>) : applying ? (<><Loader2 className="h-4 w-4 animate-spin" />Applying…</>) : 'Apply now'}
    </button>
  );
}

/* ---------- AI match radar ---------- */
export interface MatchDimension {
  key: string;
  label: string;
  pct: number;
  summary: string;
  detail: string;
}

export function matchDimensions(job: Job, profile: { skills: string[]; experienceLevel: string; preferredLocations: string[]; location: string; salaryMin: number; workMode: string; jobType: string }): MatchDimension[] {
  const overlap = job.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const skillPct = Math.round((overlap.length / Math.max(1, job.skills.length)) * 100);
  const levels = ['Entry', 'Mid', 'Senior', 'Lead'];
  const gap = Math.abs(levels.indexOf(job.experience) - levels.indexOf(profile.experienceLevel));
  const expPct = gap <= 0 ? 92 : gap === 1 ? 76 : 58;
  const locHit = job.workMode === 'Remote' || profile.preferredLocations.some((l) => job.location.includes(l) || l.includes(job.location));
  const locPct = job.workMode === 'Remote' ? 100 : locHit ? 85 : 55;
  let prefScore = 70;
  const prefNotes: string[] = [];
  if (job.type === profile.jobType) { prefScore += 12; prefNotes.push(job.type); }
  if ((profile.workMode || '').toLowerCase().includes(job.workMode.toLowerCase())) { prefScore += 10; prefNotes.push(job.workMode); }
  if (job.salaryMin >= (profile.salaryMin || 0)) { prefScore += 8; prefNotes.push('salary band fit'); }
  const prefPct = Math.min(100, prefScore);
  return [
    {
      key: 'skills', label: 'Skills', pct: skillPct,
      summary: `${overlap.length} of ${job.skills.length} required skills matched`,
      detail: overlap.length > 0 ? `Strong overlap: ${overlap.join(', ')}.` : 'Limited direct overlap — review the required stack carefully.',
    },
    {
      key: 'experience', label: 'Experience', pct: expPct,
      summary: gap === 0 ? 'Level matches your experience exactly' : gap === 1 ? 'One level from your current band' : 'Level differs from your current band',
      detail: `${job.experience} level role vs your ${profile.experienceLevel} background. ${gap <= 1 ? 'Good alignment with your current level.' : 'A stretch — emphasize transferable scope.'}`,
    },
    {
      key: 'location', label: 'Location', pct: locPct,
      summary: job.workMode === 'Remote' ? 'Remote — your top preference' : locHit ? 'Inside your preferred areas' : 'Outside preferred areas',
      detail: job.workMode === 'Remote' ? 'Matches preferred remote location.' : `${job.location} (${job.workMode}). ${locHit ? 'Within your saved preferences.' : 'Consider relocation or remote flexibility.'}`,
    },
    {
      key: 'preferences', label: 'Preferences', pct: prefPct,
      summary: prefNotes.length > 0 ? `Fits: ${prefNotes.join(' · ')}` : 'Partial preference fit',
      detail: `${job.type}, ${job.workMode}, ${job.salary} against your saved role, mode and pay preferences.`,
    },
  ];
}

export function MatchRadar({ job }: { job: Job }) {
  const { profile } = useApp();
  const dims = matchDimensions(job, profile);
  const [selected, setSelected] = useState(dims[0].key);
  const activeDim = dims.find((d) => d.key === selected) ?? dims[0];
  const size = 220;
  const c = size / 2;
  const R = size / 2 - 36;
  const vertex = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / dims.length;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  };
  const poly = dims.map((d, i) => vertex(i, (d.pct / 100) * R)).join(' ');

  return (
    <div>
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`AI match radar for ${job.title}`}>
          {[0.33, 0.66, 1].map((f) => (
            <polygon
              key={f}
              points={dims.map((_, i) => vertex(i, R * f)).join(' ')}
              fill="none" stroke="#E2E8F0" strokeWidth="1"
            />
          ))}
          {dims.map((_, i) => (
            <line key={i} x1={c} y1={c} x2={vertex(i, R).split(',')[0]} y2={vertex(i, R).split(',')[1]} stroke="#E2E8F0" strokeWidth="1" />
          ))}
          <motion.polygon
            points={poly}
            fill="rgba(79,70,229,0.14)" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            style={{ transformOrigin: 'center' }} transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {dims.map((d, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / dims.length;
            const cx = (c + (d.pct / 100) * R * Math.cos(a)).toFixed(1);
            const cy = (c + (d.pct / 100) * R * Math.sin(a)).toFixed(1);
            return <circle key={d.key} cx={cx} cy={cy} r="4" fill={selected === d.key ? '#3730A3' : '#4F46E5'} stroke="#fff" strokeWidth="2" />;
          })}
          <text x={c} y={c - 2} textAnchor="middle" fontSize="26" fontWeight="800" fill="#0F172A">{job.matchScore.toFixed(1)}</text>
          <text x={c} y={c + 16} textAnchor="middle" fontSize="11" fill="#64748B">/ 10</text>
          {dims.map((d, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / dims.length;
            const x = c + (R + 24) * Math.cos(a);
            const y = c + (R + 24) * Math.sin(a);
            return (
              <text key={d.key} x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={selected === d.key ? '#4F46E5' : '#64748B'} style={{ cursor: 'pointer' }}
                onClick={() => setSelected(d.key)}>
                {d.label}
              </text>
            );
          })}
        </svg>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5" role="tablist" aria-label="Match dimensions">
          {dims.map((d) => (
            <button
              key={d.key} role="tab" aria-selected={selected === d.key} onClick={() => setSelected(d.key)}
              className={cn('rounded-[8px] px-2.5 py-1.5 text-[12px] font-semibold transition-colors',
                selected === d.key ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
            >
              {d.label} {d.pct}%
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeDim.key}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
          className="mt-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4"
        >
          <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#4F46E5]">{activeDim.label}</p>
          <p className="mt-1 text-[14px] font-medium">{activeDim.summary}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{activeDim.detail}</p>
        </motion.div>
      </AnimatePresence>
      <p className="mt-2 text-center text-[11px] text-[#94A3B8]">Calculated live from your profile, skills and preferences.</p>
    </div>
  );
}
export function JobDetailBody({ job, onClose }: { job: Job; onClose?: () => void }) {
  const { savedJobIds, toggleSaveJob, appliedJobIds, profile, queueJobIds, toggleQueueJob, compareIds, toggleCompareJob } = useApp();
  const navigate = useNavigate();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.has(job.id);
  const queued = queueJobIds.includes(job.id);
  const compared = compareIds.includes(job.id);
  const [whyOpen, setWhyOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const gaps = job.skills.filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const overlap = job.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[20px] font-bold leading-snug">{job.title}</p>
          <p className="mt-1 text-[14px] text-[#64748B]">{job.company} • {job.location}</p>
          <p className="mt-0.5 text-[13px] text-[#64748B]">{job.salary} • {job.type} • {job.workMode} • {job.experience} level • {job.postedAt}</p>
        </div>
        <MatchBadge score={job.matchScore} compact />
      </div>

      <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-center text-[13px] font-bold uppercase tracking-[0.07em] text-[#4F46E5]">AI match radar</p>
        <div className="mt-1"><MatchRadar job={job} /></div>
      </div>

      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">About this role</p>
        <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">{job.description}</p>
      </div>
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">Skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{job.skills.map((s) => <SkillPill key={s} skill={s} />)}</div>
      </div>
      <div className="rounded-[12px] border border-[#4F46E5]/25 bg-[#EEF2FF]/50 p-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#4F46E5]">Why this matches you</p>
        <ul className="mt-2 space-y-1.5">
          {(job.whyMatches ?? job.skills.slice(0, 3)).map((w) => (
            <li key={w} className="flex items-center gap-2 text-[14px] text-[#334155]">
              <Check className="h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />{w}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[12px] border border-[#FCD34D]/60 bg-[#FFFBEB]/60 p-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#92400E]">Potential gaps</p>
        {gaps.length === 0 ? (
          <p className="mt-1.5 text-[14px] text-[#334155]">No gaps — you cover the full required stack.</p>
        ) : (
          <>
            <p className="mt-1.5 text-[14px] text-[#334155]">
              You match strongly on <span className="font-semibold">{overlap.join(', ') || 'core skills'}</span>.
              You may need <span className="font-semibold">{gaps.slice(0, 3).join(', ')}</span>.
            </p>
            <button
              onClick={() => { onClose?.(); navigate('/app/profile'); }}
              className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#4F46E5] hover:underline"
            >
              Improve Match<ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
      <ReadinessPanel job={job} onNavigate={onClose} />
      <div className="grid grid-cols-2 gap-2">
        <AiButton onClick={() => setWhyOpen(true)}>Why apply?</AiButton>
        <AiButton onClick={() => setResumeOpen(true)}>Compare resume</AiButton>
        <button
          onClick={() => toggleQueueJob(job.id)}
          aria-pressed={queued}
          className={cn('inline-flex items-center justify-center gap-1.5 rounded-[9px] border px-3 py-2 text-[13px] font-semibold transition-colors',
            queued ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
        >
          <ListPlus className="h-3.5 w-3.5" />{queued ? 'Queued' : 'Add to queue'}
        </button>
        <button
          onClick={() => toggleCompareJob(job.id)}
          aria-pressed={compared}
          className={cn('inline-flex items-center justify-center gap-1.5 rounded-[9px] border px-3 py-2 text-[13px] font-semibold transition-colors',
            compared ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
        >
          <Scale className="h-3.5 w-3.5" />{compared ? 'Added to compare' : 'Compare'}
        </button>
      </div>
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => toggleSaveJob(job.id)}
          className={cn('flex-1 rounded-[9px] border px-4 py-3 text-[14px] font-semibold transition-colors',
            saved ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
        >
          {saved ? 'Saved' : 'Save job'}
        </button>
        <ApplyNowButton jobId={job.id} applied={applied} big onDone={onClose} />
      </div>
      <WhyApplyModal job={job} open={whyOpen} onClose={() => setWhyOpen(false)} />
      <ResumeMatchModal job={job} open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </div>
  );
}

/* ---------- generic modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  xl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  xl?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/45" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl sm:rounded-[20px] ${xl ? 'sm:max-w-[880px]' : wide ? 'sm:max-w-[560px]' : 'sm:max-w-[480px]'}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <h3 className="text-[18px] font-semibold">{title}</h3>
              <button onClick={onClose} aria-label="Close dialog" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- application assistant (stepped apply flow) ---------- */
const ASSISTANT_ANALYZE = ['Resume selected', 'Profile information', 'Skills', 'Experience', 'Preferences'];
const ASSISTANT_SUBMIT = ['Preparing application', 'Filling profile', 'Uploading resume', 'Completing fields', 'Submitting'];

export function ApplyModal({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const { profile, profileCompletion, applyToJob } = useApp();
  const [step, setStep] = useState(0);
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [resume, setResume] = useState(profile.resumeName || 'Vansh_Resume_2026.pdf');
  const [questionVariant, setQuestionVariant] = useState(0);
  const [answer, setAnswer] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(true);
  const [submitIdx, setSubmitIdx] = useState(-1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // reset whenever a different job opens
  useEffect(() => {
    setStep(0);
    setAnalyzeIdx(0);
    setQuestionVariant(0);
    setAnswer('');
    setAccepted(false);
    setEditingAnswer(true);
    setSubmitIdx(-1);
    setSubmitError(null);
    setResume(profile.resumeName || 'Vansh_Resume_2026.pdf');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id]);

  // staged analysis (~1.2s)
  useEffect(() => {
    if (!job || step !== 0) return;
    setAnalyzeIdx(0);
    const timers = [240, 480, 720, 960, 1200].map((ms, i) => setTimeout(() => setAnalyzeIdx(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [job, step]);

  if (!job) return <Modal open={false} onClose={onClose} title="Apply" ><span /></Modal>;

  const overlap = job.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const analyzeChecks = [
    { label: 'Resume selected', done: !!resume, detail: resume },
    { label: 'Profile information', detail: `${profileCompletion.pct}% complete`, done: profileCompletion.pct >= 60 },
    { label: 'Skills', detail: `${overlap.length}/${job.skills.length} required skills`, done: overlap.length > 0 },
    { label: 'Experience', detail: `${job.experience} role · you: ${profile.experienceLevel}`, done: true },
    { label: 'Preferences', detail: `${job.type} · ${job.workMode}`, done: job.type === profile.jobType },
  ];

  const startSubmit = () => {
    setSubmitError(null);
    setSubmitIdx(0);
    const timers = ASSISTANT_SUBMIT.map((_, i) => setTimeout(() => setSubmitIdx(i + 1), 380 * (i + 1)));
    setTimeout(() => {
      timers.forEach(clearTimeout);
      const ok = applyToJob(job.id);
      if (ok) {
        setStep(4);
      } else {
        setSubmitIdx(-1);
        setSubmitError('Could not submit — you may have hit the daily application limit. Raise it in Automation settings.');
      }
    }, 380 * (ASSISTANT_SUBMIT.length + 1));
  };

  const steps = ['Analyze', 'Details', 'Questions', 'Review'];
  return (
    <Modal open={!!job} onClose={onClose} title="Application assistant" wide>
      <div className="space-y-4">
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-[15px] font-semibold">{job.title}</p>
          <p className="text-[13px] text-[#64748B]">{job.company} • {job.location} • {job.matchScore.toFixed(1)}/10 match</p>
        </div>

        <ol className="flex items-center gap-1" aria-label="Assistant progress">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                  step > i || (step === 4) ? 'bg-[#16A34A] text-white' : step === i ? 'bg-[#4F46E5] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]')}>
                  {step > i || step === 4 ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn('text-[10px] font-semibold', step === i ? 'text-[#0F172A]' : 'text-[#94A3B8]')}>{s}</span>
              </div>
              {i < steps.length - 1 && <span className={cn('mx-1 mb-5 h-px flex-1', step > i ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]')} />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-2" aria-live="polite">
            <AiLabel>Analyzing application…</AiLabel>
            {analyzeChecks.map((c, i) => (
              <div key={c.label} className={cn('flex items-center gap-2.5 rounded-[10px] border p-3 transition-opacity',
                analyzeIdx > i ? 'border-[#E2E8F0] opacity-100' : 'border-[#F1F5F9] opacity-40')}>
                {analyzeIdx > i
                  ? <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', c.done ? 'bg-[#16A34A] text-white' : 'bg-[#FEF2F2] text-[#DC2626]')}>
                      {c.done ? <Check className="h-3 w-3" strokeWidth={3} /> : '!'}
                    </span>
                  : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#4F46E5]" />}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{c.label}</p>
                  <p className="truncate text-[12px] text-[#64748B]">{c.detail}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={() => setStep(1)} className="flex-[2] rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <AiLabel>Application details</AiLabel>
            <div>
              <label className="mb-1.5 block text-[14px] font-semibold">Resume</label>
              <select value={resume} onChange={(e) => setResume(e.target.value)} className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]">
                <option>{profile.resumeName || 'Vansh_Resume_2026.pdf'}</option>
                <option>Vansh_Resume_General.pdf</option>
              </select>
            </div>
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[14px]">
              <p><span className="font-semibold">Profile:</span> {profileCompletion.pct >= 80 ? 'Complete' : `${profileCompletion.pct}% complete`}</p>
              <p className="mt-1"><span className="font-semibold">Skills for this role:</span> {overlap.length > 0 ? overlap.join(', ') : 'Limited overlap — review the stack'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold hover:bg-[#F8FAFC]">Back</button>
              <button onClick={() => { setAnswer(generateQuestionDraft(job, profile, 0)); setQuestionVariant(0); setAccepted(false); setEditingAnswer(true); setStep(2); }}
                className="flex-[2] rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <AiLabel>Application questions</AiLabel>
            <p className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-[14px] font-medium">“{roleQuestion(job)}”</p>
            {editingAnswer ? (
              <textarea value={answer} onChange={(e) => { setAnswer(e.target.value); setAccepted(false); }} rows={6}
                className="w-full rounded-[9px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-[#4F46E5]" aria-label="Draft answer" />
            ) : (
              <p className="whitespace-pre-line rounded-[9px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[14px] leading-relaxed">{answer}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <AiButton onClick={() => { const v = questionVariant + 1; setQuestionVariant(v); setAnswer(generateQuestionDraft(job, profile, v)); setAccepted(false); setEditingAnswer(true); }}>
                {questionVariant === 0 ? 'Generate Draft' : 'Regenerate'}
              </AiButton>
              <button onClick={() => setEditingAnswer((v) => !v)} className="rounded-[9px] border border-[#E2E8F0] px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                {editingAnswer ? 'Preview' : 'Edit'}
              </button>
              <button onClick={() => setAccepted(true)}
                className={cn('rounded-[9px] px-3.5 py-2 text-[13px] font-semibold transition-colors',
                  accepted ? 'bg-[#F0FDF4] text-[#16A34A]' : 'border border-[#E2E8F0] hover:border-[#16A34A] hover:text-[#16A34A]')}>
                {accepted ? '✓ Accepted' : 'Accept'}
              </button>
            </div>
            <DemoNote>Drafts are generated from your saved profile as a starting point — edit before submitting.</DemoNote>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold hover:bg-[#F8FAFC]">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
                Review application
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <AiLabel>Ready to submit</AiLabel>
            <ul className="space-y-1.5">
              {[
                { label: 'Resume', done: !!resume, detail: resume },
                { label: 'Profile', done: profileCompletion.pct >= 60, detail: `${profileCompletion.pct}% complete` },
                { label: 'Questions', done: accepted || answer.trim().length > 0, detail: accepted ? 'Answer accepted' : answer.trim() ? 'Draft ready — not yet accepted' : 'Optional — skipped' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F0] p-3">
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    r.done ? 'bg-[#16A34A] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]')}>
                    {r.done ? <Check className="h-3 w-3" strokeWidth={3} /> : '•'}
                  </span>
                  <span className="text-[14px] font-semibold">{r.label}</span>
                  <span className="ml-auto max-w-[220px] truncate text-[12px] text-[#64748B]">{r.detail}</span>
                </li>
              ))}
            </ul>
            {submitError && <p className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium text-[#DC2626]" role="alert">{submitError}</p>}
            {submitIdx >= 0 ? (
              <div className="space-y-1.5" aria-live="polite">
                {ASSISTANT_SUBMIT.map((s, i) => (
                  <p key={s} className={cn('flex items-center gap-2 text-[13px]', submitIdx > i ? 'font-semibold text-[#16A34A]' : submitIdx === i ? 'font-semibold text-[#4F46E5]' : 'text-[#94A3B8]')}>
                    {submitIdx > i ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : submitIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-[#CBD5E1]" />}
                    {s}…
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold hover:bg-[#F8FAFC]">Back</button>
                <button onClick={startSubmit} className="flex-[2] rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
                  Submit Application
                </button>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="py-4 text-center">
            <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]">
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </motion.span>
            <p className="mt-4 text-[20px] font-bold">Application submitted</p>
            <p className="mx-auto mt-1 max-w-[320px] text-[14px] text-[#64748B]">{job.title} at {job.company} — track it in Applications.</p>
            <button onClick={onClose} className="mt-5 w-full rounded-[9px] bg-[#0F172A] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
              Done
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---------- activity timeline ---------- */
export function ActivityTimeline({
  items,
  onItemClick,
}: {
  items: Array<{ id: string; text: string; detail?: string; time: string }>;
  onItemClick?: (item: { id: string; text: string; detail?: string; time: string }) => void;
}) {
  if (items.length === 0) {
    return <p className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-white p-5 text-center text-[14px] text-[#64748B]">No activity yet — apply to a job or send an outreach email.</p>;
  }
  return (
    <ol className="space-y-0">
      {items.slice(0, 8).map((a, i, arr) => {
        const body = (
          <>
            <span className="flex flex-col items-center">
              <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'}`} />
              {i < arr.length - 1 && <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-[#0F172A]">{a.text}</span>
              {a.detail && <span className="block truncate text-[13px] text-[#64748B]">{a.detail}</span>}
              <span className="block text-[12px] text-[#94A3B8]">{a.time}</span>
            </span>
          </>
        );
        return onItemClick ? (
          <li key={a.id} className="relative pb-5 last:pb-0">
            <button onClick={() => onItemClick(a)} className="flex w-full gap-3 rounded-[10px] p-1 text-left transition-colors hover:bg-[#F8FAFC]">
              {body}
            </button>
          </li>
        ) : (
          <li key={a.id} className="relative flex gap-3 pb-5 last:pb-0">{body}</li>
        );
      })}
    </ol>
  );
}

/* ---------- 7/30/90 range tabs ---------- */
export function RangeTabs({ value, onChange }: { value: '7D' | '30D' | '90D'; onChange: (v: '7D' | '30D' | '90D') => void }) {
  return (
    <div className="flex rounded-[9px] border border-[#E2E8F0] bg-[#F8FAFC] p-1" role="tablist" aria-label="Date range">
      {(['7D', '30D', '90D'] as const).map((r) => (
        <button
          key={r}
          role="tab"
          aria-selected={value === r}
          onClick={() => onChange(r)}
          className={`rounded-[7px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${value === r ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ---------- applied status pill used inside drawers ---------- */
export function DetailStatusRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-[13px] font-medium text-[#64748B]">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function ArrowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#4F46E5]">
      {children}<ArrowRight className="h-4 w-4" />
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

/* ---------- WHY SHOULD I APPLY ---------- */
export function WhyApplyModal({ job, open, onClose }: { job: Job | null; open: boolean; onClose: () => void }) {
  const { profile, savedJobIds, toggleSaveJob, appliedJobIds } = useApp();
  if (!job) return null;
  const overlap = job.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const gaps = job.skills.filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.has(job.id);
  return (
    <Modal open={open} onClose={onClose} title="Why should I apply?" wide>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[18px] font-bold">{job.title}</p>
            <p className="text-[14px] text-[#64748B]">{job.company} • {job.location} • {job.salary}</p>
          </div>
          <MatchBadge score={job.matchScore} compact />
        </div>
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <AiLabel>Why this job?</AiLabel>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#334155]">
            Strong overall alignment with your profile. {whyApplyContext(job, overlap, gaps)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
            <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#15803D]">Matching strengths</p>
            <ul className="mt-2 space-y-1.5">
              {overlap.length === 0 && <li className="text-[14px] text-[#475569]">Limited direct overlap — review carefully.</li>}
              {overlap.map((s) => (
                <li key={s} className="flex items-center gap-2 text-[14px] font-medium text-[#334155]">
                  <Check className="h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[12px] border border-[#FCD34D]/60 bg-[#FFFBEB]/70 p-4">
            <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#92400E]">Potential gaps</p>
            <ul className="mt-2 space-y-1.5">
              {gaps.length === 0 && <li className="text-[14px] text-[#475569]">None — full stack coverage.</li>}
              {gaps.slice(0, 4).map((s) => (
                <li key={s} className="flex items-center gap-2 text-[14px] font-medium text-[#334155]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[11px] font-bold text-[#DC2626]">!</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-[12px] border border-[#E2E8F0] p-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#475569]">Match summary</p>
          <dl className="mt-2 divide-y divide-[#F1F5F9] text-[14px]">
            {[
              ['Skills', overlap.length >= 2 ? 'Strong' : overlap.length === 1 ? 'Good' : 'Weak'],
              ['Experience', job.experience === profile.experienceLevel ? 'Strong' : 'Good'],
              ['Location', job.workMode === 'Remote' ? 'Strong' : 'Good'],
              ['Preferences', job.type === profile.jobType ? 'Strong' : 'Good'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5">
                <dt className="text-[#64748B]">{k}</dt>
                <dd className={cn('font-semibold', v === 'Strong' ? 'text-[#16A34A]' : v === 'Good' ? 'text-[#4F46E5]' : 'text-[#B45309]')}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DemoNote>This analysis is computed from your saved profile to help you decide — it is not a hiring prediction, and it doesn't tell you whether you must apply.</DemoNote>
        <div className="flex gap-2">
          <button
            onClick={() => toggleSaveJob(job.id)}
            className={cn('flex-1 rounded-[9px] border px-4 py-2.5 text-[14px] font-semibold transition-colors',
              saved ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <ApplyNowButton jobId={job.id} applied={applied} className="flex-[2]" onDone={onClose} />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- APPLICATION READINESS ---------- */
export function ReadinessPanel({ job, onNavigate }: { job: Job; onNavigate?: () => void }) {
  const { profile, profileCompletion } = useApp();
  const navigate = useNavigate();
  const { score, checks } = readinessScore(job, profile, profileCompletion.pct);
  const animated = useCountUp(score, 800);
  const go = (focus: string) => {
    onNavigate?.();
    navigate(`/app/profile?focus=${focus}`);
  };
  return (
    <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <AiLabel>Application readiness</AiLabel>
        <p className="text-[26px] font-extrabold leading-none">{animated}<span className="text-[14px] text-[#64748B]">%</span></p>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#E6EBF2]">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', score >= 80 ? 'bg-[#16A34A]' : score >= 60 ? 'bg-[#4F46E5]' : 'bg-[#F59E0B]')} />
      </div>
      <ul className="mt-3 space-y-1">
        {checks.map((c) => (
          <li key={c.key}>
            <button onClick={() => go(c.focus)} className="group flex w-full items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left transition-colors hover:bg-[#F8FAFC]" title="Open in profile">
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                c.done ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FFFBEB] text-[#B45309]')}>
                {c.done ? <Check className="h-3 w-3" strokeWidth={3} /> : '!'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#0F172A]">{c.label}</span>
                <span className="block truncate text-[12px] text-[#64748B]">{c.detail}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#4F46E5]" />
            </button>
          </li>
        ))}
      </ul>
      {!checks.find((c) => c.key === 'github')?.done && (
        <div className="mt-2.5 rounded-[10px] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#475569]">
          <span className="font-semibold">What&apos;s missing: </span>
          Adding your GitHub profile could make your application more complete.
        </div>
      )}
      <DemoNote className="mt-2">Demo readiness estimate from saved profile data — it doesn&apos;t guarantee outcomes.</DemoNote>
    </div>
  );
}

export function ReadinessModal({ job, open, onClose }: { job: Job | null; open: boolean; onClose: () => void }) {
  if (!job) return null;
  return (
    <Modal open={open} onClose={onClose} title="Application readiness">
      <ReadinessPanel job={job} onNavigate={onClose} />
    </Modal>
  );
}

/* ---------- RESUME → JOB MATCH ---------- */
const RESUME_STAGES = ['Your resume', 'Job description', 'JobWizard analysis'];

export function ResumeMatchModal({ job, open, onClose }: { job: Job | null; open: boolean; onClose: () => void }) {
  const { profile } = useApp();
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!open) return;
    setStage(0);
    setDone(false);
    const timers = [350, 700, 1050].map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    const fin = setTimeout(() => setDone(true), 1250);
    return () => [...timers, fin].forEach(clearTimeout);
  }, [open, job?.id]);
  if (!job) return null;
  if (!profile.resumeName) {
    return (
      <Modal open={open} onClose={onClose} title="Compare my resume">
        <EmptyState
          title="Upload a resume to compare your profile with this job."
          description="Resume → job matching reads your saved resume and profile."
          action={<span className="text-[13px] text-[#64748B]">Add one from Resume &amp; Profile.</span>}
        />
      </Modal>
    );
  }
  const result = resumeMatch(job, profile);
  return (
    <Modal open={open} onClose={onClose} title="Compare my resume" wide>
      <div className="space-y-4">
        <ol className="flex items-center gap-1" aria-label="Analysis progress">
          {RESUME_STAGES.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                  stage > i || done ? 'bg-[#4F46E5] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]')}>
                  {(stage > i || done) ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="whitespace-nowrap text-[10px] font-semibold text-[#64748B]">{s}</span>
              </div>
              {i < RESUME_STAGES.length - 1 && <span className={cn('mx-1 mb-5 h-px flex-1 transition-colors', stage > i || done ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0]')} />}
            </li>
          ))}
        </ol>
        {!done ? (
          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
              {stage === 0 ? 'Reading resume…' : stage === 1 ? 'Reading job description…' : 'Matching skills…'}
            </p>
            <button onClick={() => setDone(true)} className="shrink-0 text-[13px] font-semibold text-[#4F46E5] hover:underline">Skip</button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-[14px] border border-[#4F46E5]/25 bg-[#EEF2FF]/50 p-5 text-center">
              <AiLabel className="justify-center">Resume match analysis</AiLabel>
              <p className="mt-1 text-[40px] font-extrabold leading-none">{result.overall}<span className="text-[16px] text-[#64748B]">% Match</span></p>
              <div className="mx-auto mt-3 grid max-w-[420px] gap-2 text-left">
                {result.bars.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold">{b.label}</span>
                      <span className="font-bold">{b.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-[#4F46E5]" />
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#64748B]">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#15803D]">Matched skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.matched.length === 0 && <span className="text-[13px] text-[#475569]">None yet.</span>}
                  {result.matched.map((s) => <span key={s} className="rounded-[7px] bg-white px-2.5 py-1 text-[13px] font-medium">{s}</span>)}
                </div>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#475569]">Partial match</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.partial.length === 0 && <span className="text-[13px] text-[#64748B]">None detected.</span>}
                  {result.partial.map((s) => <span key={s} className="rounded-[7px] border border-[#E2E8F0] bg-white px-2.5 py-1 text-[13px] font-medium">{s}</span>)}
                </div>
              </div>
              <div className="rounded-[12px] border border-[#FCD34D]/60 bg-[#FFFBEB]/70 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#92400E]">Potential gaps</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.gaps.length === 0 && <span className="text-[13px] text-[#475569]">Full coverage.</span>}
                  {result.gaps.map((s) => <span key={s} className="rounded-[7px] bg-white px-2.5 py-1 text-[13px] font-medium">{s}</span>)}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[14px] font-semibold">Resume evidence</p>
              <div className="space-y-2">
                {[...result.matched, ...result.partial].slice(0, 4).map((s) => (
                  <div key={s} className="rounded-[10px] border border-[#E2E8F0] p-3">
                    <p className="text-[13px] font-bold text-[#4F46E5]">{s}</p>
                    <p className="mt-0.5 text-[13px] italic leading-relaxed text-[#475569]">{result.evidence[s]}</p>
                    <p className="mt-1 inline-flex rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">Match strength: Strong</p>
                  </div>
                ))}
                {result.matched.length === 0 && result.partial.length === 0 && (
                  <p className="text-[14px] text-[#64748B]">No direct evidence found — consider tailoring the resume for this stack.</p>
                )}
              </div>
            </div>
            <DemoNote>This document comparison is a demo computed from your saved profile — useful for prioritizing effort, not a hiring outcome.</DemoNote>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}

/* ---------- JOB COMPARISON ---------- */
export function CompareTray() {
  const { compareIds, clearCompare, setCompareOpen } = useApp();
  if (compareIds.length === 0) return null;
  const jobs = compareIds.map((id) => JOBS.find((j) => j.id === id)).filter((j): j is Job => !!j);
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[65] w-[calc(100%-40px)] max-w-[560px] -translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto flex items-center gap-3 rounded-[14px] border border-[#4F46E5]/25 bg-white p-3 pl-4 shadow-[0_12px_36px_rgba(15,23,42,0.16)]"
      >
        <div className="flex -space-x-2">
          {jobs.map((j) => (
            <span key={j.id} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-bold text-[#4F46E5] ring-2 ring-white">
              {j.company.charAt(0)}
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">
          {compareIds.length}/3 selected
          <span className="block truncate text-[12px] font-normal text-[#64748B]">
            {compareIds.length === 1 ? 'Select another job to compare.' : jobs.map((j) => j.title).join(' · ')}
          </span>
        </p>
        <button
          onClick={() => setCompareOpen(true)}
          disabled={compareIds.length < 2}
          className="shrink-0 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:opacity-50"
        >
          Compare
        </button>
        <button onClick={clearCompare} aria-label="Clear comparison" className="shrink-0 rounded-[9px] p-2 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0F172A]">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}

export function CompareModal() {
  const { compareIds, compareOpen, setCompareOpen, toggleCompareJob, savedJobIds, toggleSaveJob, appliedJobIds, profile } = useApp();
  const navigate = useNavigate();
  const jobs = compareIds.map((id) => JOBS.find((j) => j.id === id)).filter((j): j is Job => !!j);
  return (
    <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title={`Compare jobs (${jobs.length}/3)`} xl>
      {jobs.length < 2 ? (
        <EmptyState title="Select at least 2 jobs" description="Use the Compare button on any job card to add it here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
            <thead>
              <tr>
                <th className="w-[130px] p-2 align-top text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]"></th>
                {jobs.map((j) => (
                  <th key={j.id} className="min-w-[200px] p-2 align-top">
                    <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <p className="font-bold leading-snug">{j.title}</p>
                      <p className="mt-0.5 text-[13px] text-[#64748B]">{j.company}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Match Score', render: (j: Job) => <span className="font-bold">{j.matchScore.toFixed(1)} / 10</span> },
                { label: 'Salary', render: (j: Job) => j.salary },
                { label: 'Location', render: (j: Job) => j.location },
                { label: 'Remote', render: (j: Job) => j.workMode },
                { label: 'Job Type', render: (j: Job) => j.type },
                { label: 'Experience', render: (j: Job) => j.experience },
                {
                  label: 'Skills Match',
                  render: (j: Job) => (
                    <span>{j.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase())).length}/{j.skills.length} skills</span>
                  ),
                },
                {
                  label: 'Potential Gaps',
                  render: (j: Job) => (
                    <span>{j.skills.filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase())).slice(0, 3).join(', ') || 'None'}</span>
                  ),
                },
                {
                  label: 'Application Status',
                  render: (j: Job) => appliedJobIds.has(j.id) ? <StatusBadge status="Applied" /> : <span className="text-[#64748B]">Not applied</span>,
                },
                {
                  label: 'Saved',
                  render: (j: Job) => savedJobIds.includes(j.id)
                    ? <span className="font-semibold text-[#4F46E5]">Saved</span>
                    : <span className="text-[#64748B]">Not saved</span>,
                },
              ].map((row) => (
                <tr key={row.label} className="border-t border-[#F1F5F9]">
                  <th className="p-2.5 align-top text-[13px] font-semibold text-[#64748B]">{row.label}</th>
                  {jobs.map((j) => (
                    <td key={j.id} className="p-2.5 align-top">{row.render(j)}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-[#F1F5F9]">
                <th className="p-2 align-top text-[13px] font-semibold text-[#64748B]">Actions</th>
                {jobs.map((j) => (
                  <td key={j.id} className="p-2 align-top">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => { setCompareOpen(false); navigate(`/app/jobs?highlight=${j.id}`); }}
                        className="rounded-[8px] border border-[#E2E8F0] px-3 py-1.5 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      >
                        View Job
                      </button>
                      <button
                        onClick={() => toggleSaveJob(j.id)}
                        className="rounded-[8px] border border-[#E2E8F0] px-3 py-1.5 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      >
                        {savedJobIds.includes(j.id) ? 'Unsave' : 'Save'}
                      </button>
                      <button
                        onClick={() => toggleCompareJob(j.id)}
                        className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[13px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                      >
                        Remove
                      </button>
                      <ApplyNowButton jobId={j.id} applied={appliedJobIds.has(j.id)} className="w-full !py-1.5 !text-[13px]" />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <DemoNote className="mt-3">Side-by-side facts to help you decide — JobWizard doesn&apos;t declare an overall winner.</DemoNote>
        </div>
      )}
    </Modal>
  );
}

/* ---------- APPLICATION QUEUE ---------- */
export function QueuePanel() {
  const { queueJobIds, removeFromQueue, appliedJobIds, profile, profileCompletion } = useApp();
  const navigate = useNavigate();
  const [sort, setSort] = useState<'Match Score' | 'Salary' | 'Newest' | 'Readiness'>('Match Score');
  const jobs = queueJobIds.map((id) => JOBS.find((j) => j.id === id)).filter((j): j is Job => !!j);
  const readinessOf = (job: Job) => readinessScore(job, profile, profileCompletion.pct).score;
  const sorted = [...jobs].sort((a, b) => {
    if (sort === 'Match Score') return b.matchScore - a.matchScore;
    if (sort === 'Salary') return b.salaryMin - a.salaryMin;
    if (sort === 'Newest') return a.postedDaysAgo - b.postedDaysAgo;
    return readinessOf(b) - readinessOf(a);
  });
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3" id="queue">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#4F46E5]">
            <ListPlus className="h-4 w-4" />Application queue
          </p>
          <h3 className="mt-1 text-[19px] font-bold">Ready to apply {jobs.length > 0 && <span className="text-[#64748B]">({jobs.length})</span>}</h3>
        </div>
        {jobs.length > 0 && (
          <label className="flex items-center gap-2 text-[14px] text-[#475569]">
            Sort:
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-[9px] border border-[#E2E8F0] bg-white px-3 py-2 font-semibold text-[#0F172A] outline-none" aria-label="Sort queue">
              <option>Match Score</option><option>Salary</option><option>Newest</option><option>Readiness</option>
            </select>
          </label>
        )}
      </div>
      {jobs.length === 0 ? (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
          <p className="text-[15px] font-semibold">No jobs in your application queue.</p>
          <p className="mx-auto mt-1 max-w-[380px] text-[14px] text-[#64748B]">Queue roles from Job Search, Recommended or Saved Jobs, then work through them here.</p>
          <button onClick={() => navigate('/app/jobs')} className="mt-4 rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
            Find jobs to queue
          </button>
        </div>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {sorted.map((job, i) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <li key={job.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#E2E8F0] bg-white p-3.5 transition-all hover:-translate-y-px hover:shadow-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[14px] font-bold text-white">{i + 1}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[16px] font-bold text-[#4F46E5]">{job.company.charAt(0)}</span>
                <div className="min-w-[180px] flex-1">
                  <p className="truncate text-[15px] font-semibold">{job.title}</p>
                  <p className="truncate text-[13px] text-[#64748B]">{job.company} • {job.matchScore.toFixed(1)} match • Readiness {readinessOf(job)}%</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-[12px] font-bold', applied ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#EEF2FF] text-[#4F46E5]')}>
                  {applied ? 'Applied' : 'Queued'}
                </span>
                <div className="flex w-full gap-2 sm:w-auto">
                  <button onClick={() => navigate(`/app/jobs?highlight=${job.id}`)} className="flex-1 rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] sm:flex-none">View</button>
                  {!applied && <ApplyNowButton jobId={job.id} applied={false} onDone={() => removeFromQueue(job.id)} className="!px-3 !py-2 !text-[13px]" />}
                  <button onClick={() => removeFromQueue(job.id)} aria-label={`Remove ${job.title} from queue`} className="rounded-[8px] border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

/* ---------- CAREER PROGRESS ---------- */
export function CareerProgress() {
  const { applications } = useApp();
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const total = applications.length + 9;
  const interviews = applications.filter((a) => a.status === 'Interview').length + 4;
  const offers = applications.filter((a) => a.status === 'Offer').length + 1;
  const responded = applications.filter((a) => ['Interview', 'Offer'].includes(a.status)).length + 5;
  const series = APPLICATION_SERIES[range];
  const momentum = [
    { label: 'Applications', dir: series.applied[series.applied.length - 1] >= series.applied[0] ? 'up' as const : 'flat' as const },
    { label: 'Responses', dir: series.interviews[series.interviews.length - 1] >= series.interviews[0] ? 'up' as const : 'flat' as const },
    { label: 'Interviews', dir: interviews > 4 ? 'up' as const : 'flat' as const },
    { label: 'Profile completion', dir: 'up' as const },
  ];
  if (applications.length === 0) {
    return (
      <Card className="p-6">
        <AiLabel>Career progress</AiLabel>
        <EmptyState title="Apply to your first job to start tracking your career progress." description="Applications, responses and interviews will chart here over time." />
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Applications', value: String(total) },
          { label: 'Responses', value: String(responded) },
          { label: 'Interviews', value: String(interviews) },
          { label: 'Offers', value: String(offers) },
        ].map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-[30px] font-bold leading-none tracking-tight">{m.value}</p>
            <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">{m.label}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold">Career trends</h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">Applications and interview conversion over time</p>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <div className="mt-4">
          <AreaChart labels={series.labels} seriesA={series.applied} seriesB={series.interviews} labelA="Applications" labelB="Interviews" height={160} />
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-[16px] font-semibold">Job search momentum</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {momentum.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              {m.dir === 'up'
                ? <TrendingUp className="h-5 w-5 text-[#16A34A]" />
                : <Minus className="h-5 w-5 text-[#94A3B8]" />}
              <div>
                <p className="text-[14px] font-semibold leading-tight">{m.label}</p>
                <p className={cn('text-[12px] font-bold', m.dir === 'up' ? 'text-[#16A34A]' : 'text-[#94A3B8]')}>
                  {m.dir === 'up' ? '↑ Trending up' : '→ Steady'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-[#94A3B8]">Informational trends from your tracked activity — no arbitrary scores.</p>
      </Card>
    </div>
  );
}
