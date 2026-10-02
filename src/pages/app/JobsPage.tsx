import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BookmarkCheck, Search, SlidersHorizontal, X, Command, Sparkles } from 'lucide-react';
import { JOBS } from '../../data/mock';
import { parseSalaryLPA } from '../../lib/ai';
import { AICopilot, type CopilotApplied } from '../../components/ai-copilot';
import { useApp } from '../../store/AppContext';
import { Card, EmptyState, SkeletonCard, StatusBadge } from '../../components/ui';
import { ApplyModal, JobCard, JobDetailBody } from '../../components/app-ui';
import { Drawer } from '../../components/app-shell';
import { cn } from '../../lib/cn';
import type { Job } from '../../types';

const PAGE_SIZE = 6;
const SKILL_OPTIONS = ['React', 'TypeScript', 'Python', 'AWS', 'PostgreSQL', 'LLMs', 'Docker', 'JavaScript'];

export default function JobsPage() {
  const { savedJobIds, appliedJobIds, setPaletteOpen } = useApp();
  const [params, setParams] = useSearchParams();
  const highlight = params.get('highlight');

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All locations');
  const [salary, setSalary] = useState('Any salary');
  const [remote, setRemote] = useState('All');
  const [jobType, setJobType] = useState('All types');
  const [experience, setExperience] = useState('All levels');
  const [minScore, setMinScore] = useState('Any score');
  const [inrFloor, setInrFloor] = useState<number | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState('Best Match');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (highlight) {
      const job = JOBS.find((j) => j.id === highlight);
      if (job) setDetailJob(job);
      setParams({}, { replace: true });
    }
    if (params.get('copilot') === '1') {
      setCopilotOpen(true);
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [query, location, salary, remote, jobType, experience, minScore, inrFloor, skills, savedOnly, sort]);

  const salaryFloor = (v: string) => (v === '$100k+' ? 100 : v === '$130k+' ? 130 : v === '$150k+' ? 150 : 0);
  const scoreFloor = (v: string) => (v === '8.0+' ? 8 : v === '8.5+' ? 8.5 : v === '9.0+' ? 9 : 0);

  const filtered = useMemo(() => {
    let list = [...JOBS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((j) => `${j.title} ${j.company} ${j.skills.join(' ')}`.toLowerCase().includes(q));
    }
    if (location !== 'All locations') {
      list = list.filter((j) => (location === 'Remote only' ? j.workMode === 'Remote' : j.location.includes(location)));
    }
    if (salary !== 'Any salary') list = list.filter((j) => j.salaryMin >= salaryFloor(salary));
    if (remote !== 'All') list = list.filter((j) => j.workMode === remote);
    if (jobType !== 'All types') list = list.filter((j) => j.type === jobType);
    if (experience !== 'All levels') list = list.filter((j) => j.experience === experience);
    if (minScore !== 'Any score') list = list.filter((j) => j.matchScore >= scoreFloor(minScore));
    if (inrFloor != null) list = list.filter((j) => {
      const lpa = parseSalaryLPA(j.salary);
      return lpa != null && lpa >= inrFloor;
    });
    if (skills.length > 0) list = list.filter((j) => skills.some((s) => j.skills.includes(s)));
    if (savedOnly) list = list.filter((j) => savedJobIds.includes(j.id));
    if (sort === 'Best Match') list.sort((a, b) => b.matchScore - a.matchScore);
    if (sort === 'Newest') list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    if (sort === 'Salary') list.sort((a, b) => b.salaryMin - a.salaryMin);
    if (sort === 'Company') list.sort((a, b) => a.company.localeCompare(b.company));
    return list;
  }, [query, location, salary, remote, jobType, experience, minScore, inrFloor, skills, savedOnly, sort, savedJobIds]);

  const chips: Array<{ label: string; clear: () => void }> = [];
  if (location !== 'All locations') chips.push({ label: location, clear: () => setLocation('All locations') });
  if (salary !== 'Any salary') chips.push({ label: salary, clear: () => setSalary('Any salary') });
  if (remote !== 'All') chips.push({ label: remote, clear: () => setRemote('All') });
  if (jobType !== 'All types') chips.push({ label: jobType, clear: () => setJobType('All types') });
  if (experience !== 'All levels') chips.push({ label: experience, clear: () => setExperience('All levels') });
  if (minScore !== 'Any score') chips.push({ label: `${minScore} Match`, clear: () => setMinScore('Any score') });
  if (inrFloor != null) chips.push({ label: `₹${inrFloor} LPA+`, clear: () => setInrFloor(null) });
  skills.forEach((s) => chips.push({ label: s, clear: () => setSkills((prev) => prev.filter((x) => x !== s)) }));
  if (savedOnly) chips.push({ label: 'Saved only', clear: () => setSavedOnly(false) });

  const clearAll = () => {
    setQuery(''); setLocation('All locations'); setSalary('Any salary'); setRemote('All');
    setJobType('All types'); setExperience('All levels'); setMinScore('Any score'); setInrFloor(null); setSkills([]); setSavedOnly(false);
  };

  const applyCopilot = (f: CopilotApplied) => {
    setQuery(f.role);
    setExperience(f.experience);
    setJobType(f.jobType);
    setLocation(f.location);
    setSalary(f.salarySelect);
    setMinScore(f.scoreSelect);
    setSkills(f.skills);
    setInrFloor(f.inrFloor);
    setSavedOnly(false);
  };

  const copilotFollowUp = (kind: 'fresher' | 'pay' | 'match' | 'intern') => {
    if (kind === 'fresher') setExperience('Entry');
    if (kind === 'pay') setInrFloor(8);
    if (kind === 'match') setMinScore('8.5+');
    if (kind === 'intern') { setJobType('Contract'); setExperience('Entry'); }
  };

  const toggleSkill = (s: string) => setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const shown = filtered.slice(0, visible);
  const selectCls = 'w-full rounded-[9px] border border-[#E2E8F0] bg-white px-3 py-2.5 text-[14px] font-medium text-[#334155] outline-none focus:border-[#4F46E5]';

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Location</p>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectCls} aria-label="Location filter">
          {['All locations', 'Remote only', 'San Francisco, CA', 'Austin, TX', 'New York, NY', 'Seattle, WA', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Gurgaon'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Salary</p>
        <select value={salary} onChange={(e) => setSalary(e.target.value)} className={selectCls} aria-label="Salary filter">
          {['Any salary', '$100k+', '$130k+', '$150k+'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Work mode</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Work mode filter">
          {['All', 'Remote', 'Hybrid', 'On-site'].map((o) => (
            <button key={o} onClick={() => setRemote(o)} aria-pressed={remote === o}
              className={cn('rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                remote === o ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Job type</p>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={selectCls} aria-label="Job type filter">
          {['All types', 'Full-time', 'Contract', 'Part-time'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Experience</p>
        <select value={experience} onChange={(e) => setExperience(e.target.value)} className={selectCls} aria-label="Experience filter">
          {['All levels', 'Entry', 'Mid', 'Senior'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Match score</p>
          <span className="text-[12px] font-bold text-[#4F46E5]">{minScore === 'Any score' ? 'Any' : minScore}</span>
        </div>
        <input
          type="range" min={0} max={9} step={0.5}
          value={minScore === 'Any score' ? 0 : scoreFloor(minScore)}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMinScore(v === 0 ? 'Any score' : v <= 8 ? '8.0+' : v <= 8.5 ? '8.5+' : '9.0+');
          }}
          className="w-full accent-[#4F46E5]"
          aria-label="Minimum match score"
        />
        <div className="flex justify-between text-[11px] text-[#94A3B8]"><span>Any</span><span>9.0+</span></div>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Skills</p>
        <div className="space-y-1.5">
          {SKILL_OPTIONS.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[14px] transition-colors hover:bg-[#F8FAFC]">
              <input type="checkbox" checked={skills.includes(s)} onChange={() => toggleSkill(s)} className="h-4 w-4 rounded accent-[#4F46E5]" />
              <span className={skills.includes(s) ? 'font-semibold text-[#0F172A]' : 'text-[#475569]'}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={() => setSavedOnly((v) => !v)}
        aria-pressed={savedOnly}
        className={cn('inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] border px-4 py-2.5 text-[14px] font-semibold transition-colors',
          savedOnly ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
      >
        <BookmarkCheck className="h-4 w-4" />Saved ({savedJobIds.length})
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* search header */}
      <div>
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[36px]">Find your next opportunity.</h1>
        <p className="mt-1.5 max-w-[560px] text-[15px] leading-relaxed text-[#64748B]">Search smarter. Let JobWizard understand what actually fits you.</p>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <label className="flex flex-1 items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-colors focus-within:border-[#4F46E5]">
            <Search className="h-5 w-5 shrink-0 text-[#4F46E5]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, companies, skills…"
              className="w-full bg-transparent text-[16px] outline-none placeholder:text-[#94A3B8]"
              aria-label="Search jobs"
            />
            {query ? (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-[#94A3B8] hover:text-[#0F172A]"><X className="h-4 w-4" /></button>
            ) : (
              <button onClick={() => setPaletteOpen(true)} className="hidden items-center gap-1 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[12px] font-semibold text-[#64748B] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] sm:flex" title="Open command palette">
                <Command className="h-3.5 w-3.5" />K
              </button>
            )}
          </label>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E2E8F0] bg-white px-5 py-3.5 text-[15px] font-semibold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />Filters{chips.length > 0 && <span className="rounded-full bg-[#4F46E5] px-2 py-0.5 text-[11px] font-bold text-white">{chips.length}</span>}
          </button>
        </div>
        {/* active filter chips */}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1E293B]" title={`Remove ${c.label} filter`}>
                {c.label}<X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button onClick={clearAll} className="text-[13px] font-semibold text-[#DC2626] hover:underline">Clear All</button>
          </div>
        )}
      </div>

      {/* AI copilot entry */}
      <div>
        <button
          onClick={() => setCopilotOpen((v) => !v)}
          aria-expanded={copilotOpen}
          className={cn('flex w-full items-center gap-3 rounded-[14px] border p-4 text-left transition-all sm:px-5',
            copilotOpen ? 'border-[#4F46E5] bg-[#EEF2FF]/60' : 'border-[#E2E8F0] bg-white hover:border-[#4F46E5]')}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#4F46E5] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">Try AI Search — describe the job in words</span>
            <span className="block truncate text-[13px] text-[#64748B]">e.g. “Find remote Python internships above ₹30k”</span>
          </span>
          <span className={cn('shrink-0 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
            copilotOpen ? 'bg-[#0F172A] text-white' : 'bg-[#F1F5F9] text-[#475569]')}>
            {copilotOpen ? 'Hide' : 'Open'}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {copilotOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <AICopilot onApply={applyCopilot} onFollowUp={copilotFollowUp} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* three zones */}
      <div className="grid items-start gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* LEFT: filters */}
        <Card className={`p-5 lg:sticky lg:top-4 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[15px] font-bold"><SlidersHorizontal className="h-4 w-4 text-[#4F46E5]" />Filters</p>
            {chips.length > 0 && <button onClick={clearAll} className="text-[13px] font-semibold text-[#DC2626] hover:underline">Clear All</button>}
          </div>
          {filterPanel}
        </Card>

        {/* CENTER: results */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] text-[#475569]">
              <span className="font-bold text-[#0F172A]">128 jobs found</span>
              <span className="text-[#94A3B8]"> • showing {shown.length} of {filtered.length}</span>
            </p>
            <label className="flex items-center gap-2 text-[14px] text-[#475569]">
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-[9px] border border-[#E2E8F0] bg-white px-3 py-2 font-semibold text-[#0F172A] outline-none" aria-label="Sort jobs">
                <option>Best Match</option><option>Newest</option><option>Salary</option><option>Company</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid gap-4 xl:grid-cols-2"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={savedOnly && chips.length === 1 ? 'No saved jobs yet' : 'No jobs match those filters'}
              description="Try widening the location, lowering the match floor, or clearing a skill."
              action={<button onClick={clearAll} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#3730A3]">Clear all filters</button>}
            />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {shown.map((job) => (
                  <JobCard key={job.id} job={job} onView={() => setDetailJob(job)} onApply={() => setApplyJob(job)} />
                ))}
              </div>
              {visible < filtered.length ? (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-[9px] border border-[#E2E8F0] bg-white px-8 py-3 text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                  >
                    Load more jobs ({filtered.length - visible} remaining)
                  </button>
                </div>
              ) : (
                filtered.length > PAGE_SIZE && (
                  <p className="pt-2 text-center text-[14px] text-[#94A3B8]">You&apos;ve seen all {filtered.length} curated matches.</p>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT: intelligence drawer */}
      <Drawer open={!!detailJob} onClose={() => setDetailJob(null)} title="Job intelligence" wide>
        {detailJob && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-[10px] bg-[#EEF2FF]/60 px-3.5 py-2 text-[13px] font-medium text-[#3730A3]">
              <Sparkles className="h-4 w-4 shrink-0" />
              {appliedJobIds.has(detailJob.id) ? 'You applied to this role — track it in Applications.' : 'AI analyzed this role against your profile in real time.'}
            </div>
            <JobDetailBody job={detailJob} onClose={() => setDetailJob(null)} />
            <div className="rounded-[12px] border border-[#E2E8F0] p-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">Application status</p>
              <p className="mt-1.5">
                {appliedJobIds.has(detailJob.id)
                  ? <StatusBadge status="Applied" />
                  : <span className="text-[14px] text-[#64748B]">Not applied yet — your profile is ready to submit.</span>}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  );
}
