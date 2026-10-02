import { useEffect, useMemo, useState } from 'react';
import { Send, MailOpen, Reply, ThumbsUp, RefreshCw, Pencil, Search, Save, Sparkles, Loader2, Mail, CalendarClock, BellOff } from 'lucide-react';
import { OUTREACH_SERIES, emailVariation } from '../../data/mock';
import { generateFollowup } from '../../lib/ai';
import { useApp } from '../../store/AppContext';
import { Card, EmptyState, PageHeader, StatusBadge } from '../../components/ui';
import { AreaChart, Funnel } from '../../components/charts';
import { RangeTabs } from '../../components/app-ui';
import { Drawer } from '../../components/app-shell';
import type { Recruiter } from '../../types';

const FILTERS = ['All', 'Not Contacted', 'Sent', 'Opened', 'Replied', 'Interested'] as const;

const CONTACT_HISTORY: Record<string, Array<{ subject: string; date: string; status: string }>> = {
  'r-1': [
    { subject: 'Quick intro — full-stack engineer', date: 'Sep 27, 2026', status: 'Replied' },
    { subject: 'Following up — platform team role', date: 'Sep 20, 2026', status: 'Opened' },
  ],
  'r-2': [{ subject: 'AI Engineer interest — NeuralLabs', date: 'Sep 26, 2026', status: 'Replied' }],
  'r-3': [{ subject: 'Frontend role — TechNova', date: 'Sep 25, 2026', status: 'Opened' }],
  'r-4': [{ subject: 'Backend opportunities at DevStack', date: 'Sep 24, 2026', status: 'Sent' }],
  'r-5': [
    { subject: 'Full-stack background — Brightline', date: 'Sep 22, 2026', status: 'Replied' },
    { subject: 'Intro — React + Node engineer', date: 'Sep 15, 2026', status: 'Opened' },
  ],
  'r-6': [],
};

function lastActivityFor(r: Recruiter) {
  if (r.status === 'Not Contacted') return '—';
  const verb = r.status === 'Sent' ? 'Email sent' : r.status === 'Opened' ? 'Email opened' : r.status === 'Replied' ? 'Replied' : 'Marked interested';
  return `${verb} • ${r.date}`;
}

function relationshipOf(r: Recruiter, emailCount: number) {
  const warmth = r.status === 'Interested' || r.status === 'Replied' ? 'Warm' : r.status === 'Not Contacted' ? 'New' : 'Developing';
  const engagement = r.status === 'Interested' ? 'High' : r.status === 'Replied' ? 'High' : r.status === 'Opened' ? 'Medium' : 'Low';
  return { warmth, engagement, emails: emailCount, replies: r.status === 'Replied' || r.status === 'Interested' ? 1 : 0 };
}

