import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Search, X, Loader2, Check, ArrowRight } from 'lucide-react';
import { JOBS } from '../data/mock';
import { parseJobSearchQuery, parseSalaryLPA, type ParsedSearch } from '../lib/ai';
import { cn } from '../lib/cn';

export interface CopilotApplied {
  role: string;
  experience: string;
  jobType: string;
  location: string;
  salarySelect: string;
  scoreSelect: string;
  skills: string[];
  inrFloor: number | null;
}

const SUGGESTED = [
  'Remote Python internships',
  'Frontend jobs above ₹8 LPA',
  'AI/ML fresher roles',
  'React jobs with no experience',
];

const STAGES = ['Understanding request', 'Extracting role', 'Applying filters', 'Finding matches'];

function toApplied(p: ParsedSearch): CopilotApplied {
  const salarySelect = p.usdK != null && p.usdK >= 100
    ? p.usdK >= 150 ? '$150k+' : p.usdK >= 130 ? '$130k+' : '$100k+'
    : 'Any salary';
  const scoreSelect = p.minScore == null ? 'Any score' : p.minScore >= 9 ? '9.0+' : p.minScore >= 8.5 ? '8.5+' : '8.0+';
  return {
    role: p.role,
    experience: p.experience ?? 'All levels',
    jobType: p.internship ? 'Contract' : 'All types',
    location: p.location ?? (p.remoteOnly ? 'Remote only' : 'All locations'),
    salarySelect,
    scoreSelect,
    skills: p.skills,
    inrFloor: p.inrLpa,
  };
}

/** Count matches for a staged interpretation (mirrors JobsPage filtering). */
export function countForApplied(a: CopilotApplied): number {
  const scoreFloor = a.scoreSelect === '8.0+' ? 8 : a.scoreSelect === '8.5+' ? 8.5 : a.scoreSelect === '9.0+' ? 9 : 0;
  const salaryFloor = a.salarySelect === '$100k+' ? 100 : a.salarySelect === '$130k+' ? 130 : a.salarySelect === '$150k+' ? 150 : 0;
  return JOBS.filter((j) => {
    if (a.role && !`${j.title} ${j.company} ${j.skills.join(' ')}`.toLowerCase().includes(a.role.toLowerCase())) return false;
    if (a.location !== 'All locations' && (a.location === 'Remote only' ? j.workMode !== 'Remote' : !j.location.includes(a.location))) return false;
    if (salaryFloor > 0 && j.salaryMin < salaryFloor) return false;
    if (a.jobType !== 'All types' && j.type !== a.jobType) return false;
    if (a.experience !== 'All levels' && j.experience !== a.experience) return false;
    if (scoreFloor > 0 && j.matchScore < scoreFloor) return false;
    if (a.skills.length > 0 && !a.skills.some((s) => j.skills.includes(s))) return false;
    if (a.inrFloor != null) {
      const lpa = parseSalaryLPA(j.salary);
      if (lpa == null || lpa < a.inrFloor) return false;
    }
    return true;
  }).length;
}

