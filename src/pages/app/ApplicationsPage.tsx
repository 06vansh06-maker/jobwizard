import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Plus, Trash2, LayoutGrid, Table2, KanbanSquare } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { WEEKLY_APPLICATIONS, APPLICATION_SERIES } from '../../data/mock';
import { Card, EmptyState, PageHeader, StatusBadge, Skeleton } from '../../components/ui';
import { AreaChart, BarChart, Funnel } from '../../components/charts';
import { QueuePanel, RangeTabs } from '../../components/app-ui';
import { Drawer } from '../../components/app-shell';
import { cn } from '../../lib/cn';
import type { Application, ApplicationStatus } from '../../types';

const TABS = ['All', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected', 'Withdrawn'] as const;
const VIEWS = [
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'cards', label: 'Cards', icon: LayoutGrid },
  { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
] as const;
const PIPELINE_COLS: Array<{ status: ApplicationStatus | 'Closed'; label: string; color: string }> = [
  { status: 'Applied', label: 'APPLIED', color: '#4F46E5' },
  { status: 'Under Review', label: 'UNDER REVIEW', color: '#B45309' },
  { status: 'Interview', label: 'INTERVIEW', color: '#6D28D9' },
  { status: 'Offer', label: 'OFFER', color: '#16A34A' },
  { status: 'Closed', label: 'CLOSED', color: '#94A3B8' },
];

function lastActivity(a: Application) {
  const done = [...a.timeline].reverse().find((t) => t.done);
  return done ? `${done.label} • ${done.date}` : a.appliedDate;
}

export default function ApplicationsPage() {
  const { applications, withdrawApplication, updateApplicationStatus, addApplicationNote, askConfirm } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [view, setView] = useState<(typeof VIEWS)[number]['id']>('table');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<'7D' | '30D' | '90D'>('7D');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (tab !== 'All' && a.status !== tab) return false;
      if (query && !`${a.title} ${a.company}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [applications, tab, query]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const total = applications.length + 9;
    const review = applications.filter((a) => a.status === 'Under Review').length + 4;
    const interviews = applications.filter((a) => a.status === 'Interview').length + 4;
    const offers = applications.filter((a) => a.status === 'Offer').length + 1;
    const responded = applications.filter((a) => ['Interview', 'Offer'].includes(a.status)).length + 5;
    return [
      { label: 'Total Applications', value: String(total) },
      { label: 'Under Review', value: String(review) },
      { label: 'Interviews', value: String(interviews) },
      { label: 'Offers', value: String(offers) },
      { label: 'Response Rate', value: `${Math.round((responded / Math.max(1, total)) * 100)}%` },
    ];
  }, [applications]);

  const funnel = useMemo(() => ([
    { label: 'Applied', value: applications.length + 9, color: '#4F46E5' },
    { label: 'Under Review', value: applications.filter((a) => ['Under Review', 'Interview', 'Offer'].includes(a.status)).length + 6, color: '#06B6D4' },
    { label: 'Interview', value: applications.filter((a) => ['Interview', 'Offer'].includes(a.status)).length + 4, color: '#8B5CF6' },
    { label: 'Offer', value: applications.filter((a) => a.status === 'Offer').length + 1, color: '#16A34A' },
  ]), [applications]);

  const colApps = (col: (typeof PIPELINE_COLS)[number]) =>
    filtered.filter((a) => (col.status === 'Closed' ? ['Rejected', 'Withdrawn'].includes(a.status) : a.status === col.status));

  const dropTo = (e: React.DragEvent, col: (typeof PIPELINE_COLS)[number]) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/application-id');
    if (!id) return;
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    if (col.status === 'Closed') {
      updateApplicationStatus(id, 'Rejected');
    } else if (app.status !== col.status) {
      updateApplicationStatus(id, col.status as ApplicationStatus);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Application Tracker" subtitle="Every submission, organized as a career pipeline." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[30px] font-bold leading-none tracking-tight">{s.value}</p>
            <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h3 className="text-[16px] font-semibold">Application Funnel</h3>
          <div className="mt-4"><Funnel stages={funnel} /></div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-semibold">Application analytics</h3>
              <p className="mt-0.5 text-[13px] text-[#64748B]">Submissions vs interviews</p>
            </div>
            <RangeTabs value={analyticsRange} onChange={setAnalyticsRange} />
          </div>
          <div className="mt-4">
            <AreaChart
              labels={APPLICATION_SERIES[analyticsRange].labels}
              seriesA={APPLICATION_SERIES[analyticsRange].applied}
              seriesB={APPLICATION_SERIES[analyticsRange].interviews}
              labelA="Applied"
              labelB="Interviews"
              height={150}
            />
          </div>
          <div className="mt-4 border-t border-[#F1F5F9] pt-3">
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">This week, per day</p>
            <div className="mt-2"><BarChart data={WEEKLY_APPLICATIONS} highlightLast /></div>
          </div>
        </Card>
      </div>

      <QueuePanel />

      {/* view switcher */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-fit rounded-[11px] border border-[#E2E8F0] bg-white p-1" role="tablist" aria-label="Tracker view">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={cn('relative flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-[14px] font-semibold transition-colors',
                view === v.id ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]')}
            >
              {view === v.id && (
                <motion.span layoutId="tracker-view" transition={{ duration: 0.22 }} className="absolute inset-0 rounded-[8px] bg-[#0F172A]" />
              )}
              <v.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{v.label}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 lg:w-[260px]">
          <Search className="h-4 w-4 shrink-0 text-[#64748B]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applications…" className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#94A3B8]" aria-label="Search applications" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Application status filter">
        {TABS.map((t) => {
          const count = t === 'All' ? applications.length : applications.filter((a) => a.status === t).length;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-[9px] px-3.5 py-2 text-[13px] font-semibold transition-colors ${tab === t ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]'}`}
            >
              {t} <span className={tab === t ? 'text-white/60' : 'text-[#94A3B8]'}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-[8px] bg-[#E2E8F0]" />
          <div className="h-16 w-full animate-pulse rounded-[8px] bg-[#E2E8F0]" />
          <div className="h-16 w-full animate-pulse rounded-[8px] bg-[#E2E8F0]" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description={tab === 'All' ? 'Apply to a recommended role and it will appear in this tracker.' : `Nothing with status “${tab}”. Try another tab.`}
          action={<button onClick={() => navigate('/app/jobs')} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#3730A3]">Find Jobs</button>}
        />
      ) : view === 'table' ? (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[12px] uppercase tracking-[0.06em] text-[#64748B]">
                    <th className="px-5 py-3 font-semibold">Job</th>
                    <th className="px-5 py-3 font-semibold">Company</th>
                    <th className="px-5 py-3 font-semibold">Match</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Applied Date</th>
                    <th className="px-5 py-3 font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} onClick={() => { setNoteText(''); setSelectedId(a.id); }} className="cursor-pointer border-b border-[#F1F5F9] transition-colors last:border-0 hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3.5 font-semibold">{a.title}</td>
                      <td className="px-5 py-3.5 text-[#475569]">{a.company}</td>
                      <td className="px-5 py-3.5 font-semibold">{a.matchScore.toFixed(1)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.appliedDate}</td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-[#64748B]">{lastActivity(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid gap-3 md:hidden">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => { setNoteText(''); setSelectedId(a.id); }} className="rounded-[14px] border border-[#E2E8F0] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold">{a.title}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-[13px] text-[#64748B]">{a.company} • {a.matchScore.toFixed(1)} match • {a.appliedDate}</p>
                <p className="mt-1 truncate text-[12px] text-[#94A3B8]">{lastActivity(a)}</p>
              </button>
            ))}
          </div>
        </>
      ) : view === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((a) => {
            const doneSteps = a.timeline.filter((t) => t.done).length;
            return (
              <Card key={a.id} className="cursor-pointer p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#C7D2FE] hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]" >
                <div onClick={() => { setNoteText(''); setSelectedId(a.id); }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[16px] font-semibold">{a.title}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-0.5 text-[14px] text-[#64748B]">{a.company} • {a.location} • {a.matchScore.toFixed(1)} match</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    {a.timeline.map((t, i) => (
                      <span key={i} title={t.label} className={`h-1.5 flex-1 rounded-full ${t.done ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0]'}`} />
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] text-[#64748B]">{doneSteps}/{a.timeline.length} steps • {lastActivity(a)}</p>
                </div>
                <div className="mt-3 flex gap-2 border-t border-[#F1F5F9] pt-3">
                  <select
                    value={a.status}
                    onChange={(e) => updateApplicationStatus(a.id, e.target.value as ApplicationStatus)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-2 text-[13px] font-semibold outline-none focus:border-[#4F46E5]"
                    aria-label={`Change status of ${a.title}`}
                  >
                    {(['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setNoteText(''); setSelectedId(a.id); }}
                    className="rounded-[8px] bg-[#0F172A] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1E293B]"
                  >
                    Details
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {PIPELINE_COLS.map((col) => {
              const apps = colApps(col);
              return (
                <div
                  key={col.label}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(col.label); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => dropTo(e, col)}
                  className={cn('w-[260px] shrink-0 snap-start rounded-[16px] border bg-[#F8FAFC] p-3 transition-colors lg:w-auto',
                    dragOver === col.label ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-[#E2E8F0]')}
                >
                  <p className="flex items-center gap-2 px-1 pb-2 text-[12px] font-bold tracking-[0.06em]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-[#475569]">{col.label}</span>
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#0F172A] ring-1 ring-[#E2E8F0]">{apps.length}</span>
                  </p>
                  <div className="max-h-[480px] space-y-2.5 overflow-y-auto">
                    {apps.map((a) => (
                      <motion.div
                        key={a.id}
                        layout
                        draggable
                        onDragStart={(e: any) => {
                          e.dataTransfer.setData('text/application-id', a.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() => { setNoteText(''); setSelectedId(a.id); }}
                        className="cursor-grab rounded-[12px] border border-[#E2E8F0] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-md active:cursor-grabbing"
                      >
                        <p className="text-[14px] font-semibold leading-snug">{a.title}</p>
                        <p className="mt-0.5 truncate text-[13px] text-[#64748B]">{a.company}</p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-[12px] font-bold">{a.matchScore.toFixed(1)}</span>
                          <select
                            value={['Rejected', 'Withdrawn'].includes(a.status) ? a.status : a.status}
                            onChange={(e) => {
                              const v = e.target.value as ApplicationStatus;
                              if (v === 'Withdrawn') withdrawApplication(a.id);
                              else updateApplicationStatus(a.id, v);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="max-w-[130px] truncate rounded-[7px] border border-[#E2E8F0] bg-white px-1.5 py-1 text-[12px] font-semibold outline-none focus:border-[#4F46E5]"
                            aria-label={`Change status of ${a.title}`}
                          >
                            {(['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected', 'Withdrawn'] as ApplicationStatus[]).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                    {apps.length === 0 && (
                      <p className="rounded-[10px] border border-dashed border-[#CBD5E1] bg-white/60 p-4 text-center text-[13px] text-[#94A3B8]">
                        Drop cards here
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[13px] text-[#94A3B8]">Drag cards between columns — or use the status dropdown on any card.</p>
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelectedId(null)} title="Application Details" wide>
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="text-[20px] font-semibold">{selected.title}</p>
              <p className="text-[14px] text-[#64748B]">{selected.company} • {selected.location}</p>
              <div className="mt-2"><StatusBadge status={selected.status} /></div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-[14px]">
              {[['Job', selected.title], ['Company', selected.company], ['Applied date', selected.appliedDate], ['Resume used', selected.resumeUsed], ['Match score', `${selected.matchScore.toFixed(1)} / 10`], ['Last activity', lastActivity(selected)]].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">{k}</dt>
                  <dd className="mt-1 truncate font-medium" title={v}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-[12px] border border-[#4F46E5]/25 bg-[#EEF2FF]/50 p-4">
              <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#4F46E5]">Next action</p>
              <p className="mt-1 text-[14px] font-medium">
                {selected.status === 'Applied' && 'Wait for the view event — follow up if unseen in 7 days.'}
                {selected.status === 'Under Review' && 'Prepare for a potential screen — review the top skill gaps.'}
                {selected.status === 'Interview' && 'Interview stage — confirm the schedule and prep talking points.'}
                {selected.status === 'Offer' && 'Offer stage — compare terms and respond decisively.'}
                {selected.status === 'Rejected' && 'Closed — mine the feedback and redirect effort to open matches.'}
                {selected.status === 'Withdrawn' && 'Withdrawn — no action needed.'}
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold">Application timeline</p>
              <ol className="mt-3">
                {selected.timeline.map((t, i) => (
                  <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                    <span className="flex flex-col items-center">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${t.done ? 'bg-[#16A34A] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>{t.done ? '✓' : i + 1}</span>
                      {i < selected.timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" />}
                    </span>
                    <div><p className="text-[14px] font-semibold">{t.label}</p><p className="text-[13px] text-[#64748B]">{t.date}</p></div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-2 text-[14px] font-semibold">Update status</p>
              <div className="flex flex-wrap gap-2">
                {(['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateApplicationStatus(selected.id, s)}
                    disabled={selected.status === s}
                    className={`rounded-[8px] border px-3 py-1.5 text-[13px] font-semibold transition-colors ${selected.status === s ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[14px] font-semibold">Notes ({selected.notes.length})</p>
              <div className="space-y-2">
                {selected.notes.map((n) => (
                  <div key={n.id} className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <p className="text-[14px]">{n.text}</p>
                    <p className="mt-1 text-[12px] text-[#94A3B8]">{n.date}</p>
                  </div>
                ))}
                {selected.notes.length === 0 && <p className="text-[13px] text-[#94A3B8]">No notes yet — jot down interview prep or follow-ups.</p>}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && noteText.trim()) { addApplicationNote(selected.id, noteText); setNoteText(''); } }}
                  placeholder="Add a note…"
                  className="flex-1 rounded-[9px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]"
                  aria-label="Add application note"
                />
                <button
                  onClick={() => { if (noteText.trim()) { addApplicationNote(selected.id, noteText); setNoteText(''); } }}
                  className="inline-flex items-center gap-1 rounded-[9px] bg-[#0F172A] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1E293B]"
                >
                  <Plus className="h-4 w-4" />Add
                </button>
              </div>
            </div>
            {selected.status !== 'Withdrawn' ? (
              <button
                onClick={() => askConfirm({ title: 'Withdraw application?', description: `This will mark your application for ${selected.title} at ${selected.company} as withdrawn.`, confirmLabel: 'Withdraw', onConfirm: () => { withdrawApplication(selected.id); setSelectedId(null); } })}
                className="flex w-full items-center justify-center gap-2 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-[14px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]">
                <Trash2 className="h-4 w-4" />Withdraw application
              </button>
            ) : (
              <p className="rounded-[10px] bg-[#F1F5F9] p-3 text-center text-[14px] font-medium text-[#64748B]">This application was withdrawn.</p>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
