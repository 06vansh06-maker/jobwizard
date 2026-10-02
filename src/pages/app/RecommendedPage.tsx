import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Check, ChevronDown, ArrowRight, Loader2, ListPlus, Scale, FileSearch, Gauge } from 'lucide-react';
import { JOBS } from '../../data/mock';
import { useApp } from '../../store/AppContext';
import { Card, EmptyState, MatchBar, PageHeader } from '../../components/ui';
import { ApplyModal, WhyApplyModal, ResumeMatchModal, ReadinessModal } from '../../components/app-ui';
import { Donut } from '../../components/charts';
import { cn } from '../../lib/cn';
import type { Job } from '../../types';

function factorRows(job: Job, salaryMin: number, workMode: string) {
  return [
    { label: 'Skills', detail: `${job.skills.slice(0, 3).join(', ')} overlap with your tracked skills`, pct: 92 },
    { label: 'Experience', detail: `${job.experience} level — matches your 4 years`, pct: 88 },
    { label: 'Location', detail: job.workMode === 'Remote' ? 'Remote — your top preference' : `${job.location} — in your preferred areas`, pct: job.workMode === 'Remote' ? 100 : 85 },
    { label: 'Job preference', detail: `${job.type} · ${workMode}`, pct: 95 },
    { label: 'Salary', detail: job.salaryMin >= salaryMin ? `${job.salary} meets your $${salaryMin}k+ floor` : `${job.salary} slightly below your floor`, pct: job.salaryMin >= salaryMin ? 90 : 62 },
  ];
}