export function AICopilot({
  onApply,
  onFollowUp,
}: {
  onApply: (f: CopilotApplied) => void;
  onFollowUp: (kind: 'fresher' | 'pay' | 'match' | 'intern') => void;
}) {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [parsed, setParsed] = useState<ParsedSearch | null>(null);
  const [dropped, setDropped] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);

  const run = (q: string) => {
    const text = q.trim();
    if (!text || running) return;
    setInput(text);
    setParsed(null);
    setDropped([]);
    setApplied(false);
    setRunning(true);
    setStageIdx(0);
  };

  useEffect(() => {
    if (!running) return;
    if (stageIdx >= STAGES.length) {
      setRunning(false);
      setParsed(parseJobSearchQuery(input));
      return;
    }
    const t = setTimeout(() => setStageIdx((s) => s + 1), 320);
    return () => clearTimeout(t);
  }, [running, stageIdx, input]);

  const chips = (p: ParsedSearch): Array<{ key: string; label: string }> => {
    const out: Array<{ key: string; label: string }> = [];
    if (p.role) out.push({ key: 'role', label: `Role: ${p.role}` });
    if (p.skills.length > 0) out.push({ key: 'skills', label: p.skills.join(', ') });
    if (p.internship) out.push({ key: 'internship', label: 'Internship' });
    else if (p.experience) out.push({ key: 'experience', label: p.experience });
    if (p.location) out.push({ key: 'location', label: p.location });
    else if (p.remoteOnly) out.push({ key: 'remote', label: 'Remote' });
    if (p.inrLpa != null) out.push({ key: 'pay', label: `₹${p.inrLpa} LPA+` });
    else if (p.usdK != null) out.push({ key: 'pay', label: `$${p.usdK}k+` });
    if (p.minScore != null) out.push({ key: 'score', label: `${(p.minScore * 10).toFixed(0)}%+ match` });
    return out;
  };

  const applySearch = () => {
    if (!parsed) return;
    const partial: ParsedSearch = {
      ...parsed,
      role: dropped.includes('role') ? '' : parsed.role,
      skills: dropped.includes('skills') ? [] : parsed.skills,
      experience: dropped.includes('experience') || dropped.includes('internship') ? null : parsed.experience,
      internship: dropped.includes('internship') ? false : parsed.internship,
      location: dropped.includes('location') ? null : parsed.location,
      remoteOnly: dropped.includes('remote') ? false : parsed.remoteOnly,
      inrLpa: dropped.includes('pay') ? null : parsed.inrLpa,
      usdK: dropped.includes('pay') ? null : parsed.usdK,
      minScore: dropped.includes('score') ? null : parsed.minScore,
    };
    onApply(toApplied(partial));
    setApplied(true);
  };

  const dropChip = (key: string) => {
    setDropped((d) => (d.includes(key) ? d : [...d, key]));
  };

  const preview = parsed ? countForApplied(toApplied({
    ...parsed,
    role: dropped.includes('role') ? '' : parsed.role,
    skills: dropped.includes('skills') ? [] : parsed.skills,
    experience: dropped.includes('experience') || dropped.includes('internship') ? null : parsed.experience,
    internship: dropped.includes('internship') ? false : parsed.internship,
    location: dropped.includes('location') ? null : parsed.location,
    remoteOnly: dropped.includes('remote') ? false : parsed.remoteOnly,
    inrLpa: dropped.includes('pay') ? null : parsed.inrLpa,
    usdK: dropped.includes('pay') ? null : parsed.usdK,
    minScore: dropped.includes('score') ? null : parsed.minScore,
  })) : 0;

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#4F46E5]/25 bg-gradient-to-b from-[#EEF2FF] to-white">
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">
          <Sparkles className="h-4 w-4" />AI search
        </p>
        <p className="mt-1.5 text-[19px] font-bold leading-snug">Tell JobWizard what you&apos;re looking for.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') run(input); }}
            placeholder="Find remote React internships in Delhi"
            className="flex-1 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F46E5]"
            aria-label="Describe the jobs you want"
          />
          <button
            onClick={() => run(input)}
            disabled={!input.trim() || running}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#4F46E5] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:opacity-50"
          >
            <Search className="h-4 w-4" />Search
          </button>
        </div>
        {!parsed && !running && (
          <div className="mt-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">Suggested searches</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => run(s)}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#334155] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {running && (
            <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-4 rounded-[12px] border border-[#E2E8F0] bg-white p-4" aria-live="polite">
              <div className="space-y-1.5">
                {STAGES.map((s, i) => (
                  <p key={s} className={cn('flex items-center gap-2 text-[13px]', stageIdx > i ? 'font-semibold text-[#16A34A]' : stageIdx === i ? 'font-semibold text-[#4F46E5]' : 'text-[#94A3B8]')}>
                    {stageIdx > i ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : stageIdx === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-[#CBD5E1]" />}
                    {s}…
                  </p>
                ))}
              </div>
              <button onClick={() => { setStageIdx(STAGES.length); }} className="mt-2 text-[13px] font-semibold text-[#4F46E5] hover:underline">Skip</button>
            </motion.div>
          )}

          {!running && parsed && (
            <motion.div key="parsed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-[12px] border border-[#E2E8F0] bg-white p-4">
              <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#475569]">Understood your search</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chips(parsed).filter((c) => !dropped.includes(c.key)).map((c) => (
                  <span key={`${c.key}-${c.label}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] py-1.5 pl-3.5 pr-2 text-[13px] font-medium text-white">
                    {c.label}
                    <button onClick={() => dropChip(c.key)} aria-label={`Remove ${c.label}`}
                      className="rounded-full p-0.5 hover:bg-white/20">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {chips(parsed).length === 0 && <span className="text-[13px] text-[#64748B]">No specific filters detected — showing everything.</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={applySearch}
                  className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
                  Search Jobs<ArrowRight className="h-4 w-4" />
                </button>
                <span className="text-[13px] text-[#64748B]">I found <span className="font-bold text-[#0F172A]">{preview} jobs</span>. Adjust the chips or filters, then search.</span>
              </div>
              {applied && (
                <div className="mt-3 border-t border-[#F1F5F9] pt-3">
                  <p className="text-[13px] text-[#475569]">Would you like to narrow them down?</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {([
                      ['fresher', 'Only fresher roles'],
                      ['pay', '₹8L+'],
                      ['match', 'High AI match'],
                      ['intern', 'Internships'],
                    ] as const).map(([k, label]) => (
                      <button key={k} onClick={() => onFollowUp(k)}
                        className="rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-2 text-[11px] text-[#94A3B8]">Demo NL search — JobWizard maps your words to its real filters. Refine anytime in Filters.</p>
      </div>
    </div>
  );
}
