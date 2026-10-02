import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Sparkles, Inbox, ArrowRight, Send, LayoutDashboard, Zap, Crosshair, Flame, ListPlus, BotMessageSquare } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { DISCOVERY_SERIES, JOBS } from '../../data/mock';
import { Card, MatchBadge, MatchBar, PageHeader, SkillPill, Skeleton } from '../../components/ui';
import { StatCard, JobCard, JobDetailBody, ActivityTimeline, RangeTabs } from '../../components/app-ui';
import { AreaChart, Donut, Funnel } from '../../components/charts';
import { Drawer } from '../../components/app-shell';
import { cn } from '../../lib/cn';
import type { Job } from '../../types';

export default function DashboardPage() {
  const { profile, profileCompletion, applications, unreadResponseCount, activity, savedJobIds, appliedJobIds, recruiters, queueJobIds } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const matched = useMemo(() => JOBS.filter((j) => j.matchScore >= 8), []);
  const topJobs = useMemo(() => [...JOBS].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5), []);
  const unappliedStrong = useMemo(() => JOBS.filter((j) => j.matchScore >= 8.5 && !appliedJobIds.has(j.id)), [appliedJobIds]);
  const savedReady = useMemo(() => JOBS.filter((j) => savedJobIds.includes(j.id) && !appliedJobIds.has(j.id)), [savedJobIds, appliedJobIds]);
  const strongest = useMemo(() => [...JOBS].filter((j) => !appliedJobIds.has(j.id)).sort((a, b) => b.matchScore - a.matchScore)[0] ?? topJobs[0], [appliedJobIds, topJobs]);

  const briefing = useMemo(() => ({
    fresh: JOBS.filter((j) => j.postedDaysAgo <= 2).length * 4 + 4,
    strong: unappliedStrong.length,
    ready: savedReady.length,
    replies: unreadResponseCount,
  }), [unappliedStrong, savedReady, unreadResponseCount]);

  const nextAction = useMemo(() => {
    if (unreadResponseCount > 0)
      return { icon: Inbox, title: 'Reply to recruiter', desc: `${unreadResponseCount} unread response${unreadResponseCount === 1 ? '' : 's'} waiting — fastest wins close roles.`, cta: 'Open inbox', to: '/app/responses' };
    if (savedReady.length > 0)
      return { icon: Send, title: 'Apply to saved jobs', desc: `${savedReady.length} shortlisted role${savedReady.length === 1 ? '' : 's'} ready to submit.`, cta: `Review ${savedReady.length} job${savedReady.length === 1 ? '' : 's'}`, to: '/app/saved' };
    if (unappliedStrong.length >= 3)
      return { icon: Sparkles, title: 'Review strong matches', desc: `${unappliedStrong.length} highly matched jobs you haven't applied to.`, cta: `Review ${unappliedStrong.length} jobs`, to: '/app/recommended' };
    if (profileCompletion.pct < 100)
      return { icon: FileText, title: 'Complete your profile', desc: `${profileCompletion.missing[0] ?? 'A few gaps'} — sharper matches await.`, cta: 'Complete profile', to: '/app/profile' };
    if (!profile.resumeName)
      return { icon: FileText, title: 'Update resume', desc: 'Matching accuracy drops without a parsed resume.', cta: 'Upload resume', to: '/app/profile' };
    if (recruiters.some((r) => r.status === 'Not Contacted'))
      return { icon: Send, title: 'Contact recruiter', desc: 'Warm intros convert 3× better than cold applies.', cta: 'Open outreach', to: '/app/outreach' };
    return { icon: Search, title: 'Explore new matches', desc: 'Fresh roles land daily — check what arrived.', cta: 'Find jobs', to: '/app/jobs' };
  }, [unreadResponseCount, savedReady, unappliedStrong, profileCompletion, profile.resumeName, recruiters]);

  const priorities = useMemo(() => {
    const items: Array<{ title: string; to: string }> = [];
    if (unappliedStrong.length > 0) items.push({ title: `Review ${Math.min(3, unappliedStrong.length)} strong matches`, to: '/app/recommended' });
    if (savedReady.length > 0) items.push({ title: `Apply to ${savedReady.length} saved job${savedReady.length === 1 ? '' : 's'}`, to: '/app/saved' });
    if (unreadResponseCount > 0) items.push({ title: 'Reply to recruiter', to: '/app/responses' });
    if (profileCompletion.pct < 100) items.push({ title: 'Complete your profile', to: '/app/profile' });
    return items.slice(0, 3);
  }, [unappliedStrong, savedReady, unreadResponseCount, profileCompletion]);

  const pulse = useMemo(() => {
    const counts: Record<string, number> = {};
    JOBS.forEach((j) => j.skills.forEach((s) => { counts[s] = (counts[s] ?? 0) + 1; }));
    const trending = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const cats: Array<[string, (j: Job) => boolean]> = [
      ['Frontend', (j) => /frontend|react/i.test(j.title)],
      ['Backend', (j) => /backend|python|fastapi/i.test(`${j.title} ${j.skills.join(' ')}`)],
      ['AI/ML', (j) => /ai|ml|llm|machine/i.test(`${j.title} ${j.skills.join(' ')}`)],
      ['Full Stack', (j) => /full|full-stack/i.test(j.title)],
    ];
    return { trending, cats: cats.map(([label, fn]) => ({ label, count: JOBS.filter(fn).length })) };
  }, []);

  const dist = useMemo(() => ([
    { label: 'Excellent', value: JOBS.filter((j) => j.matchScore >= 9).length, color: '#16A34A' },
    { label: 'Strong', value: JOBS.filter((j) => j.matchScore >= 8.5 && j.matchScore < 9).length, color: '#4F46E5' },
    { label: 'Potential', value: JOBS.filter((j) => j.matchScore < 8.5).length, color: '#06B6D4' },
  ]), []);

  const funnel = useMemo(() => ([
    { label: 'Jobs Found', value: 128, color: '#94A3B8', to: '/app/jobs' },
    { label: 'AI Matches', value: matched.length * 3, color: '#4F46E5', to: '/app/recommended' },
    { label: 'Applications', value: applications.length + 9, color: '#06B6D4', to: '/app/applications' },
    { label: 'Responses', value: 7, color: '#16A34A', to: '/app/responses' },
    { label: 'Interviews', value: applications.filter((a) => a.status === 'Interview').length + 4, color: '#8B5CF6', to: '/app/applications' },
  ]), [applications, matched]);

  const series = DISCOVERY_SERIES[range];

  const activityTarget = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('outreach') || t.includes('email')) return '/app/outreach';
    if (t.includes('repl') || t.includes('response')) return '/app/responses';
    if (t.includes('saved')) return '/app/saved';
    if (t.includes('profile') || t.includes('skill') || t.includes('resume')) return '/app/profile';
    if (t.includes('appl') || t.includes('interview') || t.includes('viewed')) return '/app/applications';
    return '/app/jobs';
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[132px]" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[280px] lg:col-span-2" />
          <Skeleton className="h-[280px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${profile.firstName || 'Vansh'}`}
        subtitle="Here's what's happening with your job search."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2 text-[13px] font-semibold text-[#16A34A]">
              <span className="jw-dot-soft h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              AI Agent Active
            </span>
            <button
              onClick={() => setFocusMode((v) => !v)}
              aria-pressed={focusMode}
              className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                focusMode ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]' : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]')}
              title="Distraction-free view of today's priorities"
            >
              <Crosshair className="h-4 w-4" />Focus Mode
            </button>
          </div>
        }
      />

      {/* statistics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={Search} label="Jobs Found" value="128" delta="+18%" sub="this week" to="/app/jobs" />
        <StatCard icon={Sparkles} label="AI Matches" value={String(matched.length * 3)} delta="+12%" sub="score 8.0 and above" to="/app/recommended" />
        <StatCard icon={FileText} label="Applications" value={String(applications.length + 9)} delta="+3" sub="this week" to="/app/applications" />
        <StatCard icon={Inbox} label="Recruiter Responses" value="7" delta="+2" sub="this week" to="/app/responses" />
      </div>

      {/* copilot entry + queue snapshot */}
      <div className="grid gap-4 lg:grid-cols-5">
        <button
          onClick={() => navigate('/app/jobs?copilot=1')}
          className="group flex items-center gap-4 rounded-[16px] border border-[#4F46E5]/25 bg-gradient-to-r from-[#EEF2FF] to-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,0.14)] lg:col-span-3"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#4F46E5] text-white transition-transform duration-200 group-hover:scale-105">
            <BotMessageSquare className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold">Describe the job you want — AI Copilot finds it</span>
            <span className="block truncate text-[14px] text-[#64748B]">“Find remote Python internships” → filters applied instantly</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#CBD5E1] transition-all group-hover:translate-x-1 group-hover:text-[#4F46E5]" />
        </button>
        <button
          onClick={() => navigate('/app/applications')}
          className="group rounded-[16px] border border-[#E2E8F0] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:shadow-md lg:col-span-2"
        >
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
            <ListPlus className="h-4 w-4 text-[#4F46E5]" />Application queue
          </p>
          {(() => {
            const queued = queueJobIds.map((id) => JOBS.find((j) => j.id === id)).filter((j): j is Job => !!j).slice(0, 2);
            return queued.length === 0 ? (
              <p className="mt-2 text-[15px] text-[#64748B]">Queue is empty — <span className="font-semibold text-[#4F46E5]">add roles</span> to work through them here.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {queued.map((j) => (
                  <li key={j.id} className="truncate text-[14px] font-medium">
                    <span className="font-bold text-[#4F46E5]">{j.matchScore.toFixed(1)}</span> {j.title} <span className="text-[#64748B]">· {j.company}</span>
                  </li>
                ))}
                {queueJobIds.length > 2 && <li className="text-[13px] text-[#64748B]">+{queueJobIds.length - 2} more in queue</li>}
              </ul>
            );
          })()}
        </button>
      </div>

      {focusMode ? (
        <Card className="border-[#4F46E5]/25 bg-[#EEF2FF]/40 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">
            <Crosshair className="h-4 w-4" />Today&apos;s priorities
          </p>
          <ol className="mt-4 space-y-3">
            {priorities.length === 0 && <li className="text-[15px] text-[#475569]">All clear — fresh matches land tomorrow morning.</li>}
            {priorities.map((p, i) => (
              <li key={p.title}>
                <button
                  onClick={() => navigate(p.to)}
                  className="group flex w-full items-center gap-4 rounded-[14px] border border-[#E2E8F0] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[15px] font-bold text-white">{i + 1}</span>
                  <span className="flex-1 text-[16px] font-semibold">{p.title}</span>
                  <ArrowRight className="h-5 w-5 text-[#CBD5E1] transition-all group-hover:translate-x-1 group-hover:text-[#4F46E5]" />
                </button>
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <>
          {/* briefing + next action */}
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="relative overflow-hidden rounded-[20px] bg-[#0F172A] p-6 text-white sm:p-7 lg:col-span-3">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#4F46E5]/25 blur-[90px]" aria-hidden="true" />
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-indigo-300">Daily briefing</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { v: String(briefing.fresh), l: 'new jobs found' },
                  { v: String(briefing.strong), l: 'strong matches' },
                  { v: String(briefing.ready), l: 'applications ready' },
                  { v: String(briefing.replies), l: 'recruiter replied' },
                ].map((b) => (
                  <div key={b.l}>
                    <p className="text-[30px] font-extrabold leading-none">{b.v}</p>
                    <p className="mt-1 text-[13px] text-white/55">{b.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">Strongest match</p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold">{strongest.title} at {strongest.company} · {strongest.matchScore.toFixed(1)} / 10</p>
                </div>
                <button
                  onClick={() => navigate('/app/recommended')}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[9px] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#0B1226] transition-colors hover:bg-[#E0E7FF]"
                >
                  Review Today&apos;s Opportunities<ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Card className="border-[#4F46E5]/25 bg-gradient-to-b from-[#EEF2FF] to-white p-6 lg:col-span-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[#4F46E5]">
                <Zap className="h-4 w-4" />Recommended next action
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#4F46E5] text-white">
                  <nextAction.icon className="h-5 w-5" />
                </span>
                <p className="text-[19px] font-bold leading-snug">{nextAction.title}</p>
              </div>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#475569]">{nextAction.desc}</p>
              <button
                onClick={() => navigate(nextAction.to)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]"
              >
                {nextAction.cta}<ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          </div>

          {/* intelligence panel */}
          <Card className="overflow-hidden !rounded-[22px] p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-[18px] font-semibold">
                  <LayoutDashboard className="h-5 w-5 text-[#4F46E5]" />Job Search Intelligence
                </h3>
                <p className="mt-0.5 text-[13px] text-[#64748B]">Live picture of discovery and fit across your search</p>
              </div>
              <RangeTabs value={range} onChange={setRange} />
            </div>
            <div className="grid lg:grid-cols-5">
              <div className="border-b border-[#E2E8F0] p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
                <AreaChart labels={series.labels} seriesA={series.jobs} seriesB={series.matches} labelA="Jobs found" labelB="AI matches" />
              </div>
              <div className="p-6 lg:col-span-2">
                <Donut segments={dist} onSelect={() => navigate('/app/recommended')} />
                <p className="mt-2 text-[12px] text-[#94A3B8]">Select a segment to explore those matches.</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* horizontal AI matches */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[20px] font-semibold"><Sparkles className="h-5 w-5 text-[#4F46E5]" />AI Job Matches</h2>
            <p className="mt-0.5 text-[14px] text-[#64748B]">Top picks based on your profile, skills and preferences.</p>
          </div>
          <button onClick={() => navigate('/app/recommended')} className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-[#4F46E5] hover:underline">
            View all<ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 pt-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {topJobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              onView={() => setDetailJob(job)}
              highlighted={i === 0}
              className="w-[300px] shrink-0 snap-start sm:w-[330px]"
            />
          ))}
          <button
            onClick={() => navigate('/app/recommended')}
            className="group flex w-[180px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#CBD5E1] bg-white text-[#64748B] transition-all hover:-translate-y-1 hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2FF] transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="text-[14px] font-semibold">See all matches</span>
          </button>
        </div>
      </div>

      {/* funnel + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[18px] font-semibold">Application Funnel</h3>
          <p className="mt-0.5 text-[13px] text-[#64748B]">Select a stage to open it</p>
          <div className="mt-4">
            <Funnel stages={funnel} onSelect={(s) => s.to && navigate(s.to)} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold">Recent Activity</h3>
            <button onClick={() => navigate('/app/applications')} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#4F46E5] hover:underline">
              Tracker<ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <ActivityTimeline items={activity} onItemClick={(a) => navigate(activityTarget(a.text))} />
          </div>
        </Card>
      </div>

      {!focusMode && (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="p-6 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-[18px] font-semibold"><Flame className="h-5 w-5 text-[#4F46E5]" />Job Market Pulse</h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">Live demand across indexed roles</p>
            <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Trending skills</p>
            <div className="flex flex-wrap gap-1.5">
              {pulse.trending.map(([skill, count]) => (
                <button
                  key={skill}
                  onClick={() => navigate(`/app/jobs?highlight=${JOBS.find((j) => j.skills.includes(skill))?.id ?? ''}`)}
                  className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
                  title={`${count} roles mention ${skill}`}
                >
                  {skill} <span className="font-bold text-[#4F46E5]">{count}</span>
                </button>
              ))}
            </div>
            <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Strongest categories</p>
            <div className="space-y-2">
              {pulse.cats.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5">
                  <span className="w-24 shrink-0 text-[13px] font-medium text-[#475569]">{c.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF2FF]">
                    <div className="h-full rounded-full bg-[#4F46E5]" style={{ width: `${Math.min(100, c.count * 14)}%` }} />
                  </div>
                  <span className="w-6 text-right text-[13px] font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 lg:col-span-3">
            <h3 className="text-[18px] font-semibold">Quick Actions</h3>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                { icon: Search, title: 'Find Jobs', desc: 'Search 128 fresh postings', to: '/app/jobs' },
                { icon: Sparkles, title: 'View AI Matches', desc: 'Ranked by fit for you', to: '/app/recommended' },
                { icon: FileText, title: 'Track Applications', desc: 'Follow every submission', to: '/app/applications' },
                { icon: Send, title: 'Reach Recruiters', desc: 'Send tailored outreach', to: '/app/outreach' },
              ].map((a) => (
                <button
                  key={a.title}
                  onClick={() => navigate(a.to)}
                  className="group flex items-center gap-3 rounded-[12px] border border-[#E2E8F0] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:shadow-[0_10px_24px_rgba(79,70,229,0.12)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[#4F46E5] transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
                    <a.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{a.title}</span>
                    <span className="block truncate text-[13px] text-[#64748B]">{a.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#4F46E5]" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* top match spotlight */}
      {!focusMode && (
        <Card className="overflow-hidden !rounded-[20px] border-[#4F46E5]/25 p-0">
          <div className="grid md:grid-cols-2">
            <div className="bg-[#0F172A] p-6 text-white sm:p-8">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-indigo-300">Spotlight · highest match</p>
              {(() => {
                const job = topJobs[0];
                return (
                  <div className="mt-3">
                    <p className="text-[26px] font-bold leading-tight">{job.title}</p>
                    <p className="mt-1 text-[15px] text-white/60">{job.company} • {job.location} • {job.salary}</p>
                    <p className="mt-4 text-[44px] font-extrabold leading-none">{job.matchScore.toFixed(1)}<span className="text-[16px] font-semibold text-white/50"> / 10</span></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((s) => (
                        <span key={s} className="rounded-[8px] border border-white/15 bg-white/10 px-3 py-1.5 text-[13px] font-medium">{s}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => setDetailJob(job)}
                      className="mt-6 inline-flex items-center gap-2 rounded-[9px] bg-white px-6 py-3 text-[15px] font-semibold text-[#0B1226] transition-colors hover:bg-[#E0E7FF]"
                    >
                      View details<ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()}
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">Why it leads</p>
              <ul className="mt-3 space-y-2.5">
                {(topJobs[0].whyMatches ?? []).concat(['Preferred location', 'Salary band fit']).slice(0, 4).map((w) => (
                  <li key={w} className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[14px] font-medium">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[11px] font-bold text-[#16A34A]">✓</span>{w}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <MatchBar score={topJobs[0].matchScore} />
                <div className="mt-2 flex items-center justify-between">
                  <MatchBadge score={topJobs[0].matchScore} compact />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">{topJobs[0].skills.map((s) => <SkillPill key={s} skill={s} />)}</div>
            </div>
          </div>
        </Card>
      )}

      <Drawer open={!!detailJob} onClose={() => setDetailJob(null)} title="Job details" wide>
        {detailJob && <JobDetailBody job={detailJob} onClose={() => setDetailJob(null)} />}
      </Drawer>
    </div>
  );
}
