import { useEffect, useRef, useState } from 'react';
import { X, Plus, FileText, Eye, RefreshCw, Trash2, UploadCloud, Check, Sparkles, ArrowRight, ScanSearch } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JOBS } from '../../data/mock';
import { useApp } from '../../store/AppContext';
import { Card, PageHeader } from '../../components/ui';
import { CareerProgress, Modal } from '../../components/app-ui';
import { cn } from '../../lib/cn';

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-[#0F172A]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15" />
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SKILL_CLUSTERS: Array<{ label: string; skills: string[] }> = [
  { label: 'Frontend', skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Storybook', 'Figma'] },
  { label: 'Backend', skills: ['Python', 'FastAPI', 'Django', 'Node.js', 'PostgreSQL', 'MongoDB', 'SQL', 'REST APIs', 'Airflow', 'Snowflake'] },
  { label: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'MLOps', 'Go'] },
  { label: 'AI', skills: ['LLMs', 'Machine Learning', 'PyTorch', 'TensorFlow'] },
];

function clusterOf(skill: string): string {
  const hit = SKILL_CLUSTERS.find((c) => c.skills.some((s) => s.toLowerCase() === skill.toLowerCase()));
  return hit ? hit.label : 'General';
}

function ResumeIntelligence() {
  const { profile, profileCompletion } = useApp();
  const checks = [
    profile.email && profile.phone,
    !!profile.location,
    profile.skills.length >= 5,
    !!profile.resumeName,
    !!profile.headline,
  ];
  const ats = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const words = (profile.experienceDetails || '').trim().split(/\s+/).filter(Boolean).length;
  return (
    <Card className="p-6">
      <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">
        <ScanSearch className="h-4 w-4" />Resume intelligence
      </p>
      <div className="mt-4 flex items-center gap-4">
        <p className="text-[38px] font-extrabold leading-none">{ats}<span className="text-[16px] text-[#64748B]">%</span></p>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">ATS Readiness</p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{ width: `${ats}%` }} />
          </div>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-[14px]">
        <div className="flex justify-between gap-2"><dt className="text-[#64748B]">Skills detected</dt><dd className="font-bold">{profile.skills.length}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-[#64748B]">Experience narrative</dt><dd className="font-bold">{words} words</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-[#64748B]">Profile completion</dt><dd className="font-bold">{profileCompletion.pct}%</dd></div>
      </dl>
      {profileCompletion.missing.length > 0 && (
        <div className="mt-3 rounded-[10px] border border-[#FCD34D]/60 bg-[#FFFBEB]/60 p-3">
          <p className="text-[13px] font-semibold text-[#92400E]">Potential improvements</p>
          <ul className="mt-1 space-y-0.5 text-[13px] text-[#92400E]/90">
            {profileCompletion.missing.slice(0, 3).map((m) => <li key={m}>• {m}</li>)}
          </ul>
        </div>
      )}
      <p className="mt-2.5 text-[11px] text-[#94A3B8]">Live analysis of your saved profile data.</p>
    </Card>
  );
}

function CareerIdentity() {
  const { profile } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const activeCluster = selected ? clusterOf(selected) : null;
  const related = selected
    ? [...JOBS].filter((j) => j.skills.some((s) => s.toLowerCase() === selected.toLowerCase())).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
    : [];
  const shownClusters = SKILL_CLUSTERS.map((c) => ({
    ...c,
    mine: c.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase())),
  })).filter((c) => c.mine.length > 0);
  const extra = profile.skills.filter((s) => clusterOf(s) === 'General');

  return (
    <Card className="overflow-hidden !rounded-[20px] p-0">
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5 sm:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">Career identity</p>
        <h3 className="mt-1 text-[24px] font-bold tracking-tight sm:text-[28px]">Your skill constellation</h3>
        <p className="mt-1 text-[14px] text-[#64748B]">Select a skill to highlight its cluster and see matching roles.</p>
      </div>
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
        <div className="space-y-4">
          {shownClusters.map((c) => (
            <div key={c.label}>
              <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">{c.label}</p>
              <div className="flex flex-wrap gap-2">
                {c.mine.map((s) => {
                  const isSel = selected === s;
                  const connected = !!selected && !isSel && clusterOf(s) === activeCluster;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelected(isSel ? null : s)}
                      aria-pressed={isSel}
                      className={cn(
                        'rounded-[10px] px-3.5 py-2 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-px',
                        isSel
                          ? 'bg-[#4F46E5] text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)]'
                          : connected
                            ? 'bg-[#EEF2FF] text-[#3730A3] ring-1 ring-[#4F46E5]'
                            : selected
                              ? 'bg-[#F8FAFC] text-[#94A3B8] ring-1 ring-[#E2E8F0]'
                              : 'bg-[#EEF2FF] text-[#3730A3] hover:bg-[#4F46E5] hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {extra.length > 0 && (
            <div>
              <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">General</p>
              <div className="flex flex-wrap gap-2">
                {extra.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelected(selected === s ? null : s)}
                    aria-pressed={selected === s}
                    className={cn('rounded-[10px] px-3.5 py-2 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-px',
                      selected === s ? 'bg-[#4F46E5] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#4F46E5] hover:text-white')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          {!selected ? (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
              <p className="text-[15px] font-semibold">No skill selected</p>
              <p className="mt-1 max-w-[260px] text-[14px] text-[#64748B]">Pick any skill to reveal its cluster and the roles it unlocks.</p>
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">{activeCluster} cluster</p>
              <p className="mt-1 text-[18px] font-bold">Roles using {selected}</p>
              <div className="mt-3 space-y-2">
                {related.length === 0 && <p className="text-[14px] text-[#64748B]">No indexed roles use this skill yet.</p>}
                {related.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => navigate(`/app/jobs?highlight=${j.id}`)}
                    className="group flex w-full items-center gap-3 rounded-[12px] border border-[#E2E8F0] bg-white p-3 text-left transition-all hover:-translate-y-px hover:border-[#4F46E5] hover:shadow-md"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[15px] font-bold text-[#4F46E5]">{j.company.charAt(0)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{j.title}</span>
                      <span className="block truncate text-[12px] text-[#64748B]">{j.company} • {j.location}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-bold">{j.matchScore.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { profile, updateProfile, addSkill, removeSkill, pushToast, profileCompletion, setResume, clearResume, askConfirm } = useApp();
  const [params, setParams] = useSearchParams();
  const [skillInput, setSkillInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* deep-link from readiness checklist (?focus=resume|skills|...) */
  useEffect(() => {
    const focus = params.get('focus');
    if (!focus) return;
    const el = document.getElementById(`profile-${focus}`);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
      el.classList.add('ring-2', 'ring-[#4F46E5]', 'ring-offset-2');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#4F46E5]', 'ring-offset-2'), 2200);
    }
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => pushToast({ title: 'Profile updated', description: 'Matching now uses your latest details.', kind: 'success' });

  const startUpload = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      pushToast({ title: 'Unsupported file type', description: 'Please choose a PDF, DOC or DOCX file.', kind: 'error' });
      return;
    }
    setUploading({ name: file.name, progress: 0 });
    const t = setInterval(() => {
      setUploading((u) => {
        if (!u) { clearInterval(t); return u; }
        const next = Math.min(100, u.progress + 12 + Math.random() * 18);
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => {
            setUploading(null);
            setResume(file.name, formatSize(file.size || 184320));
            pushToast({ title: 'Resume uploaded', description: `${file.name} parsed successfully.`, kind: 'success' });
          }, 250);
        }
        return { ...u, progress: next };
      });
    }, 160);
  };

  const checklist = [
    { done: !!(profile.name && profile.email && profile.phone && profile.location), label: 'Personal information' },
    { done: !!profile.resumeName, label: 'Resume' },
    { done: profile.skills.length >= 5, label: `Skills (${profile.skills.length})` },
    { done: profile.preferredRoles.length >= 2 && profile.preferredLocations.length >= 2, label: 'Job preferences' },
    { done: (profile.experienceDetails || '').trim().length >= 40, label: 'Experience' },
  ];

  const improvements = [
    ...(profile.skills.length < 8 ? [`Add ${8 - profile.skills.length} more skill${8 - profile.skills.length === 1 ? '' : 's'} (try PostgreSQL)`] : []),
    ...((profile.experienceDetails || '').trim().length < 40 ? ['Add project experience with measurable outcomes'] : []),
    ...(profile.preferredRoles.length < 2 || profile.preferredLocations.length < 2 ? ['Complete job preferences'] : []),
  ].slice(0, 3);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your Professional Profile"
        subtitle="Your career identity — everything AI matching is built on."
        actions={
          <button onClick={save} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]">Save changes</button>
        }
      />

      {/* completion hero */}
      <Card className="overflow-hidden !rounded-[20px] p-0">
        <div className="grid md:grid-cols-2">
          <div className="bg-[#0F172A] p-6 text-white sm:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-indigo-300">Profile intelligence</p>
            <p className="mt-2 text-[52px] font-extrabold leading-none">{profileCompletion.pct}<span className="text-[20px] text-white/50">%</span></p>
            <div className="mt-3 h-2.5 max-w-[320px] overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#06B6D4] transition-all duration-500" style={{ width: `${profileCompletion.pct}%` }} />
            </div>
            <p className="mt-2.5 max-w-[340px] text-[14px] leading-relaxed text-white/60">
              {profileCompletion.missing.length === 0
                ? 'Complete — matching runs at full accuracy.'
                : `${profileCompletion.missing.length} gap${profileCompletion.missing.length === 1 ? '' : 's'} between you and sharper matches.`}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-[15px] font-semibold">Completion checklist</p>
            <ul className="mt-3 space-y-2.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-[14px]">
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold',
                    c.done ? 'bg-[#F0FDF4] text-[#16A34A]' : 'border border-dashed border-[#CBD5E1] text-[#94A3B8]')}>
                    {c.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : '○'}
                  </span>
                  <span className={c.done ? 'font-medium text-[#0F172A]' : 'text-[#64748B]'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card id="profile-personal" className="p-6 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <h3 className="text-[18px] font-semibold">Personal Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile.name} onChange={(v) => updateProfile({ name: v, firstName: v.split(' ')[0] })} />
              <Field label="Email" value={profile.email} onChange={(v) => updateProfile({ email: v })} />
              <Field label="Phone" value={profile.phone} onChange={(v) => updateProfile({ phone: v })} />
              <Field label="Location" value={profile.location} onChange={(v) => updateProfile({ location: v })} />
            </div>
          </Card>

          <Card id="profile-professional" className="p-6 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <h3 className="text-[18px] font-semibold">Professional Information</h3>
            <div className="mt-4 grid gap-4">
              <Field label="Headline" value={profile.headline} onChange={(v) => updateProfile({ headline: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Experience" value={profile.experienceYears} onChange={(v) => updateProfile({ experienceYears: v })} />
                <div>
                  <label className="mb-1.5 block text-[14px] font-semibold">Level</label>
                  <select value={profile.experienceLevel} onChange={(e) => updateProfile({ experienceLevel: e.target.value })}
                    className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]">
                    {['Entry', 'Mid', 'Senior', 'Lead'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Current Role" value={profile.currentRole} onChange={(v) => updateProfile({ currentRole: v })} />
              <Field label="Education" value={profile.education || ''} onChange={(v) => updateProfile({ education: v })} placeholder="e.g. B.Tech, Computer Science" />
            </div>
          </Card>

          <Card id="profile-experience" className="p-6 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <h3 className="text-[18px] font-semibold">Experience</h3>
            <p className="mt-1 text-[14px] text-[#64748B]">Highlights AI uses to judge seniority and relevance.</p>
            <textarea
              value={profile.experienceDetails || ''}
              onChange={(e) => updateProfile({ experienceDetails: e.target.value })}
              rows={4}
              placeholder="e.g. Shipped an LLM support assistant used by 40k users — cut response time 35% with RAG + Postgres pgvector…"
              className="mt-3 w-full rounded-[9px] border border-[#E2E8F0] px-4 py-3 text-[14px] leading-relaxed outline-none transition-colors focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
              aria-label="Experience details"
            />
            <p className="mt-1.5 text-[12px] text-[#94A3B8]">{(profile.experienceDetails || '').trim().length}/40 characters recommended for full credit.</p>
          </Card>

          <Card id="profile-skills" className="p-6 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <h3 className="text-[18px] font-semibold">Skills <span className="ml-1 text-[13px] font-medium text-[#94A3B8]">({profile.skills.length})</span></h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="group inline-flex items-center gap-1.5 rounded-[8px] bg-[#EEF2FF] px-3 py-1.5 text-[14px] font-medium text-[#3730A3] transition-all hover:-translate-y-px hover:bg-[#FEE2E2] hover:text-[#DC2626]">
                  {s}
                  <button onClick={() => { removeSkill(s); pushToast({ title: 'Skill removed', description: s, kind: 'info' }); }} aria-label={`Remove ${s}`} className="rounded-full transition-transform hover:scale-110"><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
              {profile.skills.length === 0 && <p className="text-[14px] text-[#94A3B8]">No skills yet — add your first below.</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim()) { addSkill(skillInput); pushToast({ title: 'Skill added', description: skillInput.trim(), kind: 'success' }); setSkillInput(''); } }}
                placeholder="Add a skill and press Enter"
                className="flex-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]"
                aria-label="Add a skill"
              />
              <button onClick={() => { if (skillInput.trim()) { addSkill(skillInput); pushToast({ title: 'Skill added', description: skillInput.trim(), kind: 'success' }); setSkillInput(''); } }} className="inline-flex items-center gap-1 rounded-[9px] border border-[#E2E8F0] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"><Plus className="h-4 w-4" />Add Skill</button>
            </div>
          </Card>

          <Card id="profile-preferences" className="p-6 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            <h3 className="text-[18px] font-semibold">Job Preferences</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Preferred Roles (comma separated)" value={profile.preferredRoles.join(', ')} onChange={(v) => updateProfile({ preferredRoles: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
              <Field label="Preferred Locations (comma separated)" value={profile.preferredLocations.join(', ')} onChange={(v) => updateProfile({ preferredLocations: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
              <Field label="Salary Range" value={profile.salaryRange} onChange={(v) => updateProfile({ salaryRange: v })} />
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold">Minimum salary (k)</label>
                <select value={profile.salaryMin} onChange={(e) => updateProfile({ salaryMin: Number(e.target.value), salaryRange: `$${e.target.value}k+` })}
                  className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]">
                  {[80, 100, 120, 130, 150, 170].map((n) => <option key={n} value={n}>${n}k+</option>)}
                </select>
              </div>
              <Field label="Work Mode" value={profile.workMode} onChange={(v) => updateProfile({ workMode: v })} />
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold">Job Type</label>
                <select value={profile.jobType} onChange={(e) => updateProfile({ jobType: e.target.value })}
                  className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[15px] outline-none focus:border-[#4F46E5]">
                  {['Full-time', 'Contract', 'Part-time'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* resume */}
          <Card id="profile-resume" className="p-6">
            <h3 className="text-[18px] font-semibold">Resume</h3>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" aria-label="Choose resume file"
              onChange={(e) => { startUpload(e.target.files?.[0]); e.target.value = ''; }} />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); startUpload(e.dataTransfer.files?.[0]); }}
              onClick={() => !uploading && fileRef.current?.click()}
              className={cn(
                'mt-4 cursor-pointer rounded-[14px] border-2 border-dashed p-6 text-center transition-colors',
                dragOver ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#4F46E5]'
              )}
              role="button"
              aria-label="Upload resume — drag and drop or choose file"
            >
              {uploading ? (
                <div>
                  <p className="truncate text-[14px] font-semibold">{uploading.name}</p>
                  <div className="mx-auto mt-3 h-2 max-w-[220px] overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="h-full rounded-full bg-[#4F46E5] transition-all" style={{ width: `${uploading.progress}%` }} />
                  </div>
                  <p className="mt-2 text-[13px] text-[#64748B]">Uploading… {Math.round(uploading.progress)}%</p>
                </div>
              ) : (
                <div>
                  <UploadCloud className="mx-auto h-8 w-8 text-[#4F46E5]" />
                  <p className="mt-2 text-[14px] font-semibold">Drag & drop your resume</p>
                  <p className="text-[13px] text-[#64748B]">or <span className="font-semibold text-[#4F46E5]">choose file</span> · PDF, DOC, DOCX</p>
                </div>
              )}
            </div>

            {profile.resumeName ? (
              <div className="mt-4">
                <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#DC2626]/10 text-[#DC2626]"><FileText className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">{profile.resumeName}</p>
                      <p className="text-[13px] text-[#64748B]">Uploaded: {profile.resumeUpdated || '—'} • {profile.resumeSize}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={() => setPreviewOpen(true)} className="inline-flex items-center justify-center gap-1 rounded-[9px] border border-[#E2E8F0] px-2 py-2.5 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"><Eye className="h-4 w-4" />Preview</button>
                    <button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-1 rounded-[9px] border border-[#E2E8F0] px-2 py-2.5 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"><RefreshCw className="h-4 w-4" />Replace</button>
                    <button
                      onClick={() => askConfirm({ title: 'Delete resume?', description: 'Your uploaded resume will be removed from your profile.', confirmLabel: 'Delete', onConfirm: () => { clearResume(); pushToast({ title: 'Resume deleted', kind: 'info' }); } })}
                      className="inline-flex items-center justify-center gap-1 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] px-2 py-2.5 text-[13px] font-semibold text-[#DC2626] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="h-4 w-4" />Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[12px] border border-dashed border-[#CBD5E1] p-4 text-center text-[14px] text-[#64748B]">No resume uploaded — matching accuracy is reduced.</p>
            )}
          </Card>

          {/* resume intelligence — computed live from saved profile */}
          <ResumeIntelligence />

          {/* AI insights */}
          <Card className="border-[#4F46E5]/20 bg-[#EEF2FF]/50 p-6">
            <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">
              <Sparkles className="h-4 w-4" />AI Profile Insights
            </p>
            <p className="mt-3 text-[15px] font-medium leading-relaxed">
              Your profile currently aligns strongly with backend and AI roles.
            </p>
            <p className="mt-2 text-[14px] text-[#475569]">Potential improvements:</p>
            <ul className="mt-2 space-y-1.5">
              {(improvements.length > 0 ? improvements : ['Your profile is in great shape — keep it fresh.']).map((imp) => (
                <li key={imp} className="flex items-start gap-2 text-[14px] text-[#334155]">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" />{imp}
                </li>
              ))}
            </ul>
            <button
              onClick={save}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] bg-[#4F46E5] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3]"
            >
              Improve Profile<ArrowRight className="h-4 w-4" />
            </button>
          </Card>
        </div>
      </div>

      <CareerIdentity />

      <div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4F46E5]">Career progress</p>
        <CareerProgress />
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Resume preview" wide>
        <div className="space-y-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <p className="text-[18px] font-bold">{profile.name} — {profile.headline}</p>
          <p className="text-[13px] text-[#64748B]">{profile.email} • {profile.phone} • {profile.location}</p>
          {profile.education && <p className="text-[13px] text-[#64748B]">{profile.education}</p>}
          <div className="border-t border-[#E2E8F0] pt-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#475569]">Experience</p>
            <p className="mt-1 text-[14px]">{profile.currentRole} • {profile.experienceYears}</p>
            {(profile.experienceDetails || '').trim() && <p className="mt-1 text-[14px] text-[#475569]">{profile.experienceDetails}</p>}
          </div>
          <div className="border-t border-[#E2E8F0] pt-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#475569]">Skills</p>
            <p className="mt-1 text-[14px]">{profile.skills.join(' • ')}</p>
          </div>
          <p className="text-[12px] text-[#94A3B8]">{profile.resumeName} • {profile.resumeSize} — rendered from your profile data (mock preview).</p>
        </div>
      </Modal>
    </div>
  );
}
