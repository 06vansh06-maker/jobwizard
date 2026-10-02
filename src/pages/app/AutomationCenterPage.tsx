import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MousePointerClick, Send, Radar, Pause, Play, Settings2, Check, Zap, ScanSearch, BookmarkCheck } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Card, PageHeader, Toggle } from '../../components/ui';
import { cn } from '../../lib/cn';

const ICONS: Record<string, typeof Search> = {
  discovery: Search,
  applications: MousePointerClick,
  outreach: Send,
  monitoring: Radar,
};

export default function AutomationCenterPage() {
  const { automation, toggleAutomation, settings, updateSettings, pushToast } = useApp();
  const navigate = useNavigate();

  const allOn = automation.every((s) => s.enabled);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Automation Center"
        subtitle="Four AI agents work your job search around the clock. Pause anything, anytime — you stay in control."
        actions={
          <button
            onClick={() => {
              automation.forEach((s) => { if (s.enabled !== !allOn) toggleAutomation(s.id); });
              pushToast({ title: allOn ? 'All automations paused' : 'All automations activated', kind: 'info' });
            }}
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            {allOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {allOn ? 'Pause all' : 'Activate all'}
          </button>
        }
      />

      {/* dark command-center hero */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#070A12] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#4F46E5]/25 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[#06B6D4]/15 blur-[100px]" aria-hidden="true" />
        <div className="relative grid items-start gap-8 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-bold text-indigo-200">
              <Zap className="h-3.5 w-3.5" />AI AGENT COMMAND CENTER
            </p>
            <h2 className="mt-4 text-[30px] font-extrabold leading-[1.08] tracking-tight sm:text-[38px]">
              Your job search,
              <br />
              running in the background.
            </h2>
            <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-white/60">
              JobWizard handles repetitive work while you stay in control.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="text-[14px] text-white/70">
                <span className="text-[22px] font-extrabold text-white">{automation.filter((s) => s.enabled).length}/4</span> agents active
              </p>
              <p className="text-[14px] text-white/70">
                <span className="text-[22px] font-extrabold text-white">{automation.reduce((a, s) => a + s.usage, 0)}</span> actions today
              </p>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/45">AI agent activity</p>
            <div className="relative mt-3">
              <motion.span
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                style={{ transformOrigin: 'top' }}
                className="absolute bottom-2 left-[5px] top-2 w-px bg-white/15"
                aria-hidden="true"
              />
              <ol className="space-y-4">
                {[
                  { t: '10:15', text: 'Recruiter response detected.', sub: 'CloudCore • classified Interested' },
                  { t: '10:02', text: 'Application prepared.', sub: 'Frontend Developer • awaiting your review' },
                  { t: '09:18', text: 'AI identified 4 strong matches.', sub: 'Scored against your profile' },
                  { t: '08:42', text: 'AI discovered 8 new jobs.', sub: 'Across 5 connected sources' },
                ].map((e, i) => (
                  <motion.li
                    key={e.t}
                    initial={{ opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 }}
                    className="relative flex gap-3.5 pl-1"
                  >
                    <span className="relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[#070A12] bg-[#06B6D4]" />
                    <div>
                      <p className="text-[13px] font-bold text-white/45">{e.t}</p>
                      <p className="text-[14px] font-medium text-white">{e.text}</p>
                      <p className="text-[13px] text-white/50">{e.sub}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* agent workflow */}
      <Card className="overflow-hidden p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-[18px] font-semibold">AI agent workflow</h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">How one opportunity moves through JobWizard</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1.5 text-[12px] font-bold text-[#16A34A]">
            <span className="jw-dot-soft h-1.5 w-1.5 rounded-full bg-[#16A34A]" />Live pipeline
          </span>
        </div>
        <div className="relative mt-6 overflow-x-auto pb-1">
          <div className="relative flex min-w-[640px] items-start">
            <div className="absolute left-8 right-8 top-[22px] h-px bg-[#E2E8F0]" aria-hidden="true" />
            <div className="jw-flow-track pointer-events-none absolute left-8 right-8 top-[22px] h-px" aria-hidden="true">
              <span className="jw-flow-dot" />
              <span className="jw-flow-dot jw-flow-dot-2" />
            </div>
            {[
              { icon: Search, label: 'Discovery', sub: '24 jobs found' },
              { icon: ScanSearch, label: 'Profile Match', sub: '8 strong fits' },
              { icon: BookmarkCheck, label: 'Shortlist', sub: 'Saved for review' },
              { icon: Send, label: 'Apply / Outreach', sub: 'Submitted + sent' },
              { icon: Radar, label: 'Response Monitor', sub: '3 replies tracked' },
            ].map((n, i) => (
              <div key={n.label} className="relative z-10 flex flex-1 flex-col items-center px-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-white text-[#4F46E5] shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                  <n.icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-[13px] font-bold">{i + 1}. {n.label}</p>
                <p className="text-[12px] text-[#64748B]">{n.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* overview strip */}
      <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <div>
          <p className="text-[30px] font-bold leading-none">{automation.filter((s) => s.enabled).length}<span className="text-[16px] text-[#64748B]">/4</span></p>
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Agents active</p>
        </div>
        <div className="h-10 w-px bg-[#E2E8F0]" />
        <div>
          <p className="text-[30px] font-bold leading-none">{automation.reduce((a, s) => a + s.usage, 0)}</p>
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Actions today</p>
        </div>
        <div className="h-10 w-px bg-[#E2E8F0]" />
        <p className="flex max-w-[420px] items-center gap-2 text-[14px] text-[#475569]">
          <Check className="h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />
          Daily limits from Settings apply ({settings.dailyApplicationLimit} applications, {settings.outreachLimit} outreach).
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {automation.map((svc) => {
          const Icon = ICONS[svc.id] ?? Search;
          const pct = Math.min(100, Math.round((svc.usage / Math.max(1, svc.limit)) * 100));
          return (
            <Card key={svc.id} className={cn('flex flex-col p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]', !svc.enabled && 'opacity-90')}>
              <div className="flex items-start justify-between gap-3">
                <span className={cn('flex h-12 w-12 items-center justify-center rounded-[14px] transition-colors',
                  svc.enabled ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#F1F5F9] text-[#94A3B8]')}>
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <Toggle checked={svc.enabled} onChange={() => toggleAutomation(svc.id)} label={`${svc.title} enabled`} />
              </div>
              <h3 className="mt-4 text-[19px] font-semibold">{svc.title}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">{svc.description}</p>

              <div className="mt-4 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[#334155]">{svc.title}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[12px] font-bold', svc.enabled ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]')}>
                    {svc.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className={cn('h-full rounded-full transition-all', svc.enabled ? 'bg-[#4F46E5]' : 'bg-[#94A3B8]')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#0F172A]">{svc.usage} / {svc.limit} {svc.unit}</span>
                  <span className="text-[#94A3B8]">Last run {svc.lastRun}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate('/app/settings')}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
                >
                  <Settings2 className="h-4 w-4" />Configure
                </button>
                <button
                  onClick={() => toggleAutomation(svc.id)}
                  className={cn('flex-1 rounded-[9px] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors',
                    svc.enabled ? 'bg-[#0F172A] hover:bg-[#1E293B]' : 'bg-[#4F46E5] hover:bg-[#3730A3]')}
                >
                  {svc.enabled ? 'Pause' : 'Activate'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