function FollowUpModal({ recruiter, open, onClose }: { recruiter: Recruiter | null; open: boolean; onClose: () => void }) {
  const { sendFollowUp, saveDraft, scheduleFollowUp, getDraft, profile, pushToast } = useApp();
  const [variant, setVariant] = useState(0);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('In 4 days');
  useEffect(() => {
    if (!open || !recruiter) return;
    const saved = getDraft(`followup:${recruiter.id}`);
    if (saved) {
      setSubject(saved.subject);
      setBody(saved.body);
    } else {
      const g = generateFollowup(recruiter.name, recruiter.company, recruiter.title, profile.firstName || 'Vansh', 0);
      setSubject(g.subject);
      setBody(g.body);
    }
    setVariant(0);
    setSending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recruiter?.id]);
  if (!recruiter) return null;
  const draftKey = `followup:${recruiter.id}`;
  return (
    <Drawer open={open} onClose={onClose} title="Follow-up generator" wide>
      <div className="space-y-4">
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[14px]">
          <p><span className="font-semibold">To:</span> {recruiter.email}</p>
          <p className="mt-1"><span className="font-semibold">Context:</span> {recruiter.name} • {recruiter.title} at {recruiter.company} — {recruiter.status}</p>
          {getDraft(draftKey) && <p className="mt-1.5 inline-flex rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[12px] font-semibold text-[#B45309]">Draft restored</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] font-semibold" htmlFor="fu-subject">Subject</label>
          <input id="fu-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]" />
        </div>
        <div>
          <label className="mb-1.5 block text-[14px] font-semibold" htmlFor="fu-body">
            Follow-up body <span className="ml-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">AI-generated • editable</span>
          </label>
          <textarea id="fu-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-3 text-[14px] leading-relaxed outline-none focus:border-[#4F46E5]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const v = variant + 1;
              setVariant(v);
              const g = generateFollowup(recruiter.name, recruiter.company, recruiter.title, profile.firstName || 'Vansh', v);
              setSubject(g.subject);
              setBody(g.body);
              pushToast({ title: 'Follow-up regenerated', kind: 'info' });
            }}
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            <RefreshCw className="h-4 w-4" />Regenerate
          </button>
        </div>
        <div className="flex flex-col gap-2 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 text-[14px] font-medium">
            <CalendarClock className="h-4 w-4 text-[#4F46E5]" />
            <input value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="w-full rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]" aria-label="Schedule follow-up for" />
          </label>
          <button
            onClick={() => { scheduleFollowUp(recruiter.id, { scheduledFor, subject, body }); onClose(); }}
            className="rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            Schedule Follow-up
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => saveDraft(draftKey, subject, body)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            <Save className="h-4 w-4" />Save Draft
          </button>
          <button
            onClick={() => {
              if (sending || !subject.trim() || !body.trim()) return;
              setSending(true);
              const s = subject; const b = body;
              setTimeout(() => {
                setSending(false);
                sendFollowUp(recruiter.id, s, b);
                onClose();
              }, 900);
            }}
            disabled={!subject.trim() || !body.trim() || sending}
            className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:opacity-70"
          >
            {sending ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending…</>) : (<><Send className="h-4 w-4" />Send</>)}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function FollowUpState({ recruiter, onGenerate }: { recruiter: Recruiter; onGenerate: () => void }) {
  const { followUps, dismissFollowUp } = useApp();
  const fu = followUps[recruiter.id];
  if (!fu || fu.status === 'dismissed') {
    if (recruiter.status !== 'Sent' && recruiter.status !== 'Opened') return null;
    return (
      <div className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-white p-4">
        <p className="text-[14px] font-semibold">Follow-up</p>
        <p className="mt-1 text-[13px] text-[#64748B]">
          {recruiter.status === 'Sent' ? 'Sent recently — no response yet.' : 'Opened — no reply yet.'} Consider sending a short follow-up.
        </p>
        <button onClick={onGenerate}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-[9px] bg-[#0F172A] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
          <Sparkles className="h-4 w-4" />Generate Follow-up
        </button>
      </div>
    );
  }
  if (fu.status === 'suggested') {
    return (
      <div className="rounded-[12px] border border-[#4F46E5]/25 bg-[#EEF2FF]/50 p-4">
        <p className="text-[14px] font-semibold">Suggested next step</p>
        <p className="mt-1 text-[13px] text-[#475569]">Consider sending a short follow-up {fu.scheduledFor ? `(${fu.scheduledFor})` : ''}.</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button onClick={onGenerate} className="rounded-[9px] bg-[#4F46E5] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#3730A3]">
            Generate Follow-up
          </button>
          <button onClick={() => dismissFollowUp(recruiter.id)} className="inline-flex items-center gap-1 rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]">
            <BellOff className="h-3.5 w-3.5" />Dismiss
          </button>
        </div>
      </div>
    );
  }
  if (fu.status === 'scheduled') {
    return (
      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-[14px] font-semibold">Follow-up scheduled <span className="font-normal text-[#64748B]">· {fu.scheduledFor}</span></p>
        <ol className="mt-2.5 flex items-center" aria-label="Follow-up progress">
          {['Initial Outreach', 'Waiting', 'Follow-up', 'Response'].map((s, i) => {
            const done = i <= 2;
            return (
              <li key={s} className="flex min-w-0 flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${done ? 'bg-[#4F46E5] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-semibold text-[#64748B]">{s}</span>
                </div>
                {i < 3 && <span className={`mx-1 mb-4 h-px flex-1 ${i < 2 ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0]'}`} />}
              </li>
            );
          })}
        </ol>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button onClick={onGenerate} className="rounded-[9px] bg-[#0F172A] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
            Send now
          </button>
          <button onClick={() => dismissFollowUp(recruiter.id)} className="rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]">
            Dismiss
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
      <p className="text-[14px] font-semibold text-[#15803D]">✓ Follow-up sent{fu.sentAt ? ` · ${fu.sentAt}` : ''}</p>
      <p className="mt-0.5 text-[13px] text-[#475569]">Reply tracking continues on this thread.</p>
    </div>
  );
}

export default function OutreachPage() {
  const { profile, pushToast, recruiters, emailsSent, sendOutreach, saveDraft, getDraft, followUps, scheduleFollowUp, sendFollowUp, dismissFollowUp } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [detailFor, setDetailFor] = useState<Recruiter | null>(null);
  const [composerFor, setComposerFor] = useState<Recruiter | null>(null);
  const [followUpFor, setFollowUpFor] = useState<Recruiter | null>(null);
  const [draft, setDraft] = useState({ to: '', subject: '', body: '' });
  const [editing, setEditing] = useState(true);
  const [variant, setVariant] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const name = profile.firstName || 'Vansh';

  const openComposer = (r: Recruiter) => {
    const saved = getDraft(r.id);
    setComposerFor(r);
    setDraft({
      to: r.email,
      subject: saved?.subject ?? `Quick intro — ${name}, Full-Stack Engineer (React / Python / AI)`,
      body: saved?.body ?? emailVariation(r.name, r.company, name, variant % 3),
    });
    setEditing(true);
    setSending(false);
  };

  const generate = () => {
    if (!composerFor) return;
    setGenerating(true);
    setTimeout(() => {
      const v = variant + 1;
      setVariant(v);
      setDraft((d) => ({ ...d, body: emailVariation(composerFor.name, composerFor.company, name, v) }));
      setGenerating(false);
      pushToast({ title: 'New draft generated', description: 'Review and edit before sending.', kind: 'info' });
    }, 700);
  };

  const stats = useMemo(() => {
    const sent = emailsSent;
    const opened = recruiters.filter((r) => ['Opened', 'Replied', 'Interested'].includes(r.status)).length + 24;
    const replies = recruiters.filter((r) => ['Replied', 'Interested'].includes(r.status)).length + 5;
    const interested = recruiters.filter((r) => r.status === 'Interested').length + 1;
    return [
      { icon: Send, label: 'Emails Sent', value: String(sent) },
      { icon: MailOpen, label: 'Open Rate', value: `${Math.round((opened / Math.max(1, sent + 20)) * 100)}%` },
      { icon: Reply, label: 'Replies', value: String(replies) },
      { icon: ThumbsUp, label: 'Interested', value: String(interested) },
    ];
  }, [emailsSent, recruiters]);

  const filtered = recruiters.filter((r) => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (query && !`${r.name} ${r.company} ${r.title}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const series = OUTREACH_SERIES[range];
  const hasDraft = composerFor ? !!getDraft(composerFor.id) : false;

  const funnelStages = useMemo(() => ([
    { label: 'Sent', value: emailsSent + 20, color: '#4F46E5' },
    { label: 'Opened', value: 28, color: '#06B6D4' },
    { label: 'Replied', value: 8, color: '#8B5CF6' },
    { label: 'Interested', value: 3, color: '#16A34A' },
  ]), [emailsSent]);

  return (
    <div className="space-y-5">
      <PageHeader title="Reach recruiters directly." subtitle="Build meaningful connections with personalized outreach." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]"><s.icon className="h-4 w-4 text-[#4F46E5]" />{s.label}</p>
            <p className="mt-2 text-[30px] font-bold leading-none tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[16px] font-semibold">Outreach performance</h3>
            <RangeTabs value={range} onChange={setRange} />
          </div>
          <div className="mt-3">
            <AreaChart labels={series.labels} seriesA={series.sent} seriesB={series.replies} labelA="Sent" labelB="Replies" height={150} />
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-[16px] font-semibold">Outreach funnel</h3>
          <p className="mt-0.5 text-[13px] text-[#64748B]">From send to genuine interest</p>
          <div className="mt-3"><Funnel stages={funnelStages} /></div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-[16px] font-semibold">
              <CalendarClock className="h-[18px] w-[18px] text-[#4F46E5]" />Follow-up manager
            </h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">Nudges for threads awaiting a reply</p>
          </div>
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] font-bold text-[#4F46E5]">
            {recruiters.filter((r) => (r.status === 'Sent' || r.status === 'Opened') && (!followUps[r.id] || followUps[r.id].status === 'suggested' || followUps[r.id].status === 'scheduled')).length} need attention
          </span>
        </div>
        <div className="mt-4 space-y-2.5">
          {recruiters
            .filter((r) => (r.status === 'Sent' || r.status === 'Opened') && (!followUps[r.id] || ['suggested', 'scheduled'].includes(followUps[r.id].status)))
            .map((r) => {
              const fu = followUps[r.id];
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#E2E8F0] p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#4F46E5]">{r.initials}</span>
                  <div className="min-w-[160px] flex-1">
                    <p className="truncate text-[14px] font-semibold">{r.name} <span className="font-normal text-[#64748B]">· {r.company}</span></p>
                    <p className="text-[12px] text-[#64748B]">
                      {fu?.status === 'scheduled' ? `Scheduled · ${fu.scheduledFor}` : fu?.status === 'suggested' ? 'Suggested · consider a short nudge' : `${r.status} · no response yet`}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setFollowUpFor(r)}
                      className="rounded-[8px] bg-[#0F172A] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
                      {fu?.status === 'scheduled' ? 'Send now' : 'Generate'}
                    </button>
                    {fu && (fu.status === 'suggested' || fu.status === 'scheduled') && (
                      <button onClick={() => dismissFollowUp(r.id)}
                        className="rounded-[8px] border border-[#E2E8F0] px-3.5 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]">
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {recruiters.filter((r) => (r.status === 'Sent' || r.status === 'Opened') && (!followUps[r.id] || ['suggested', 'scheduled'].includes(followUps[r.id].status))).length === 0 && (
            <p className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-[14px] text-[#64748B]">
              No follow-ups needed right now — every thread is answered or scheduled.
            </p>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Recruiter status filter">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`rounded-[9px] px-3.5 py-2 text-[13px] font-semibold transition-colors ${filter === f ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]'}`}>{f}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 lg:w-[260px]">
          <Search className="h-4 w-4 shrink-0 text-[#64748B]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recruiters…" className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#94A3B8]" aria-label="Search recruiters" />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No recruiters here" description="Try a different search or filter." />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[14px]">
                <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[12px] uppercase tracking-[0.06em] text-[#64748B]">
                  <th className="px-5 py-3 font-semibold">Recruiter</th><th className="px-5 py-3 font-semibold">Company</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Last Activity</th>
                </tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} onClick={() => setDetailFor(r)} className="cursor-pointer border-b border-[#F1F5F9] transition-colors last:border-0 hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3.5"><span className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#4F46E5]">{r.initials}</span><span className="font-semibold">{r.name}</span></span></td>
                      <td className="px-5 py-3.5 text-[#475569]">{r.company}</td>
                      <td className="max-w-[180px] truncate px-5 py-3.5 text-[#475569]">{r.title}</td>
                      <td className="max-w-[200px] truncate px-5 py-3.5 text-[#64748B]">{r.email}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#64748B]">{lastActivityFor(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid gap-3 md:hidden">
            {filtered.map((r) => (
              <button key={r.id} onClick={() => setDetailFor(r)} className="rounded-[14px] border border-[#E2E8F0] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#4F46E5]">{r.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{r.name}</p>
                    <p className="truncate text-[13px] text-[#64748B]">{r.title} • {r.company}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-[12px] text-[#94A3B8]">{lastActivityFor(r)}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* recruiter detail */}
      <Drawer open={!!detailFor} onClose={() => setDetailFor(null)} title="Recruiter profile">
        {detailFor && (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[18px] font-bold text-[#4F46E5]">{detailFor.initials}</span>
              <div className="min-w-0">
                <p className="truncate text-[19px] font-bold">{detailFor.name}</p>
                <p className="truncate text-[14px] text-[#64748B]">{detailFor.title} • {detailFor.company}</p>
                <p className="truncate text-[13px] text-[#94A3B8]">{detailFor.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="text-[14px] font-medium text-[#475569]">Current status</span>
              <StatusBadge status={detailFor.status} />
            </div>
            <div className="rounded-[12px] border border-[#4F46E5]/20 bg-[#EEF2FF]/40 p-4">
              <p className="text-[13px] font-bold uppercase tracking-[0.07em] text-[#4F46E5]">Relationship overview</p>
              {(() => {
                const history = CONTACT_HISTORY[detailFor.id] ?? [];
                const rel = relationshipOf(detailFor, history.length + (detailFor.status === 'Not Contacted' ? 0 : 1));
                const fu = followUps[detailFor.id];
                return (
                  <>
                    <dl className="mt-2.5 grid grid-cols-2 gap-2 text-[13px]">
                      {[
                        ['Relationship', rel.warmth],
                        ['Last interaction', detailFor.status === 'Not Contacted' ? '—' : detailFor.date],
                        ['Emails', String(rel.emails)],
                        ['Replies', String(rel.replies)],
                        ['Open activity', fu && fu.status !== 'dismissed' ? `Follow-up ${fu.status}` : getDraft(detailFor.id) ? 'Draft saved' : 'None'],
                        ['Engagement', rel.engagement],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-[8px] bg-white/70 px-2.5 py-1.5">
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">{k}</dt>
                          <dd className="font-bold text-[#0F172A]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-2 text-[11px] text-[#94A3B8]">Demo relationship estimates from outreach history.</p>
                  </>
                );
              })()}
            </div>
            <div>
              <p className="mb-2 text-[15px] font-semibold">Recruiter journey</p>
              <ol className="flex items-center" aria-label="Outreach progress">
                {['Found', 'Drafted', 'Sent', 'Opened', 'Replied'].map((stage, i) => {
                  const reached = detailFor.status === 'Not Contacted' ? 0 : detailFor.status === 'Sent' ? 2 : detailFor.status === 'Opened' ? 3 : 4;
                  const done = i <= reached;
                  return (
                    <li key={stage} className="flex min-w-0 flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${done ? 'bg-[#4F46E5] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
                          {done ? '✓' : i + 1}
                        </span>
                        <span className={`text-[10px] font-semibold ${done ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{stage}</span>
                      </div>
                      {i < 4 && <span className={`mx-1 mb-5 h-px flex-1 ${i < reached ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0]'}`} />}
                    </li>
                  );
                })}
              </ol>
            </div>
            <div>
              <p className="mb-2 text-[15px] font-semibold">Contact history</p>
              <div className="space-y-2">
                {(CONTACT_HISTORY[detailFor.id] ?? []).map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F0] p-3">
                    <Mail className="h-4 w-4 shrink-0 text-[#64748B]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{h.subject}</p>
                      <p className="text-[12px] text-[#94A3B8]">{h.date}</p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
                {(CONTACT_HISTORY[detailFor.id] ?? []).length === 0 && (
                  <p className="rounded-[10px] border border-dashed border-[#CBD5E1] p-4 text-center text-[14px] text-[#64748B]">No emails yet — compose the first one below.</p>
                )}
                {getDraft(detailFor.id) && (
                  <div className="rounded-[10px] border border-[#FCD34D] bg-[#FFFBEB] p-3">
                    <p className="text-[13px] font-semibold text-[#B45309]">Unsent draft saved</p>
                    <p className="truncate text-[13px] text-[#92400E]">{getDraft(detailFor.id)?.subject}</p>
                  </div>
                )}
              </div>
            </div>
            <FollowUpState recruiter={detailFor} onGenerate={() => setFollowUpFor(detailFor)} />
            <button
              onClick={() => { const r = detailFor; setDetailFor(null); openComposer(r); }}
              className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#3730A3]"
            >
              <Send className="h-4 w-4" />Compose Email
            </button>
          </div>
        )}
      </Drawer>

      {/* composer */}
      <Drawer open={!!composerFor} onClose={() => setComposerFor(null)} title="Email composer" wide>
        {composerFor && (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[14px]">
              <p><span className="font-semibold">To:</span> {draft.to}</p>
              <p className="mt-1"><span className="font-semibold">Recruiter:</span> {composerFor.name} • {composerFor.title} at {composerFor.company}</p>
              {hasDraft && <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[12px] font-semibold text-[#B45309]">Draft restored</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] font-semibold" htmlFor="outreach-subject">Subject</label>
              {editing ? (
                <input id="outreach-subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]" />
              ) : <p className="rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[14px]">{draft.subject}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] font-semibold" htmlFor="outreach-body">
                Email body <span className="ml-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">AI-generated • editable</span>
              </label>
              {editing ? (
                <textarea id="outreach-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={12} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-3 text-[14px] leading-relaxed outline-none focus:border-[#4F46E5]" />
              ) : <p className="whitespace-pre-line rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] leading-relaxed">{draft.body}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-50">
                <Sparkles className="h-4 w-4" />{generating ? 'Generating…' : 'Generate'}
              </button>
              <button onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />Regenerate
              </button>
              <button onClick={() => setEditing((v) => !v)} className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
                <Pencil className="h-4 w-4" />{editing ? 'Preview' : 'Edit'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => saveDraft(composerFor.id, draft.subject, draft.body)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
              >
                <Save className="h-4 w-4" />Save Draft
              </button>
              <button
                onClick={() => {
                  if (sending || !draft.subject.trim() || !draft.body.trim()) return;
                  setSending(true);
                  const rid = composerFor.id;
                  setTimeout(() => {
                    setSending(false);
                    sendOutreach(rid, draft.subject, draft.body);
                    setComposerFor(null);
                  }, 900);
                }}
                disabled={!draft.subject.trim() || !draft.body.trim() || sending}
                className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:opacity-70"
              >
                {sending ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending…</>) : (<><Send className="h-4 w-4" />Send Email</>)}
              </button>
            </div>
            <p className="text-[13px] text-[#64748B]">Nothing is sent until you press Send Email. Drafts persist across refreshes.</p>
          </div>
        )}
      </Drawer>

      <FollowUpModal recruiter={followUpFor} open={!!followUpFor} onClose={() => setFollowUpFor(null)} />
    </div>
  );
}