export default function RecommendedPage() {
  const { applyToJob, appliedJobIds, profile, profileCompletion, notify, queueJobIds, toggleQueueJob, compareIds, toggleCompareJob } = useApp();
  const navigate = useNavigate();
  const [minScore, setMinScore] = useState(8);
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [whyJob, setWhyJob] = useState<Job | null>(null);
  const [resumeJob, setResumeJob] = useState<Job | null>(null);
  const [readinessJob, setReadinessJob] = useState<Job | null>(null);
  const [scanStep, setScanStep] = useState(0);

  /* AI scanning simulation — replays when filters change (~1.4s total) */
  useEffect(() => {
    setScanStep(0);
    const timers = [250, 500, 750, 1000, 1250].map((ms, i) =>
      setTimeout(() => setScanStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [minScore, onlyRemote]);

  /* surface one "new strong match" notification per session */
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (scanStep === 5 && !notifiedRef.current) {
      try {
        if (sessionStorage.getItem('jw_scan_notified') !== '1') {
          sessionStorage.setItem('jw_scan_notified', '1');
          const top = [...JOBS].sort((a, b) => b.matchScore - a.matchScore)[0];
          notify({ title: 'New strong match', body: `${top.title} at ${top.company} scores ${top.matchScore.toFixed(1)}/10 for your profile.`, link: '/app/recommended', kind: 'match' });
        }
      } catch { /* noop */ }
      notifiedRef.current = true;
    }
  }, [scanStep, notify]);

  const list = useMemo(() => {
    return [...JOBS]
      .filter((j) => j.matchScore >= minScore)
      .filter((j) => (onlyRemote ? j.workMode === 'Remote' : true))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [minScore, onlyRemote]);

  const matched = useMemo(() => JOBS.filter((j) => j.matchScore >= 8), []);
  const avg = useMemo(() => matched.reduce((a, j) => a + j.matchScore, 0) / Math.max(1, matched.length), [matched]);
  const dist = useMemo(() => ([
    { label: 'Excellent (9.0+)', value: JOBS.filter((j) => j.matchScore >= 9).length, color: '#16A34A' },
    { label: 'Strong (8.5+)', value: JOBS.filter((j) => j.matchScore >= 8.5 && j.matchScore < 9).length, color: '#4F46E5' },
    { label: 'Potential', value: JOBS.filter((j) => j.matchScore < 8.5).length, color: '#06B6D4' },
  ]), []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recommended for You"
        subtitle="AI-selected jobs based on your profile, skills, preferences and experience."
      />

      {/* AI summary + distribution */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-[#4F46E5]/20 bg-gradient-to-br from-[#EEF2FF] to-white p-6 lg:col-span-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#4F46E5] px-3 py-1 text-[12px] font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" />AI recommendation summary
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="text-[44px] font-extrabold leading-none tracking-tight">{matched.length * 3}</p>
              <p className="mt-1 text-[14px] text-[#475569]">opportunities match your profile</p>
            </div>
            <div>
              <p className="text-[44px] font-extrabold leading-none tracking-tight">{avg.toFixed(1)}<span className="text-[18px] font-semibold text-[#64748B]"> / 10</span></p>
              <p className="mt-1 text-[14px] text-[#475569]">average match score</p>
            </div>
          </div>
          <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-[#475569]">
            Backend and AI engineering roles score highest for your React + Python background and remote preference.
            Strongest category: <span className="font-semibold text-[#0F172A]">Backend Engineering</span>.
            Scores refresh whenever your profile changes.
          </p>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-[16px] font-semibold">Match distribution</h3>
          <div className="mt-3">
            <Donut
              segments={dist}
              size={132}
              onSelect={(s) => {
                if (s.label.startsWith('Excellent')) setMinScore(9);
                else if (s.label.startsWith('Strong')) setMinScore(8.5);
                else setMinScore(7.5);
              }}
            />
          </div>
          <p className="mt-2 text-[12px] text-[#94A3B8]">Select a segment to filter the list below.</p>
        </Card>
      </div>

      {/* AI scanning status */}
      <Card className="border-[#4F46E5]/20 bg-[#EEF2FF]/40 p-4" aria-live="polite">
        <div className="flex min-h-[104px] flex-col justify-center gap-2">
          {scanStep < 5 ? (
            <>
              <p className="flex items-center gap-2 text-[14px] font-semibold text-[#3730A3]">
                {scanStep < 4 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-[#16A34A]" strokeWidth={3} />}
                {scanStep < 4 ? 'Analyzing opportunities…' : 'Finalizing matches…'}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
                {['Skills checked', 'Experience checked', 'Location checked'].map((s, i) => (
                  <span key={s} className={cn('flex items-center gap-1.5 transition-opacity', scanStep > i ? 'text-[#334155] opacity-100' : 'opacity-30')}>
                    {scanStep > i
                      ? <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} />
                      : <span className="h-3.5 w-3.5 rounded-full border-2 border-[#CBD5E1]" />}
                    {s}
                  </span>
                ))}
                <span className={cn('flex items-center gap-1.5 transition-opacity', scanStep >= 4 ? 'text-[#334155] opacity-100' : 'opacity-30')}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', scanStep >= 4 ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]')} />
                  Matching roles
                </span>
              </div>
            </>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[14px] font-semibold text-[#15803D]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              {matched.length * 3} opportunities matched — ranked by fit for your profile.
            </motion.p>
          )}
        </div>
      </Card>

      {/* filter controls */}
      <Card className="flex flex-wrap items-center gap-4 p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F46E5] px-3 py-1.5 text-[13px] font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5" />AI ranking active
        </span>
        <label className="flex items-center gap-2 text-[14px] font-medium">
          Min score:
          <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-1.5 font-semibold outline-none" aria-label="Minimum match score">
            <option value={7.5}>7.5+</option><option value={8}>8.0+</option><option value={8.5}>8.5+</option><option value={9}>9.0+</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium">
          <input type="checkbox" checked={onlyRemote} onChange={(e) => setOnlyRemote(e.target.checked)} className="h-4 w-4 accent-[#4F46E5]" />
          Remote only
        </label>
        <span className="ml-auto text-[13px] text-[#475569]">{list.length} AI picks</span>
      </Card>

      {/* improve match */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">Improve Your Match</p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="h-2.5 max-w-[280px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div className="h-full rounded-full bg-[#4F46E5] transition-all" style={{ width: `${profileCompletion.pct}%` }} />
            </div>
            <span className="text-[14px] font-bold">{profileCompletion.pct}% complete</span>
          </div>
          <p className="mt-1.5 text-[13px] text-[#64748B]">
            {profileCompletion.missing.length === 0
              ? 'Profile is complete — matching at full accuracy.'
              : `Missing: ${profileCompletion.missing.slice(0, 2).join(' · ')}${profileCompletion.missing.length > 2 ? ` +${profileCompletion.missing.length - 2} more` : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/app/profile')}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9px] bg-[#0F172A] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]"
        >
          Complete Profile<ArrowRight className="h-4 w-4" />
        </button>
      </Card>

      {list.length === 0 ? (
        <EmptyState title="No recommendations at this threshold" description="Lower the minimum score to see more AI picks." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((job) => {
            const applied = appliedJobIds.has(job.id);
            const pct = Math.round(job.matchScore * 10);
            const open = expanded === job.id;
            const factors = factorRows(job, profile.salaryMin, profile.workMode);
            const gaps = job.skills.filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
            return (
              <Card key={job.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between bg-[#F0FDF4] px-5 py-2.5">
                  <span className="text-[14px] font-bold text-[#16A34A]">{pct}% Match</span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#15803D]"><Sparkles className="h-3.5 w-3.5" />AI-selected</span>
                </div>
                <div className="p-5">
                  <p className="text-[19px] font-semibold">{job.title}</p>
                  <p className="mt-0.5 text-[14px] text-[#64748B]">{job.company} • {job.location} • {job.salary}</p>
                  <MatchBar score={job.matchScore} className="mt-3" />
                  <div className="mt-4 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#475569]">Why this matches you</p>
                    <ul className="mt-2 space-y-1.5">
                      {(job.whyMatches ?? job.skills.slice(0, 3)).map((w) => (
                        <li key={w} className="flex items-center gap-2 text-[14px] text-[#334155]">
                          <Check className="h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />{w}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setExpanded(open ? null : job.id)}
                      aria-expanded={open}
                      className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#4F46E5] hover:underline"
                    >
                      {open ? 'Hide matching factors' : 'Show all matching factors'}
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2.5 pt-3">
                            {factors.map((f) => (
                              <div key={f.label}>
                                <div className="flex items-center justify-between text-[13px]">
                                  <span className="font-semibold text-[#334155]">{f.label}</span>
                                  <span className="font-bold text-[#0F172A]">{f.pct}%</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                                  <div className="h-full rounded-full bg-[#4F46E5]" style={{ width: `${f.pct}%` }} />
                                </div>
                                <p className="mt-0.5 text-[12px] text-[#64748B]">{f.detail}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {gaps.length > 0 && (
                      <p className="mt-2.5 border-t border-[#E2E8F0] pt-2.5 text-[13px] text-[#64748B]">
                        <span className="font-semibold text-[#92400E]">Potential gaps: </span>{gaps.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button disabled={applied} onClick={() => { if (!applied) setApplyJob(job); }}
                      className={cn('flex-1 rounded-[9px] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors', applied ? 'bg-[#94A3B8]' : 'bg-[#4F46E5] hover:bg-[#3730A3]')}>
                      {applied ? 'Applied' : 'Apply'}
                    </button>
                    <button onClick={() => { if (!applied) applyToJob(job.id); }} disabled={applied}
                      className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-50">
                      {applied ? 'Applied' : 'Quick Apply'}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    <button onClick={() => setWhyJob(job)}
                      className="inline-flex items-center justify-center gap-1 rounded-[8px] border border-[#E2E8F0] px-2 py-2 text-[12px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                      <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />Why apply?
                    </button>
                    <button onClick={() => setResumeJob(job)}
                      className="inline-flex items-center justify-center gap-1 rounded-[8px] border border-[#E2E8F0] px-2 py-2 text-[12px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                      <FileSearch className="h-3.5 w-3.5 text-[#4F46E5]" />Resume match
                    </button>
                    <button onClick={() => setReadinessJob(job)}
                      className="inline-flex items-center justify-center gap-1 rounded-[8px] border border-[#E2E8F0] px-2 py-2 text-[12px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                      <Gauge className="h-3.5 w-3.5 text-[#4F46E5]" />Readiness
                    </button>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleQueueJob(job.id)} aria-pressed={queueJobIds.includes(job.id)} title="Add to application queue"
                        className={cn('flex flex-1 items-center justify-center rounded-[8px] border px-2 py-2 transition-colors',
                          queueJobIds.includes(job.id) ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}>
                        <ListPlus className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleCompareJob(job.id)} aria-pressed={compareIds.includes(job.id)} title="Add to compare"
                        className={cn('flex flex-1 items-center justify-center rounded-[8px] border px-2 py-2 transition-colors',
                          compareIds.includes(job.id) ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}>
                        <Scale className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
      <WhyApplyModal job={whyJob} open={!!whyJob} onClose={() => setWhyJob(null)} />
      <ResumeMatchModal job={resumeJob} open={!!resumeJob} onClose={() => setResumeJob(null)} />
      <ReadinessModal job={readinessJob} open={!!readinessJob} onClose={() => setReadinessJob(null)} />
    </div>
  );
}
