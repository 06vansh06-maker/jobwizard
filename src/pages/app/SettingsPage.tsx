import { useState } from 'react';
import { User, Bell, Briefcase, Zap, Mail, ShieldCheck, Trash2, RotateCcw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { DEFAULT_SETTINGS } from '../../data/mock';
import { Card, PageHeader, Toggle } from '../../components/ui';
import { cn } from '../../lib/cn';

const SECTIONS = [
  { id: 'Account', icon: User },
  { id: 'Notifications', icon: Bell },
  { id: 'Job Preferences', icon: Briefcase },
  { id: 'Automation', icon: Zap },
  { id: 'Email Integration', icon: Mail },
  { id: 'Security', icon: ShieldCheck },
] as const;

export default function SettingsPage() {
  const { settings, updateSettings, pushToast, askConfirm, profile, updateProfile } = useApp();
  const [active, setActive] = useState<(typeof SECTIONS)[number]['id']>('Automation');
  const [emailConnected, setEmailConnected] = useState(true);
  const [newPw, setNewPw] = useState('');
  const [curPw, setCurPw] = useState('');

  const saved = (msg: string) => pushToast({ title: msg, kind: 'success' });

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Control your account, notifications, automation and integrations. Changes save automatically." />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={cn('flex w-full items-center gap-2.5 rounded-[9px] px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                active === s.id ? 'bg-[#EEF2FF] font-semibold text-[#4F46E5]' : 'text-[#475569] hover:bg-[#F8FAFC]')}>
              <s.icon className="h-[18px] w-[18px]" />{s.id}
            </button>
          ))}
        </Card>

        <div className="min-w-0">
          {active === 'Automation' && (
            <Card className="p-6">
              <h3 className="text-[18px] font-semibold">Automation</h3>
              <p className="mt-1 text-[14px] text-[#64748B]">Safe defaults with clear limits. Nothing sends without your rules.</p>
              <div className="mt-5 divide-y divide-[#F1F5F9]">
                <div className="flex items-center justify-between gap-4 py-4">
                  <div><p className="text-[15px] font-semibold">Automatically fetch new jobs</p><p className="text-[13px] text-[#64748B]">Daily discovery across connected sources.</p></div>
                  <Toggle checked={settings.autoFetchJobs} onChange={(v) => { updateSettings({ autoFetchJobs: v }); saved(v ? 'Job discovery enabled' : 'Job discovery paused'); }} label="Automatically fetch new jobs" />
                </div>
                <div className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-[15px] font-semibold">Daily application limit</p><p className="text-[13px] text-[#64748B]">Maximum assisted applications per day.</p></div>
                    <span className="rounded-[8px] bg-[#EEF2FF] px-3 py-1 text-[14px] font-bold text-[#4F46E5]">{settings.dailyApplicationLimit}</span>
                  </div>
                  <input
                    type="range" min={1} max={15} step={1}
                    value={settings.dailyApplicationLimit}
                    onChange={(e) => { updateSettings({ dailyApplicationLimit: Number(e.target.value) }); }}
                    onMouseUp={() => saved('Daily application limit updated')}
                    className="mt-3 w-full accent-[#4F46E5]"
                    aria-label="Daily application limit"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8]"><span>1</span><span>15</span></div>
                </div>
                <div className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-[15px] font-semibold">Cold outreach limit</p><p className="text-[13px] text-[#64748B]">Max personalized emails per day.</p></div>
                    <span className="rounded-[8px] bg-[#EEF2FF] px-3 py-1 text-[14px] font-bold text-[#4F46E5]">{settings.outreachLimit}</span>
                  </div>
                  <input
                    type="range" min={10} max={100} step={10}
                    value={settings.outreachLimit}
                    onChange={(e) => { updateSettings({ outreachLimit: Number(e.target.value) }); }}
                    onMouseUp={() => saved('Outreach limit updated')}
                    className="mt-3 w-full accent-[#4F46E5]"
                    aria-label="Cold outreach limit"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8]"><span>10</span><span>100</span></div>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <div><p className="text-[15px] font-semibold">Recruiter response monitoring</p><p className="text-[13px] text-[#64748B]">Instant alerts when a recruiter replies.</p></div>
                  <Toggle checked={settings.responseMonitoring} onChange={(v) => { updateSettings({ responseMonitoring: v }); saved(v ? 'Response monitoring on' : 'Response monitoring off'); }} label="Recruiter response monitoring" />
                </div>
              </div>
            </Card>
          )}

          {active === 'Account' && (
            <Card className="space-y-4 p-6">
              <h3 className="text-[18px] font-semibold">Account</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-[14px] font-semibold" htmlFor="set-name">Name</label>
                  <input id="set-name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value, firstName: e.target.value.split(' ')[0] })} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
                <div><label className="mb-1.5 block text-[14px] font-semibold" htmlFor="set-email">Email</label>
                  <input id="set-email" value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => saved('Account updated')} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#3730A3]">Save account</button>
                <button onClick={() => { updateSettings({ ...DEFAULT_SETTINGS }); saved('Settings reset to defaults'); }} className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]">
                  <RotateCcw className="h-4 w-4" />Reset all settings
                </button>
              </div>
              <div className="border-t border-[#F1F5F9] pt-4">
                <button onClick={() => askConfirm({ title: 'Delete account?', description: 'This permanently removes your profile, applications and outreach history.', confirmLabel: 'Delete', onConfirm: () => pushToast({ title: 'Account deletion requested', description: 'Check your email to confirm.', kind: 'info' }) })}
                  className="inline-flex items-center gap-2 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-[14px] font-semibold text-[#DC2626]"><Trash2 className="h-4 w-4" />Delete account</button>
              </div>
            </Card>
          )}

          {active === 'Notifications' && (
            <Card className="p-6">
              <h3 className="text-[18px] font-semibold">Notifications</h3>
              <div className="mt-4 divide-y divide-[#F1F5F9]">
                {([
                  ['Email notifications', 'Job matches and reply alerts by email.', settings.emailNotifications, (v: boolean) => updateSettings({ emailNotifications: v })],
                  ['Weekly digest', 'A Sunday summary of matches and activity.', settings.weeklyDigest, (v: boolean) => updateSettings({ weeklyDigest: v })],
                  ['Instant reply alerts', 'Push + email the moment a recruiter replies.', settings.instantAlerts, (v: boolean) => updateSettings({ instantAlerts: v })],
                ] as const).map(([title, desc, checked, onChange]) => (
                  <div key={title} className="flex items-center justify-between gap-4 py-4">
                    <div><p className="text-[15px] font-semibold">{title}</p><p className="text-[13px] text-[#64748B]">{desc}</p></div>
                    <Toggle checked={checked} onChange={(v) => { onChange(v); saved('Notification preference saved'); }} label={title} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === 'Job Preferences' && (
            <Card className="space-y-4 p-6">
              <h3 className="text-[18px] font-semibold">Job Preferences</h3>
              <p className="text-[14px] text-[#64748B]">These drive AI ranking everywhere. Changes apply instantly.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-[14px] font-semibold">Preferred roles</label>
                  <input value={profile.preferredRoles.join(', ')} onChange={(e) => updateProfile({ preferredRoles: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
                <div><label className="mb-1.5 block text-[14px] font-semibold">Preferred locations</label>
                  <input value={profile.preferredLocations.join(', ')} onChange={(e) => updateProfile({ preferredLocations: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
                <div><label className="mb-1.5 block text-[14px] font-semibold">Work mode</label>
                  <select value={profile.workMode} onChange={(e) => { updateProfile({ workMode: e.target.value }); saved('Work mode updated'); }} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]">
                    {['Remote / Hybrid', 'Remote', 'Hybrid', 'On-site'].map((w) => <option key={w}>{w}</option>)}
                  </select></div>
                <div><label className="mb-1.5 block text-[14px] font-semibold">Job type</label>
                  <select value={profile.jobType} onChange={(e) => { updateProfile({ jobType: e.target.value }); saved('Job type updated'); }} className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]">
                    {['Full-time', 'Contract', 'Part-time'].map((t) => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[14px]">
                <p><span className="font-semibold">Roles:</span> {profile.preferredRoles.join(', ') || '—'}</p>
                <p className="mt-1"><span className="font-semibold">Locations:</span> {profile.preferredLocations.join(', ') || '—'}</p>
                <p className="mt-1"><span className="font-semibold">Salary:</span> {profile.salaryRange} • {profile.workMode} • {profile.jobType}</p>
              </div>
            </Card>
          )}

          {active === 'Email Integration' && (
            <Card className="p-6">
              <h3 className="text-[18px] font-semibold">Email Integration</h3>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div><p className="text-[15px] font-semibold">Gmail connected</p><p className="text-[13px] text-[#64748B]">{profile.email} • tracking opens + replies</p></div>
                <Toggle checked={emailConnected} onChange={(v) => { setEmailConnected(v); saved(v ? 'Mailbox connected' : 'Mailbox disconnected'); }} label="Gmail connection" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => pushToast({ title: emailConnected ? 'Mailbox synced' : 'Mailbox disconnected', description: emailConnected ? '12 threads synced.' : undefined, kind: emailConnected ? 'success' : 'info' })}
                  className="rounded-[9px] border border-[#E2E8F0] px-5 py-2.5 text-[14px] font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]">Sync now</button>
                <button onClick={() => { setEmailConnected(false); pushToast({ title: 'Mailbox disconnected', kind: 'info' }); }}
                  className="rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-2.5 text-[14px] font-semibold text-[#DC2626]">Disconnect</button>
              </div>
            </Card>
          )}

          {active === 'Security' && (
            <Card className="space-y-4 p-6">
              <h3 className="text-[18px] font-semibold">Security</h3>
              <div><label className="mb-1.5 block text-[14px] font-semibold" htmlFor="cur-pw">Current password</label>
                <input id="cur-pw" type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="••••••••" className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
              <div><label className="mb-1.5 block text-[14px] font-semibold" htmlFor="new-pw">New password</label>
                <input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Minimum 8 characters" className="w-full rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]" /></div>
              <button
                onClick={() => {
                  if (newPw.length < 8) { pushToast({ title: 'Password too short', description: 'Use at least 8 characters.', kind: 'error' }); return; }
                  setCurPw(''); setNewPw('');
                  pushToast({ title: 'Password updated', kind: 'success' });
                }}
                className="rounded-[9px] bg-[#0F172A] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1E293B]">Update password</button>
              <div className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div><p className="text-[15px] font-semibold">Two-factor authentication</p><p className="text-[13px] text-[#64748B]">Extra code on new devices.</p></div>
                <Toggle checked={false} onChange={() => pushToast({ title: '2FA setup started', description: 'Scan the QR code sent to your email.', kind: 'info' })} label="Two-factor authentication" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
