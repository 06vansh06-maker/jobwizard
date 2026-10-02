import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX, Sparkles, Send } from 'lucide-react';
import { JOBS } from '../../data/mock';
import { useApp } from '../../store/AppContext';
import { Card, EmptyState, PageHeader } from '../../components/ui';
import { ApplyModal, JobCard, JobDetailBody } from '../../components/app-ui';
import { Drawer } from '../../components/app-shell';
import { cn } from '../../lib/cn';
import type { Job } from '../../types';

const FILTERS = ['All', '9+ Match', '8+ Match', 'Remote', 'Internships'] as const;

export default function SavedJobsPage() {
  const { savedJobIds, toggleSaveJob, appliedJobIds, askConfirm } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const saved = useMemo(() => JOBS.filter((j) => savedJobIds.includes(j.id)), [savedJobIds]);

  const filtered = useMemo(() => {
    return saved.filter((j) => {
      if (filter === '9+ Match') return j.matchScore >= 9;
      if (filter === '8+ Match') return j.matchScore >= 8;
      if (filter === 'Remote') return j.workMode === 'Remote';
      if (filter === 'Internships') return j.experience === 'Entry' && j.type === 'Contract';
      return true;
    });
  }, [saved, filter]);

  const stats = useMemo(() => ([
    { icon: Bookmark, label: 'Saved Jobs', value: String(saved.length) },
    { icon: Sparkles, label: 'Excellent Matches', value: String(saved.filter((j) => j.matchScore >= 9).length) },
    { icon: Send, label: 'Ready to Apply', value: String(saved.filter((j) => !appliedJobIds.has(j.id)).length) },
  ]), [saved, appliedJobIds]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your Shortlist"
        subtitle="Opportunities worth coming back to."
        actions={
          <button onClick={() => navigate('/app/jobs')} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
            Explore Jobs
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <s.icon className="h-5 w-5 text-[#4F46E5]" />
            <p className="mt-2 text-[30px] font-bold leading-none tracking-tight">{s.value}</p>
            <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B] sm:text-[13px]">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Shortlist filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn('rounded-[9px] px-4 py-2 text-[14px] font-semibold transition-colors',
              filter === f ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]')}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={saved.length === 0 ? 'No saved jobs yet' : 'Nothing in this filter'}
          description={saved.length === 0
            ? 'Tap the bookmark on any job and it will wait for you here.'
            : 'Try a different filter.'}
          action={<button onClick={() => navigate('/app/jobs')} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#3730A3]">Explore Jobs</button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <div key={job.id} className="space-y-2">
                <JobCard job={job} onView={() => setDetailJob(job)} onApply={() => setApplyJob(job)} />
                {!applied && (
                  <button
                    onClick={() => askConfirm({
                      title: 'Remove from shortlist?',
                      description: `${job.title} at ${job.company} will be removed from Saved Jobs.`,
                      confirmLabel: 'Remove',
                      onConfirm: () => toggleSaveJob(job.id),
                    })}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-2 text-[13px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                  >
                    <BookmarkX className="h-4 w-4" />Remove from shortlist
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Drawer open={!!detailJob} onClose={() => setDetailJob(null)} title="Job details" wide>
        {detailJob && <JobDetailBody job={detailJob} onClose={() => setDetailJob(null)} />}
      </Drawer>

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  );
}
